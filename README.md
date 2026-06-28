<div align="center">

# antoniojerkovic.com

**My portfolio: projects, case studies, and a blog.**

[![Live site](https://img.shields.io/badge/Live-antoniojerkovic.com-080C18?style=for-the-badge)](https://antoniojerkovic.com)

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Sanity](https://img.shields.io/badge/Sanity-F03E2F?logo=sanity&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-0AE448?logo=greensock&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

<img src="docs/screenshots/home.png" alt="antoniojerkovic.com" width="760">

</div>

My personal site, where I show my work and write about building for the web. It is a scroll-driven, animation-heavy front end backed by a Sanity CMS, so I can add projects and blog posts myself without touching code. The fun was making it feel alive while still loading fast and staying accessible.

## What's in it

- **Projects** — case studies for each project, with covers, tech, and write-ups managed in Sanity.
- **Blog** — posts written and edited in the CMS, rendered from portable text.
- **Motion** — GSAP and Lenis drive the scroll, a custom cursor, and the section transitions, all behind `prefers-reduced-motion`.
- **Accessible by default** — visible keyboard focus, a real skip link, semantic landmarks, and captions/alt text throughout.
- **SEO and entity disambiguation** — a single source of truth feeds page metadata, JSON-LD (Person / WebSite / BlogPosting), OpenGraph, and a generated OG image, so the name resolves to the right person.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js (App Router) + React + TypeScript |
| Content | Sanity (headless CMS, portable text) |
| Styling | Tailwind CSS |
| Motion | GSAP + Lenis, custom cursor |
| Hosting | Vercel |

## Run it locally

Prerequisites: Node 18+ and a Sanity project.

```bash
git clone https://github.com/Kizza00232Jera/antonio-portfolio.git
cd antonio-portfolio
npm install
npm run dev
```

Create a `.env.local` with your Sanity project values:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
```

Open http://localhost:3000. The Sanity Studio config lives in `sanity/`.

## License

[MIT](LICENSE) © Antonio Jerković
