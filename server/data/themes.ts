// The fixed vocabulary the model may choose from. The model only ever picks theme
// keys. The verses, hadith and duʿāʾ shown to the user are looked up from curated
// libraries by these keys, never written by the model.

export const THEME_KEYS = [
  'anxiety',
  'patience',
  'gratitude',
  'trust',
  'forgiveness',
  'provision',
  'family',
  'kindness',
  'knowledge',
  'repentance',
  'hardship',
  'intention',
  'prayer',
  'charity',
  'hope',
  'anger',
  'humility',
  'honesty',
  'contentment',
  'brotherhood',
  'marriage',
  'health',
  'dhikr',
  'character',
  'death',
  'guidance',
  'general',
] as const

export type ThemeKey = (typeof THEME_KEYS)[number]

export interface ThemeInfo {
  description: string
  /**
   * Lexicon used when the model is unavailable, and to back up its choice.
   * A plain entry matches the start of a word, "=word" matches the whole word,
   * and an entry with a space matches as a phrase.
   */
  keywords: string[]
}

export const THEMES: Record<ThemeKey, ThemeInfo> = {
  anxiety: {
    description: 'worry, stress, fear, sadness, grief, loneliness, overthinking, feeling overwhelmed',
    keywords: ['anxi', 'worr', 'stress', 'panic', 'afraid', 'fear', 'overthink', 'restless', 'nervous', 'depress', 'sad', 'sorrow', 'grie', 'lonel', 'overwhelm', 'insomnia', 'cannot sleep', "can't sleep", 'burden'],
  },
  patience: {
    description: 'patience, perseverance, enduring something slowly or for a long time',
    keywords: ['patien', 'sabr', 'endur', 'persever', 'tolerat', 'waiting', 'delay'],
  },
  gratitude: {
    description: 'thankfulness, noticing blessings',
    keywords: ['grate', 'thank', 'shukr', 'blessing', 'appreciat'],
  },
  trust: {
    description: 'reliance on Allah, tawakkul, uncertainty about the future, accepting the decree',
    keywords: ['trust', 'tawakkul', 'rely', 'reliance', 'uncertain', 'qadr', 'destiny', 'decree', 'future'],
  },
  forgiveness: {
    description: 'seeking or granting forgiveness, regret, guilt, forgiving others',
    keywords: ['forgiv', 'pardon', '=sin', '=sins', 'sinful', 'regret', 'guilt', 'istighfar'],
  },
  provision: {
    description: 'rizq, money, work, jobs, business, debt, financial difficulty',
    keywords: ['rizq', 'provision', 'money', 'financ', 'income', 'salary', '=job', '=jobs', 'career', 'business', 'debt', 'poverty', 'broke', '=rent', 'bills', 'unemploy', 'livelihood', 'employ'],
  },
  family: {
    description: 'parents, children, siblings, relatives, family conflict',
    keywords: ['family', 'parent', 'mother', 'father', 'sibling', 'child', '=son', '=daughter', 'relative', 'kinship', 'in-law', 'inlaw', 'upbring'],
  },
  kindness: {
    description: 'mercy, compassion, gentleness, treating people well',
    keywords: ['kind', 'mercy', 'merciful', 'compassion', 'gentle', 'generous', 'forgiving others'],
  },
  knowledge: {
    description: 'seeking knowledge, study, exams, learning, teaching',
    keywords: ['knowledge', 'learn', 'study', 'student', 'exam', 'school', 'teach', 'ilm', 'universit', 'memoris', 'memoriz'],
  },
  repentance: {
    description: 'tawbah, returning to Allah after sin, relapsing into a habit',
    keywords: ['repent', 'tawbah', 'tawba', 'sinned', 'relaps', 'return to allah', 'turn back to allah'],
  },
  hardship: {
    description: 'trials, calamity, loss, illness of the heart, a hard season of life',
    keywords: ['hardship', 'trial', 'difficult', 'struggl', 'suffer', 'calamit', 'tough', 'hard time', 'loss', 'afflict', 'tested', 'test from allah', 'going through'],
  },
  intention: {
    description: 'sincerity, ikhlas, niyyah, doing things for the sake of Allah, showing off',
    keywords: ['intention', 'niyyah', 'niyah', 'sincer', 'ikhlas', 'riya', 'show off', 'showing off'],
  },
  prayer: {
    description: 'salah, concentration in prayer, consistency, night prayer, the mosque',
    keywords: ['prayer', 'salah', 'salat', '=pray', 'praying', 'fajr', 'tahajjud', 'khushu', 'mosque', 'masjid'],
  },
  charity: {
    description: 'sadaqah, zakat, giving, spending for the sake of Allah',
    keywords: ['charity', 'sadaqah', 'sadaqa', 'zakat', 'donat', 'giving', 'generos'],
  },
  hope: {
    description: 'hope in Allah, despair, feeling far from Allah, His mercy',
    keywords: ['hope', 'despair', 'mercy of allah', 'optimis', 'give up', 'giving up', 'far from allah', 'hopeless'],
  },
  anger: {
    description: 'anger, resentment, losing temper, controlling oneself',
    keywords: ['anger', 'angry', 'rage', 'temper', 'furious', 'resent', 'irritat'],
  },
  humility: {
    description: 'humility, pride, arrogance, ego',
    keywords: ['humil', 'arrogan', '=pride', 'proud', '=ego', 'boast', 'conceit'],
  },
  honesty: {
    description: 'truthfulness, lying, keeping promises, trust between people, betrayal',
    keywords: ['honest', 'truth', '=lie', '=lies', 'lying', '=liar', 'betray', 'deceiv', 'cheat', 'promise'],
  },
  contentment: {
    description: 'being satisfied, envy, comparing oneself to others, greed',
    keywords: ['content', 'satisf', 'envy', 'envious', 'jealous', 'compar', 'greed', 'enough'],
  },
  brotherhood: {
    description: 'friends, community, neighbours, unity, disputes between people',
    keywords: ['friend', 'brotherhood', 'sisterhood', 'communit', 'ummah', 'neighbo', 'companion', 'unity', 'argument', 'conflict', 'quarrel', 'lonely friends'],
  },
  marriage: {
    description: 'marriage, spouse, finding a partner, divorce, engagement',
    keywords: ['marri', 'spouse', 'husband', '=wife', 'nikah', 'wedding', 'divorc', 'engag', 'fianc', 'proposal'],
  },
  health: {
    description: 'illness, healing, the body, sleep, caring for health',
    keywords: ['health', '=sick', 'illness', 'disease', '=cure', 'heal', '=pain', 'cancer', 'hospital', 'surgery', 'chronic'],
  },
  dhikr: {
    description: 'remembrance of Allah, adhkar, tasbih, daily habits of worship',
    keywords: ['dhikr', 'zikr', 'remembrance', 'tasbih', 'adhkar', 'routine', 'daily habit'],
  },
  character: {
    description: 'good manners, akhlaq, habits, self improvement, discipline',
    keywords: ['character', 'manner', 'akhlaq', 'ethic', 'behavio', 'habit', 'disciplin', 'self improvement'],
  },
  death: {
    description: 'death, bereavement, the afterlife, preparing for the hereafter',
    keywords: ['death', '=die', 'dying', 'funeral', 'grave', 'afterlife', 'akhirah', 'hereafter', 'bereave', 'passed away', 'mourn', 'deceased'],
  },
  guidance: {
    description: 'making a decision, confusion about a path, istikharah, purpose, direction in life',
    keywords: ['decision', 'decide', 'choice', 'choose', 'istikhar', 'direction', 'confus', 'crossroad', 'purpose', 'guidance', 'lost my way', 'what should i do'],
  },
  general: {
    description: 'anything that fits no other theme',
    keywords: [],
  },
}

