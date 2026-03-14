# TARU — Full Build Prompt (Replit Agent)

Build a complete React Native / Expo mobile app called **TARU**. This is a crisis intervention tool for people struggling with compulsive behaviors (porn, gambling, gaming, doomscrolling). When someone is about to relapse, they have a 3-5 second window before the compulsion wins. TARU delivers physiological interventions that work on the **body**, not the mind — because willpower is offline during craving.

**Core philosophy:** Surrender over self-will. Nervous system regulation, not behavior modification. The phone does the work, not the user. No login, no streaks, no shame. All data stays on device. Works offline.

---

## Tech Stack (Use These Exact Versions)

```json
{
  "expo": "~54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-router": "~6.0.14",
  "zustand": "^5.0.0",
  "@react-native-async-storage/async-storage": "2.1.2",
  "react-native-reanimated": "~4.1.1",
  "react-native-gesture-handler": "~2.28.0",
  "expo-haptics": "~15.0.7",
  "expo-av": "~16.0.8",
  "expo-linear-gradient": "~15.0.8",
  "expo-image": "~3.0.10",
  "expo-image-picker": "~16.1.4",
  "react-native-safe-area-context": "5.4.0",
  "@react-navigation/bottom-tabs": "^7.3.10",
  "typescript": "~5.9.2"
}
```

- File-based routing via Expo Router
- TypeScript strict mode
- Dark mode enforced (`userInterfaceStyle: "dark"`)
- Portrait only
- iOS-first

---

## Design System

### Colors

```typescript
const TaruColors = {
  background: '#0A0A0F',      // Deep dark navy — all screens
  surface: '#13131A',          // Cards, inputs
  surfaceAlt: '#1A1A24',       // Chips, badges
  electricBlue: '#00D4FF',     // Cyan neon accent
  neonPurple: '#8B5CF6',       // Purple accent
  hotPink: '#FF006E',          // Pink/red accent
  neonGreen: '#00FF94',        // Green accent
  textPrimary: '#FFFFFF',      // Headings, main text
  textSecondary: '#8888AA',    // Body text, descriptions
  textMuted: '#4A4A6A',        // Labels, hints
  border: '#1E1E2E',           // Subtle dividers, card borders
};

const ArchetypeColors = {
  Warrior: '#FF006E',
  Lover: '#8B5CF6',
  Sage: '#00D4FF',
  Seeker: '#00FF94',
};
```

### Emotion Grid Quadrant Colors

```typescript
const QUADRANT_COLORS = {
  HIGH_UNPLEASANT: '#FF006E',  // Top-left (anxious, stressed)
  HIGH_PLEASANT: '#FFD60A',    // Top-right (excited, craving)
  LOW_UNPLEASANT: '#8B5CF6',   // Bottom-left (lonely, numb)
  LOW_PLEASANT: '#00FF94',     // Bottom-right (bored, flat)
};
```

### Typography

- Page titles: 32-72px, fontWeight 900, letterSpacing 2-12
- Body text: 14-18px, color textSecondary
- Labels: 11-13px, textTransform uppercase, letterSpacing 1.5-2, color textMuted
- Use system fonts (no custom fonts needed)

### Styling Patterns

- All backgrounds: `#0A0A0F`
- Cards: `backgroundColor: surface`, `borderRadius: 10-12`, `borderWidth: 1`, `borderColor: border`
- Horizontal padding: 24-36px
- Neon glow effect on buttons: `shadowColor: accentColor`, `shadowOpacity: 0.6`, `shadowRadius: 12`
- Always use SafeAreaView from `react-native-safe-area-context`

---

## Data Models & State (Zustand + AsyncStorage)

### Store Shape

