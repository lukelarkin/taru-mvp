import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import { useTaruStore } from '@/store/taru-store';
import type { Archetype } from '@/constants/archetypes';

const { width } = Dimensions.get('window');
const ORB_SIZE = 180;
const DURATION = 90000; // 90 seconds
const HAPTIC_INTERVAL = 1500; // 1.5s
const INSET = 32;

export default function HumScreen() {
  const router = useRouter();
  const archetype = useTaruStore((s) => s.archetype) as Archetype | null;
  const accent = archetype ? ArchetypeColors[archetype] : TaruColors.neonGreen;

  const [done, setDone] = useState(false);
  const hapticTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Orb pulse
  const orbScale = useSharedValue(1);
  const orbGlow = useSharedValue(0.6);

  // Concentric rings
  const ring1Scale = useSharedValue(1);
  const ring1Opacity = useSharedValue(0.4);
  const ring2Scale = useSharedValue(1);
  const ring2Opacity = useSharedValue(0.25);
  const ring3Scale = useSharedValue(1);
  const ring3Opacity = useSharedValue(0.12);

  // Progress
  const progressWidth = useSharedValue(0);

  // Fade in
  const contentOpacity = useSharedValue(0);

  const cleanup = () => {
    if (hapticTimer.current) clearInterval(hapticTimer.current);
    if (completionTimer.current) clearTimeout(completionTimer.current);
    hapticTimer.current = null;
    completionTimer.current = null;
  };

  useEffect(() => {
    // Fade in
    contentOpacity.value = withTiming(1, { duration: 800 });

    // Orb breathing pulse — continuous
    const PULSE = 1500;
    orbScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: PULSE, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: PULSE, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    orbGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: PULSE, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.5, { duration: PULSE, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );

    // Concentric ring ripples — staggered outward pulses
    const RING_PULSE = 3000;
    ring1Scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: RING_PULSE, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: RING_PULSE, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      true,
    );
    ring1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: RING_PULSE, easing: Easing.out(Easing.quad) }),
        withTiming(0.4, { duration: RING_PULSE, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      true,
    );

    ring2Scale.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1.7, { duration: RING_PULSE, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: RING_PULSE, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );
    ring2Opacity.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.05, { duration: RING_PULSE, easing: Easing.out(Easing.quad) }),
          withTiming(0.25, { duration: RING_PULSE, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );

    ring3Scale.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(2.0, { duration: RING_PULSE, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: RING_PULSE, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );
    ring3Opacity.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(0.02, { duration: RING_PULSE, easing: Easing.out(Easing.quad) }),
          withTiming(0.12, { duration: RING_PULSE, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        true,
      ),
    );

    // Progress bar
    progressWidth.value = withTiming(width - INSET * 2, {
      duration: DURATION,
      easing: Easing.linear,
    });

    // Haptic pulse every 1.5s
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    hapticTimer.current = setInterval(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, HAPTIC_INTERVAL);

    // Completion
    completionTimer.current = setTimeout(() => {
      cleanup();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDone(true);
    }, DURATION);

    return cleanup;
  }, []);

  // Animated styles
  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbScale.value }],
    shadowOpacity: orbGlow.value,
  }));

  const r1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1Scale.value }],
    opacity: ring1Opacity.value,
  }));

  const r2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2Scale.value }],
    opacity: ring2Opacity.value,
  }));

  const r3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring3Scale.value }],
    opacity: ring3Opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContent}>
          <View style={[styles.doneOrb, { backgroundColor: TaruColors.neonGreen, shadowColor: TaruColors.neonGreen }]} />
          <Text style={styles.doneTitle}>Reset complete.</Text>
          <Text style={styles.doneSubtitle}>
            Your vagus nerve just got a tune-up.
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={[styles.doneButton, { borderColor: TaruColors.neonGreen }]}
          >
            <Text style={[styles.doneButtonText, { color: TaruColors.neonGreen }]}>Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Close */}
      <Pressable
        onPress={() => {
          cleanup();
          router.back();
        }}
        style={styles.closeButton}
      >
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <Animated.View style={[styles.content, fadeStyle]}>
        {/* Instruction */}
        <Text style={styles.instruction}>
          Hum along.{'\n'}Feel it in your chest.
        </Text>

        {/* Orb area */}
        <View style={styles.orbArea}>
          {/* Ring 3 — outermost */}
          <Animated.View
            style={[
              styles.ring,
              {
                width: ORB_SIZE * 2.4,
                height: ORB_SIZE * 2.4,
                borderRadius: ORB_SIZE * 1.2,
                borderColor: TaruColors.neonGreen,
              },
              r3Style,
            ]}
          />
          {/* Ring 2 */}
          <Animated.View
            style={[
              styles.ring,
              {
                width: ORB_SIZE * 1.8,
                height: ORB_SIZE * 1.8,
                borderRadius: ORB_SIZE * 0.9,
                borderColor: TaruColors.neonGreen,
              },
              r2Style,
            ]}
          />
          {/* Ring 1 */}
          <Animated.View
            style={[
              styles.ring,
              {
                width: ORB_SIZE * 1.35,
                height: ORB_SIZE * 1.35,
                borderRadius: ORB_SIZE * 0.675,
                borderColor: TaruColors.neonGreen,
              },
              r1Style,
            ]}
          />
          {/* Core orb */}
          <Animated.View
            style={[
              styles.orb,
              {
                backgroundColor: TaruColors.neonGreen,
                shadowColor: TaruColors.neonGreen,
              },
              orbStyle,
            ]}
          />
        </View>

        {/* Subtle label */}
        <Text style={styles.humLabel}>
          Let the vibration move through you.
        </Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: TaruColors.neonGreen },
              progressStyle,
            ]}
          />
        </View>
      </Animated.View>
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
  instruction: {
    fontSize: 32,
    fontWeight: '800',
    color: TaruColors.textPrimary,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: 0.5,
  },
  orbArea: {
    width: ORB_SIZE * 2.8,
    height: ORB_SIZE * 2.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  orb: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    elevation: 20,
  },
  humLabel: {
    fontSize: 15,
    color: TaruColors.textSecondary,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 22,
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
  // Done
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
