import type { HadithCollection } from '../../src/shared/types.js'

// Grades for the narrations that are not in Ṣaḥīḥ al-Bukhārī or Ṣaḥīḥ Muslim. They are
// copied from the open fawazahmed0/hadith-api dataset, using the grading of al-Albānī.
// `npm run audit:sources` re-checks every row against the live dataset.
//
// Inclusion rule for the library: a narration is dropped if al-Albānī grades it weak, or if
// two or more graders in the dataset do. Where a single grader dissents from the others the
// narration stays, and the label shows whose grading is being quoted.
//
// Musnad Aḥmad is not in the open dataset, so its entries carry no grade here.

export interface HadithGrade {
  grade: 'Ṣaḥīḥ' | 'Ḥasan' | 'Ḥasan Ṣaḥīḥ'
  by: string
}

const albani = (grade: HadithGrade['grade']): HadithGrade => ({ grade, by: 'al-Albānī' })

export const HADITH_GRADES: Record<string, HadithGrade> = {
  'tirmidhi:4': albani('Ṣaḥīḥ'),
  'tirmidhi:413': albani('Ṣaḥīḥ'),
  'tirmidhi:1162': albani('Ḥasan Ṣaḥīḥ'),
  'tirmidhi:2307': albani('Ḥasan Ṣaḥīḥ'),
  'tirmidhi:2344': albani('Ṣaḥīḥ'),
  'tirmidhi:2346': albani('Ḥasan'),
  'tirmidhi:2396': albani('Ḥasan Ṣaḥīḥ'),
  'tirmidhi:2499': albani('Ḥasan'),
  'tirmidhi:2516': albani('Ṣaḥīḥ'),
  'tirmidhi:3537': albani('Ḥasan'),
  'tirmidhi:3540': albani('Ṣaḥīḥ'),
  'tirmidhi:3895': albani('Ṣaḥīḥ'),
  'abudawud:4777': albani('Ḥasan'),
  'abudawud:4799': albani('Ṣaḥīḥ'),
  'abudawud:4811': albani('Ṣaḥīḥ'),
  'nasai:3104': albani('Ḥasan Ṣaḥīḥ'),
  'nasai:3940': albani('Ṣaḥīḥ'),
}

/** The label shown next to a reference, or null when nothing is verified for it. */
export function gradeLabel(collection: HadithCollection, number: number): string | null {
  if (collection === 'bukhari' || collection === 'muslim') return 'Ṣaḥīḥ collection'
  const entry = HADITH_GRADES[`${collection}:${number}`]
  return entry ? `${entry.grade}, graded by ${entry.by}` : null
}