```typescript
interface TaruState {
  // User identity
  archetype: 'Warrior' | 'Lover' | 'Sage' | 'Seeker' | null;
  onboardingComplete: boolean;

  // Crisis logs
  surrenders: SurrenderEntry[];
  relapses: RelapseEntry[];

  // Settings
  groundingPhotos: string[];          // URI array, max 3
  accountabilityContact: {
    name: string;
    phone: string;
    message: string;
  } | null;

  // Hydration
  _hasHydrated: boolean;
}

interface SurrenderEntry {
  timestamp: number;
  emotionalState: string;
  quadrant?: 'HIGH_UNPLEASANT' | 'HIGH_PLEASANT' | 'LOW_UNPLEASANT' | 'LOW_PLEASANT';
  archetypeAtTime: string;
}

interface RelapseEntry {
  timestamp: number;
  emotionalState: string;
  patternNotes: string[];
  honestSentence: string;
}
```

### Persist Config

Persist to AsyncStorage with key `'taru-storage'`. Partialize to exclude `_hasHydrated` and action functions. Handle hydration with `onRehydrateStorage` callback that sets `_hasHydrated: true`.

### Computed Selector

```typescript
const selectSelfTrustScore = (state) =>
  state.surrenders.length * 2 + state.relapses.length * 3;
```

---

## Archetypes & Quiz Data

### 4 Archetypes

| Archetype | Color | Description |
|-----------|-------|-------------|
| Warrior | `#FF006E` | "You move through pain with force and discipline. Your strength is in action — when you channel it, nothing stops you." |
| Lover | `#8B5CF6` | "You heal through connection and vulnerability. Your strength is in feeling deeply — that courage is rare." |
| Sage | `#00D4FF` | "You process through understanding and clarity. Your strength is in wisdom — you see what others miss." |
| Seeker | `#00FF94` | "You transform through growth and meaning. Your strength is in adaptability — you find the lesson in everything." |

### Motivational Lines (shown on home screen)

| Archetype | Line |
|-----------|------|
| Warrior | "Discipline is your shield. The urge is just another opponent — you have beaten worse." |
| Lover | "What you feel right now is real. You do not have to act on it to honor it." |
| Sage | "You already know what this is. Clarity is your superpower — use it now." |
| Seeker | "Every hard moment is data. You are not falling back — you are learning forward." |

### Quiz Questions (4 questions, 4 answers each)

**Q1: "When facing a challenge, your first instinct?"**
- "Attack it head-on" → Warrior
- "Seek connection and support" → Lover
- "Analyze it carefully" → Sage
- "Find the lesson in it" → Seeker

**Q2: "What does strength look like to you?"**
- "Discipline and power" → Warrior
- "Emotional courage" → Lover
- "Wisdom and clarity" → Sage
- "Growth and adaptability" → Seeker

**Q3: "In your darkest moments, you crave?"**
- "Action — move or fight" → Warrior
- "Closeness — to feel held" → Lover
- "Clarity — to understand" → Sage
- "Meaning — the lesson" → Seeker

**Q4: "The best version of you is?"**
- "Unbreakable. Disciplined." → Warrior
- "Open. Loving. Connected." → Lover
- "Clear-minded. Wise." → Sage
- "Free. Evolving." → Seeker

**Scoring:** Each answer adds 1 to that archetype's score. Highest score wins. Ties go to first in order (Warrior > Lover > Sage > Seeker).

---

## Emotion Grid Data

### Quadrants & Emotion Words

The emotion grid is a 2D space. X-axis: Unpleasant (left) → Pleasant (right). Y-axis: High energy (top) → Low energy (bottom).

| Quadrant | Position | Color | Emotions |
|----------|----------|-------|----------|
| HIGH_UNPLEASANT | Top-left | `#FF006E` | Anxious, Restless, Overwhelmed, Stressed, Panicked |
| HIGH_PLEASANT | Top-right | `#FFD60A` | Excited, Craving, Pumped, Wanting more, Celebratory |
| LOW_UNPLEASANT | Bottom-left | `#8B5CF6` | Lonely, Empty, Hopeless, Numb, Disconnected |
| LOW_PLEASANT | Bottom-right | `#00FF94` | Bored, Flat, Drifting, Zoned out, Checked out |

