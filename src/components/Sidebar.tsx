import { useEffect, useMemo, useRef, useState } from 'react'
import type { ConversationMeta } from '../lib/chatTypes'
import { formatWhen, groupByDay } from '../lib/time'
import { Icon } from './icons'
import { LogoMark } from './Ornaments'

interface SidebarProps {
  metas: ConversationMeta[]
  activeId: string | null
  open: boolean
  collapsed: boolean
  persistent: boolean
  saveFailed: boolean
  onClose: () => void
  onNew: () => void
  onSelect: (id: string) => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

export function Sidebar(props: SidebarProps) {
  const { metas, activeId, open, collapsed, persistent, saveFailed } = props
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAll, setConfirmAll] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const shown = needle ? metas.filter((m) => `${m.title} ${m.questions} ${m.preview}`.toLowerCase().includes(needle)) : metas
    return groupByDay(shown)
  }, [metas, query])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') props.onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const startRename = (meta: ConversationMeta) => {
    setConfirmId(null)
    setEditingId(meta.id)
    setDraftTitle(meta.title)
  }

  const commitRename = () => {
    if (editingId && draftTitle.trim()) props.onRename(editingId, draftTitle)
    setEditingId(null)
  }

  return (
    <>
      <div className={`scrim${open ? ' is-open' : ''}`} onClick={props.onClose} aria-hidden="true" />
      <aside
        id="chat-history"
        className={`sidebar${open ? ' is-open' : ''}${collapsed ? ' is-collapsed' : ''}`}
        aria-label="Chat history"
      >
        <div className="sidebar__head">
          <a className="sidebar__brand" href="/" onClick={(e) => { e.preventDefault(); props.onNew() }} aria-label="HikmahGuide, start a new chat">
            <LogoMark size={30} />
            <span>HikmahGuide</span>
          </a>
          <button ref={closeRef} type="button" className="icon-btn sidebar__close" onClick={props.onClose} aria-label="Close history">
            <Icon name="close" size={18} />
          </button>
        </div>

        <button type="button" className="newchat" onClick={props.onNew}>
          <Icon name="plus" size={16} />
          New chat
        </button>

        {metas.length > 0 && (
          <div className="search">
            <Icon name="search" size={15} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your chats"
              aria-label="Search your chats"
              maxLength={80}
            />
          </div>
        )}

        <nav className="history" aria-label="Previous chats">
          {metas.length === 0 && (
            <p className="history__empty">
              Your conversations will appear here, so you can come back to them any time.
            </p>
          )}
          {metas.length > 0 && groups.length === 0 && <p className="history__empty">No chats match “{query}”.</p>}

          {groups.map((group) => (
            <section key={group.label} className="history__group">
              <h2>{group.label}</h2>
              <ul>
                {group.items.map((meta) => {
                  const active = meta.id === activeId
                  if (editingId === meta.id) {
                    return (
                      <li key={meta.id} className="row row--edit">
                        <input
                          autoFocus
                          value={draftTitle}
                          maxLength={80}
                          aria-label="Chat name"
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitRename()
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                        />
                      </li>
                    )
                  }
                  if (confirmId === meta.id) {
                    return (
                      <li key={meta.id} className="row row--confirm">
                        <span>Delete this chat?</span>
                        <button type="button" className="mini mini--danger" onClick={() => { props.onDelete(meta.id); setConfirmId(null) }}>
                          Delete
                        </button>
                        <button type="button" className="mini" onClick={() => setConfirmId(null)}>
                          Keep
                        </button>
                      </li>
                    )
                  }
                  return (
                    <li key={meta.id} className={`row${active ? ' is-active' : ''}`}>
                      <button
                        type="button"
                        className="row__main"
                        aria-current={active ? 'true' : undefined}
                        onClick={() => props.onSelect(meta.id)}
                      >
                        <span className="row__title">{meta.title}</span>
                        <span className="row__time">{formatWhen(meta.updatedAt)}</span>
                      </button>
                      <span className="row__actions">
                        <button type="button" className="icon-btn" onClick={() => startRename(meta)} aria-label={`Rename ${meta.title}`}>
                          <Icon name="pencil" size={14} />
                        </button>
                        <button type="button" className="icon-btn" onClick={() => setConfirmId(meta.id)} aria-label={`Delete ${meta.title}`}>
                          <Icon name="trash" size={14} />
                        </button>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </nav>

        <div className="sidebar__foot">
          {!persistent && (
            <p className="warn">History cannot be saved in this browser mode, so these chats end when you close the tab.</p>
          )}
          {persistent && saveFailed && (
            <p className="warn">This device is out of storage, so your latest messages may not be saved. Try deleting older chats.</p>
          )}
          <p className="privacy">
            <Icon name="shield" size={13} />
            Chats are saved on this device only, not on our servers.
          </p>
          {metas.length > 0 &&
            (confirmAll ? (
              <div className="row row--confirm">
                <span>Delete all chats?</span>
                <button type="button" className="mini mini--danger" onClick={() => { props.onClearAll(); setConfirmAll(false) }}>
                  Delete all
                </button>
                <button type="button" className="mini" onClick={() => setConfirmAll(false)}>
                  Keep
                </button>
              </div>
            ) : (
              <button type="button" className="clear" onClick={() => setConfirmAll(true)}>
                <Icon name="trash" size={13} />
                Clear all history
              </button>
            ))}
        </div>
      </aside>
    </>
  )
}
