import { defineField, defineType } from 'sanity'

/**
 * Reusable, OPTIONAL SEO override object.
 *
 * Leave it empty and the site derives sensible metadata automatically from the
 * document's title / tagline / excerpt and the project-wide defaults. Fill a
 * field only when you want to override that smart default for one document.
 * Nothing here is required, so existing content never becomes "invalid".
 */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  description:
    'Optional. Leave blank to auto-generate from the title/excerpt. Fill in to override for this page.',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta title',
      type: 'string',
      description: 'Override the <title>. Aim for under ~60 characters. Include the name where it fits.',
      validation: (Rule) =>
        Rule.max(70).warning('Longer than ~60 characters may be truncated by Google.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      description: 'Override the search snippet. Aim for under ~155 characters.',
      validation: (Rule) =>
        Rule.max(165).warning('Longer than ~155 characters may be truncated by Google.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image',
      type: 'image',
      description: 'Override the image shown when this page is shared. Falls back to the cover/hero image.',
    }),
  ],
})
