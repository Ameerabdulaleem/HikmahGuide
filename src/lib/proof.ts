// Proof = SHA-256(question + ISO timestamp). Anyone can reproduce it from the two values shown.
// crypto.subtle only exists in secure contexts (https and localhost), so this can return null.
export async function sha256Hex(input: string): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}
