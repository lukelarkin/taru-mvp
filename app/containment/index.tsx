import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BreathingCircle } from '@/components/breathing-circle';
import { NeonButton } from '@/components/neon-button';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import { PATTERN_CAPTURE_CATEGORIES, type Archetype } from '@/constants/archetypes';
import { useTaruStore } from '@/store/taru-store';

type Step = 1 | 2 | 3 | 4 | 5;

export default function ContainmentScreen() {
  const router = useRouter();
  const archetype = useTaruStore((s) => s.archetype) as Archetype | null;
  const logRelapse = useTaruStore((s) => s.logRelapse);

  const [step, setStep] = useState<Step>(1);
  // Step 3: one selection per category index
  const [categorySelections, setCategorySelections] = useState<(string | null)[]>(
    PATTERN_CAPTURE_CATEGORIES.map(() => null)
  );
  const [honestSentence, setHonestSentence] = useState('');

  const accentColor = archetype ? ArchetypeColors[archetype] : TaruColors.hotPink;

  const selectCategory = (categoryIndex: number, option: string) => {
    setCategorySelections((prev) => {
      const next = [...prev];
      next[categoryIndex] = option;
      return next;
    });
  };

  const allCategoriesSelected = categorySelections.every((s) => s !== null);

  const handleFinish = () => {
    const patternNotes = categorySelections.filter(Boolean) as string[];
    logRelapse(
      patternNotes[2] ?? 'Unspecified', // "How you felt" is the emotional state
      patternNotes,
      honestSentence.trim()
    );
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        {([1, 2, 3, 4, 5] as Step[]).map((s) => (
          <View
            key={s}
            style={[
              styles.progressSegment,
              s <= step && { backgroundColor: accentColor },
            ]}
          />
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Step 1: Breathe */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTag}>Step 1</Text>
              <Text style={styles.mainText}>You are still here.{'\n'}That matters.</Text>
              <BreathingCircle color={accentColor} size={90} />
              <Text style={styles.bodyText}>
                Take a few slow breaths. Follow the circle. You showed up — that already counts.
              </Text>
              <NeonButton
                label="I'm Ready"
                color={accentColor}
                onPress={() => setStep(2)}
                style={styles.continueBtn}
              />
            </View>
          )}

          {/* Step 2: Body Reset */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTag}>Step 2</Text>
              <Text style={styles.mainText}>Stand up.{'\n'}Shake it out.</Text>
              <Text style={styles.bodyText}>
                Shake your hands. Roll your shoulders. Stomp your feet. The body holds the charge —
                move it through, not down.
              </Text>
              <Text style={styles.bodyText}>Take 30 seconds. I'll wait.</Text>
              <NeonButton
                label="Done That"
                color={accentColor}
                onPress={() => setStep(3)}
                style={styles.continueBtn}
              />
            </View>
          )}

          {/* Step 3: Pattern Capture */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTag}>Step 3 — Capture</Text>
              <Text style={styles.mainText}>What was happening?</Text>
              <Text style={styles.captureSubtext}>One tap per row.</Text>

              {PATTERN_CAPTURE_CATEGORIES.map((category, catIdx) => (
                <View key={catIdx} style={styles.categoryBlock}>
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                  <View style={styles.chipRow}>
                    {category.options.map((option) => {
                      const isSelected = categorySelections[catIdx] === option;
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.chip,
                            isSelected && {
                              borderColor: accentColor,
                              backgroundColor: TaruColors.surface,
                            },
                          ]}
                          onPress={() => selectCategory(catIdx, option)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && { color: accentColor },
                            ]}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}

              <NeonButton
                label="Continue"
                color={accentColor}
                onPress={() => setStep(4)}
                disabled={!allCategoriesSelected}
                style={styles.continueBtn}
              />
            </View>
          )}

          {/* Step 4: Honest Sentence */}
          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTag}>Step 4 — Honest</Text>
              <Text style={styles.mainText}>
                What were you really{'\n'}trying to escape?
              </Text>
              <Text style={styles.bodyText}>One honest sentence. No judgment here.</Text>
              <TextInput
                style={styles.textInput}
                value={honestSentence}
                onChangeText={setHonestSentence}
                placeholder="I was trying to escape..."
                placeholderTextColor={TaruColors.textMuted}
                multiline
                numberOfLines={4}
                maxLength={280}
                autoFocus
              />
              <NeonButton
                label="Record It"
                color={accentColor}
                onPress={() => setStep(5)}
                disabled={honestSentence.trim().length < 3}
                style={styles.continueBtn}
              />
            </View>
          )}

          {/* Step 5: Close the Loop */}
          {step === 5 && (
            <View style={styles.stepContainer}>
              <Text style={styles.mainText}>
                Relapse logged.{'\n'}Pattern recorded.{'\n'}You showed up{'\n'}anyway.
              </Text>
              <Text style={styles.bodyText}>
                The fact that you are here means you chose awareness over denial. That is the
                foundation everything else is built on.
              </Text>
              <Text style={[styles.bodyText, { color: accentColor }]}>
                No streak was reset. No score was punished. Just data, and a moment of honesty.
              </Text>
              <NeonButton
                label="Close"
                color={accentColor}
                onPress={handleFinish}
                style={styles.continueBtn}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TaruColors.background },
  flex: { flex: 1 },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: TaruColors.border,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingBottom: 60,
  },
  stepContainer: {
    paddingTop: 32,
    gap: 20,
    alignItems: 'center',
  },
  stepTag: {
    fontSize: 12,
    color: TaruColors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  mainText: {
    fontSize: 36,
    fontWeight: '800',
    color: TaruColors.textPrimary,
    lineHeight: 46,
    alignSelf: 'flex-start',
  },
  bodyText: {
    fontSize: 17,
    color: TaruColors.textSecondary,
    lineHeight: 26,
    alignSelf: 'flex-start',
  },
  captureSubtext: {
    fontSize: 13,
    color: TaruColors.textMuted,
    alignSelf: 'flex-start',
    letterSpacing: 0.5,
  },
  categoryBlock: {
    width: '100%',
    gap: 10,
  },
  categoryLabel: {
    fontSize: 13,
    color: TaruColors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TaruColors.border,
    backgroundColor: TaruColors.surfaceAlt,
  },
  chipText: {
    fontSize: 14,
    color: TaruColors.textPrimary,
  },
  textInput: {
    width: '100%',
    backgroundColor: TaruColors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TaruColors.border,
    padding: 16,
    color: TaruColors.textPrimary,
    fontSize: 17,
    lineHeight: 26,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  continueBtn: {
    width: '100%',
    marginTop: 8,
  },
});
