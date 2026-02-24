# Emotion Grid — Surrender Wedge Phase 2 Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Surrender Wedge Phase 2 emotion chips with a full-screen spatial gradient grid (How We Feel-style) — user taps where they are on a colour field, a glowing dot confirms the position, then 5 emotion words rise up for a final tap. Output: `{ quadrant, emotionalState }` stored in `SurrenderEntry`.

**Architecture:** New `EmotionGrid` component owns the gradient, gesture, animation, and word reveal. New `constants/surrender-states.ts` owns all quadrant data. `taru-store` gains a `quadrant` field on `SurrenderEntry`. `surrender/index.tsx` swaps Phase 2 to use `EmotionGrid`. `archetypes.ts` gains quadrant-based interventions. `collapse-map.tsx` shows quadrant colour dots on timeline.

**Tech Stack:** `expo-linear-gradient` (new), `react-native-gesture-handler` ~2.28 (existing), `react-native-reanimated` ~4.1 (existing), Zustand v5 (existing), TypeScript strict.

---

## Context You Need

**Reanimated 4 API (different from v2/v3):**
- `useSharedValue(x)` — reactive value
- `useAnimatedStyle(() => ({ ... }))` — drives native-side style
- `withSpring(value)`, `withTiming(value, { duration })` — animate a shared value
- `withDelay(ms, animation)` — delays an animation

**Gesture Handler v2 API:**
```tsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const tap = Gesture.Tap().onEnd((e) => {
  // e.x, e.y — coordinates relative to the gesture view
  'worklet'; // if calling runOnJS, do so explicitly
});

<GestureDetector gesture={tap}>
  <View />
</GestureDetector>
```

**Gradient column technique:** `expo-linear-gradient` supports only one axis per component. A 4-corner gradient is achieved by rendering N thin vertical columns side-by-side, each a vertical `LinearGradient` whose top and bottom colours are linearly interpolated between the left and right corner colours.

**Existing path aliases:** `@/*` maps to the project root. Use `@/constants/surrender-states`, `@/components/emotion-grid`, etc.

**No Jest setup exists.** Verification is: TypeScript (`npx tsc --noEmit`) + Expo dev build (`npx expo start`).

---

## Task 1: Install expo-linear-gradient

**Files:**
- Modify: `package.json` (automatic via install)

**Step 1: Install the package**

```bash
cd /Users/lukelarkin/Documents/taru-mvp
npx expo install expo-linear-gradient
```

Expected: package installs, `expo-linear-gradient` appears in `package.json` dependencies.

**Step 2: Type-check to confirm no regressions**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 3: Commit**

```bash
git add package.json
git commit -m "feat: install expo-linear-gradient for emotion grid gradient"
```

---

## Task 2: Create constants/surrender-states.ts

This file owns all quadrant data. No app logic lives here — only types, colours, emotion words, and the intervention map.

**Files:**
- Create: `constants/surrender-states.ts`

**Step 1: Create the file**

