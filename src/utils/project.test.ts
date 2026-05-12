import { describe, it, expect, vi } from 'vitest'
import { padIndex, getThumbnailUrl } from './project'
import type { Project } from '@/lib/sanity/types'

vi.mock('@/lib/sanity/image', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  urlFor: (_image: unknown): any => {
    const chain = {
      width: () => chain,
      height: () => chain,
      quality: () => chain,
      url: () => 'https://cdn.sanity.io/images/test/mock',
    }
    return chain
  },
}))

const baseProject: Project = {
  _id: 'p1',
  _type: 'project',
  title: 'Test',
  slug: { _type: 'slug', current: 'test' },
  featured: false,
}

describe('padIndex', () => {
  it('pads a zero-based index to two digits', () => {
    expect(padIndex(0)).toBe('01')
  })
  it('returns double digits for index 9', () => {
    expect(padIndex(9)).toBe('10')
  })
  it('handles indices beyond 9', () => {
    expect(padIndex(10)).toBe('11')
  })
})

describe('getThumbnailUrl', () => {
  it('returns a Mux URL when muxVideoId is present', () => {
    const project: Project = { ...baseProject, muxVideoId: 'abc123' }
    const url = getThumbnailUrl(project)
    expect(url).toContain('image.mux.com/abc123')
  })

  it('returns a Sanity URL when only coverImage is present', () => {
    const project: Project = {
      ...baseProject,
      coverImage: { _type: 'image', asset: { _ref: 'ref', _type: 'reference' } },
    }
    const url = getThumbnailUrl(project)
    expect(url).toContain('cdn.sanity.io')
  })

  it('returns null when neither muxVideoId nor coverImage is present', () => {
    expect(getThumbnailUrl(baseProject)).toBeNull()
  })
})