### 16 Intervention Texts (4 Archetypes x 4 Quadrants)

**Warrior:**
- HIGH_UNPLEASANT: "Channel the energy. Drop and do 10 right now. Move the charge through your body."
- HIGH_PLEASANT: "Good energy. Use it on something real. Name one thing you will build today."
- LOW_UNPLEASANT: "Warriors do not fight alone. Text one person right now. Just \"thinking of you.\""
- LOW_PLEASANT: "Boredom is a lie your mind tells when it wants an easy win. Find one thing worth fighting for."

**Lover:**
- HIGH_UNPLEASANT: "Your body is speaking. Place both hands on your chest. Breathe into them. What does it need?"
- HIGH_PLEASANT: "That energy wants real connection, not a screen. Who can you reach out to right now?"
- LOW_UNPLEASANT: "You are not alone in this. Put your hand on your chest. Feel your own heartbeat."
- LOW_PLEASANT: "Flatness is distance from yourself. What would it feel like to be close to someone right now?"

**Sage:**
- HIGH_UNPLEASANT: "Pause. What is actually true right now — not the story your mind is telling, the facts?"
- HIGH_PLEASANT: "You can see this clearly. What is this excitement actually seeking underneath it?"
- LOW_UNPLEASANT: "Observe this without judgment. Name what you feel. It is temporary data, not your identity."
- LOW_PLEASANT: "The mind is hunting for stimulation it can control. Name 3 things you can see right now."

**Seeker:**
- HIGH_UNPLEASANT: "What is this restlessness trying to build in you? Sit with that question for 60 seconds."
- HIGH_PLEASANT: "That wanting is real. What are you actually seeking underneath it? Go one layer deeper."
- LOW_UNPLEASANT: "The hollow feeling has a message. Stay with it long enough to hear it."
- LOW_PLEASANT: "What unexplored part of yourself have you been avoiding? Stay there for one minute."

### Pattern Capture Categories (for post-relapse flow)

| Category | Options |
|----------|---------|
| Time of day | Morning, Afternoon, Evening, Late Night |
| Where you were | Home alone, With others, At work, In public |
| How you felt | Stressed, Lonely, Bored, In pain |

---

## File Structure

```
app/
  _layout.tsx                  # Root stack: GestureHandlerRootView + DarkTheme
  (tabs)/
    _layout.tsx                # Bottom tabs: Home, Collapse Map, Settings
    index.tsx                  # Home screen
    collapse-map.tsx           # Analytics timeline
    settings.tsx               # Photo picker, contact form, retake quiz
  onboarding/
    _layout.tsx                # Stack
    index.tsx                  # Welcome screen
    quiz.tsx                   # 4-question quiz + archetype reveal
  crisis/
    _layout.tsx                # Stack, headerShown: false, fullScreenModal
    index.tsx                  # Intervention selector (5 cards)
    bilateral.tsx              # 60s alternating haptic pulse
    breathe.tsx                # Physiological sigh breathing
    photo.tsx                  # Full-screen grounding photo
    reach.tsx                  # One-tap accountability SMS
  surrender/
    _layout.tsx                # Stack
    index.tsx                  # Legacy 3-phase flow (Breathe → Grid → Intervention text)
  containment/
    _layout.tsx                # Stack, fullScreenModal
    index.tsx                  # 5-step post-relapse protocol
components/
  emotion-grid.tsx             # 2D gradient picker with tap gesture
  breathing-circle.tsx         # Animated breathing orb
  neon-button.tsx              # Glowing CTA button with haptics
services/
  haptics.ts                   # Bilateral pulse engine
store/
  taru-store.ts                # Zustand store with AsyncStorage persist
constants/
  theme.ts                     # TaruColors, ArchetypeColors
  archetypes.ts                # Quiz data, descriptions, interventions
  surrender-states.ts          # Quadrant model, emotions, colors, helpers
```

---

