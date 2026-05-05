export function filterByTag<T>(
  items: T[],
  activeTag: string | null,
  getTagSlugs: (item: T) => string[],
): T[] {
  if (!activeTag) return items
  return items.filter((item) => getTagSlugs(item).includes(activeTag))
}
