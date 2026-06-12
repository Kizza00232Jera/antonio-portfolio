import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { presentationTool, defineLocations } from 'sanity/presentation'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'antonio-portfolio',
  title: 'Antonio Portfolio',
  basePath: '/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    structureTool(),
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        locations: {
          project: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) =>
              doc?.slug
                ? {
                    locations: [
                      { title: doc.title || 'Untitled', href: `/projects/${doc.slug}` },
                      { title: 'All Projects', href: '/projects' },
                    ],
                  }
                : null,
          }),
          blogPost: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) =>
              doc?.slug
                ? {
                    locations: [
                      { title: doc.title || 'Untitled', href: `/blog/${doc.slug}` },
                      { title: 'All Posts', href: '/blog' },
                    ],
                  }
                : null,
          }),
          siteSettings: defineLocations({
            select: { title: 'title' },
            resolve: () => ({
              locations: [{ title: 'Homepage', href: '/' }],
            }),
          }),
        },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
