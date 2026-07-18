// Curated library of authentic supplications from Hisnul Muslim (Fortress of the
// Muslim), with their original hadith sources. We select a duʿāʾ by theme rather
// than letting the model generate the Arabic/transliteration itself (which it can
// distort). Every entry here is a well-known prophetic duʿāʾ.

export interface Dua {
  arabic: string
  transliteration: string
  translation: string
  source: string
}

export const DUA_LIBRARY: Record<string, Dua[]> = {
  anxiety: [
    {
      arabic:
        'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
      transliteration:
        'Allāhumma innī aʿūdhu bika minal-hammi wal-ḥazan, wal-ʿajzi wal-kasal, wal-bukhli wal-jubn, wa ḍalaʿid-dayni wa ghalabatir-rijāl',
      translation:
        'O Allah, I seek refuge in You from worry and grief, from helplessness and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men.',
      source: 'Hisnul Muslim; Sahih al-Bukhari 6369',
    },
    {
      arabic:
        'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
      transliteration: 'Ḥasbunā-llāhu wa niʿmal-wakīl',
      translation: 'Allah is sufficient for us, and He is the best Disposer of affairs.',
      source: 'Hisnul Muslim; Sahih al-Bukhari 4563',
    },
  ],
  hardship: [
    {
      arabic:
        'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
      transliteration:
        'Lā ilāha illa-llāhul-ʿaẓīmul-ḥalīm, lā ilāha illa-llāhu rabbul-ʿarshil-ʿaẓīm, lā ilāha illa-llāhu rabbus-samāwāti wa rabbul-arḍi wa rabbul-ʿarshil-karīm',
      translation:
        'There is none worthy of worship but Allah, the Mighty, the Forbearing. There is none worthy of worship but Allah, Lord of the Magnificent Throne. There is none worthy of worship but Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.',
      source: 'Hisnul Muslim; Sahih al-Bukhari 6346, Sahih Muslim 2730',
    },
    {
      arabic:
        'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ',
      transliteration:
        'Allāhumma raḥmataka arjū falā takilnī ilā nafsī ṭarfata ʿayn, wa aṣliḥ lī sha’nī kullah, lā ilāha illā ant',
      translation:
        'O Allah, I hope for Your mercy, so do not leave me to myself even for the blink of an eye, and set right all of my affairs. There is none worthy of worship but You.',
      source: 'Hisnul Muslim; Sunan Abi Dawud 5090',
    },
  ],
  patience: [
    {
      arabic:
        'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا',
      transliteration: 'Rabbanā afrigh ʿalaynā ṣabran wa thabbit aqdāmanā',
      translation: 'Our Lord, pour upon us patience and make firm our footsteps.',
      source: 'Hisnul Muslim; Qurʾān, Al-Baqarah 2:250',
    },
    {
      arabic:
        'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ',
      transliteration:
        'Allāhumma raḥmataka arjū falā takilnī ilā nafsī ṭarfata ʿayn, wa aṣliḥ lī sha’nī kullah, lā ilāha illā ant',
      translation:
        'O Allah, I hope for Your mercy, so do not leave me to myself even for the blink of an eye, and set right all of my affairs. There is none worthy of worship but You.',
      source: 'Hisnul Muslim; Sunan Abi Dawud 5090',
    },
  ],
  forgiveness: [
    {
      arabic:
        'اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ، وَعَلَانِيَتَهُ وَسِرَّهُ',
      transliteration:
        'Allāhumma-ghfir lī dhanbī kullah, diqqahu wa jillah, wa awwalahu wa ākhirah, wa ʿalāniyatahu wa sirrah',
      translation:
        'O Allah, forgive me all my sins, the small and the great, the first and the last, the open and the secret.',
      source: 'Hisnul Muslim; Sahih Muslim 483',
    },
    {
      arabic:
        'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
      transliteration: 'Rabbi-ghfir lī wa tub ʿalayya innaka antat-tawwābur-raḥīm',
      translation:
        'My Lord, forgive me and accept my repentance. Verily, You are the Ever-Relenting, the Most Merciful.',
      source: 'Hisnul Muslim; Sunan Abi Dawud 1516',
    },
  ],
  repentance: [
    {
      arabic:
        'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      transliteration:
        'Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa ana ʿabduk, wa ana ʿalā ʿahdika wa waʿdika mas-taṭaʿt, aʿūdhu bika min sharri mā ṣanaʿt, abū’u laka biniʿmatika ʿalayy, wa abū’u bidhanbī faghfir lī fa’innahu lā yaghfirudh-dhunūba illā ant',
      translation:
        'O Allah, You are my Lord, there is none worthy of worship but You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favour upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You. (Sayyid al-Istighfār)',
      source: 'Hisnul Muslim; Sahih al-Bukhari 6306',
    },
    {
      arabic:
        'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
      transliteration: 'Rabbi-ghfir lī wa tub ʿalayya innaka antat-tawwābur-raḥīm',
      translation:
        'My Lord, forgive me and accept my repentance. Verily, You are the Ever-Relenting, the Most Merciful.',
      source: 'Hisnul Muslim; Sunan Abi Dawud 1516',
    },
  ],
  trust: [
    {
      arabic:
        'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
      transliteration:
        'Ḥasbiya-llāhu lā ilāha illā huwa ʿalayhi tawakkalt, wa huwa rabbul-ʿarshil-ʿaẓīm',
      translation:
        'Allah is sufficient for me. There is none worthy of worship but Him. Upon Him I rely, and He is the Lord of the Magnificent Throne.',
      source: 'Hisnul Muslim; Qurʾān, At-Tawbah 9:129',
    },
    {
      arabic:
        'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
      transliteration: 'Ḥasbunā-llāhu wa niʿmal-wakīl',
      translation: 'Allah is sufficient for us, and He is the best Disposer of affairs.',
      source: 'Hisnul Muslim; Sahih al-Bukhari 4563',
    },
  ],
  provision: [
    {
      arabic:
        'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
      transliteration:
        'Allāhumma-kfinī biḥalālika ʿan ḥarāmik, wa aghninī bifaḍlika ʿamman siwāk',
      translation:
        'O Allah, suffice me with what You have made lawful so I have no need of what You have forbidden, and enrich me by Your grace so I have no need of anyone besides You.',
      source: 'Hisnul Muslim; Sunan al-Tirmidhi 3563',
    },
    {
      arabic:
        'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
      transliteration: 'Allāhumma innī as’aluka ʿilman nāfiʿā, wa rizqan ṭayyibā, wa ʿamalan mutaqabbalā',
      translation:
        'O Allah, I ask You for beneficial knowledge, wholesome provision, and accepted deeds.',
      source: 'Hisnul Muslim; Sunan Ibn Majah 925',
    },
  ],
  knowledge: [
    {
      arabic:
        'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا',
      transliteration:
        'Allāhumma-nfaʿnī bimā ʿallamtanī, wa ʿallimnī mā yanfaʿunī, wa zidnī ʿilmā',
      translation:
        'O Allah, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge.',
      source: 'Hisnul Muslim; Sunan Ibn Majah 3833',
    },
    {
      arabic:
        'رَبِّ زِدْنِي عِلْمًا',
      transliteration: 'Rabbi zidnī ʿilmā',
      translation: 'My Lord, increase me in knowledge.',
      source: 'Hisnul Muslim; Qurʾān, Ta-Ha 20:114',
    },
  ],
  health: [
    {
      arabic:
        'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
      transliteration:
        'Allāhumma ʿāfinī fī badanī, Allāhumma ʿāfinī fī samʿī, Allāhumma ʿāfinī fī baṣarī, lā ilāha illā ant',
      translation:
        'O Allah, grant my body health. O Allah, grant my hearing health. O Allah, grant my sight health. There is none worthy of worship but You.',
      source: 'Hisnul Muslim; Sunan Abi Dawud 5090',
    },
    {
      arabic:
        'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
      transliteration: 'Allāhumma innī as’alukal-ʿāfiyata fid-dunyā wal-ākhirah',
      translation: 'O Allah, I ask You for well-being in this world and the Hereafter.',
      source: 'Hisnul Muslim; Sunan Ibn Majah 3871',
    },
  ],
  gratitude: [
    {
      arabic:
        'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ',
      transliteration: 'Allāhumma aʿinnī ʿalā dhikrika, wa shukrika, wa ḥusni ʿibādatik',
      translation:
        'O Allah, help me to remember You, to give thanks to You, and to worship You in the best manner.',
      source: 'Hisnul Muslim; Sunan Abi Dawud 1522',
    },
    {
      arabic:
        'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ',
      transliteration: 'Rabbi awziʿnī an ashkura niʿmatakal-latī anʿamta ʿalayya',
      translation: 'My Lord, enable me to be grateful for the favour You have bestowed upon me.',
      source: 'Hisnul Muslim; Qurʾān, An-Naml 27:19',
    },
  ],
  dhikr: [
    {
      arabic:
        'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ',
      transliteration: 'Allāhumma aʿinnī ʿalā dhikrika, wa shukrika, wa ḥusni ʿibādatik',
      translation:
        'O Allah, help me to remember You, to give thanks to You, and to worship You in the best manner.',
      source: 'Hisnul Muslim; Sunan Abi Dawud 1522',
    },
    {
      arabic:
        'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
      transliteration: 'Subḥāna-llāhi wa biḥamdih, subḥāna-llāhil-ʿaẓīm',
      translation: 'Glory be to Allah and praise be to Him; glory be to Allah, the Magnificent.',
      source: 'Hisnul Muslim; Sahih al-Bukhari 6406',
    },
  ],
  anger: [
    {
      arabic:
        'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
      transliteration: 'Aʿūdhu billāhi minash-shayṭānir-rajīm',
      translation: 'I seek refuge in Allah from Satan, the accursed.',
      source: 'Hisnul Muslim; Sahih al-Bukhari 3282, Sahih Muslim 2610',
    },
  ],
  family: [
    {
      arabic:
        'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
      transliteration:
        'Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata aʿyun, wajʿalnā lil-muttaqīna imāmā',
      translation:
        'Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us a leader for the righteous.',
      source: 'Hisnul Muslim; Qurʾān, Al-Furqan 25:74',
    },
  ],
  marriage: [
    {
      arabic:
        'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
      transliteration:
        'Rabbanā hab lanā min azwājinā wa dhurriyyātinā qurrata aʿyun, wajʿalnā lil-muttaqīna imāmā',
      translation:
        'Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us a leader for the righteous.',
      source: 'Hisnul Muslim; Qurʾān, Al-Furqan 25:74',
    },
  ],
  hope: [
    {
      arabic:
        'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ',
      transliteration:
        'Allāhumma raḥmataka arjū falā takilnī ilā nafsī ṭarfata ʿayn, wa aṣliḥ lī sha’nī kullah, lā ilāha illā ant',
      translation:
        'O Allah, I hope for Your mercy, so do not leave me to myself even for the blink of an eye, and set right all of my affairs. There is none worthy of worship but You.',
      source: 'Hisnul Muslim; Sunan Abi Dawud 5090',
    },
  ],
  contentment: [
    {
      arabic:
        'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
      transliteration: 'Allāhumma innī as’alukal-hudā wat-tuqā wal-ʿafāfa wal-ghinā',
      translation:
        'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.',
      source: 'Hisnul Muslim; Sahih Muslim 2721',
    },
  ],
  character: [
    {
      arabic:
        'اللَّهُمَّ اهْدِنِي لِأَحْسَنِ الْأَخْلَاقِ لَا يَهْدِي لِأَحْسَنِهَا إِلَّا أَنْتَ، وَاصْرِفْ عَنِّي سَيِّئَهَا لَا يَصْرِفُ عَنِّي سَيِّئَهَا إِلَّا أَنْتَ',
      transliteration:
        'Allāhumma-hdinī li’aḥsanil-akhlāqi lā yahdī li’aḥsanihā illā ant, waṣrif ʿannī sayyi’ahā lā yaṣrifu ʿannī sayyi’ahā illā ant',
      translation:
        'O Allah, guide me to the best of manners, for none can guide to the best of them but You; and turn me away from evil manners, for none can turn me away from them but You.',
      source: 'Hisnul Muslim; Sahih Muslim 771',
    },
  ],
  prayer: [
    {
      arabic:
        'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ',
      transliteration: 'Rabbi-jʿalnī muqīmaṣ-ṣalāti wa min dhurriyyatī rabbanā wa taqabbal duʿā’',
      translation:
        'My Lord, make me an establisher of prayer, and many from my descendants. Our Lord, and accept my supplication.',
      source: 'Hisnul Muslim; Qurʾān, Ibrahim 14:40',
    },
  ],
  guidance: [
    {
      arabic:
        'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
      transliteration: 'Allāhumma innī as’alukal-hudā wat-tuqā wal-ʿafāfa wal-ghinā',
      translation:
        'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.',
      source: 'Hisnul Muslim; Sahih Muslim 2721',
    },
  ],
  general: [
    {
      arabic:
        'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      transliteration:
        'Rabbanā ātinā fid-dunyā ḥasanah, wa fil-ākhirati ḥasanah, wa qinā ʿadhāban-nār',
      translation:
        'Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
      source: 'Hisnul Muslim; Sahih al-Bukhari 6389',
    },
    {
      arabic:
        'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
      transliteration: 'Allāhumma innī as’alukal-hudā wat-tuqā wal-ʿafāfa wal-ghinā',
      translation:
        'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.',
      source: 'Hisnul Muslim; Sahih Muslim 2721',
    },
  ],
}

// Select one authentic Hisnul Muslim duʿāʾ matching the given theme.
export function selectDua(theme: string | undefined): Dua {
  const key = (theme || 'general').toLowerCase().trim()
  const list = DUA_LIBRARY[key] || DUA_LIBRARY.general
  return list[Math.floor(Math.random() * list.length)]
}
