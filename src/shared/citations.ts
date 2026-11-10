// Citation tags such as [Q1], [H2] and [D1] link a sentence to a numbered source.

export type CitationKind = 'Q' | 'H' | 'D'

export type Segment = { type: 'text'; value: string } | { type: 'cite'; id: string }

const TAG = /\[([QHD]\d{1,2})\]/g

/** Splits prose into plain text and citation tags so the UI can render the tags as chips. */
export function splitCitations(text: string): Segment[] {
  const segments: Segment[] = []
  let last = 0
  for (const match of text.matchAll(TAG)) {
    const index = match.index ?? 0
    if (index > last) segments.push({ type: 'text', value: text.slice(last, index) })
    segments.push({ type: 'cite', id: match[1] })
    last = index + match[0].length
  }
  if (last < text.length) segments.push({ type: 'text', value: text.slice(last) })
  return segments
}

export function extractCitations(text: string): string[] {
  return Array.from(text.matchAll(TAG), (m) => m[1])
}

/** Turns "[Q1, H2]" and "(Q1)" into "[Q1][H2]" and "[Q1]" so the tags can be validated. */
export function normaliseTags(text: string): string {
  return text.replace(/[[(]\s*([QHD]\d{1,2}(?:\s*[,;&/]\s*[QHD]\d{1,2})*)\s*[\])]/g, (_all, list: string) =>
    list
      .split(/\s*[,;&/]\s*/)
      .map((id) => `[${id}]`)
      .join(''),
  )
}