```typescript
// constants/surrender-states.ts

export type SurrenderQuadrant =
  | 'HIGH_UNPLEASANT'
  | 'HIGH_PLEASANT'
  | 'LOW_UNPLEASANT'
  | 'LOW_PLEASANT';

/**
 * Corner colours for the 2D gradient grid.
 * Layout:
 *   TOP-LEFT (high energy, unpleasant) = RED
 *   TOP-RIGHT (high energy, pleasant)  = YELLOW
 *   BOT-LEFT (low energy, unpleasant)  = PURPLE
 *   BOT-RIGHT (low energy, pleasant)   = GREEN
 */
export const GRID_CORNER_COLORS = {
  topLeft: '#FF006E',     // HIGH_UNPLEASANT
  topRight: '#FFD60A',    // HIGH_PLEASANT
  bottomLeft: '#8B5CF6',  // LOW_UNPLEASANT
  bottomRight: '#00FF94', // LOW_PLEASANT
} as const;

/** Solid accent colour used for UI elements (dot, chips) per quadrant */
export const QUADRANT_ACCENT: Record<SurrenderQuadrant, string> = {
  HIGH_UNPLEASANT: '#FF006E',
  HIGH_PLEASANT:   '#FFD60A',
  LOW_UNPLEASANT:  '#8B5CF6',
  LOW_PLEASANT:    '#00FF94',
};

/** Emotion words surfaced after the user taps a region */
export const QUADRANT_EMOTIONS: Record<SurrenderQuadrant, string[]> = {
  HIGH_UNPLEASANT: ['Anxious', 'Restless', 'Overwhelmed', 'Stressed', 'Panicked'],
  HIGH_PLEASANT:   ['Excited', 'Craving', 'Pumped', 'Wanting more', 'Celebratory'],
  LOW_UNPLEASANT:  ['Lonely', 'Empty', 'Hopeless', 'Numb', 'Disconnected'],
  LOW_PLEASANT:    ['Bored', 'Flat', 'Drifting', 'Zoned out', 'Checked out'],
};

/**
 * Maps a tap position (as a percentage of container width/height) to a quadrant.
 * x: 0 = left (unpleasant), 1 = right (pleasant)
 * y: 0 = top (high energy), 1 = bottom (low energy)
 */
export function positionToQuadrant(xPct: number, yPct: number): SurrenderQuadrant {
  const pleasant = xPct >= 0.5;
  const highEnergy = yPct < 0.5;
  if (highEnergy && !pleasant) return 'HIGH_UNPLEASANT';
  if (highEnergy && pleasant)  return 'HIGH_PLEASANT';
  if (!highEnergy && !pleasant) return 'LOW_UNPLEASANT';
  return 'LOW_PLEASANT';
}

/**
 * Linearly interpolates between two hex colours.
 * t = 0 returns colorA, t = 1 returns colorB.
 */
export function lerpColor(colorA: string, colorB: string, t: number): string {
  const parse = (c: string) => ({
    r: parseInt(c.slice(1, 3), 16),
    g: parseInt(c.slice(3, 5), 16),
    b: parseInt(c.slice(5, 7), 16),
  });
  const a = parse(colorA);
  const b = parse(colorB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bv = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bv})`;
}

/** Default fallback if the user makes no selection (statistically dominant state) */
export const DEFAULT_QUADRANT: SurrenderQuadrant = 'LOW_UNPLEASANT';
export const DEFAULT_EMOTION = 'Lonely';
```

**Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 3: Commit**

```bash
git add constants/surrender-states.ts
git commit -m "feat: add surrender-states constants — quadrant model, colours, emotions, lerpColor"
```

---

## Task 3: Update store/taru-store.ts

Add `quadrant` to `SurrenderEntry` and update `logSurrender`. Old entries without `quadrant` remain valid — the field is optional.

**Files:**
- Modify: `store/taru-store.ts`

**Step 1: Add the import and update SurrenderEntry**

At the top of `store/taru-store.ts`, add the import after the existing imports:

```typescript
import type { SurrenderQuadrant } from '@/constants/surrender-states';
```

Update `SurrenderEntry`:

```typescript
export interface SurrenderEntry {
  timestamp: number;
  emotionalState: string;
  quadrant?: SurrenderQuadrant;   // optional — old entries won't have this
  archetypeAtTime: string;
}
```

**Step 2: Update logSurrender in the interface**

In `TaruState`, change:
```typescript
// Before:
logSurrender: (emotionalState: string) => void;

// After:
logSurrender: (emotionalState: string, quadrant?: SurrenderQuadrant) => void;
```

**Step 3: Update logSurrender implementation**

In the store implementation, change:
```typescript
// Before:
logSurrender: (emotionalState) =>
  set((state) => ({
    surrenders: [
      ...state.surrenders,
      {
        timestamp: Date.now(),
        emotionalState,
        archetypeAtTime: state.archetype ?? 'unknown',
      },
    ],
  })),

// After:
logSurrender: (emotionalState, quadrant) =>
  set((state) => ({
    surrenders: [
      ...state.surrenders,
      {
        timestamp: Date.now(),
        emotionalState,
        quadrant,
        archetypeAtTime: state.archetype ?? 'unknown',
      },
    ],
  })),
