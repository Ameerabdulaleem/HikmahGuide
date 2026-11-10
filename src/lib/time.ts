import type { ConversationMeta } from './chatTypes'

const DAY = 24 * 60 * 60 * 1000

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export interface Group {
  label: string
  items: ConversationMeta[]
}

/** Groups chats the way people remember them: today, yesterday, this week, older. */
export function groupByDay(metas: ConversationMeta[], now = Date.now()): Group[] {
  const today = startOfDay(now)
  const buckets: Group[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Previous 7 days', items: [] },
    { label: 'Older', items: [] },
  ]
  for (const meta of metas) {
    const day = startOfDay(meta.updatedAt)
    const index = day >= today ? 0 : day >= today - DAY ? 1 : day >= today - 7 * DAY ? 2 : 3
    buckets[index].items.push(meta)
  }
  return buckets.filter((b) => b.items.length > 0)
}

export function formatWhen(ts: number, now = Date.now()): string {
  const date = new Date(ts)
  const sameDay = startOfDay(ts) === startOfDay(now)
  return sameDay
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString([], { day: 'numeric', month: 'short', year: date.getFullYear() === new Date(now).getFullYear() ? undefined : 'numeric' })
}
