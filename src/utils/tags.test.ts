import { describe, it, expect } from 'vitest'
import { filterByTag } from './tags'

const items = [
  { name: 'a', tags: ['react', 'typescript'] },
  { name: 'b', tags: ['vue'] },
  { name: 'c', tags: ['react'] },
]

const getSlugs = (item: typeof items[number]) => item.tags

describe('filterByTag', () => {
  it('returns all items when activeTag is null', () => {
    expect(filterByTag(items, null, getSlugs)).toEqual(items)
  })

  it('returns only matching items for an active tag', () => {
    const result = filterByTag(items, 'react', getSlugs)
    expect(result).toHaveLength(2)
    expect(result.map((i) => i.name)).toEqual(['a', 'c'])
  })

  it('returns empty array when no items match the active tag', () => {
    expect(filterByTag(items, 'svelte', getSlugs)).toEqual([])
  })
})