## Screen-by-Screen Specs

### 1. Root Layout (`app/_layout.tsx`)

Wrap everything in `GestureHandlerRootView`. Use `@react-navigation/native` `DarkTheme`. Stack navigator with screens: `(tabs)`, `onboarding`, `crisis`, `surrender`, `containment`, `modal`.

### 2. Onboarding Welcome (`app/onboarding/index.tsx`)

If `onboardingComplete`, redirect to `/(tabs)`.

**Layout (top to bottom, full screen, dark background):**
- "TARU" — 72px, fontWeight 900, letterSpacing 12, white
- "Rebuild self-trust\nin moments you used to\nabandon yourself." — 20px, electricBlue, fontWeight 300
- Body text (centered vertically):
  ```
  This is not a tracker.
  This is not a blocker.

  This is a real-time tool
  for when things get hard.

  Answer four questions.
  Discover your archetype.
  Use it when it matters.
  ```
  — 18px, textSecondary
- NeonButton: "Find My Archetype", electricBlue, full width → navigates to `/onboarding/quiz`

### 3. Archetype Quiz (`app/onboarding/quiz.tsx`)

**Question view:**
- Progress dots (4 dots, 8px circles, active dot is 24px wide + electricBlue, done dots are textSecondary, pending dots are textMuted)
- "X of 4" label — 13px, textMuted, uppercase
- Question text — 26px, fontWeight 700, white
- 4 answer cards — each is a TouchableOpacity with padding 20, borderRadius 10, borderWidth 1, borderColor border, backgroundColor surface. Text is 16px white. Tapping adds 1 to that archetype's score and advances.

**Reveal view (after all 4 questions):**
- "You are" — 16px, textSecondary, uppercase, letterSpacing 3
- "The {Archetype}" — 52px, fontWeight 900, letterSpacing 4, archetype color
- Colored divider line (60px wide, 2px tall)
- Archetype description text — 18px, textSecondary, centered
- NeonButton: "Begin", archetype color → sets archetype in store, marks onboarding complete, navigates to `/(tabs)`

### 4. Home Screen (`app/(tabs)/index.tsx`)

If not hydrated, show dark splash. If not onboarded, redirect to `/onboarding`.

**Layout:**
- Header row: "TARU" (20px, fontWeight 900, letterSpacing 6) | Self-Trust score (label "SELF-TRUST" 11px muted + score value 24px in archetype color)
- Center block: "Your Archetype" label (12px muted uppercase) + "The {Archetype}" (52px, fontWeight 900, archetype color) + motivational line (17px, textSecondary)
- Bottom CTAs:
  - NeonButton primary: "I'm Struggling" (archetype color, paddingVertical 22, 18px text) → `/crisis`
  - NeonButton ghost: "I Relapsed" (textSecondary color) → `/containment`

### 5. Crisis Selection (`app/crisis/index.tsx`)

**Header:** "What do you need?" — 36px, fontWeight 900. Subheading: "Your nervous system will do the rest." — 15px, textSecondary.

**5 intervention cards in a scrollable list:**

| Label | Description | Duration | Color | Route | Available |
|-------|-------------|----------|-------|-------|-----------|
| Bilateral Pulse | "Alternating vibration interrupts the craving loop. Hold the phone. Let it work." | 60s | neonPurple | /crisis/bilateral | Yes |
| Physiological Sigh | "Double inhale + long exhale. Fastest way to activate the parasympathetic system." | 2 min | electricBlue | /crisis/breathe | Yes |
| Vagal Hum | "Hum along with a low tone. Sound vibration activates vagal tone." | 90s | neonGreen | /crisis/hum | No (show "Soon" badge) |
| Photo Ground | "Look at someone you love. Activates the attachment system." | 30s | hotPink | /crisis/photo | Yes |
| Reach Out | "One tap sends a message to your accountability contact." | Instant | electricBlue | /crisis/reach | Yes |

