import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

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

  switch (_type) {
    case 'project': {
      revalidatePath('/projects', 'layout')
      if (slugValue) {
        revalidatePath(`/projects/${slugValue}`, 'page')
      }
      break
    }
    case 'blogPost': {
      revalidatePath('/', 'page')
      revalidatePath('/blog', 'layout')
      if (slugValue) {
        revalidatePath(`/blog/${slugValue}`, 'page')
      }
      break
    }
    case 'siteSettings': {
      revalidatePath('/', 'page')
      break
    }
    default: {
      return NextResponse.json(
        { message: `Unknown content type: ${_type ?? '(none)'}` },
        { status: 400 }
      )
    }
  }

  return NextResponse.json({
    revalidated: true,
    type: _type,
    slug: slugValue,
    timestamp: new Date().toISOString(),
  })
}
