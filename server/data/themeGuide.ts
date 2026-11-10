import type { ThemeKey } from './themes.js'

// Plain, general guidance used when the model is unavailable or its output is rejected.
// These lines are ordinary advice. They are never presented as a quotation, a ruling,
// or something the Prophet ﷺ said. All religious text comes from the source libraries.

export interface ThemeGuide {
  reflections: [string, string]
  steps: [string, string, string]
  followUps: [string, string]
}

export const THEME_GUIDE: Record<ThemeKey, ThemeGuide> = {
  anxiety: {
    reflections: [
      'Worry grows when we carry tomorrow today. Bring your heart back to the present moment and place the rest with Allah.',
      'Feeling anxious does not mean your faith is weak. It means you are human and in need of support.',
    ],
    steps: [
      'Slow your breathing, pray calmly, and tell Allah exactly what is weighing on you.',
      'Keep your morning and evening remembrances, even if you can only manage a few minutes.',
      'Write down what you can act on today and what is out of your hands, then entrust the second list to Allah in duʿāʾ.',
    ],
    followUps: ['How can I calm my thoughts at night?', 'What can I do when I feel overwhelmed during the day?'],
  },
  patience: {
    reflections: [
      'Patience is not silence or pretending. It is staying steady and turning to Allah while the test is still unfolding.',
      'Small, consistent acts of steadiness matter more than one heroic effort.',
    ],
    steps: [
      'Name the one thing you are being patient with, and decide the next small action within your control.',
      'Keep your five daily prayers as an anchor, especially when the day feels heavy.',
      'Lean on a friend or elder who can encourage you to stay the course.',
    ],
    followUps: ['How do I stay patient when nothing seems to change?', 'How can I stop complaining during a hard time?'],
  },
  gratitude: {
    reflections: [
      'Gratitude turns attention from what is missing to what is already here.',
      'Thankfulness is shown by the tongue, the heart and by how we use what we have been given.',
    ],
    steps: [
      'Each night, name three blessings from the day and thank Allah for them specifically.',
      'Thank the people who helped you, in words or in a small gift.',
      'Use one blessing, such as your time, health or skill, to help someone else this week.',
    ],
    followUps: ['How can I be grateful when life feels hard?', 'How do I stop taking my blessings for granted?'],
  },
  trust: {
    reflections: [
      'Trusting Allah means doing your part with care, then letting go of what is not yours to control.',
      'Reliance on Allah is not passive. It sits beside effort, planning and good action.',
    ],
    steps: [
      'Do the practical thing that is in front of you today, and then make your duʿāʾ with a settled heart.',
      'When the outcome is uncertain, remind yourself that Allah’s knowledge covers what you cannot see.',
      'Talk to a trusted person to check that you are acting wisely, not only hoping.',
    ],
    followUps: ['How do I trust Allah when the future is unclear?', 'What is the difference between trust and doing nothing?'],
  },
  forgiveness: {
    reflections: [
      'Seeking forgiveness is a sign that the heart is alive and still turning toward Allah.',
      'Forgiving people frees you from carrying their weight.',
    ],
    steps: [
      'Make sincere istighfar several times a day, slowly and with presence of heart.',
      'If you wronged someone, make amends or apologise where you safely can.',
      'If someone wronged you, decide to let go of the grudge even if the relationship needs distance.',
    ],
    followUps: ['How do I know if my repentance is accepted?', 'How can I forgive someone who hurt me deeply?'],
  },
  provision: {
    reflections: [
      'Provision comes through effort and through Allah. Ease and difficulty both pass through His wisdom.',
      'Financial stress is real. Seeking lawful earning with patience is itself worship.',
    ],
    steps: [
      'Make a simple plan: list your expenses, one income step to try this week, and one thing you can cut.',
      'Ask Allah for lawful provision, and keep away from shortcuts that involve haram or deception.',
      'Give something small in charity, even a little, and speak with someone experienced about your next career move.',
    ],
    followUps: ['How can I deal with debt in a way that pleases Allah?', 'How should I choose between two job offers?'],
  },
  family: {
    reflections: [
      'Family bonds are tested most by the people closest to us, and patient kindness is rarely wasted.',
      'You can only control your own conduct. Do your part well, and leave the hearts of others to Allah.',
    ],
    steps: [
      'Reach out first with a kind message or visit, without waiting for the other person.',
      'Choose a calm moment to talk, and listen fully before explaining yourself.',
      'Make duʿāʾ for your family by name, and for ease between you.',
    ],
    followUps: ['How do I handle a family member who keeps hurting me?', 'How can I be kind to my parents when we disagree?'],
  },
  kindness: {
    reflections: [
      'Gentleness changes hearts in ways that harshness rarely does.',
      'Mercy begins at home, with the people we see every day.',
    ],
    steps: [
      'Choose one person today and do something small and kind for them quietly.',
      'Pause before responding when you are irritated, and choose the gentler words.',
      'Help someone without expecting anything back, even in a way that is never mentioned.',
    ],
    followUps: ['How can I be kind to people who are unkind to me?', 'How do I stay gentle when I am tired?'],
  },
  knowledge: {
    reflections: [
      'Seeking knowledge is an act of worship when done with sincerity and good manners.',
      'Learning works best in small, regular steps with a trustworthy teacher.',
    ],
    steps: [
      'Set a small daily time for study, even twenty minutes, and protect it.',
      'Learn from qualified teachers and reliable books rather than random clips.',
      'Before you begin, renew your intention and ask Allah to make the knowledge beneficial.',
    ],
    followUps: ['How can I stay consistent with studying?', 'What should I learn first about my deen?'],
  },
  repentance: {
    reflections: [
      'The door of return stays open. The first step is simply turning back, again and again.',
      'Shame can keep us away from Allah, while honest repentance draws us near.',
    ],
    steps: [
      'Stop the sin as soon as you can, regret it sincerely, and resolve not to return.',
      'Replace the habit with something good, and avoid the places and triggers that lead to it.',
      'If you slip again, do not despair. Start again immediately and seek help from a trusted person.',
    ],
    followUps: ['What if I keep falling into the same sin?', 'How do I rebuild my relationship with Allah after a long time away?'],
  },
  hardship: {
    reflections: [
      'A hard season is not a sign that Allah has left you. It is often where growth and nearness are found.',
      'You do not have to understand the wisdom now to keep going with dignity.',
    ],
    steps: [
      'Break the problem into the next small step you can take today.',
      'Hold on to your prayers, and add extra dhikr and duʿāʾ at night.',
      'Share what you are going through with someone safe so you are not carrying it alone.',
    ],
    followUps: ['How do I keep going when I feel exhausted?', 'How can I see wisdom in a loss?'],
  },
  intention: {
    reflections: [
      'Sincerity is renewed often. A good deed grows or shrinks by what is in the heart behind it.',
      'It is easy to be noticed and hard to be sincere. Ask Allah for the second.',
    ],
    steps: [
      'Before a task, pause and silently ask yourself who it is for.',
      'Do some good deeds in private where only Allah knows.',
      'When praise comes, thank Allah and return the credit to Him.',
    ],
    followUps: ['How do I fight showing off?', 'How do I know if my intention is sincere?'],
  },
  prayer: {
    reflections: [
      'Prayer is a meeting, not a task. Come to it as a person in need.',
      'Consistency comes before perfection. Return to it every time you drift.',
    ],
    steps: [
      'Pray at the beginning of the time when possible, and put your phone out of reach.',
      'Learn the meaning of what you recite so your heart can follow your tongue.',
      'Add one small habit, such as two units after the adhān, and keep it steady.',
    ],
    followUps: ['How can I focus better in prayer?', 'How do I become consistent with Fajr?'],
  },
  charity: {
    reflections: [
      'Giving purifies the heart and reminds us that what we have is a trust.',
      'Small, steady giving is better than rare large gifts that never repeat.',
    ],
    steps: [
      'Set a fixed amount for charity each week, however small.',
      'Give to someone you know is in need, quietly and without embarrassment for them.',
      'Give your time or skill if money is tight, and make duʿāʾ for the recipient.',
    ],
    followUps: ['How can I give when my own finances are tight?', 'Who should I give to first?'],
  },
  hope: {
    reflections: [
      'Despair says there is no way out. Faith says Allah is closer than the problem.',
      'Your worth is not decided by your worst day or your longest struggle.',
    ],
    steps: [
      'Say a short duʿāʾ in your own words tonight and ask Allah plainly for what you hope for.',
      'Do one small good deed today to remind yourself that goodness is still possible.',
      'Speak to someone supportive, and do not wait until things are perfect to ask for help.',
    ],
    followUps: ['How do I stop feeling far from Allah?', 'What can I do when I feel hopeless?'],
  },
  anger: {
    reflections: [
      'Anger is a feeling. What you do with it is a choice.',
      'The strongest response is often a quiet pause.',
    ],
    steps: [
      'When anger rises, stop speaking, change your position, and take a slow breath.',
      'Make wudu or step away from the situation for a few minutes before replying.',
      'Later, calmly state what bothered you and what you need, without attacking the person.',
    ],
    followUps: ['How can I control my temper at home?', 'How do I forgive someone who made me angry?'],
  },
  humility: {
    reflections: [
      'Humility is seeing yourself truthfully before Allah and before people.',
      'Pride hides behind many forms, including being proud of your humility.',
    ],
    steps: [
      'Thank those who helped you, and admit when you were wrong.',
      'Do a simple service, like helping at home or the masjid, that nobody asked you to do.',
      'Ask Allah to protect you from arrogance, even in your good deeds.',
    ],
    followUps: ['How do I recognise pride in myself?', 'How can I stay humble after success?'],
  },
  honesty: {
    reflections: [
      'Truthfulness builds trust slowly and breaks it quickly when abandoned.',
      'Honesty includes being honest with yourself.',
    ],
    steps: [
      'Choose one situation this week where you will be fully truthful, even if it is uncomfortable.',
      'Keep your promises, and say no when you cannot keep them.',
      'If you made a mistake, own it early and fix it.',
    ],
    followUps: ['How can I tell the truth without hurting someone?', 'How do I rebuild trust after I lied?'],
  },
  contentment: {
    reflections: [
      'Contentment is not having everything. It is the heart being at peace with what Allah has given.',
      'Comparison steals joy. Looking at your own path restores it.',
    ],
    steps: [
      'Limit time on social media that makes you feel behind.',
      'Write down what you already have that you once prayed for.',
      'Work on your goals with effort, but let the result rest with Allah.',
    ],
    followUps: ['How do I stop comparing myself to others?', 'How can I be content and still ambitious?'],
  },
  brotherhood: {
    reflections: [
      'Good friendship is a form of worship when it is built on honesty and care.',
      'Unity begins with small acts, such as greeting, listening and making space.',
    ],
    steps: [
      'Reach out to a friend you have not checked on lately.',
      'Settle a disagreement by speaking privately and kindly.',
      'Join or help a local community effort, even in a small way.',
    ],
    followUps: ['How do I choose good friends?', 'How can I repair a friendship that broke?'],
  },
  marriage: {
    reflections: [
      'A good marriage is built daily through patience, honesty and kindness.',
      'Two imperfect people can make a home of peace when both aim at pleasing Allah.',
    ],
    steps: [
      'Set aside regular time to talk about your day without screens.',
      'Say thank you and make duʿāʾ for your spouse often.',
      'When you disagree, speak calmly, listen fully, and seek counsel from a wise person if needed.',
    ],
    followUps: ['How can I improve communication with my spouse?', 'What should I look for in a spouse?'],
  },
  health: {
    reflections: [
      'Health is a trust. Caring for the body is part of caring for your faith.',
      'Illness can soften the heart while we seek treatment with effort.',
    ],
    steps: [
      'See a qualified doctor and follow the treatment plan you are given.',
      'Make duʿāʾ for healing, and keep up your prayers as much as you are able.',
      'Rest, eat well, and accept help from family and friends.',
    ],
    followUps: ['How do I stay patient during a long illness?', 'How do I look after my health better?'],
  },
  dhikr: {
    reflections: [
      'Remembrance turns ordinary moments into worship.',
      'A few minutes every day beats a burst of effort that fades.',
    ],
    steps: [
      'Choose a fixed time, such as after prayer, for a short daily dhikr.',
      'Use idle moments, like walking or waiting, to say a simple remembrance.',
      'Read the morning and evening adhkar from a reliable collection.',
    ],
    followUps: ['What adhkar should I say daily?', 'How can I stay consistent with dhikr?'],
  },
  character: {
    reflections: [
      'Character is shaped by small choices repeated until they become habit.',
      'Good manners are a way of honouring other people and honouring Allah.',
    ],
    steps: [
      'Pick one quality, such as patience or honesty, and practise it deliberately this week.',
      'At night, review the day gently and note one thing to improve.',
      'Spend time with people whose manners you admire.',
    ],
    followUps: ['How do I change a bad habit?', 'How can I improve my manners at home?'],
  },
  death: {
    reflections: [
      'Remembering death softens the heart and sharpens priorities.',
      'Grief is natural, and hope in Allah’s mercy can sit beside it.',
    ],
    steps: [
      'Make duʿāʾ for those who have passed, and give charity on their behalf if you can.',
      'Settle any debts or unfinished matters you are responsible for.',
      'Spend time with people who are living, and tell them you love them.',
    ],
    followUps: ['How do I cope with losing someone I love?', 'How can I prepare for the hereafter?'],
  },
  guidance: {
    reflections: [
      'When you are unsure, seek counsel, seek Allah’s guidance, then act with trust.',
      'A good decision is one made with knowledge, consultation and sincerity.',
    ],
    steps: [
      'Write down the options and the real pros and cons of each.',
      'Consult someone wise and trustworthy, then pray istikhārah and make your decision.',
      'After deciding, act with confidence and accept the result with patience.',
    ],
    followUps: ['How do I pray istikhārah properly?', 'What if I make the wrong decision?'],
  },
  general: {
    reflections: [
      'Turn to Allah in every state, in ease and in difficulty.',
      'Small, consistent good deeds shape a life.',
    ],
    steps: [
      'Keep your five daily prayers with presence.',
      'Keep your tongue moist with dhikr during the day.',
      'Make sincere duʿāʾ and surrender your worries to Allah.',
    ],
    followUps: ['What daily habits help build closeness to Allah?', 'How can I stay hopeful during a hard season?'],
  },
}

export const OPENERS = [
  'May Allah ease what is on your heart. Here is what the Qurʾān and the authentic Sunnah offer on what you shared.',
  'Thank you for trusting me with this. May Allah grant you clarity and peace as you read what follows.',
  'I am glad you asked. May Allah make this beneficial for you.',
]

export const FALLBACK_STEPS = [
  'Keep your five daily prayers, and give them your full presence.',
  'Make a short, honest duʿāʾ about this matter every day.',
  'Speak to someone you trust, and consult a knowledgeable person where a ruling is involved.',
]
