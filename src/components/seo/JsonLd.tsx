/**
 * Renders a JSON-LD <script> block. Server component, no client JS.
 * Pass one schema.org object (or an array) and it is injected into the DOM
 * for crawlers to read. Not visible to users.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const payload = Array.isArray(data) ? data : [data]
  return (
    <>
      {payload.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Schema objects are built server-side from our own data, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  )
}
