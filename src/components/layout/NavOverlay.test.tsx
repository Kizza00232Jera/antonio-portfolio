import React from 'react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuProvider } from '@/contexts/MenuContext'
import { MenuButton } from '@/components/layout/MenuButton'
import { NavOverlay } from '@/components/layout/NavOverlay'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}))

vi.mock('gsap', () => ({
  gsap: {
    set: vi.fn((target, props: Record<string, unknown>) => {
      const els = Array.isArray(target) ? target : [target]
      for (const el of els) {
        if (el && typeof el === 'object' && 'style' in el) {
          Object.assign((el as HTMLElement).style, props)
        }
      }
    }),
    to: vi.fn(),
    fromTo: vi.fn(),
  },
}))

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))

vi.mock('next/link', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...props }: any) => <a href={href} {...props}>{children}</a>,
}))

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  })
})

function renderNav() {
  return render(
    <MenuProvider>
      <MenuButton />
      <NavOverlay />
    </MenuProvider>,
  )
}

describe('NavOverlay', () => {
  it('clicking the menu button marks the overlay as open', async () => {
    renderNav()
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('pressing Escape closes the overlay', async () => {
    renderNav()
    const button = screen.getByRole('button')
    await userEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('all four nav links are present in the overlay', async () => {
    renderNav()
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }))
    const links = screen.getAllByRole('link')
    const hrefs = links.map(link => link.getAttribute('href'))
    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/projects')
    expect(hrefs).toContain('/blog')
    expect(hrefs).toContain('/#contact')
  })
})
