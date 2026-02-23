import Link from 'next/link'

const socialLinks = [
  { href: 'https://github.com', label: 'GitHub' },
  { href: 'https://linkedin.com', label: 'LinkedIn' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border">
      <div
        className="mx-auto flex flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row max-w-[var(--max-width)]"
      >
        <p className="text-sm text-text-muted">
          &copy; {year} Antonio. All rights reserved.
        </p>

        <ul className="flex items-center gap-6 list-none m-0 p-0">
          {socialLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-muted hover:text-accent transition-colors duration-200"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