```

**Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors. (If `surrender/index.tsx` reports a type error on the old `logSurrender` call, ignore it — fixed in Task 6.)

**Step 5: Commit**

```bash
git add store/taru-store.ts
git commit -m "feat: add optional quadrant field to SurrenderEntry and logSurrender"
```

---

## Task 4: Add quadrant-based interventions to constants/archetypes.ts

The existing `INTERVENTIONS` map stays untouched (backwards compatible). We add a new `QUADRANT_INTERVENTIONS` map alongside it.

**Files:**
- Modify: `constants/archetypes.ts`

**Step 1: Add the import at the top of archetypes.ts**

```typescript
import type { SurrenderQuadrant } from '@/constants/surrender-states';
```

**Step 2: Add QUADRANT_INTERVENTIONS after the existing INTERVENTIONS export**

```typescript
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
```

**Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 4: Commit**

```bash
git add constants/archetypes.ts
git commit -m "feat: add QUADRANT_INTERVENTIONS — 16 archetype×quadrant intervention strings"
```

---

## Task 5: Create components/emotion-grid.tsx

The heart of this feature. A full-screen spatial gradient grid with gesture tap, glowing dot indicator, and animated word chips. All animation runs via Reanimated. Gradient uses the column technique.

**Files:**
- Create: `components/emotion-grid.tsx`

**Step 1: Create the file**

```tsx
// components/emotion-grid.tsx
import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  SurrenderQuadrant,
  QUADRANT_EMOTIONS,
  QUADRANT_ACCENT,
  GRID_CORNER_COLORS,
  positionToQuadrant,
  lerpColor,
  DEFAULT_QUADRANT,
  DEFAULT_EMOTION,
} from '@/constants/surrender-states';
import { TaruColors } from '@/constants/theme';

const COLUMNS = 24; // more columns = smoother gradient

interface EmotionGridProps {
  onSelect: (quadrant: SurrenderQuadrant, emotionalState: string) => void;
}

export function EmotionGrid({ onSelect }: EmotionGridProps) {
  const containerRef = useRef<View>(null);
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 });
  const [activeQuadrant, setActiveQuadrant] = useState<SurrenderQuadrant | null>(null);

  // Animated dot
  const dotX = useSharedValue(-100);
  const dotY = useSharedValue(-100);
  const dotScale = useSharedValue(0);
  const dotOpacity = useSharedValue(0);

  // Animated word panel
  const wordsTranslateY = useSharedValue(80);
  const wordsOpacity = useSharedValue(0);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dotX.value - 20 },
      { translateY: dotY.value - 20 },
      { scale: dotScale.value },
    ],
    opacity: dotOpacity.value,
  }));

  const wordsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: wordsTranslateY.value }],
    opacity: wordsOpacity.value,
  }));

  function handleTap(x: number, y: number) {
    const xPct = x / containerSize.width;
    const yPct = y / containerSize.height;
    const quadrant = positionToQuadrant(xPct, yPct);

    // Place and animate the dot
    dotX.value = x;
    dotY.value = y;
    dotScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    dotOpacity.value = withTiming(1, { duration: 150 });

    // Reveal word chips
    wordsOpacity.value = withTiming(1, { duration: 250 });
    wordsTranslateY.value = withSpring(0, { damping: 14, stiffness: 180 });

    setActiveQuadrant(quadrant);
  }

  const tapGesture = Gesture.Tap().onEnd((e) => {
    runOnJS(handleTap)(e.x, e.y);
  });

  // Build column gradient data
  const columns = Array.from({ length: COLUMNS }, (_, i) => {
    const t = COLUMNS === 1 ? 0 : i / (COLUMNS - 1);
    const topColor = lerpColor(GRID_CORNER_COLORS.topLeft, GRID_CORNER_COLORS.topRight, t);
    const bottomColor = lerpColor(GRID_CORNER_COLORS.bottomLeft, GRID_CORNER_COLORS.bottomRight, t);
    return { topColor, bottomColor };
  });

  const accentColor = activeQuadrant ? QUADRANT_ACCENT[activeQuadrant] : TaruColors.electricBlue;
  const emotions = activeQuadrant ? QUADRANT_EMOTIONS[activeQuadrant] : [];

  return (
    <View style={styles.container}>
      {/* Gradient field */}
      <GestureDetector gesture={tapGesture}>
        <View
          ref={containerRef}
          style={styles.gradientContainer}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setContainerSize({ width, height });
          }}
        >
          {/* Column-based 4-corner gradient */}
          <View style={styles.gradientRow}>
            {columns.map((col, i) => (
              <LinearGradient
                key={i}
                colors={[col.topColor, col.bottomColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientColumn}
              />
            ))}
          </View>

          {/* Axis labels — barely visible, purely informational */}
          <Text style={[styles.axisLabel, styles.axisTop]}>HIGH ENERGY</Text>
          <Text style={[styles.axisLabel, styles.axisBottom]}>LOW ENERGY</Text>
          <Text style={[styles.axisLabel, styles.axisLeft]}>UNPLEASANT</Text>
          <Text style={[styles.axisLabel, styles.axisRight]}>PLEASANT</Text>

          {/* Tap prompt — disappears after first tap */}
          {!activeQuadrant && (
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>Touch where you are</Text>
            </View>
          )}

          {/* Glowing dot indicator */}
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: accentColor, shadowColor: accentColor },
              dotStyle,
            ]}
            pointerEvents="none"
          />
        </View>
      </GestureDetector>

      {/* Word chips — rise up after tap */}
      {activeQuadrant && (
        <Animated.View style={[styles.wordsPanel, wordsStyle]}>
          <Text style={styles.wordsPrompt}>Which word fits?</Text>
          <View style={styles.wordsRow}>
            {emotions.map((word) => (
              <TouchableOpacity
                key={word}
                style={[styles.wordChip, { borderColor: accentColor }]}
                onPress={() => onSelect(activeQuadrant, word)}
                activeOpacity={0.7}
              >
                <Text style={[styles.wordText, { color: accentColor }]}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TaruColors.background,
  },
  gradientContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 0,
  },
  gradientRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gradientColumn: {
    flex: 1,
  },
  axisLabel: {
    position: 'absolute',
    fontSize: 9,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.18)',
    textTransform: 'uppercase',
  },
  axisTop: {
    top: 10,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  axisBottom: {
    bottom: 10,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -38 }],
  },
  axisLeft: {
    left: 8,
    top: '50%',
    transform: [{ rotate: '-90deg' }, { translateX: -30 }],
  },
  axisRight: {
    right: 8,
    top: '50%',
    transform: [{ rotate: '90deg' }, { translateX: -24 }],
  },
  promptContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 12,
  },
  wordsPanel: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
    backgroundColor: TaruColors.background,
  },
  wordsPrompt: {
    fontSize: 13,
    color: TaruColors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  wordChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: TaruColors.surface,
  },
  wordText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
