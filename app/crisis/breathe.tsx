import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import { useTaruStore } from '@/store/taru-store';
import type { Archetype } from '@/constants/archetypes';

const { width } = Dimensions.get('window');

// Physiological sigh: inhale (4s) → sip inhale (1s) → long exhale (6s)
const INHALE  = 4000;
const SIP     = 1000;
const EXHALE  = 6000;
const CYCLE   = INHALE + SIP + EXHALE; // 11 000ms
const TOTAL_CYCLES = 10;               // ~110s ≈ 2 min

const ORB = 200;
const INSET = 32;

type Phase = 'inhale' | 'sip' | 'exhale';

const LABELS: Record<Phase, string> = {
  inhale: 'Breathe in',
  sip:    'And again',
  exhale: 'Breathe out...',
};

export default function BreatheScreen() {
  const router = useRouter();
  const archetype = useTaruStore((s) => s.archetype) as Archetype | null;
  const accent = archetype ? ArchetypeColors[archetype] : TaruColors.electricBlue;

  const [phase, setPhase]         = useState<Phase>('inhale');
  const [labelText, setLabelText] = useState<string>(LABELS.inhale);
  const [cycle, setCycle]         = useState(0);
  const [done, setDone]           = useState(false);

  // --- Shared values ---
  const orbScale    = useSharedValue(1);
  const glowRadius  = useSharedValue(20);
  const glowOpacity = useSharedValue(0.5);

  // Outer ring 1
  const ring1Scale   = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.2);

  // Outer ring 2
  const ring2Scale   = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.1);

  // Sip ripple
  const rippleScale   = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);

  // Phase label fade
  const labelOpacity = useSharedValue(1);

  // Progress bar
  const progressWidth = useSharedValue(0);

  // ---- Animate a phase ----
  const animatePhase = (p: Phase) => {
    const EASE_BREATH = Easing.inOut(Easing.cubic);
    const EASE_SIP    = Easing.out(Easing.quad);

    if (p === 'inhale') {
      orbScale.value    = withTiming(1.5,  { duration: INHALE, easing: EASE_BREATH });
      glowRadius.value  = withTiming(48,   { duration: INHALE, easing: EASE_BREATH });
      glowOpacity.value = withTiming(0.95, { duration: INHALE, easing: EASE_BREATH });
      ring1Scale.value   = withTiming(1.3,  { duration: INHALE, easing: EASE_BREATH });
      ring1Opacity.value = withTiming(0.35, { duration: INHALE, easing: EASE_BREATH });
      ring2Scale.value   = withTiming(1.55, { duration: INHALE, easing: EASE_BREATH });
      ring2Opacity.value = withTiming(0.15, { duration: INHALE, easing: EASE_BREATH });
    } else if (p === 'sip') {
      orbScale.value    = withTiming(1.62, { duration: SIP, easing: EASE_SIP });
      glowRadius.value  = withTiming(56,   { duration: SIP, easing: EASE_SIP });
      glowOpacity.value = withTiming(1,    { duration: SIP, easing: EASE_SIP });
      ring1Scale.value   = withTiming(1.4,  { duration: SIP, easing: EASE_SIP });
      ring1Opacity.value = withTiming(0.45, { duration: SIP, easing: EASE_SIP });
      ring2Scale.value   = withTiming(1.7,  { duration: SIP, easing: EASE_SIP });
      ring2Opacity.value = withTiming(0.2,  { duration: SIP, easing: EASE_SIP });
      // Ripple burst for the sip
      rippleScale.value   = 1;
      rippleOpacity.value = 0.6;
      rippleScale.value   = withTiming(2.2, { duration: 900, easing: Easing.out(Easing.quad) });
      rippleOpacity.value = withTiming(0,   { duration: 900, easing: Easing.in(Easing.quad) });
    } else {
      orbScale.value    = withTiming(1,    { duration: EXHALE, easing: EASE_BREATH });
      glowRadius.value  = withTiming(20,   { duration: EXHALE, easing: EASE_BREATH });
      glowOpacity.value = withTiming(0.4,  { duration: EXHALE, easing: EASE_BREATH });
      ring1Scale.value   = withTiming(1,    { duration: EXHALE, easing: EASE_BREATH });
      ring1Opacity.value = withTiming(0.12, { duration: EXHALE, easing: EASE_BREATH });
      ring2Scale.value   = withTiming(1,    { duration: EXHALE, easing: EASE_BREATH });
      ring2Opacity.value = withTiming(0.05, { duration: EXHALE, easing: EASE_BREATH });
    }
  };

  const crossFadeTo = (nextPhase: Phase) => {
    // Instantly drop to 0, swap text, fade back in
    labelOpacity.value = withSequence(
      withTiming(0, { duration: 180 }, (finished) => {
        if (finished) runOnJS(setLabelText)(LABELS[nextPhase]);
      }),
      withTiming(1, { duration: 320 }),
    );
  };

  // ---- Phase sequencer (JS side) ----
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef = useRef(0);
  const phaseRef = useRef<Phase>('inhale');

  const scheduleNext = (nextPhase: Phase, afterMs: number) => {
    timerRef.current = setTimeout(() => {
      // Advance phase
      const order: Phase[] = ['inhale', 'sip', 'exhale'];
      const next = order[(order.indexOf(nextPhase) + 1) % 3] as Phase;

      if (next === 'inhale') {
        cycleRef.current += 1;
        if (cycleRef.current >= TOTAL_CYCLES) {
          setDone(true);
          return;
        }
        setCycle(cycleRef.current);
      }

      phaseRef.current = next;
      setPhase(next);
      crossFadeTo(next);
      animatePhase(next);

      // Haptic on each transition
      if (next === 'inhale') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      else if (next === 'sip') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const durations: Record<Phase, number> = { inhale: INHALE, sip: SIP, exhale: EXHALE };
      scheduleNext(next, durations[next]);
    }, afterMs);
  };

  useEffect(() => {
    // Kick off progress bar
    progressWidth.value = withTiming(width - INSET * 2, {
      duration: TOTAL_CYCLES * CYCLE,
      easing: Easing.linear,
    });

    // First beat
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animatePhase('inhale');
    scheduleNext('inhale', INHALE);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ---- Animated styles ----
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    shadowOpacity: glowOpacity.value,
    shadowRadius: glowRadius.value,
  }));

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  // ---- Done screen ----
  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContent}>
          <View style={[styles.doneOrb, { backgroundColor: accent, shadowColor: accent }]} />
          <Text style={styles.doneTitle}>Your body{'\n'}did that.</Text>
          <Text style={styles.doneSubtitle}>
            Parasympathetic system activated.{'\n'}The reset is real.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.doneButton, { borderColor: accent }]}
          >
            <Text style={[styles.doneButtonText, { color: accent }]}>Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Main screen ----
  return (
    <SafeAreaView style={styles.container}>
      {/* Close */}
      <Pressable
        onPress={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          router.back();
        }}
        style={styles.closeButton}
      >
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.content}>
        {/* Cycle counter */}
        <Text style={styles.cycleText}>
          {cycle + 1} / {TOTAL_CYCLES}
        </Text>

        {/* Orb */}
        <View style={styles.orbArea}>
          {/* Ring 2 — outermost halo */}
          <Animated.View
            style={[
              styles.ring,
              {
                width: ORB * 2.2,
                height: ORB * 2.2,
                borderRadius: ORB * 1.1,
                borderColor: accent,
              },
              ring2Style,
            ]}
          />
          {/* Ring 1 — inner halo */}
          <Animated.View
            style={[
              styles.ring,
              {
                width: ORB * 1.55,
                height: ORB * 1.55,
                borderRadius: ORB * 0.775,
                borderColor: accent,
              },
              ring1Style,
            ]}
          />
          {/* Sip ripple */}
          <Animated.View
            style={[
              styles.ring,
              {
                width: ORB,
                height: ORB,
                borderRadius: ORB / 2,
                borderColor: accent,
                borderWidth: 2,
              },
              rippleStyle,
            ]}
          />
          {/* Core orb */}
          <Animated.View
            style={[
              styles.orb,
              {
                width: ORB,
                height: ORB,
                borderRadius: ORB / 2,
                backgroundColor: accent,
                shadowColor: accent,
              },
              orbStyle,
            ]}
          />
        </View>

        {/* Phase label */}
        <Animated.Text style={[styles.phaseLabel, labelStyle]}>
          {labelText}
        </Animated.Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: accent },
              progressStyle,
            ]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TaruColors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: TaruColors.textMuted,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: INSET,
    paddingVertical: 48,
  },
  cycleText: {
    fontSize: 13,
    color: TaruColors.textMuted,
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  orbArea: {
    width: ORB * 2.4,
    height: ORB * 2.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  orb: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
  phaseLabel: {
    fontSize: 28,
    fontWeight: '300',
    color: TaruColors.textPrimary,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: TaruColors.border,
    borderRadius: 1,
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
  },
  // Done screen
  doneContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 40,
  },
  doneOrb: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    marginBottom: 8,
  },
  doneTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: TaruColors.textPrimary,
    textAlign: 'center',
    lineHeight: 56,
    letterSpacing: 0.5,
  },
  doneSubtitle: {
    fontSize: 17,
    color: TaruColors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  doneButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
