import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Composer } from './components/Composer'
import { Icon } from './components/icons'
import { Landing } from './components/Landing'
import { Sidebar } from './components/Sidebar'
import { Thread, type ThreadError } from './components/Thread'
import { ApiError, buildHistory, requestGuidance, usedSourceKeys } from './lib/api'
import { getChatStore } from './lib/chatStore'
import { browserStorage, readJson, UI_KEY, writeJson } from './lib/storage'

type Variant = 'serene' | 'warm'

interface UiPrefs {
  variant: Variant
  collapsed: boolean
}

function loadPrefs(): UiPrefs {
  const raw = readJson(browserStorage(), UI_KEY)
  const data = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}
  return { variant: data.variant === 'warm' ? 'warm' : 'serene', collapsed: data.collapsed === true }
}

function describe(error: unknown): ThreadError {
  if (error instanceof ApiError) {
    const wait = error.kind === 'rate_limit' && error.retryAfter ? ` Try again in about ${error.retryAfter} seconds.` : ''
    return { message: `${error.message}${wait}`, kind: error.kind }
  }
  return { message: 'Something went wrong. Please try again.', kind: 'server' }
}

export default function App() {
  const store = getChatStore()
  const { metas, activeId, active, persistent, saveFailed } = useSyncExternalStore(store.subscribe, store.getState)

  const [prefs, setPrefs] = useState<UiPrefs>(loadPrefs)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, ThreadError>>({})
  const [status, setStatus] = useState('')

  const inFlight = useRef(new Map<string, AbortController>())
  const scrolled = useRef<{ id: string | null; last?: string }>({ id: null })

  useEffect(() => {
    writeJson(browserStorage(), UI_KEY, prefs)
  }, [prefs])

  useEffect(() => {
    document.title = active ? `${active.title} · HikmahGuide` : 'HikmahGuide'
  }, [active])

  const setBusy = (id: string, busy: boolean) =>
    setPending((previous) => {
      const next = new Set(previous)
      if (busy) next.add(id)
      else next.delete(id)
      return next
    })

  const send = useCallback(
    async (text: string, retry = false) => {
      let convId = store.getState().activeId
      if (convId && inFlight.current.has(convId)) return

      let question = text
      if (retry) {
        const last = convId ? store.getConversation(convId)?.messages.at(-1) : undefined
        if (!convId || last?.role !== 'user') return
        question = last.content
      } else {
        const added = store.addUserMessage(convId, text)
        if (!added) return
        convId = added.convId
      }

      if (!convId) return
      const id = convId
      const conversation = store.getConversation(id)
      const controller = new AbortController()
      inFlight.current.set(id, controller)
      setBusy(id, true)
      setErrors(({ [id]: _cleared, ...rest }) => rest)
      setStatus('Preparing guidance…')

      try {
        const result = await requestGuidance(
          {
            question,
            history: buildHistory(conversation, (conversation?.messages.length ?? 1) - 1),
            exclude: usedSourceKeys(conversation),
          },
          controller.signal,
        )
        store.addAssistantMessage(id, question, result)
        setStatus('Guidance ready')
      } catch (error) {
        const failure = describe(error)
        if (failure.kind === 'aborted') setStatus('Stopped')
        else {
          setErrors((previous) => ({ ...previous, [id]: failure }))
          setStatus(failure.message)
        }
      } finally {
        inFlight.current.delete(id)
        setBusy(id, false)
      }
    },
    [store],
  )

  const stop = useCallback(() => {
    const id = store.getState().activeId
    if (id) inFlight.current.get(id)?.abort()
  }, [store])

  const startNewChat = () => {
    store.newChat()
    setDrawerOpen(false)
  }

  const removeChat = (id: string) => {
    inFlight.current.get(id)?.abort()
    store.remove(id)
  }

  const clearAll = () => {
    inFlight.current.forEach((controller) => controller.abort())
    store.clearAll()
  }

  // Keep the right part of the page in view: the latest answer from its start, the loader
  // while thinking, and the newest message when a saved chat is opened.
  const lastMessage = active?.messages.at(-1)
  const busy = activeId ? pending.has(activeId) : false

  useEffect(() => {
    const previous = scrolled.current
    scrolled.current = { id: activeId, last: lastMessage?.id }
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

    if (!activeId) {
      window.scrollTo({ top: 0, behavior: previous.id ? behavior : 'auto' })
      return
    }
    if (previous.id !== activeId) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' })
      return
    }
    if (previous.last === lastMessage?.id) return

    if (lastMessage?.role === 'assistant') {
      document.getElementById(`msg-${lastMessage.id}`)?.scrollIntoView({ behavior, block: 'start' })
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior })
    }
  }, [activeId, lastMessage?.id, lastMessage?.role])

  useEffect(() => {
    if (busy) window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
  }, [busy])

  const toggleCollapsed = () => setPrefs((p) => ({ ...p, collapsed: !p.collapsed }))

  return (
    <div className="app" data-variant={prefs.variant} data-collapsed={prefs.collapsed}>
      <a className="skip" href="#main">
        Skip to the conversation
      </a>

      <div className="bg bg--pattern" aria-hidden="true" />
      <div className="bg bg--top" aria-hidden="true" />
      <div className="bg bg--corner" aria-hidden="true" />

      <Sidebar
        metas={metas}
        activeId={activeId}
        open={drawerOpen}
        collapsed={prefs.collapsed}
        persistent={persistent}
        saveFailed={saveFailed}
        onClose={() => setDrawerOpen(false)}
        onNew={startNewChat}
        onSelect={(id) => {
          store.select(id)
          setDrawerOpen(false)
        }}
        onRename={store.rename}
        onDelete={removeChat}
        onClearAll={clearAll}
      />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn topbar__menu"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open chat history"
            aria-expanded={drawerOpen}
            aria-controls="chat-history"
          >
            <Icon name="menu" size={20} />
          </button>
          <button
            type="button"
            className="icon-btn topbar__collapse"
            onClick={toggleCollapsed}
            aria-label={prefs.collapsed ? 'Show chat history' : 'Hide chat history'}
            aria-expanded={!prefs.collapsed}
            aria-controls="chat-history"
          >
            <Icon name="panel" size={19} />
          </button>

          <p className="topbar__title">{active ? active.title : ''}</p>

          <div className="theme" role="group" aria-label="Appearance">
            {(['serene', 'warm'] as const).map((variant) => (
              <button
                key={variant}
                type="button"
                aria-pressed={prefs.variant === variant}
                onClick={() => setPrefs((p) => ({ ...p, variant }))}
              >
                {variant}
              </button>
            ))}
          </div>

          <button type="button" className="btn btn--emerald topbar__new" onClick={startNewChat}>
            <Icon name="plus" size={15} />
            <span>New chat</span>
          </button>
        </header>

        <main id="main" className="stage" tabIndex={-1}>
          {active ? (
            <>
              <h1 className="sr-only">{active.title}</h1>
              <Thread
                conversation={active}
                pending={busy}
                error={activeId ? (errors[activeId] ?? null) : null}
                onAsk={(text) => void send(text)}
                onRetry={() => void send('', true)}
              />
            </>
          ) : (
            <Landing pending={false} onSubmit={(text) => void send(text)} onStop={stop} />
          )}
        </main>

        {active && (
          <div className="dock">
            <Composer
              variant="dock"
              pending={busy}
              focusKey={active.id}
              placeholder="Ask a follow up, or start something new…"
              onSubmit={(text) => void send(text)}
              onStop={stop}
            />
            <p className="dock__note">HikmahGuide shares reflections from the Qurʾān and Sunnah. It does not issue rulings.</p>
          </div>
        )}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  )
}
