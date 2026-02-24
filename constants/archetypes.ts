export type Archetype = 'Warrior' | 'Lover' | 'Sage' | 'Seeker';

export const ARCHETYPE_DESCRIPTIONS: Record<Archetype, string> = {
  Warrior:
    'You move through pain with force and discipline. Your strength is in action — when you channel it, nothing stops you.',
  Lover:
    'You heal through connection and vulnerability. Your strength is in feeling deeply — that courage is rare.',
  Sage:
    'You process through understanding and clarity. Your strength is in wisdom — you see what others miss.',
  Seeker:
    'You transform through growth and meaning. Your strength is in adaptability — you find the lesson in everything.',
};

export const ARCHETYPE_MOTIVATIONAL_LINES: Record<Archetype, string> = {
  Warrior:
    'Discipline is your shield. The urge is just another opponent — you have beaten worse.',
  Lover:
    'What you feel right now is real. You do not have to act on it to honor it.',
  Sage: 'You already know what this is. Clarity is your superpower — use it now.',
  Seeker:
    'Every hard moment is data. You are not falling back — you are learning forward.',
};

export const QUIZ_QUESTIONS: Array<{
  question: string;
  answers: Array<{ text: string; archetype: Archetype }>;
}> = [
  {
    question: 'When facing a challenge, your first instinct?',
    answers: [
      { text: 'Attack it head-on', archetype: 'Warrior' },
      { text: 'Seek connection and support', archetype: 'Lover' },
      { text: 'Analyze it carefully', archetype: 'Sage' },
      { text: 'Find the lesson in it', archetype: 'Seeker' },
    ],
  },
  {
    question: 'What does strength look like to you?',
    answers: [
      { text: 'Discipline and power', archetype: 'Warrior' },
      { text: 'Emotional courage', archetype: 'Lover' },
      { text: 'Wisdom and clarity', archetype: 'Sage' },
      { text: 'Growth and adaptability', archetype: 'Seeker' },
    ],
  },
  {
    question: 'In your darkest moments, you crave?',
    answers: [
      { text: 'Action — move or fight', archetype: 'Warrior' },
      { text: 'Closeness — to feel held', archetype: 'Lover' },
      { text: 'Clarity — to understand', archetype: 'Sage' },
      { text: 'Meaning — the lesson', archetype: 'Seeker' },
    ],
  },
  {
    question: 'The best version of you is?',
    answers: [
      { text: 'Unbreakable. Disciplined.', archetype: 'Warrior' },
      { text: 'Open. Loving. Connected.', archetype: 'Lover' },
      { text: 'Clear-minded. Wise.', archetype: 'Sage' },
      { text: 'Free. Evolving.', archetype: 'Seeker' },
    ],
  },
];

// Phase 2 options for the Surrender Wedge
export const SURRENDER_EMOTIONAL_STATES = ['Stress', 'Loneliness', 'Boredom', 'Pain'] as const;
export type SurrenderEmotionalState = (typeof SURRENDER_EMOTIONAL_STATES)[number];

// 16 intervention combinations: 4 archetypes × 4 emotional states
export const INTERVENTIONS: Record<Archetype, Record<SurrenderEmotionalState, string>> = {
  Warrior: {
    Stress: '3 wall pushes. Right now.',
    Loneliness: "Text one person right now. Just 'thinking of you.'",
    Boredom: 'Drop and do 10 pushups. Channel it.',
    Pain: "Feel it. Then stand up. Warriors aren't numb — they're strong.",
  },
  Lover: {
    Stress: 'Breathe into your chest. What does your body need?',
    Loneliness: 'Put your hand on your chest. You are not alone.',
    Boredom: 'What kind of closeness are you actually craving right now?',
    Pain: 'Let yourself feel it. Pain means you are alive and you care.',
  },
  Sage: {
    Stress: "Pause. What's actually true right now, not the story about it?",
    Loneliness: 'Solitude is different from loneliness. What would you tell a friend?',
    Boredom: 'Name 3 things you can see.',
    Pain: 'Observe it without judgment. This feeling is temporary data.',
  },
  Seeker: {
    Stress: 'What is this pressure trying to build in you?',
    Loneliness: 'Where have you been disconnecting from yourself lately?',
    Boredom: 'What unexplored path have you been avoiding?',
    Pain: 'This feeling has a message. What is it?',
  },
};

// Containment Protocol — Step 3 pattern capture categories
export const PATTERN_CAPTURE_CATEGORIES: Array<{
  label: string;
  options: string[];
}> = [
  {
    label: 'Time of day',
    options: ['Morning', 'Afternoon', 'Evening', 'Late Night'],
  },
  {
    label: 'Where you were',
    options: ['Home alone', 'With others', 'At work', 'In public'],
  },
  {
    label: 'How you felt',
    options: ['Stressed', 'Lonely', 'Bored', 'In pain'],
  },
];
