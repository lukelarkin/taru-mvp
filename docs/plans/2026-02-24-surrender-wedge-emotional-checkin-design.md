# Surrender Wedge — Emotional Check-In Redesign
**Date:** 2026-02-24
**Status:** Approved

---

## Problem

The current Surrender Wedge Phase 2 presents four text chips: `Stress / Loneliness / Boredom / Pain`. This vocabulary is generic and the interaction is adequate, but it doesn't capture enough nuance to surface meaningful patterns in the Collapse Map over time, and it doesn't speak the language of someone in peak craving.

The old APP repo has a richer quadrant-based emotion model (circumplex model of affect: valence × arousal, 24 emotions, intensity slider) — but that component is designed for calm daily check-ins, not crisis moments. Porting it directly would increase cognitive load at exactly the wrong time.

---

## Design Philosophy

**Meet people in their capacity.** In peak craving, executive function is offline. Brain fog, compulsion, and shame are active. The UI must require zero reading, zero scrolling, zero decision fatigue. Recognition, not recall.

**Addiction-specific language.** Users don't think "I'm feeling disconnected." They recognize "I'm hollow" or "I can't stop thinking about it." Language should feel like a mirror, not a clinical form.

**Capture enough for Layer 3.** The data collected in Layer 1 (crisis) becomes the raw material for Layer 3 (belief work). The emotional check-in must encode both quadrant (for intervention routing) and specific word (for pattern analysis) — while asking almost nothing of the user.

---

## The Quadrant Model

Uses the circumplex model of affect: **valence (pleasant/unpleasant) × arousal (high/low)**.

Emotion vocabulary is curated for digital addiction triggers — normal, recognizable words rather than clinical labels, but the set reflects where this user actually lives.

| Quadrant | Color | Emotions |
|----------|-------|----------|
| HIGH_UNPLEASANT (top-left) | Red `#FF006E` | Anxious · Restless · Overwhelmed · Stressed · Panicked |
| HIGH_PLEASANT (top-right) | Yellow `#FFD60A` | Excited · Craving · Pumped · Wanting more · Celebratory |
| LOW_UNPLEASANT (bottom-left) | Blue/Purple `#8B5CF6` | Lonely · Empty · Hopeless · Numb · Disconnected |
| LOW_PLEASANT (bottom-right) | Green `#00FF94` | Bored · Flat · Drifting · Zoned out · Checked out |

---

## Interaction Design — Option A: Spatial Gradient Grid

**Inspired by How We Feel. One touch. No list. No reading. Just a place.**

### The Visual

A full-screen 2D color gradient — four corner colors blending continuously across the space. The axes are unlabelled (no cognitive load in reading them). The color itself communicates the territory.

```
  RED ──────────────────────────── YELLOW
  (anxious, stressed)   (excited, craving)
  │                                      │
  │                                      │
  │                                      │
  │                                      │
  PURPLE ─────────────────────────── GREEN
  (lonely, empty)       (bored, flat, drifting)
```

Axis labels appear as small, muted corner text — barely readable, purely informational:
- Top: `HIGH ENERGY`
- Bottom: `LOW ENERGY`
- Left: `UNPLEASANT`
- Right: `PLEASANT`

### Tap 1 — Touch where you are

User places a finger anywhere on the gradient. A glowing dot appears at the touch point. The quadrant is determined by position:
- `x < 50%, y < 50%` → HIGH_UNPLEASANT
- `x ≥ 50%, y < 50%` → HIGH_PLEASANT
- `x < 50%, y ≥ 50%` → LOW_UNPLEASANT
- `x ≥ 50%, y ≥ 50%` → LOW_PLEASANT

### Tap 2 — Which word fits?

After the tap, 5 emotion words for that quadrant rise from the bottom of the screen as large, spaced chips. User taps one word. Auto-advances to Phase 3.

No intensity slider. The quadrant encodes urgency implicitly.

### Auto-advance fallback

If no touch after 15 seconds, defaults to `LOW_UNPLEASANT / Lonely`.

### Technical Implementation

- **Gradient:** `expo-linear-gradient` (new dependency). Four-corner gradient achieved by layering two `LinearGradient` components:
  - Layer 1 (base): horizontal gradient, full-screen — `RED` left to `YELLOW` right
  - Layer 2 (overlay): horizontal gradient, full-screen — `PURPLE` left to `GREEN` right, with a vertical `LinearGradient` mask fading it from transparent (top) to opaque (bottom)
