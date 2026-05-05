export function formatDateFull(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateMedium(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateShort(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateCompact(dateString?: string): string {
  if (!dateString) return ''
  return new Date(dateString)
    .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase()
}
