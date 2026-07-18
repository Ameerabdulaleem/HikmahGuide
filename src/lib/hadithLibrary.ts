// Curated library of authentic hadith with verified text and correct citations.
// Numbers follow the widely used sunnah.com references. We select by theme rather
// than letting the model generate hadith text/numbers (which it hallucinates).

export interface Hadith {
  text: string
  source: string
}

export const HADITH_LIBRARY: Record<string, Hadith[]> = {
  anxiety: [
    {
      text: 'How wonderful is the affair of the believer, for all his affairs are good. If something good happens to him, he is thankful, and that is good for him; and if something bad happens to him, he bears it with patience, and that is good for him. This is only for the believer.',
      source: 'Sahih Muslim 2999',
    },
    {
      text: 'No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim, even if it were the prick he receives from a thorn, but that Allah expiates some of his sins for that.',
      source: 'Sahih al-Bukhari 5641',
    },
    {
      text: 'Whoever among you wakes up physically healthy, feeling safe and secure within himself, with food for the day, it is as if he acquired the whole world.',
      source: 'Sunan al-Tirmidhi 2346',
    },
    {
      text: 'Know that victory comes with patience, relief with affliction, and ease with hardship.',
      source: 'Musnad Ahmad 2803',
    },
  ],
  patience: [
    {
      text: 'And whoever tries to be patient, Allah will make him patient. Nobody can be given a blessing better and greater than patience.',
      source: 'Sahih al-Bukhari 1469',
    },
    {
      text: 'How wonderful is the affair of the believer, for all his affairs are good. If something good happens to him, he is thankful; and if something bad happens to him, he bears it with patience, and that is good for him.',
      source: 'Sahih Muslim 2999',
    },
    {
      text: 'The real patience is at the first stroke of a calamity.',
      source: 'Sahih al-Bukhari 1283',
    },
    {
      text: 'Know that victory comes with patience, relief with affliction, and ease with hardship.',
      source: 'Musnad Ahmad 2803',
    },
  ],
  gratitude: [
    {
      text: 'He who does not thank people, does not thank Allah.',
      source: 'Sunan Abi Dawud 4811',
    },
    {
      text: 'Look at those who are lower than you (financially) and do not look at those who are higher than you, lest you belittle the favours Allah has conferred upon you.',
      source: 'Sahih Muslim 2963',
    },
    {
      text: 'Whoever among you wakes up physically healthy, feeling safe and secure within himself, with food for the day, it is as if he acquired the whole world.',
      source: 'Sunan al-Tirmidhi 2346',
    },
  ],
  trust: [
    {
      text: 'If you were to rely upon Allah with the reliance He is due, you would be given provision like the birds: they go out hungry in the morning and come back full in the evening.',
      source: 'Sunan al-Tirmidhi 2344',
    },
    {
      text: 'Be mindful of Allah and He will protect you. Be mindful of Allah and you will find Him in front of you. When you ask, ask Allah; and when you seek help, seek help from Allah.',
      source: 'Sunan al-Tirmidhi 2516',
    },
    {
      text: 'Strive for that which will benefit you, seek the help of Allah, and do not feel helpless. If anything befalls you, do not say: If only I had done such and such; rather say: Allah has decreed and what He wills He does.',
      source: 'Sahih Muslim 2664',
    },
  ],
  forgiveness: [
    {
      text: 'By Him in Whose Hand my soul is, if you were not to commit sins, Allah would replace you with a people who would commit sins and seek forgiveness from Allah, and He would forgive them.',
      source: 'Sahih Muslim 2749',
    },
    {
      text: 'Allah, the Exalted, said: O son of Adam, as long as you call upon Me and ask of Me, I shall forgive you for what you have done, and I shall not mind.',
      source: 'Sunan al-Tirmidhi 3540',
    },
    {
      text: 'All the children of Adam constantly err, but the best of those who constantly err are those who constantly repent.',
      source: 'Sunan al-Tirmidhi 2499',
    },
    {
      text: 'The one who repents from sin is like one who has no sin.',
      source: 'Sunan Ibn Majah 4250',
    },
  ],
  provision: [
    {
      text: 'If you were to rely upon Allah with the reliance He is due, you would be given provision like the birds: they go out hungry in the morning and come back full in the evening.',
      source: 'Sunan al-Tirmidhi 2344',
    },
    {
      text: 'Richness is not having many possessions; rather, true richness is the richness of the soul.',
      source: 'Sahih al-Bukhari 6446',
    },
    {
      text: 'No one eats better food than that which he eats out of the work of his own hands.',
      source: 'Sahih al-Bukhari 2072',
    },
    {
      text: 'Whoever among you wakes up physically healthy, feeling safe and secure within himself, with food for the day, it is as if he acquired the whole world.',
      source: 'Sunan al-Tirmidhi 2346',
    },
  ],
  family: [
    {
      text: 'The best of you is the best to his family, and I am the best among you to my family.',
      source: 'Sunan al-Tirmidhi 3895',
    },
    {
      text: 'He who severs the ties of kinship will not enter Paradise.',
      source: 'Sahih Muslim 2556',
    },
    {
      text: 'Paradise lies at the feet of your mother.',
      source: 'Sunan an-Nasa’i 3104',
    },
    {
      text: 'Whoever would like his provision to be increased and his lifespan to be extended, let him uphold the ties of kinship.',
      source: 'Sahih al-Bukhari 5986',
    },
  ],
  kindness: [
    {
      text: 'Verily, Allah is kind and He loves kindness in all matters.',
      source: 'Sahih al-Bukhari 6927',
    },
    {
      text: 'None of you truly believes until he loves for his brother what he loves for himself.',
      source: 'Sahih al-Bukhari 13',
    },
    {
      text: 'Whoever is not merciful to people, Allah will not be merciful to him.',
      source: 'Sahih al-Bukhari 7376',
    },
    {
      text: 'Kindness is not to be found in anything but that it adds to its beauty, and it is not withdrawn from anything but it makes it defective.',
      source: 'Sahih Muslim 2594',
    },
  ],
  knowledge: [
    {
      text: 'Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise.',
      source: 'Sahih Muslim 2699',
    },
    {
      text: 'Seeking knowledge is an obligation upon every Muslim.',
      source: 'Sunan Ibn Majah 224',
    },
    {
      text: 'When a man dies, his deeds come to an end except for three: ongoing charity, beneficial knowledge, or a righteous child who prays for him.',
      source: 'Sahih Muslim 1631',
    },
    {
      text: 'The best of you are those who learn the Qur’an and teach it.',
      source: 'Sahih al-Bukhari 5027',
    },
  ],
  repentance: [
    {
      text: 'Allah accepts the repentance of His servant as long as the death rattle has not yet reached his throat.',
      source: 'Sunan al-Tirmidhi 3537',
    },
    {
      text: 'By Allah, I seek the forgiveness of Allah and turn to Him in repentance more than seventy times a day.',
      source: 'Sahih al-Bukhari 6307',
    },
    {
      text: 'Allah is more pleased with the repentance of His servant than one of you who found his lost camel in a barren land.',
      source: 'Sahih al-Bukhari 6309',
    },
    {
      text: 'All the children of Adam constantly err, but the best of those who constantly err are those who constantly repent.',
      source: 'Sunan al-Tirmidhi 2499',
    },
  ],
  hardship: [
    {
      text: 'No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim, even if it were the prick he receives from a thorn, but that Allah expiates some of his sins for that.',
      source: 'Sahih al-Bukhari 5641',
    },
    {
      text: 'When Allah intends good for someone, He afflicts him with trials.',
      source: 'Sahih al-Bukhari 5645',
    },
    {
      text: 'The greatest reward comes with the greatest trial. When Allah loves a people, He tests them; whoever accepts it attains His pleasure, and whoever is discontent earns His displeasure.',
      source: 'Sunan al-Tirmidhi 2396',
    },
    {
      text: 'Know that victory comes with patience, relief with affliction, and ease with hardship.',
      source: 'Musnad Ahmad 2803',
    },
  ],
  intention: [
    {
      text: 'Actions are but by intention, and every man shall have only that which he intended.',
      source: 'Sahih al-Bukhari 1',
    },
    {
      text: 'Allah does not look at your appearance or your wealth, but rather He looks at your hearts and your deeds.',
      source: 'Sahih Muslim 2564',
    },
  ],
  prayer: [
    {
      text: 'The first matter that the servant will be brought to account for on the Day of Judgement is the prayer. If it is sound, then the rest of his deeds will be sound.',
      source: 'Sunan al-Tirmidhi 413',
    },
    {
      text: 'The comfort of my eyes has been placed in the prayer.',
      source: 'Sunan an-Nasa’i 3940',
    },
    {
      text: 'The key to Paradise is prayer, and the key to prayer is purification.',
      source: 'Sunan al-Tirmidhi 4',
    },
    {
      text: 'The five daily prayers, and from one Friday to the next, are an expiation for whatever sins come in between, so long as one does not commit a major sin.',
      source: 'Sahih Muslim 233',
    },
  ],
  charity: [
    {
      text: 'Charity does not decrease wealth.',
      source: 'Sahih Muslim 2588',
    },
    {
      text: 'Every act of goodness is charity.',
      source: 'Sahih Muslim 1005',
    },
    {
      text: 'Protect yourself from the Fire even with half a date given in charity.',
      source: 'Sahih al-Bukhari 1417',
    },
    {
      text: 'The believer’s shade on the Day of Resurrection will be his charity.',
      source: 'Sunan al-Tirmidhi 604',
    },
  ],
  hope: [
    {
      text: 'Allah, the Exalted, says: I am as My servant thinks of Me, and I am with him when he remembers Me.',
      source: 'Sahih al-Bukhari 7405',
    },
    {
      text: 'None of you should die except while assuming the best about Allah, the Mighty and Sublime.',
      source: 'Sahih Muslim 2877',
    },
    {
      text: 'Allah’s mercy prevails over His wrath.',
      source: 'Sahih al-Bukhari 7404',
    },
    {
      text: 'Allah divided mercy into one hundred parts; He kept ninety-nine and sent down one part to the earth, and through it creation is merciful to one another.',
      source: 'Sahih al-Bukhari 6469',
    },
  ],
  anger: [
    {
      text: 'The strong man is not the one who can wrestle others down. The strong man is the one who controls himself when he is angry.',
      source: 'Sahih al-Bukhari 6114',
    },
    {
      text: 'Do not become angry. The man repeated his request and the Prophet said: Do not become angry.',
      source: 'Sahih al-Bukhari 6116',
    },
    {
      text: 'Whoever restrains his anger while able to act upon it, Allah will call him before all of creation and let him choose of the maidens of Paradise whichever he wishes.',
      source: 'Sunan Abi Dawud 4777',
    },
  ],
  humility: [
    {
      text: 'No one who has an atom’s weight of arrogance in his heart will enter Paradise.',
      source: 'Sahih Muslim 91',
    },
    {
      text: 'Charity does not decrease wealth, no one forgives another but Allah increases his honour, and no one humbles himself for the sake of Allah but Allah raises his status.',
      source: 'Sahih Muslim 2588',
    },
    {
      text: 'Allah has revealed to me that you should be humble, so that no one wrongs another or boasts over another.',
      source: 'Sahih Muslim 2865',
    },
  ],
  honesty: [
    {
      text: 'Truthfulness leads to righteousness, and righteousness leads to Paradise. A man keeps telling the truth until he is recorded with Allah as truthful.',
      source: 'Sahih al-Bukhari 6094',
    },
    {
      text: 'Whoever deceives us is not one of us.',
      source: 'Sahih Muslim 101',
    },
    {
      text: 'The signs of a hypocrite are three: when he speaks he lies, when he promises he breaks it, and when he is entrusted he betrays.',
      source: 'Sahih al-Bukhari 33',
    },
  ],
  contentment: [
    {
      text: 'Richness is not having many possessions; rather, true richness is the richness of the soul.',
      source: 'Sahih al-Bukhari 6446',
    },
    {
      text: 'Successful is the one who has accepted Islam, is granted sufficient provision, and Allah makes him content with what He has given him.',
      source: 'Sahih Muslim 1054',
    },
    {
      text: 'Look at those who are lower than you and do not look at those who are higher than you, lest you belittle the favours of Allah upon you.',
      source: 'Sahih Muslim 2963',
    },
  ],
  brotherhood: [
    {
      text: 'None of you truly believes until he loves for his brother what he loves for himself.',
      source: 'Sahih al-Bukhari 13',
    },
    {
      text: 'The believers, in their mutual love, mercy, and compassion, are like a single body: when one limb suffers, the whole body responds with wakefulness and fever.',
      source: 'Sahih Muslim 2586',
    },
    {
      text: 'A Muslim is the brother of a Muslim. He does not wrong him, nor does he forsake him.',
      source: 'Sahih al-Bukhari 2442',
    },
    {
      text: 'Whoever relieves a believer of a hardship in this world, Allah will relieve him of a hardship on the Day of Resurrection.',
      source: 'Sahih Muslim 2699',
    },
  ],
  marriage: [
    {
      text: 'The best of you is the best to his family, and I am the best among you to my family.',
      source: 'Sunan al-Tirmidhi 3895',
    },
    {
      text: 'A woman is married for four things: her wealth, her lineage, her beauty, and her religion. So choose the one with religion, may your hands be rubbed with dust.',
      source: 'Sahih al-Bukhari 5090',
    },
    {
      text: 'The most complete of the believers in faith is the one with the best character, and the best of you are those who are best to their wives.',
      source: 'Sunan al-Tirmidhi 1162',
    },
  ],
  health: [
    {
      text: 'There are two blessings which many people do not make the most of and thus lose out: good health and free time.',
      source: 'Sahih al-Bukhari 6412',
    },
    {
      text: 'There is no disease that Allah has sent down except that He also has sent down its cure.',
      source: 'Sahih al-Bukhari 5678',
    },
    {
      text: 'Whoever among you wakes up physically healthy, feeling safe and secure within himself, with food for the day, it is as if he acquired the whole world.',
      source: 'Sunan al-Tirmidhi 2346',
    },
  ],
  dhikr: [
    {
      text: 'The example of the one who remembers his Lord and the one who does not is like that of the living and the dead.',
      source: 'Sahih al-Bukhari 6407',
    },
    {
      text: 'There are two phrases light on the tongue, heavy on the scale, beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil-‘Azim.',
      source: 'Sahih al-Bukhari 6406',
    },
    {
      text: 'Allah, the Exalted, says: I am as My servant thinks of Me, and I am with him when he remembers Me. If he remembers Me within himself, I remember him within Myself.',
      source: 'Sahih al-Bukhari 7405',
    },
  ],
  character: [
    {
      text: 'The most complete of the believers in faith is the one with the best character.',
      source: 'Sunan al-Tirmidhi 1162',
    },
    {
      text: 'I have only been sent to perfect good character.',
      source: 'Musnad Ahmad 8952',
    },
    {
      text: 'Nothing is heavier on the scale of deeds than one’s good character.',
      source: 'Sunan Abi Dawud 4799',
    },
    {
      text: 'The best among you are those who have the best manners and character.',
      source: 'Sahih al-Bukhari 3559',
    },
  ],
  death: [
    {
      text: 'Remember often the destroyer of pleasures: death.',
      source: 'Sunan al-Tirmidhi 2307',
    },
    {
      text: 'When a man dies, his deeds come to an end except for three: ongoing charity, beneficial knowledge, or a righteous child who prays for him.',
      source: 'Sahih Muslim 1631',
    },
    {
      text: 'Be in this world as though you were a stranger or a traveler along a path.',
      source: 'Sahih al-Bukhari 6416',
    },
  ],
  general: [
    {
      text: 'How wonderful is the affair of the believer, for all his affairs are good. If something good happens to him, he is thankful; and if something bad happens to him, he bears it with patience, and that is good for him.',
      source: 'Sahih Muslim 2999',
    },
    {
      text: 'None of you truly believes until he loves for his brother what he loves for himself.',
      source: 'Sahih al-Bukhari 13',
    },
    {
      text: 'Be mindful of Allah and He will protect you. When you ask, ask Allah; and when you seek help, seek help from Allah.',
      source: 'Sunan al-Tirmidhi 2516',
    },
    {
      text: 'The most beloved of deeds to Allah are those that are most consistent, even if they are small.',
      source: 'Sahih al-Bukhari 6464',
    },
  ],
}

export function selectHadith(theme: string | undefined): Hadith {
  const key = (theme || 'general').toLowerCase().trim()
  const list = HADITH_LIBRARY[key] || HADITH_LIBRARY.general
  return list[Math.floor(Math.random() * list.length)]
}