```

**Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 3: Commit**

```bash
git add components/emotion-grid.tsx
git commit -m "feat: add EmotionGrid component — 4-corner spatial gradient with tap gesture and word reveal"
```

---

## Task 6: Update app/surrender/index.tsx

Swap Phase 2 from the old 4-chip row to the new `EmotionGrid`. Wire `handleEmotionSelect` to receive `quadrant` and pass it to `logSurrender`.

**Files:**
- Modify: `app/surrender/index.tsx`

**Step 1: Replace the import block at the top**

Add to existing imports:
```typescript
import { EmotionGrid } from '@/components/emotion-grid';
import type { SurrenderQuadrant } from '@/constants/surrender-states';
import { QUADRANT_INTERVENTIONS } from '@/constants/archetypes';
```

Remove from existing imports (no longer needed):
```typescript
// Remove: SURRENDER_EMOTIONAL_STATES, INTERVENTIONS, type SurrenderEmotionalState
// Keep: type Archetype (still used)
```

So the archetypes import changes from:
```typescript
import {
  SURRENDER_EMOTIONAL_STATES,
  INTERVENTIONS,
  type Archetype,
  type SurrenderEmotionalState,
} from '@/constants/archetypes';
```
to:
```typescript
import {
  QUADRANT_INTERVENTIONS,
  type Archetype,
} from '@/constants/archetypes';
```

**Step 2: Update state types in SurrenderScreen**

Change:
```typescript
const [selectedEmotion, setSelectedEmotion] = useState<SurrenderEmotionalState | null>(null);
```
to:
```typescript
const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
const [selectedQuadrant, setSelectedQuadrant] = useState<SurrenderQuadrant | null>(null);
```

**Step 3: Update handleEmotionSelect**

Replace:
```typescript
const handleEmotionSelect = (emotion: SurrenderEmotionalState) => {
  if (timerRef.current) clearTimeout(timerRef.current);
  setSelectedEmotion(emotion);
  setPhase(3);
};
```
with:
```typescript
const handleEmotionSelect = (quadrant: SurrenderQuadrant, emotion: string) => {
  if (timerRef.current) clearTimeout(timerRef.current);
  setSelectedQuadrant(quadrant);
  setSelectedEmotion(emotion);
  setPhase(3);
};
```

**Step 4: Update handleDismiss**

Replace:
```typescript
const handleDismiss = () => {
  const emotion = selectedEmotion ?? 'Stress';
  logSurrender(emotion);
  router.back();
};
```
with:
```typescript
const handleDismiss = () => {
  const emotion = selectedEmotion ?? 'Lonely';
  const quadrant = selectedQuadrant ?? 'LOW_UNPLEASANT';
  logSurrender(emotion, quadrant);
  router.back();
};
```

**Step 5: Update Phase 2 auto-advance fallback**

Change the Phase 2 `useEffect` timeout handler from:
```typescript
if (!selectedEmotion) setSelectedEmotion('Stress');
```
to:
```typescript
if (!selectedEmotion) {
  setSelectedEmotion('Lonely');
  setSelectedQuadrant('LOW_UNPLEASANT');
}
```

**Step 6: Update interventionText to use QUADRANT_INTERVENTIONS**

Replace:
```typescript
const interventionText =
  archetype && selectedEmotion
    ? INTERVENTIONS[archetype][selectedEmotion]
    : archetype
      ? INTERVENTIONS[archetype]['Stress']
      : 'Take three slow breaths. You are already doing the hard thing.';
