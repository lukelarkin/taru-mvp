import type { SurrenderQuadrant } from '@/constants/surrender-states';

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

/**
 * Intervention text keyed by archetype × quadrant.
 * These replace the old 4-state map when quadrant data is available.
 * Each string is shown in Phase 3 of the Surrender Wedge.
 */
export const QUADRANT_INTERVENTIONS: Record<Archetype, Record<SurrenderQuadrant, string>> = {
  Warrior: {
    HIGH_UNPLEASANT: 'Channel the energy. Drop and do 10 right now. Move the charge through your body.',
    HIGH_PLEASANT:   'Good energy. Use it on something real. Name one thing you will build today.',
    LOW_UNPLEASANT:  'Warriors do not fight alone. Text one person right now. Just "thinking of you."',
    LOW_PLEASANT:    'Boredom is a lie your mind tells when it wants an easy win. Find one thing worth fighting for.',
  },
  Lover: {
    HIGH_UNPLEASANT: 'Your body is speaking. Place both hands on your chest. Breathe into them. What does it need?',
    HIGH_PLEASANT:   'That energy wants real connection, not a screen. Who can you reach out to right now?',
    LOW_UNPLEASANT:  'You are not alone in this. Put your hand on your chest. Feel your own heartbeat.',
    LOW_PLEASANT:    'Flatness is distance from yourself. What would it feel like to be close to someone right now?',
  },
  Sage: {
    HIGH_UNPLEASANT: 'Pause. What is actually true right now — not the story your mind is telling, the facts?',
    HIGH_PLEASANT:   'You can see this clearly. What is this excitement actually seeking underneath it?',
    LOW_UNPLEASANT:  'Observe this without judgment. Name what you feel. It is temporary data, not your identity.',
    LOW_PLEASANT:    'The mind is hunting for stimulation it can control. Name 3 things you can see right now.',
  },
  Seeker: {
    HIGH_UNPLEASANT: 'What is this restlessness trying to build in you? Sit with that question for 60 seconds.',
    HIGH_PLEASANT:   'That wanting is real. What are you actually seeking underneath it? Go one layer deeper.',
    LOW_UNPLEASANT:  'The hollow feeling has a message. Stay with it long enough to hear it.',
    LOW_PLEASANT:    'What unexplored part of yourself have you been avoiding? Stay there for one minute.',
  },
};
