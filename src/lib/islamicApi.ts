import axios from 'axios'

const QURAN_BASE = 'https://api.alquran.cloud/v1'
const HADITH_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions'

export async function getAyah(surah: number, ayah: number, lang = 'en.sahih') {
  try {
    const { data } = await axios.get(`${QURAN_BASE}/ayah/${surah}:${ayah}/${lang}`)
    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function searchQuran(keyword: string, lang = 'en.sahih') {
  try {
    const { data } = await axios.get(`${QURAN_BASE}/search/${encodeURIComponent(keyword)}/all/${lang}`)
    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getHadith(collection = 'eng-bukhari', number: number) {
  try {
    const { data } = await axios.get(`${HADITH_BASE}/${collection}/${number}.json`)
    return data
  } catch (error) {
    console.error(error)
    return null
  }
}
