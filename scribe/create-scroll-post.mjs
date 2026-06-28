#!/usr/bin/env node
// create-scroll-post.mjs
//
// Creates the "find and fix horizontal scroll from the console" blog post as a
// Sanity DRAFT. Prints the bare document id (no drafts. prefix) on stdout so the
// caller can attach a hero image and publish it.
//
// Reuses the same env loading + write client as unsplash-upload.mjs.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { createClient } from '@sanity/client'

const envPath = resolve(process.cwd(), '.env.local')
try {
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (!m) continue
    const [, name, rawValue] = m
    if (process.env[name]) continue
    process.env[name] = rawValue.replace(/^['"]|['"]$/g, '')
  }
} catch {}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-12-01',
  useCdn: false,
})

// ── Portable Text builders ──────────────────────────────────
let k = 0
const key = () => 'b' + (k++).toString(36)

// segments: string | {code} | {strong} | {em}
function spans(segments) {
  const arr = Array.isArray(segments) ? segments : [segments]
  return arr.map((s) => {
    if (typeof s === 'string') return { _key: key(), _type: 'span', text: s, marks: [] }
    if (s.code) return { _key: key(), _type: 'span', text: s.code, marks: ['code'] }
    if (s.strong) return { _key: key(), _type: 'span', text: s.strong, marks: ['strong'] }
    if (s.em) return { _key: key(), _type: 'span', text: s.em, marks: ['em'] }
    throw new Error('bad segment ' + JSON.stringify(s))
  })
}

const block = (style, segments) => ({
  _key: key(),
  _type: 'block',
  style,
  markDefs: [],
  children: spans(segments),
})
const p = (segments) => block('normal', segments)
const h2 = (text) => block('h2', text)
const h3 = (text) => block('h3', text)
const li = (segments) => ({
  _key: key(),
  _type: 'block',
  style: 'normal',
  listItem: 'bullet',
  level: 1,
  markDefs: [],
  children: spans(segments),
})
const code = (language, codeText) => ({ _key: key(), _type: 'codeBlock', language, code: codeText })

const DETECTOR = `const vw = innerWidth;
[...document.querySelectorAll('body *')]
  .map(el => ({ el, r: el.getBoundingClientRect() }))
  .filter(({ r }) => r.right > vw + 1 || r.left < -1)
  .sort((a, b) => (b.r.right - b.r.left) - (a.r.right - a.r.left))
  .slice(0, 8)
  .forEach(({ el, r }) => console.log(
    Math.round(r.left) + ' to ' + Math.round(r.right) + '  ' +
    el.tagName + '.' + (el.className || '(no class)')
  ));
console.log('viewport =', vw);`

const CHAIN = `const vw = innerWidth;
[...document.querySelectorAll('body *')]
  .map(el => ({ el, r: el.getBoundingClientRect() }))
  .filter(({ r }) => r.right > vw + 1 || r.left < -1)
  .sort((a, b) => (b.r.right - b.r.left) - (a.r.right - a.r.left))
  .slice(0, 4)
  .forEach(({ el }) => {
    const chain = [];
    let n = el;
    for (let i = 0; i < 5 && n; i++, n = n.parentElement)
      chain.push(n.tagName + (n.className ? '.' + String(n.className).replace(/\\s+/g, '.') : ''));
    console.log(chain.join('  <  '));
  });`

