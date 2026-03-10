import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import { useTaruStore } from '@/store/taru-store';
import { startBilateral, stopBilateral } from '@/services/haptics';
import type { Archetype } from '@/constants/archetypes';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = 96;
const PROGRESS_INSET = 24;

export default function BilateralScreen() {
  const router = useRouter();
  const archetype = useTaruStore((s) => s.archetype) as Archetype | null;
  const accentColor = archetype ? ArchetypeColors[archetype] : TaruColors.electricBlue;

  const [done, setDone] = useState(false);

  // Reanimated shared values for left circle
  const leftOpacity = useSharedValue(1);
  const leftScale = useSharedValue(1.12);

  // Reanimated shared values for right circle
  const rightOpacity = useSharedValue(0.18);
  const rightScale = useSharedValue(1.0);

  // Progress bar (0 → full width over 60s)
  const progressWidth = useSharedValue(0);

  const handleBeat = useCallback(
    (side: 'left' | 'right') => {
      const T = { duration: 100 };
      if (side === 'left') {
        leftOpacity.value = withTiming(1, T);
        leftScale.value = withTiming(1.12, T);
        rightOpacity.value = withTiming(0.18, T);
        rightScale.value = withTiming(1.0, T);
      } else {
        leftOpacity.value = withTiming(0.18, T);
        leftScale.value = withTiming(1.0, T);
        rightOpacity.value = withTiming(1, T);
        rightScale.value = withTiming(1.12, T);
      }
    },
    // shared values are stable refs — empty deps is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleComplete = useCallback(() => {
    setDone(true);
  }, []);

  useEffect(() => {
    progressWidth.value = withTiming(width - PROGRESS_INSET * 2, {
      duration: 60000,
      easing: Easing.linear,
    });
    startBilateral(handleBeat, handleComplete);
    return () => stopBilateral();
  }, []);

  const leftStyle = useAnimatedStyle(() => ({
    opacity: leftOpacity.value,
    transform: [{ scale: leftScale.value }],
  }));

  const rightStyle = useAnimatedStyle(() => ({
    opacity: rightOpacity.value,
    transform: [{ scale: rightScale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: progressWidth.value,
  }));

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneContent}>
          <Text style={styles.doneTitle}>Done.</Text>
          <Text style={styles.doneSubtitle}>The urge passed through you.</Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.doneButton, { borderColor: accentColor }]}
          >
            <Text style={[styles.doneButtonText, { color: accentColor }]}>
              Close
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Close button */}
      <Pressable onPress={() => { stopBilateral(); router.back(); }} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.instruction}>Hold the phone.{'\n'}Let it work.</Text>

        {/* Two alternating pulse circles */}
        <View style={styles.pulseRow}>
          <Animated.View
            style={[
              styles.circle,
              {
                backgroundColor: accentColor,
                shadowColor: accentColor,
              },
              leftStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.circle,
              {
                backgroundColor: accentColor,
                shadowColor: accentColor,
              },
              rightStyle,
            ]}
          />
        </View>

        {/* 60s progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { backgroundColor: accentColor },
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
    paddingHorizontal: PROGRESS_INSET,
    paddingVertical: 48,
  },
  instruction: {
    fontSize: 34,
    fontWeight: '800',
    color: TaruColors.textPrimary,
    textAlign: 'center',
    lineHeight: 44,
    letterSpacing: 1,
  },
  pulseRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 28,
    elevation: 12,
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
  doneContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 36,
  },
  doneTitle: {
    fontSize: 72,
    fontWeight: '900',
    color: TaruColors.textPrimary,
    letterSpacing: 3,
  },
  doneSubtitle: {
    fontSize: 20,
    color: TaruColors.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
  },
  doneButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
