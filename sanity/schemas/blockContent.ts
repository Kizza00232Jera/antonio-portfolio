import { defineArrayMember, defineType } from 'sanity'

export const blockContent = defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
    }),
    defineArrayMember({
      name: 'codeBlock',
      type: 'object',
      title: 'Code Block',
      fields: [
        {
          name: 'language',
          type: 'string',
          title: 'Language',
        },
        {
          name: 'code',
          type: 'text',
          title: 'Code',
        },
      ],
    }),
    defineArrayMember({
      name: 'muxVideo',
      type: 'object',
      title: 'Mux Video',
      fields: [
        {
          name: 'playbackId',
          type: 'string',
          title: 'Mux Playback ID',
          validation: (rule) => rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
    defineArrayMember({
      name: 'callout',
      type: 'object',
      title: 'Callout',
      fields: [
        {
          name: 'type',
          type: 'string',
          title: 'Type',
          options: {
            list: [
              { title: 'Tip', value: 'tip' },
              { title: 'Info', value: 'info' },
              { title: 'Warning', value: 'warning' },
              { title: 'Danger', value: 'danger' },
            ],
          },
          initialValue: 'info',
        },
        {
          name: 'content',
          type: 'text',
          title: 'Content',
          rows: 3,
        },
      ],
    }),
    defineArrayMember({
      name: 'imageWithCaption',
      type: 'object',
      title: 'Image with Caption',
      fields: [
        {
          name: 'image',
          type: 'image',
          title: 'Image',
          options: { hotspot: true },
        },
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
    }),
  ],
})
