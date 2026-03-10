import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTaruStore } from '@/store/taru-store';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import type { Archetype } from '@/constants/archetypes';

export default function PhotoScreen() {
  const router = useRouter();
  const archetype = useTaruStore((s) => s.archetype) as Archetype | null;
  const photos = useTaruStore((s) => s.groundingPhotos);
  const accent = archetype ? ArchetypeColors[archetype] : TaruColors.hotPink;

  // No photos set up yet
  if (photos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyTitle}>No photos yet.</Text>
          <Text style={styles.emptyBody}>
            Add 1–3 photos of people you love in Settings. They'll appear here instantly when you need them.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.button, { borderColor: accent }]}
          >
            <Text style={[styles.buttonText, { color: accent }]}>Got it</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Show first photo full-screen with a timer feel
  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
      <Image
        source={{ uri: photos[0] }}
        style={styles.photo}
        contentFit="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Just look.</Text>
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
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  emptyTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: TaruColors.textPrimary,
  },
  emptyBody: {
    fontSize: 17,
    color: TaruColors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  photo: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
});
