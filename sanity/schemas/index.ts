import { blockContent } from './blockContent'
import { author } from './author'
import { siteSettings } from './siteSettings'
import { project } from './project'
import { blogPost } from './blogPost'
import { techStackItem } from './techStackItem'
import { tag } from './tag'
import { seo } from './seo'

export const schemaTypes = [
  blockContent,
  seo,
  author,
  siteSettings,
  project,
  blogPost,
  techStackItem,
  tag,
]
