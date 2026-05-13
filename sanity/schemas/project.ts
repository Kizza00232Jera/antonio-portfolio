import { defineField, defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short one-liner shown on the homepage project card.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Thumbnail Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Preview image shown on the homepage and project cards. Overrides the Mux auto-screenshot.',
    }),
    defineField({
      name: 'muxVideoId',
      title: 'Mux Playback ID',
      type: 'string',
      description: 'The Mux Playback ID for the project demo video.',
    }),
    defineField({
      name: 'focusAreas',
      title: 'Focus Areas',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "State management", "Auth flow", "Performance"',
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack (Legacy)',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Plain-text tech list (legacy). Use "Tech Stack" references instead.',
      hidden: true,
    }),
    defineField({
      name: 'techStackRefs',
      title: 'Tech Stack',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'techStackItem' }] }],
      description: 'Select technologies used in this project.',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
      description: 'Tags for filtering on the projects page.',
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub URL',
      type: 'url',
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live URL',
      type: 'url',
    }),
    defineField({
      name: 'liveUrl2',
      title: 'Live URL 2',
      type: 'url',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show on the homepage project showcase.',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower number appears first.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'sections',
      title: 'Detail Sections',
      type: 'array',
      description: 'Accordion sections for the project detail page.',
      of: [
        {
          type: 'object',
          name: 'projectSection',
          title: 'Section',
          fields: [
            defineField({
              name: 'title',
              title: 'Section Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'content',
              title: 'Content',
              type: 'blockContent',
            }),
            defineField({
              name: 'images',
              title: 'Images',
              type: 'array',
              of: [{ type: 'image', options: { hotspot: true } }],
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'sectionLink',
                  title: 'Link',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                    }),
                    defineField({
                      name: 'url',
                      title: 'URL',
                      type: 'url',
                    }),
                  ],
                },
              ],
            }),
          ],
          preview: {
            select: { title: 'title' },
          },
        },
      ],
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      subtitle: 'tagline',
    },
  },
})