export function isThemeKey(value: unknown): value is ThemeKey {
  return typeof value === 'string' && (THEME_KEYS as readonly string[]).includes(value)
}

function tokens(text: string): string[] {
  return text.toLowerCase().replace(/[’‘`]/g, "'").match(/[a-z][a-z'-]*/g) ?? []
}

function matches(keyword: string, words: string[], flat: string): boolean {
  if (keyword.startsWith('=')) return words.includes(keyword.slice(1))
  if (keyword.includes(' ')) return flat.includes(keyword)
  return words.some((word) => word.startsWith(keyword))
}

export interface ThemeMatch {
  themes: ThemeKey[]
  /** Number of keyword hits behind the strongest theme */
  strength: number
}

/** Lexicon based theme detection. Cheap, deterministic, and independent of the model. */
export function detectThemes(text: string, max = 3): ThemeMatch {
  const words = tokens(text)
  const flat = ` ${words.join(' ')} `
  const scored: Array<{ key: ThemeKey; score: number }> = []

  for (const key of THEME_KEYS) {
    if (key === 'general') continue
    const score = THEMES[key].keywords.reduce((total, keyword) => total + (matches(keyword, words, flat) ? 1 : 0), 0)
    if (score > 0) scored.push({ key, score })
  }

  scored.sort((a, b) => b.score - a.score)
  return { themes: scored.slice(0, max).map((s) => s.key), strength: scored[0]?.score ?? 0 }
}

const CRISIS_PATTERNS: RegExp[] = [
  /\b(kill|end|take)\s+(my\s+own\s+life|myself|my\s+life)\b/i,
  /\bsuicid/i,
  /\bwant(?:ed)?\s+to\s+die\b/i,
  /\b(?:don'?t|do\s+not)\s+want\s+to\s+(?:live|be\s+alive|exist)\b/i,
  /\bhurt(?:ing)?\s+myself\b/i,
  /\bself[\s-]?harm/i,
  /\bbetter\s+off\s+(?:dead|without\s+me)\b/i,
]

/** Phrases that mean the person may be in danger. Used alongside the model's own judgement. */
export function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text))
}
