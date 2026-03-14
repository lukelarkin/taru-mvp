import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { TaruColors } from '@/constants/theme';

type Intervention = {
  label: string;
  description: string;
  duration: string;
  href: string;
  available: boolean;
  color: string;
};

const INTERVENTIONS: Intervention[] = [
  {
    label: 'Bilateral Pulse',
    description: 'Alternating vibration interrupts the craving loop. Hold the phone. Let it work.',
    duration: '60s',
    href: '/crisis/bilateral',
    available: true,
    color: TaruColors.neonPurple,
  },
  {
    label: 'Physiological Sigh',
    description: 'Double inhale + long exhale. Fastest way to activate the parasympathetic system.',
    duration: '2 min',
    href: '/crisis/breathe',
    available: true,
    color: TaruColors.electricBlue,
  },
  {
    label: 'Vagal Hum',
    description: 'Hum along with a low tone. Sound vibration activates vagal tone.',
    duration: '90s',
    href: '/crisis/hum',
    available: true,
    color: TaruColors.neonGreen,
  },
  {
    label: 'Photo Ground',
    description: 'Look at someone you love. Activates the attachment system.',
    duration: '30s',
    href: '/crisis/photo',
    available: true,
    color: TaruColors.hotPink,
  },
  {
    label: 'Reach Out',
    description: 'One tap sends a message to your accountability contact.',
    duration: 'Instant',
    href: '/crisis/reach',
    available: true,
    color: TaruColors.electricBlue,
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function InterventionCard({
  item,
  index,
  onPress,
}: {
  item: Intervention;
  index: number;
  onPress: () => void;
}) {
  // Staggered fade-in
  const fadeIn = useSharedValue(0);
  const translateY = useSharedValue(30);

  // Glow on press
  const glowOpacity = useSharedValue(0);
  const cardScale = useSharedValue(1);

  // Pulse indicator for available
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    const delay = index * 120;
    fadeIn.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }));

    if (item.available) {
      pulseOpacity.value = withDelay(
        delay + 600,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.3, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        ),
      );
    }
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: translateY.value }, { scale: cardScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handlePressIn = () => {
    if (!item.available) return;
    glowOpacity.value = withTiming(1, { duration: 150 });
    cardScale.value = withTiming(0.97, { duration: 150 });
  };

  const handlePressOut = () => {
    glowOpacity.value = withTiming(0, { duration: 300 });
    cardScale.value = withTiming(1, { duration: 300 });
  };

  return (
    <AnimatedPressable
      onPress={() => {
        if (!item.available) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        !item.available && styles.cardDisabled,
        containerStyle,
      ]}
    >
      {/* Glow overlay on press */}
      <Animated.View
        style={[
          styles.cardGlow,
          { backgroundColor: item.color },
          glowStyle,
        ]}
      />

      {/* Accent bar */}
      <View style={[styles.cardAccent, { backgroundColor: item.color }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.labelRow}>
            {/* Pulsing dot for available interventions */}
            {item.available && (
              <Animated.View
                style={[
                  styles.pulseDot,
                  { backgroundColor: item.color },
                  pulseStyle,
                ]}
              />
            )}
            <Text
              style={[
                styles.cardLabel,
                !item.available && styles.cardLabelDisabled,
              ]}
            >
              {item.label}
            </Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
            {!item.available && (
              <View style={styles.soonBadge}>
                <Text style={styles.soonText}>Soon</Text>
              </View>
            )}
          </View>
        </View>
        <Text
          style={[
            styles.cardDesc,
            !item.available && styles.cardDescDisabled,
          ]}
        >
          {item.description}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

export default function CrisisScreen() {
  const router = useRouter();

  // Heading fade in
  const headingOpacity = useSharedValue(0);
  const headingTranslateY = useSharedValue(20);
  const subOpacity = useSharedValue(0);

  useEffect(() => {
    headingOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    headingTranslateY.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) });
    subOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
  }, []);

  const headingStyle = useAnimatedStyle(() => ({
    opacity: headingOpacity.value,
    transform: [{ translateY: headingTranslateY.value }],
  }));

  const subStyle = useAnimatedStyle(() => ({
    opacity: subOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Close */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        style={styles.closeButton}
      >
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text style={[styles.heading, headingStyle]}>
          What do{'\n'}you need?
        </Animated.Text>
        <Animated.Text style={[styles.subheading, subStyle]}>
          Your nervous system will do the rest.
        </Animated.Text>

        <View style={styles.list}>
          {INTERVENTIONS.map((item, i) => (
            <InterventionCard
              key={item.label}
              item={item}
              index={i}
              onPress={() => router.push(item.href as any)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TaruColors.background,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 16,
    paddingRight: 24,
  },
  closeText: {
    fontSize: 18,
    color: TaruColors.textMuted,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 42,
    fontWeight: '900',
    color: TaruColors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 10,
    lineHeight: 48,
  },
  subheading: {
    fontSize: 15,
    color: TaruColors.textSecondary,
    marginBottom: 40,
    lineHeight: 22,
  },
  list: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: TaruColors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: TaruColors.border,
  },
  cardDisabled: {
    opacity: 0.45,
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    // Subtle color wash on press
    borderRadius: 12,
  },
  cardAccent: {
    width: 3,
  },
  cardBody: {
    flex: 1,
    padding: 18,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: TaruColors.textPrimary,
    letterSpacing: 0.3,
  },
  cardLabelDisabled: {
    color: TaruColors.textSecondary,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  durationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: TaruColors.surfaceAlt,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    color: TaruColors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  soonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: TaruColors.surfaceAlt,
    borderRadius: 4,
  },
  soonText: {
    fontSize: 11,
    color: TaruColors.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardDesc: {
    fontSize: 14,
    color: TaruColors.textSecondary,
    lineHeight: 21,
  },
  cardDescDisabled: {
    color: TaruColors.textMuted,
  },
});
