import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useTaruStore } from '@/store/taru-store';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import type { Archetype } from '@/constants/archetypes';
import type { AccountabilityContact } from '@/store/taru-store';

const DEFAULT_MESSAGE =
  "Hey, having a hard moment. Don't need to talk, just wanted you to know.";

export default function SettingsScreen() {
  const router = useRouter();
  const archetype = useTaruStore((s) => s.archetype) as Archetype | null;
  const groundingPhotos = useTaruStore((s) => s.groundingPhotos);
  const accountabilityContact = useTaruStore((s) => s.accountabilityContact);
  const setGroundingPhotos = useTaruStore((s) => s.setGroundingPhotos);
  const setAccountabilityContact = useTaruStore((s) => s.setAccountabilityContact);
  const setArchetype = useTaruStore((s) => s.setArchetype);
  const completeOnboarding = useTaruStore((s) => s.completeOnboarding);

  const accent = archetype ? ArchetypeColors[archetype] : TaruColors.electricBlue;

  // Contact form state — initialise from store
  const [contactName, setContactName] = useState(accountabilityContact?.name ?? '');
  const [contactPhone, setContactPhone] = useState(accountabilityContact?.phone ?? '');
  const [contactMessage, setContactMessage] = useState(
    accountabilityContact?.message ?? DEFAULT_MESSAGE,
  );
  const [contactSaved, setContactSaved] = useState(false);

  // ── Photos ──────────────────────────────────────────────

  const pickPhoto = async () => {
    if (groundingPhotos.length >= 3) {
      Alert.alert('Max 3 photos', 'Remove one before adding another.');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access in Settings to use this feature.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setGroundingPhotos([...groundingPhotos, result.assets[0].uri]);
    }
  };

  const removePhoto = (uri: string) => {
    Alert.alert('Remove photo?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setGroundingPhotos(groundingPhotos.filter((p) => p !== uri));
        },
      },
    ]);
  };

  // ── Contact ─────────────────────────────────────────────

  const saveContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      Alert.alert('Missing info', 'Name and phone number are required.');
      return;
    }
    const contact: AccountabilityContact = {
      name: contactName.trim(),
      phone: contactPhone.trim(),
      message: contactMessage.trim() || DEFAULT_MESSAGE,
    };
    setAccountabilityContact(contact);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setContactSaved(true);
    setTimeout(() => setContactSaved(false), 2000);
  };

  const clearContact = () => {
    Alert.alert('Remove contact?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setAccountabilityContact(null);
          setContactName('');
          setContactPhone('');
          setContactMessage(DEFAULT_MESSAGE);
        },
      },
    ]);
  };

  // ── Retake quiz ──────────────────────────────────────────

  const retakeQuiz = () => {
    Alert.alert('Retake the quiz?', 'Your archetype will be reset.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Retake',
        onPress: () => router.replace('/onboarding/quiz'),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>Settings</Text>

          {/* ── You ── */}
          <Section label="You">
            <View style={styles.archetypeRow}>
              <View>
                <Text style={styles.fieldLabel}>Your Archetype</Text>
                <Text style={[styles.archetypeValue, { color: accent }]}>
                  The {archetype ?? '—'}
                </Text>
              </View>
              <Pressable onPress={retakeQuiz} style={styles.retakeButton}>
                <Text style={styles.retakeText}>Retake Quiz</Text>
              </Pressable>
            </View>
          </Section>

          {/* ── Grounding Photos ── */}
          <Section label="Grounding Photos">
            <Text style={styles.sectionNote}>
              Up to 3 photos. They appear full-screen during crisis.
            </Text>
            <View style={styles.photoGrid}>
              {groundingPhotos.map((uri) => (
                <Pressable
                  key={uri}
                  onPress={() => removePhoto(uri)}
                  style={styles.photoSlot}
                >
                  <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                  <View style={styles.removeOverlay}>
                    <Text style={styles.removeIcon}>✕</Text>
                  </View>
                </Pressable>
              ))}
              {groundingPhotos.length < 3 && (
                <Pressable onPress={pickPhoto} style={styles.addPhotoSlot}>
                  <Text style={[styles.addPhotoIcon, { color: accent }]}>+</Text>
                  <Text style={styles.addPhotoLabel}>Add</Text>
                </Pressable>
              )}
            </View>
          </Section>

          {/* ── Accountability Contact ── */}
          <Section label="Accountability Contact">
            <Text style={styles.sectionNote}>
              One tap sends this message when you're struggling.
            </Text>
            <View style={styles.fieldGroup}>
              <Field label="Name">
                <TextInput
                  style={styles.input}
                  value={contactName}
                  onChangeText={setContactName}
                  placeholder="Alex"
                  placeholderTextColor={TaruColors.textMuted}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </Field>
              <Field label="Phone">
                <TextInput
                  style={styles.input}
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  placeholder="+1 555 000 0000"
                  placeholderTextColor={TaruColors.textMuted}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </Field>
              <Field label="Message">
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={contactMessage}
                  onChangeText={setContactMessage}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={TaruColors.textMuted}
                />
              </Field>
            </View>

            <View style={styles.contactActions}>
              <Pressable
                onPress={saveContact}
                style={[styles.saveButton, { backgroundColor: accent }]}
              >
                <Text style={styles.saveButtonText}>
                  {contactSaved ? 'Saved ✓' : 'Save Contact'}
                </Text>
              </Pressable>
              {accountabilityContact && (
                <Pressable onPress={clearContact}>
                  <Text style={styles.clearText}>Remove</Text>
                </Pressable>
              )}
            </View>
          </Section>

          {/* ── App ── */}
          <Section label="App">
            <View style={styles.appRow}>
              <Text style={styles.fieldLabel}>Version</Text>
              <Text style={styles.appValue}>1.0.0 (dev)</Text>
            </View>
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TaruColors.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: TaruColors.textPrimary,
    letterSpacing: 0.5,
    paddingTop: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: TaruColors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingLeft: 4,
  },
  sectionCard: {
    backgroundColor: TaruColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TaruColors.border,
    padding: 16,
    gap: 14,
  },
  sectionNote: {
    fontSize: 13,
    color: TaruColors.textMuted,
    lineHeight: 19,
  },
  // Archetype row
  archetypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  archetypeValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  retakeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: TaruColors.surfaceAlt,
  },
  retakeText: {
    fontSize: 13,
    color: TaruColors.textSecondary,
    fontWeight: '600',
  },
  // Photos
  photoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  photoSlot: {
    width: 88,
    height: 88,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  addPhotoSlot: {
    width: 88,
    height: 88,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TaruColors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addPhotoIcon: {
    fontSize: 28,
    lineHeight: 32,
  },
  addPhotoLabel: {
    fontSize: 11,
    color: TaruColors.textMuted,
    letterSpacing: 0.5,
  },
  // Contact form
  fieldGroup: {
    gap: 12,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    color: TaruColors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  input: {
    backgroundColor: TaruColors.surfaceAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TaruColors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: TaruColors.textPrimary,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 14,
    color: TaruColors.textMuted,
  },
  // App info
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appValue: {
    fontSize: 14,
    color: TaruColors.textMuted,
  },
});