**Card design:** Horizontal row — 3px wide colored accent bar on left, then card body with label (17px bold) + duration badge (11px in surfaceAlt pill) + description (14px textSecondary). Unavailable cards: opacity 0.45, "Soon" badge.

Close button (✕) top-right goes back.

### 6. Bilateral Haptic Pulse (`app/crisis/bilateral.tsx`)

**Active state:**
- Instruction text: "Hold the phone.\nLet it work." — 34px, fontWeight 800, centered
- Two circles (96px diameter, archetype color) arranged horizontally. They alternate pulsing: active circle has opacity 1.0 + scale 1.12, inactive has opacity 0.18 + scale 1.0. Circles have neon glow shadow (shadowOpacity 0.85, shadowRadius 28).
- Progress bar (2px height, border color track, archetype color fill, animates from 0 to full width over 60 seconds, linear easing)
- Close button (✕) top-right

**Haptic engine:** Fires every 300ms, alternating between Heavy and Light impact styles. Runs for 60 seconds total.

**Done state (after 60s):**
- "Done." — 72px, fontWeight 900
- "The urge passed through you." — 20px, textSecondary
- "Close" button (bordered, archetype color)

### 7. Physiological Sigh (`app/crisis/breathe.tsx`)

**Pattern:** Inhale 4s → Sip inhale 1s → Long exhale 6s = 11s per cycle, 10 cycles total (~110s)

**Active state:**
- Cycle counter: "X / 10" — 13px, textMuted, uppercase
- Breathing orb (200px diameter, archetype color):
  - Core orb scales 1.0→1.5 on inhale, 1.5→1.62 on sip, 1.62→1.0 on exhale
  - Inner halo ring (1px border, 155% size): scales proportionally
  - Outer halo ring (1px border, 220% size): scales proportionally
  - Sip phase triggers a ripple burst animation (scale 1→2.2, opacity 0.6→0, 900ms)
  - Glow shadow intensifies during inhale, peaks at sip, fades during exhale
- Phase labels cross-fade (180ms fade out, 320ms fade in):
  - Inhale: "Breathe in" — 28px, fontWeight 300
  - Sip: "And again"
  - Exhale: "Breathe out..."
- Haptic feedback at each phase transition: inhale=Light, sip=Medium, exhale=Heavy
- Progress bar (same as bilateral, full duration ~110s)

**Done state:**
- Small glowing orb (64px, archetype color, with shadow glow)
- "Your body\ndid that." — 48px, fontWeight 900
- "Parasympathetic system activated.\nThe reset is real." — 17px, textSecondary
- "Close" button

### 8. Photo Ground (`app/crisis/photo.tsx`)

**No photos state:** "No photos yet." title (36px bold) + "Add 1–3 photos of people you love in Settings. They'll appear here instantly when you need them." + "Got it" button

**Photo state:** First photo displayed full-screen (`contentFit: cover`). Overlay text at bottom: "Just look." — 28px, fontWeight 300, white, with text shadow. Close button top-right.

### 9. Reach Out (`app/crisis/reach.tsx`)

**No contact state:** "No contact yet." + instructions to set up in Settings + "Got it" button

**Send state:**
- "Reach out\nto {Name}." — 36px, fontWeight 900
- Message preview card (surface background, border): "YOUR MESSAGE" label + message text in italics
- "Send" button (solid archetype color, black text, 18px fontWeight 800)
- "Not now" link (14px, textMuted)
- Uses `Linking.openURL('sms:...')` to open Messages app

**Sent confirmation:**
- "Message sent\nto {Name}." — 36px
- "You are not alone in this." — 17px
- "Close" button

### 10. Surrender / Legacy Flow (`app/surrender/index.tsx`)

3-phase full-screen flow:

**Phase 1 (5 seconds, auto-advance):** "Stop." title (56px) → BreathingCircle component (120px, archetype color) → "Just breathe." (17px textSecondary)

