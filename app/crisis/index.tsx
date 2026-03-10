import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    available: false,
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

export default function CrisisScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Close */}
      <Pressable onPress={() => router.back()} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>What do you need?</Text>
        <Text style={styles.subheading}>Your nervous system will do the rest.</Text>

        <View style={styles.list}>
          {INTERVENTIONS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => item.available && router.push(item.href as any)}
              style={({ pressed }) => [
                styles.card,
                item.available && pressed && styles.cardPressed,
                !item.available && styles.cardDisabled,
              ]}
            >
              <View style={[styles.cardAccent, { backgroundColor: item.color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text
                    style={[
                      styles.cardLabel,
                      !item.available && styles.cardLabelDisabled,
                    ]}
                  >
                    {item.label}
                  </Text>
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
            </Pressable>
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
    fontSize: 36,
    fontWeight: '900',
    color: TaruColors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: TaruColors.textSecondary,
    marginBottom: 36,
    lineHeight: 22,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: TaruColors.surface,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: TaruColors.border,
  },
  cardPressed: {
    opacity: 0.75,
  },
  cardDisabled: {
    opacity: 0.45,
  },
  cardAccent: {
    width: 3,
  },
  cardBody: {
    flex: 1,
    padding: 18,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: TaruColors.textPrimary,
    letterSpacing: 0.3,
    flex: 1,
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
