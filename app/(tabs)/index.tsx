import { View, Text, StyleSheet } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeonButton } from '@/components/neon-button';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import { ARCHETYPE_MOTIVATIONAL_LINES } from '@/constants/archetypes';
import { useTaruStore, selectSelfTrustScore } from '@/store/taru-store';

export default function HomeScreen() {
  const router = useRouter();
  const archetype = useTaruStore((s) => s.archetype);
  const onboardingComplete = useTaruStore((s) => s.onboardingComplete);
  const hasHydrated = useTaruStore((s) => s._hasHydrated);
  const score = useTaruStore(selectSelfTrustScore);

  // Show dark splash while AsyncStorage hydrates
  if (!hasHydrated) {
    return <View style={styles.splash} />;
  }

  // Navigator is mounted when a screen renders — safe to use <Redirect>
  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  const accentColor = archetype ? ArchetypeColors[archetype] : TaruColors.electricBlue;
  const motivationalLine = archetype ? ARCHETYPE_MOTIVATIONAL_LINES[archetype] : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>TARU</Text>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>Self-Trust</Text>
            <Text style={[styles.scoreValue, { color: accentColor }]}>{score}</Text>
          </View>
        </View>

        {/* Archetype */}
        <View style={styles.archetypeBlock}>
          <Text style={styles.archetypeTag}>Your Archetype</Text>
          <Text style={[styles.archetypeName, { color: accentColor }]}>
            The {archetype}
          </Text>
          <Text style={styles.motivationalLine}>{motivationalLine}</Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctaBlock}>
          <NeonButton
            label="I'm Struggling"
            color={accentColor}
            onPress={() => router.push('/crisis')}
            style={styles.primaryCta}
            textStyle={styles.primaryCtaText}
          />
          <NeonButton
            label="I Relapsed"
            color={TaruColors.textSecondary}
            onPress={() => router.push('/containment')}
            variant="ghost"
            style={styles.secondaryCta}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: TaruColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: TaruColors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: TaruColors.textPrimary,
    letterSpacing: 6,
  },
  scoreBlock: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 11,
    color: TaruColors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  archetypeBlock: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  archetypeTag: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: TaruColors.textMuted,
  },
  archetypeName: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 2,
    lineHeight: 56,
  },
  motivationalLine: {
    fontSize: 17,
    color: TaruColors.textSecondary,
    lineHeight: 26,
    maxWidth: 300,
  },
  ctaBlock: {
    gap: 14,
  },
  primaryCta: {
    width: '100%',
    paddingVertical: 22,
  },
  primaryCtaText: {
    fontSize: 18,
  },
  secondaryCta: {
    width: '100%',
  },
});
