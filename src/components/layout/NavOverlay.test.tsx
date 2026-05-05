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
    set: vi.fn(),
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

  it('all four nav links are present in the overlay', () => {
    renderNav()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument()
  })
})
