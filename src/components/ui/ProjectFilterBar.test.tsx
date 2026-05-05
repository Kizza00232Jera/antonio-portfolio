import React, { useState } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectFilterBar } from './ProjectFilterBar'
import type { Tag } from '@/lib/sanity/types'

const tags: Tag[] = [
  { _id: 't1', _type: 'tag', name: 'React', slug: { _type: 'slug', current: 'react' } },
  { _id: 't2', _type: 'tag', name: 'TypeScript', slug: { _type: 'slug', current: 'typescript' } },
]

const items = [
  { _id: 'p1', title: 'Project One', tag: 'react' },
  { _id: 'p2', title: 'Project Two', tag: 'typescript' },
  { _id: 'p3', title: 'Project Three', tag: 'react' },
]

// Simulates the parent (ProjectsListingClient) — filter bar + item list
function FilterIntegration() {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const filtered = activeTag ? items.filter((i) => i.tag === activeTag) : items
  return (
    <div>
      <ul>
        {filtered.map((item) => (
          <li key={item._id}>{item.title}</li>
        ))}
      </ul>
      <ProjectFilterBar tags={tags} activeTag={activeTag} onTagChange={setActiveTag} />
    </div>
  )
}

describe('ProjectFilterBar', () => {
  it('clicking a tag filters the visible item list to matching items', async () => {
    render(<FilterIntegration />)
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    // Use first button found — mobile options panel renders first in DOM
    await userEvent.click(screen.getAllByRole('button', { name: 'React' })[0])
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Project One')).toBeInTheDocument()
    expect(screen.getByText('Project Three')).toBeInTheDocument()
    expect(screen.queryByText('Project Two')).not.toBeInTheDocument()
  })

  it('clicking All resets to all items', async () => {
    render(<FilterIntegration />)
    await userEvent.click(screen.getAllByRole('button', { name: 'React' })[0])
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    await userEvent.click(screen.getAllByRole('button', { name: 'All' })[0])
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('the active tag button indicator has the active class', async () => {
    render(<FilterIntegration />)
    const reactButtons = screen.getAllByRole('button', { name: 'React' })
    await userEvent.click(reactButtons[0])
    // At least one React button must carry the filled indicator (bg-text class)
    const hasActiveIndicator = reactButtons.some((btn) =>
      btn.querySelector('span')?.classList.contains('bg-text'),
    )
    expect(hasActiveIndicator).toBe(true)
  })
})