```
with:
```typescript
const interventionText =
  archetype && selectedQuadrant
    ? QUADRANT_INTERVENTIONS[archetype][selectedQuadrant]
    : 'Take three slow breaths. You are already doing the hard thing.';
```

**Step 7: Replace Phase 2 JSX**

Replace the entire `{phase === 2 && (...)}` block:

```tsx
{/* Phase 2: Emotion Grid */}
{phase === 2 && (
  <EmotionGrid onSelect={handleEmotionSelect} />
)}
```

Remove the `emotionGrid` and `emotionChip` styles from `StyleSheet.create` — they are no longer used.

**Step 8: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 9: Manual test in Expo**

```bash
npx expo start
```

Flow to verify:
1. Complete onboarding (or already past it)
2. Tap "I'm Struggling" on home screen
3. Phase 1: breathing circle appears, auto-advances after 5s
4. Phase 2: full-screen gradient appears with "Touch where you are" prompt
5. Tap anywhere → glowing dot appears, 5 word chips rise from bottom
6. Tap a word → Phase 3 shows archetype-specific intervention text
7. Tap "Done" → returns to home, surrender is logged

**Step 10: Commit**

```bash
git add app/surrender/index.tsx
git commit -m "feat: replace Surrender Wedge Phase 2 with EmotionGrid spatial gradient picker"
```

---

## Task 7: Update app/(tabs)/collapse-map.tsx

Show a small coloured quadrant dot on surrender timeline entries where quadrant data exists. Entries without quadrant data (logged before this feature) render unchanged.

**Files:**
- Modify: `app/(tabs)/collapse-map.tsx`

**Step 1: Add the import**

```typescript
import { QUADRANT_ACCENT } from '@/constants/surrender-states';
```

**Step 2: Update the surrender entry dot colour logic**

Inside the timeline `map`, find this line:
```typescript
const dotColor = isSurrender ? TaruColors.neonGreen : TaruColors.hotPink;
```

Change to:
```typescript
const dotColor = isSurrender
  ? (entry.type === 'surrender' && entry.quadrant
      ? QUADRANT_ACCENT[entry.quadrant]
      : TaruColors.neonGreen)
  : TaruColors.hotPink;
```

**Step 3: Show quadrant word on surrender entries**

Inside the `entryCard` View, after `<Text style={styles.entryEmotion}>{entry.emotionalState}</Text>`, add:

```tsx
{entry.type === 'surrender' && entry.quadrant && (
  <Text style={[styles.quadrantLabel, { color: QUADRANT_ACCENT[entry.quadrant] }]}>
    {entry.quadrant.replace('_', ' ').toLowerCase()}
  </Text>
)}
```

**Step 4: Add the quadrantLabel style**

Inside `StyleSheet.create`, add:
```typescript
quadrantLabel: {
  fontSize: 11,
  letterSpacing: 1,
  textTransform: 'uppercase',
  opacity: 0.7,
},
```

**Step 5: Type-check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 6: Manual verification**

Open the app, log a surrender via the new EmotionGrid, then check the Collapse Map tab. The surrender entry should show:
- A coloured dot matching the selected quadrant colour
- The emotion word (e.g., "Lonely")
- A small quadrant label (e.g., "low unpleasant")

**Step 7: Commit**

```bash
git add app/(tabs)/collapse-map.tsx
git commit -m "feat: show quadrant colour dot and label on Collapse Map surrender entries"
```

---

## Done

All 7 tasks complete. Final type-check and smoke test:

```bash
npx tsc --noEmit
npx expo start
```

Full user journey to verify end-to-end:
1. Home → "I'm Struggling"
2. Phase 1: breathe (5s auto-advance)
3. Phase 2: tap gradient → dot appears → word chips rise → tap a word
4. Phase 3: archetype×quadrant intervention text displays
5. "Done" → Collapse Map shows coloured entry with quadrant label
