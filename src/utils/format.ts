// All formatters pin timeZone to UTC. publishedAt values are stored at UTC
// midnight, so without a fixed zone the server (UTC) and the visitor's browser
// can render different calendar days, causing a React hydration mismatch (#418).
export function formatDateFull(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatDateMedium(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatDateShort(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatDateCompact(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString)
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .toUpperCase()
}
