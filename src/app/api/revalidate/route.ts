import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { submitToIndexNow } from '@/lib/indexnow'

interface WebhookBody {
  _type?: string
  slug?: { current?: string }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.SANITY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[revalidate] SANITY_WEBHOOK_SECRET is not set')
    return NextResponse.json({ message: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  let body: WebhookBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const { _type, slug } = body
  const slugValue = slug?.current ?? null

  // Canonical, public page URLs whose content just changed. These are the ones
  // pinged to IndexNow (Bing/Yandex/etc.) for near-instant re-crawl.
  const indexNowPaths: string[] = []

  switch (_type) {
    case 'project': {
      revalidatePath('/projects', 'layout')
      indexNowPaths.push('/projects')
      if (slugValue) {
        revalidatePath(`/projects/${slugValue}`, 'page')
        indexNowPaths.push(`/projects/${slugValue}`)
      }
      break
    }
    case 'blogPost': {
      revalidatePath('/', 'page')
      revalidatePath('/blog', 'layout')
      indexNowPaths.push('/', '/blog')
      if (slugValue) {
        revalidatePath(`/blog/${slugValue}`, 'page')
        indexNowPaths.push(`/blog/${slugValue}`)
      }
      break
    }
    case 'siteSettings': {
      revalidatePath('/', 'page')
      indexNowPaths.push('/')
      break
    }
    default: {
      return NextResponse.json(
        { message: `Unknown content type: ${_type ?? '(none)'}` },
        { status: 400 }
      )
    }
  }

  // Fire IndexNow alongside revalidation. submitToIndexNow never throws, so a
  // search-engine hiccup can't fail the publish/revalidate flow.
  const indexNowStatus = await submitToIndexNow(indexNowPaths)

  return NextResponse.json({
    revalidated: true,
    type: _type,
    slug: slugValue,
    indexNow: { submitted: indexNowPaths, status: indexNowStatus },
    timestamp: new Date().toISOString(),
  })
}
