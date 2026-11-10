import type { ThemeKey } from './themes.js'

// A topic index for the Qur'an. It stores references only (surah and ayah). The
// Arabic and English text is always fetched live from AlQuran Cloud at answer time,
// so no Qur'anic text is ever typed by hand or produced by the model.
//
// The first entries of each list are the strongest matches for the theme. Each verse is
// shown on its own, so verses that only make sense with their neighbours (they open with
// a legal ruling, an exception clause, or a story about someone else) are left out even
// when a phrase inside them is often quoted. `npm run audit:sources` fetches every
// reference live through the app's own client so the text can be reviewed.

export interface QuranRef {
  surah: number
  ayah: number
}

const r = (surah: number, ayah: number): QuranRef => ({ surah, ayah })

export const QURAN_LIBRARY: Record<ThemeKey, QuranRef[]> = {
  anxiety: [r(13, 28), r(94, 6), r(2, 286), r(65, 3), r(3, 173), r(9, 51)],
  patience: [r(2, 153), r(39, 10), r(3, 200), r(2, 155), r(11, 115)],
  gratitude: [r(14, 7), r(2, 152), r(31, 12), r(16, 18)],
  trust: [r(65, 3), r(3, 159), r(3, 173), r(9, 51), r(2, 286)],
  forgiveness: [r(39, 53), r(3, 135), r(4, 110), r(42, 40), r(24, 22), r(71, 10)],
  provision: [r(65, 3), r(11, 6), r(62, 10), r(67, 15), r(29, 60), r(51, 22)],
  family: [r(30, 21), r(25, 74), r(17, 23), r(31, 14), r(4, 1)],
  kindness: [r(41, 34), r(3, 159), r(16, 90), r(17, 53)],
  knowledge: [r(20, 114), r(58, 11), r(39, 9), r(35, 28), r(96, 5)],
  repentance: [r(66, 8), r(25, 70), r(39, 53), r(4, 17)],
  hardship: [r(94, 6), r(65, 7), r(2, 286), r(2, 214), r(2, 153)],
  intention: [r(98, 5), r(22, 37), r(18, 110), r(67, 2)],
  prayer: [r(20, 14), r(29, 45), r(2, 45), r(2, 238), r(11, 114)],
  charity: [r(2, 261), r(2, 274), r(57, 18), r(3, 92)],
  hope: [r(39, 53), r(12, 87), r(15, 56), r(93, 5), r(2, 186), r(94, 6)],
  anger: [r(3, 134), r(42, 37), r(42, 43), r(7, 199), r(41, 34)],
  humility: [r(25, 63), r(31, 18), r(17, 37), r(28, 83)],
  honesty: [r(9, 119), r(33, 70), r(5, 8), r(2, 42), r(61, 2)],
  contentment: [r(20, 131), r(16, 97), r(57, 20), r(13, 28)],
  brotherhood: [r(49, 10), r(3, 103), r(49, 13), r(9, 71)],
  marriage: [r(30, 21), r(4, 19), r(25, 74), r(24, 32)],
  health: [r(26, 80), r(17, 82), r(10, 57), r(21, 83)],
  dhikr: [r(13, 28), r(33, 41), r(2, 152), r(7, 205), r(29, 45)],
  character: [r(68, 4), r(33, 21), r(3, 159), r(16, 90)],
  death: [r(3, 185), r(62, 8), r(2, 156), r(21, 35)],
  guidance: [r(3, 159), r(42, 38), r(29, 69), r(65, 3), r(1, 6)],
  general: [r(13, 28), r(94, 6), r(2, 286), r(2, 153)],
}
