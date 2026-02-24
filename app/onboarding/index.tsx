import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeonButton } from '@/components/neon-button';
import { TaruColors } from '@/constants/theme';
import { useTaruStore } from '@/store/taru-store';

const { height } = Dimensions.get('window');

export default function OnboardingWelcome() {
  const router = useRouter();
  const onboardingComplete = useTaruStore((s) => s.onboardingComplete);

  if (onboardingComplete) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.titleBlock}>
          <Text style={styles.appName}>TARU</Text>
          <Text style={styles.tagline}>
            Rebuild self-trust{'\n'}in moments you used to{'\n'}abandon yourself.
          </Text>
        </View>

        <View style={styles.bodyBlock}>
          <Text style={styles.body}>
            This is not a tracker.{'\n'}
            This is not a blocker.{'\n\n'}
            This is a real-time tool{'\n'}
            for when things get hard.{'\n\n'}
            Answer four questions.{'\n'}
            Discover your archetype.{'\n'}
            Use it when it matters.
          </Text>
        </View>

        <View style={styles.ctaBlock}>
          <NeonButton
            label="Find My Archetype"
            color={TaruColors.electricBlue}
            onPress={() => router.push('/onboarding/quiz')}
            style={styles.cta}
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
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingTop: height * 0.08,
    paddingBottom: 32,
  },
  titleBlock: {
    gap: 16,
  },
  appName: {
    fontSize: 72,
    fontWeight: '900',
    color: TaruColors.textPrimary,
    letterSpacing: 12,
  },
  tagline: {
    fontSize: 20,
    color: TaruColors.electricBlue,
    fontWeight: '300',
    lineHeight: 30,
    letterSpacing: 0.3,
  },
  bodyBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  body: {
    fontSize: 18,
    color: TaruColors.textSecondary,
    lineHeight: 30,
  },
  ctaBlock: {},
  cta: {
    width: '100%',
  },
});