- **Gesture:** `react-native-gesture-handler` `Gesture.Tap()` on the gradient view, captures `x` and `y` as percentage of container dimensions
- **Dot animation:** Reanimated `useSharedValue` for the glowing indicator position and scale-in animation
- **Word reveal:** Reanimated `FadeInDown` for the word chips rising from below

---

## Integration Into Surrender Wedge

| Phase | Current | After |
|-------|---------|-------|
| **1 — Stop. Breathe.** | Breathing circle, auto-advance 5s | Unchanged |
| **2 — Name it** | 4 text chips (Stress/Loneliness/Boredom/Pain) | 2×2 tile grid → Tap 1 → 3 words → Tap 2. Auto-advance on Tap 2. |
| **3 — Intervention** | Routes by archetype × 4 emotional states (16 combos) | Routes by archetype × quadrant × specific word (richer routing) |

---

## Data Model

### SurrenderEntry (updated)

```typescript
export interface SurrenderEntry {
  timestamp: number;
  emotionalState: string;       // specific word: 'Lonely', 'Agitated', etc.
  quadrant: SurrenderQuadrant;  // 'HIGH_UNPLEASANT' | 'LOW_UNPLEASANT' | 'HIGH_PLEASANT' | 'LOW_PLEASANT'
  archetypeAtTime: string;
}

export type SurrenderQuadrant =
  | 'HIGH_UNPLEASANT'
  | 'LOW_UNPLEASANT'
  | 'HIGH_PLEASANT'
  | 'LOW_PLEASANT';
```

**Backwards compatible.** Old entries without `quadrant` still render correctly in the Collapse Map. New entries have the richer data Layer 3 needs.

### logSurrender (updated signature)

```typescript
logSurrender: (emotionalState: string, quadrant: SurrenderQuadrant) => void;
```

---

## Intervention Routing (updated)

The existing `INTERVENTIONS` map (`archetype × emotional state`) expands to route by quadrant as primary key, with specific word available for future Layer 3 personalization.

Quadrant → intervention philosophy:
- **HIGH_UNPLEASANT** → Somatic first (physiologic reset, movement, breath)
- **LOW_UNPLEASANT** → Connection first (loved one letter, presence prompt)
- **HIGH_PLEASANT** → Redirect first (channel the energy somewhere real)
- **LOW_PLEASANT** → Grounding first (name 3 things, body scan, gentle activation)

---

## What Is NOT Ported From Old App

| Old Component | Decision | Reason |
|---------------|----------|--------|
| Intensity slider (1–5) | Not ported | Too much friction for crisis state. Quadrant encodes urgency implicitly. |
| IFS parts selection | Not ported | Layer 3 tool, not Layer 1. Wrong moment. |
| Streak meter | Not ported | Violates anti-engagement design philosophy. |
| Scrollable 24-emotion list | Not ported | Requires executive function the user doesn't have. |
| Quadrant model (architecture) | Ported | Sound science. Produces meaningful patterns. Maps to interventions. |

---

## New Files

| File | Purpose |
|------|---------|
| `constants/surrender-states.ts` | Quadrant type, corner colors, emotion word lists per quadrant, quadrant→intervention routing |
| `components/emotion-grid.tsx` | Full-screen spatial gradient grid. Tap gesture → glowing dot → word chips rise from bottom. Callback: `{ quadrant, emotionalState }` |

## Modified Files

| File | Change |
|------|--------|
| `store/taru-store.ts` | Add `SurrenderQuadrant` type. Add optional `quadrant` to `SurrenderEntry` (backwards compatible). Update `logSurrender` signature. |
| `app/surrender/index.tsx` | Replace Phase 2 emotion chips with `EmotionGrid`. Update `handleDismiss` to pass quadrant. |
| `constants/archetypes.ts` | Add `QUADRANT_INTERVENTIONS` map (archetype × quadrant) alongside existing `INTERVENTIONS`. |
| `app/(tabs)/collapse-map.tsx` | Show quadrant color dot on surrender timeline entries where quadrant data exists. |

## New Dependencies

| Package | Why |
|---------|-----|
| `expo-linear-gradient` | Four-corner gradient rendering for the spatial grid |
