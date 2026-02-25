import { defineField, defineType } from 'sanity'

export const techStackItem = defineType({
  name: 'techStackItem',
  title: 'Tech Stack Item',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g. "React", "TypeScript", "Tailwind CSS"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      options: { hotspot: true },
      description: 'Square icon/logo for this technology (SVG or PNG).',
    }),
  ],
  preview: {
    select: { title: 'name', media: 'icon' },
  },
})