**Phase 2 (EmotionGrid):** Full-screen 2D gradient grid. User taps to place a glowing dot. 5 emotion word chips appear below. User taps a word to select.

**Phase 3 (Intervention):** Shows the intervention text from the 16-item archetype×quadrant matrix. Large text (24px, fontWeight 600, archetype color). "Done" NeonButton logs the surrender and goes back.

### 11. Containment Protocol (`app/containment/index.tsx`)

5-step post-relapse flow. Progress bar (5 segments) at top.

**Step 1 — Breathe:**
- Tag: "Step 1"
- "You are still here.\nThat matters." — 36px, fontWeight 800
- BreathingCircle (90px, archetype color)
- "Take a few slow breaths. Follow the circle. You showed up — that already counts."
- Button: "I'm Ready"

**Step 2 — Body Reset:**
- "Stand up.\nShake it out."
- "Shake your hands. Roll your shoulders. Stomp your feet. The body holds the charge — move it through, not down."
- "Take 30 seconds. I'll wait."
- Button: "Done That"

**Step 3 — Pattern Capture:**
- "What was happening?"
- "One tap per row."
- 3 categories (Time of day, Where you were, How you felt) each with 4 chip options. Selected chips get archetype-colored border.
- Button: "Continue" (disabled until all 3 selected)

**Step 4 — Honest Sentence:**
- "What were you really\ntrying to escape?"
- "One honest sentence. No judgment here."
- TextInput (multiline, max 280 chars, placeholder: "I was trying to escape...")
- Button: "Record It" (disabled until 3+ chars)

**Step 5 — Close the Loop:**
- "Relapse logged.\nPattern recorded.\nYou showed up\nanyway."
- "The fact that you are here means you chose awareness over denial. That is the foundation everything else is built on."
- Archetype-colored text: "No streak was reset. No score was punished. Just data, and a moment of honesty."
- Button: "Close" → logs relapse to store and goes back

### 12. Collapse Map (`app/(tabs)/collapse-map.tsx`)

**Score header:** "SELF-TRUST SCORE" label + giant score number (72px, fontWeight 900, archetype color) + "X surrenders · Y relapses logged"

**Patterns section (only shows after 5+ entries):**
- Insight cards with left border accent (electricBlue, 3px)
- Possible insights:
  - Night-time pattern (>40% between 10pm-4am): "Most of your hard moments happen at night. Build a night-time ritual."
  - Dominant emotion (3+ occurrences): '"{emotion}" is your most common trigger. That is the feeling to build a response to first.'
  - Good surrender ratio (>60%): "You caught yourself X times before acting. That pattern is real."
  - Perfect record: "X surrenders. Zero relapses logged. That is not an accident."

**Hint card (1-4 entries):** "X more entries until patterns surface."

**Timeline:** Reverse chronological. Each entry has a colored dot (surrender = quadrant color or neonGreen, relapse = hotPink), type label, date, emotional state, and for relapses: the honest sentence in italics + pattern note chips.

**Empty state:** "Nothing here yet. Use the app in hard moments. Your entries will appear here — no judgment, just data."

### 13. Settings (`app/(tabs)/settings.tsx`)

**Sections in cards (surface bg, rounded, border):**

**You:** Shows "Your Archetype: The {Archetype}" + "Retake Quiz" button (confirms with alert, then navigates to quiz)

**Grounding Photos:** "Up to 3 photos. They appear full-screen during crisis." Photo grid (88x88 rounded thumbnails). Tap existing photo → confirm removal. "+" dashed-border button to add (uses expo-image-picker, square crop, 0.8 quality). Max 3.

**Accountability Contact:** "One tap sends this message when you're struggling." Form with Name, Phone, Message fields. Default message: "Hey, having a hard moment. Don't need to talk, just wanted you to know." Save button (solid archetype color) + Remove link.

**App:** Version: "1.0.0 (dev)"

---

## Reusable Components

### NeonButton

Props: `label`, `color`, `onPress`, `variant?: 'primary' | 'ghost'`, `disabled?`, `style?`, `textStyle?`

