import { describe, it, expect } from 'vitest'
import { formatDateFull, formatDateMedium, formatDateShort, formatDateCompact } from './format'

const ISO = '2024-01-15'

describe('formatDateFull', () => {
  it('formats a valid ISO string', () => {
    expect(formatDateFull(ISO)).toBe('15 January 2024')
  })
  it('returns empty string for empty input', () => {
    expect(formatDateFull('')).toBe('')
  })
  it('returns empty string for undefined', () => {
    expect(formatDateFull(undefined)).toBe('')
  })
})

describe('formatDateMedium', () => {
  it('formats a valid ISO string', () => {
    expect(formatDateMedium(ISO)).toBe('15 Jan 2024')
  })
})

describe('formatDateShort', () => {
  it('formats a valid ISO string', () => {
    expect(formatDateShort(ISO)).toBe('January 2024')
  })
})

describe('formatDateCompact', () => {
  it('formats a valid ISO string in uppercase', () => {
    expect(formatDateCompact(ISO)).toBe('JAN 2024')
  })
})
