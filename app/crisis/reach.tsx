import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTaruStore } from '@/store/taru-store';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import type { Archetype } from '@/constants/archetypes';

export default function ReachScreen() {
  const router = useRouter();
  const archetype = useTaruStore((s) => s.archetype) as Archetype | null;
  const contact = useTaruStore((s) => s.accountabilityContact);
  const accent = archetype ? ArchetypeColors[archetype] : TaruColors.electricBlue;
  const [sent, setSent] = useState(false);

  const sendMessage = async () => {
    if (!contact) return;
    // iOS uses & separator, Android uses ? separator for SMS URIs
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = `sms:${contact.phone}${separator}body=${encodeURIComponent(contact.message)}`;
    try {
      await Linking.openURL(url);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
    } catch {
      Alert.alert('Cannot send SMS', 'Check that Messages is available on this device.');
    }
  };

  // No contact set up
  if (!contact) {
    return (
      <SafeAreaView style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={styles.content}>
          <Text style={styles.title}>No contact yet.</Text>
          <Text style={styles.body}>
            Add an accountability contact in Settings. One tap will send them a message when you need it.
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

  // Sent confirmation
  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Message sent{'\n'}to {contact.name}.</Text>
          <Text style={styles.body}>You are not alone in this.</Text>
          <Pressable
            onPress={() => router.back()}
            style={[styles.button, { borderColor: accent }]}
          >
            <Text style={[styles.buttonText, { color: accent }]}>Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Send screen
  return (
    <SafeAreaView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>
      <View style={styles.content}>
        <Text style={styles.title}>Reach out{'\n'}to {contact.name}.</Text>
        <View style={styles.messagePreview}>
          <Text style={styles.messageLabel}>Your message</Text>
          <Text style={styles.messageText}>"{contact.message}"</Text>
        </View>
        <Pressable
          onPress={sendMessage}
          style={[styles.sendButton, { backgroundColor: accent }]}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.skipText}>Not now</Text>
        </Pressable>
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
    justifyContent: 'center',
    paddingHorizontal: 36,
    gap: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: TaruColors.textPrimary,
    textAlign: 'center',
    lineHeight: 44,
  },
  body: {
    fontSize: 17,
    color: TaruColors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  messagePreview: {
    backgroundColor: TaruColors.surface,
    borderRadius: 10,
    padding: 20,
    width: '100%',
    gap: 8,
    borderWidth: 1,
    borderColor: TaruColors.border,
  },
  messageLabel: {
    fontSize: 11,
    color: TaruColors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    color: TaruColors.textPrimary,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  sendButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 6,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  skipText: {
    fontSize: 14,
    color: TaruColors.textMuted,
    letterSpacing: 0.5,
  },
});