- **Primary:** solid backgroundColor = color, text color = `#0A0A0F` (dark), neon glow shadow
- **Ghost:** transparent bg, 1.5px border in color, text color = color, subtle glow
- Haptic feedback (Medium impact) on press
- Disabled: opacity 0.4
- Base padding: 16px vertical, 32px horizontal, borderRadius 8
- Label: 15px, fontWeight 700, letterSpacing 1.5, uppercase

### BreathingCircle

Props: `color`, `size`

Animated circle that breathes: 4s inhale (scale up) → 1s hold → 4s exhale (scale down) → 1s pause. Repeating. 3 concentric rings: core orb + 2 halos. Glow shadow with the color.

### EmotionGrid

A full-screen 2D gradient created by rendering 24 vertical `LinearGradient` columns side by side. Each column interpolates between the top color (lerp topLeft↔topRight based on column position) and bottom color (lerp bottomLeft↔bottomRight).

Axis labels in corners: "HIGH ENERGY" (top), "LOW ENERGY" (bottom), "UNPLEASANT" (left, rotated), "PLEASANT" (right, rotated). Subtle white text (9px, 18% opacity).

Center prompt: "Touch where you are" (disappears after tap).

On tap: glowing dot (40px circle, quadrant accent color, spring animation: stiffness 200, damping 12) appears at tap position. Words panel slides up from bottom (spring: stiffness 180, damping 14) showing "Which word fits?" + 5 emotion word chips for that quadrant (bordered pills, quadrant color). Tapping a word calls `onSelect(quadrant, word)`.

---

## Services

### Haptic Engine (`services/haptics.ts`)

```typescript
// Bilateral pattern: alternates left/right every 300ms for 60 seconds
// Left beat = Heavy impact, Right beat = Light impact
// Accepts onBeat(side) callback for visual sync
// Accepts onComplete() callback for auto-finish
// stopBilateral() cleans up both interval and timeout
```

---

## Navigation Flow

```
App Launch
├─ Check _hasHydrated → dark splash while loading
├─ Check onboardingComplete
│  ├─ false → /onboarding → /onboarding/quiz → reveal → /(tabs)
│  └─ true → /(tabs)
│
/(tabs) — Bottom Tab Navigator
├─ Home (index) — shield icon
│  ├─ "I'm Struggling" → /crisis (modal)
│  │   ├─ /crisis/bilateral
│  │   ├─ /crisis/breathe
│  │   ├─ /crisis/photo
│  │   └─ /crisis/reach
│  └─ "I Relapsed" → /containment (modal)
├─ Collapse Map — chart icon
└─ Settings — gear icon
    └─ "Retake Quiz" → /onboarding/quiz
```

Tab bar: dark background (surface color), active tab tint = archetype color, inactive = textMuted. Light haptic on iOS tab press.

---

## Critical Implementation Notes

1. **Offline-first:** No API calls, no backend. Everything persists to AsyncStorage via Zustand.
2. **Haptics are essential:** The bilateral pulse haptics are the core intervention mechanism. They must alternate L-R reliably.
3. **Cleanup on unmount:** All timers, intervals, and haptic engines MUST be cleaned up in useEffect return functions.
4. **No streaks, no shame:** Never punish the user. The containment flow explicitly says "No streak was reset. No score was punished."
5. **Crisis path speed:** From home screen to active intervention should be 2 taps max (Home → Crisis selector → Intervention).
6. **EmotionGrid gradient:** Don't use a single LinearGradient with 4 stops — that creates an X pattern. Use 24 vertical columns with interpolated top/bottom colors for a smooth 2D field.

---

## What NOT to Build

- No user accounts or login
- No backend or API
- No community features
- No AI chat
- No journaling
- No streak tracking
- No push notifications
- No domain blocking
- No analytics beyond local
- No Vagal Hum screen yet (mark it "Coming Soon" in the crisis selector)