const body = [
  p('You open your site on a phone, swipe, and the whole page slides a little to the left and right. Nothing is supposed to move sideways, but it does. There is a thin strip of empty space on the edge, and the layout feels loose and broken.'),
  p('This is one of the most common layout bugs on the web, and almost everyone hits it. It is usually called horizontal scroll, or horizontal overflow. People often describe it loosely as "the scroll problem" because it feels like the page is scrolling in a direction it should not. The good news is that it is very findable. You do not need to guess. The browser console can tell you the exact element that is too wide, and the fix is usually one or two lines of CSS.'),
  p('This post walks through the whole thing in general terms, so you can use it on any project, mobile or desktop.'),

  h2('First, a quick word on the console'),
  p(['Every browser ships with developer tools. Press ', { code: 'F12' }, ' on Windows or Linux, or ', { code: 'Cmd + Option + I' }, ' on a Mac, and a panel opens. One of its tabs is the Console. The Console is a live JavaScript prompt that runs against the page you are looking at right now. Whatever you type runs immediately, with full access to the page and its elements.']),
  p('That last part is what makes it perfect for hunting layout bugs. You are not reading static code. You are asking the real, rendered page questions like "how wide are you actually?" and "which element is sticking out past the edge?"'),
  p('To test mobile behavior without a phone, open the dev tools and click the device toolbar icon (it looks like a small phone next to a tablet, usually top left of the dev tools panel). Pick a device like iPhone or Pixel. Now the page renders at phone width and you can debug it on your desktop.'),

  h2('Why horizontal scroll happens'),
  p('The page scrolls sideways when something inside it is wider than the screen. The browser will not crop your content by default. If one element pokes past the right edge, the browser adds horizontal scroll so the user can reach it.'),
  p('The usual suspects are:'),
  li([{ code: 'width: 1200px' }, ' or any other fixed width, on a screen narrower than that.']),
  li([{ code: '100vw' }, ' used as a width. ', { code: 'vw' }, ' does not subtract the scrollbar, so it can be a few pixels wider than the visible area.']),
  li([{ code: 'margin-left: -20px' }, ' and other negative margins that pull an element past the edge.']),
  li(['Large padding on a full width element when ', { code: 'box-sizing: border-box' }, ' is not set.']),
  li('A long unbroken string of text or a wide code block that refuses to wrap.'),
  li(['An image or video with no ', { code: 'max-width: 100%' }, '.']),
  li('A transformed or absolutely positioned decorative layer (a blurred background, a rotated card, an offset glow) that bleeds past its container.'),
  p('Notice the theme. It is almost always one specific element, not the whole layout. So the job is to find that one element.'),

  h2('Step one: confirm there really is overflow'),
  p('Open the Console and run this:'),
  code('javascript', `const de = document.documentElement;
console.log('overflow px =', de.scrollWidth - de.clientWidth);`),
  p([{ code: 'clientWidth' }, ' is how wide the visible area is. ', { code: 'scrollWidth' }, ' is how wide the content actually is, including anything that spills past the edge. If ', { code: 'scrollWidth' }, ' is bigger than ', { code: 'clientWidth' }, ', that difference is your overflow in pixels. If it prints ', { code: '0' }, ', there is no horizontal overflow at the page level, and whatever you are seeing is something else (more on that at the end).']),

  h2('Step two: find the element that sticks out'),
  p('Now ask the page which elements extend past the right edge, widest first:'),
  code('javascript', DETECTOR),
  p('Here is what each part does:'),
  li([{ code: "document.querySelectorAll('body *')" }, ' grabs every element on the page.']),
  li([{ code: 'getBoundingClientRect()' }, ' gives the real on screen position of each one, including its left and right edge in pixels.']),
  li(['The ', { code: 'filter' }, ' keeps only elements whose right edge is past the viewport width, or whose left edge is in negative space (off the left side). The ', { code: '+ 1' }, ' and ', { code: '- 1' }, ' ignore harmless rounding.']),
  li(['The ', { code: 'sort' }, ' puts the widest offenders first, and ', { code: 'slice(0, 8)' }, ' keeps the list short.']),
  li('Each line prints as "left to right" plus the tag and class, so you can recognize the element.'),
  p(['You will get something like ', { code: '-21 to 452  IMG.card-background' }, ' with a viewport of ', { code: '430' }, '. That tells you an image starts 21 pixels off the left edge and ends 22 pixels past the right. There is your culprit.']),

  h2('Step three: identify exactly what it is'),
  p('Sometimes the offending element has no class, or there are several of them. Print a short parent chain so you know which component it belongs to:'),
  code('javascript', CHAIN),
  p(['This climbs up to five levels from the offending element to its ancestors and prints the path, like ', { code: 'IMG < DIV.card-bg < DIV.card-image < A.card' }, '. Now you know the component, not just a mystery element.']),

  h2('Step four: fix the cause'),
  p('Once you know the element, the fix depends on why it is wide. The common ones:'),
  code('css', `* { box-sizing: border-box; }          /* padding never widens the box */
img, video { max-width: 100%; display: block; }
.full-width { width: 100%; }            /* prefer 100% over 100vw */
.text { overflow-wrap: break-word; }    /* wrap long words and URLs */`),
  p('If the wide element is a decorative layer that is supposed to be bigger than its box (a blurred background, an offset shape), you do not want to resize it, you want to contain it. Clip it at the container:'),
  code('css', `.container {
  overflow: clip;
}`),
  p([{ code: 'overflow: clip' }, ' is usually a better choice than ', { code: 'overflow: hidden' }, ' here. ', { code: 'hidden' }, ' creates a scroll container, which can interfere with sticky positioning and smooth scroll libraries. ', { code: 'clip' }, ' just clips and does not create a scroll container, so the rest of your layout keeps behaving normally.']),

  h2('The last resort, and a desktop note'),
  p('If you cannot easily track down every leak, or you want a guarantee, you can clip the whole page on the horizontal axis:'),
  code('css', `html {
  overflow-x: clip;
}`),
  p('This stops the page from ever scrolling sideways. Use it as a safety net, not as a substitute for finding the cause, because it hides the symptom rather than fixing the wide element. Hiding a real layout problem can bite you later when content actually needs that space.'),
  p('A quick word on desktop. Horizontal scroll is not only a phone problem. It shows up on desktop too, especially at smaller window widths or when someone zooms in. The detection steps above work exactly the same. Just resize your browser narrow, or zoom to 150 percent, and run the same console checks. If your layout overflows when the window gets small, the same one element is usually to blame.'),

  h2('A gotcha worth knowing: mobile browsers are not all the same'),
  p(['Here is a subtle trap. You run the overflow check in Chrome, it prints ', { code: '0' }, ', everything looks contained, and yet a real iPhone still scrolls sideways. How?']),
  p(['Browsers do not all clip content identically. In particular, when an element is transformed (for example ', { code: 'transform: scale(1.1)' }, ' to cover an edge), Chrome will contain that scaled overflow with ', { code: 'overflow: clip' }, ', but Safari on iOS has historically let a transformed child leak past the clip anyway. So Chrome reports no overflow while Safari still scrolls.']),
  p(['If you suspect this, two things help. First, add ', { code: 'clip-path: inset(0)' }, ' to the container alongside ', { code: 'overflow: clip' }, '. ', { code: 'clip-path' }, ' clips transformed descendants more reliably across browsers. Second, when possible, test on a real device, because device mode in Chrome emulates the size but not every quirk of the actual mobile engine.']),

  h2('The recap'),
  li(['Open the Console (', { code: 'F12' }, '), and switch on device mode to test at phone width.']),
  li(['Run ', { code: 'scrollWidth - clientWidth' }, ' to confirm there is real overflow and see how many pixels.']),
  li('Run the detector snippet to list elements sticking past the edge, widest first.'),
  li('Run the parent chain snippet to identify which component it belongs to.'),
  li(['Fix the cause: ', { code: 'box-sizing' }, ', ', { code: 'max-width' }, ' on media, ', { code: '100%' }, ' instead of ', { code: '100vw' }, ', wrapping for long text, or ', { code: 'overflow: clip' }, ' on a container for decorative bleed.']),
  li(['Use ', { code: 'html { overflow-x: clip }' }, ' only as a safety net.']),
  li(['If Chrome says zero but a real phone still scrolls, suspect a transformed child and reach for ', { code: 'clip-path: inset(0)' }, ', then test on a real device.']),
  p('The whole point is that you never have to guess. The page already knows which element is too wide. You just have to ask it.'),
]

const id = randomUUID()
const draftId = 'drafts.' + id

const doc = {
  _id: draftId,
  _type: 'blogPost',
  title: 'That sideways scroll on your phone? Find and fix it from the console',
  slug: { _type: 'slug', current: 'find-and-fix-horizontal-scroll-from-the-console' },
  publishedAt: new Date().toISOString(),
  excerpt:
    'That unwanted left-to-right scroll on mobile (and desktop) is almost always one element that is too wide. Here is how to find the exact culprit from the browser console and fix it in a line or two of CSS.',
  author: { _type: 'reference', _ref: '465cfecb-034a-4f5c-8717-8fd37e61b172' },
  tags: [
    { _key: key(), _type: 'reference', _ref: 'c05656b6-2d86-4bf9-8eca-b1092f431f5d' }, // web-development
    { _key: key(), _type: 'reference', _ref: '0cc5dee7-083c-4838-9189-d08e84ad8dff' }, // coding
    { _key: key(), _type: 'reference', _ref: 'a6f0356e-3bbb-4ccf-8ebb-cf580f741449' }, // css
  ],
  body,
}

await client.createOrReplace(doc)
console.log(JSON.stringify({ id, draftId, slug: doc.slug.current, blocks: body.length }))
