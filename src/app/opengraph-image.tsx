import { ImageResponse } from 'next/og'
import { SITE } from '@/lib/seo'

/**
 * Code-generated default social share image (1200x630). Used for any page that
 * does not supply its own OpenGraph image (e.g. the homepage and listing pages).
 * No asset upload required: Next renders this on demand at /opengraph-image.
 */
export const alt = `${SITE.name}, ${SITE.role} in ${SITE.locality}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0a',
          color: '#fafafa',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#9ca3af',
          }}
        >
          Antonio Portfolio
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>
            Antonio
          </div>
          <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>
            Jerković
          </div>
        </div>

        <div style={{ fontSize: 38, color: '#d1d5db' }}>
          {`${SITE.role} · ${SITE.locality}, ${SITE.country}`}
        </div>
      </div>
    ),
    { ...size },
  )
}
