import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NeonButton } from '@/components/neon-button';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import {
  QUIZ_QUESTIONS,
  ARCHETYPE_DESCRIPTIONS,
  type Archetype,
} from '@/constants/archetypes';
import { useTaruStore } from '@/store/taru-store';

type ArchetypeScores = Record<Archetype, number>;

const ALL_ARCHETYPES: Archetype[] = ['Warrior', 'Lover', 'Sage', 'Seeker'];

function computeArchetype(scores: ArchetypeScores): Archetype {
  return ALL_ARCHETYPES.reduce((best, a) => (scores[a] > scores[best] ? a : best));
}

export default function QuizScreen() {
  const router = useRouter();
  const setArchetype = useTaruStore((s) => s.setArchetype);
  const completeOnboarding = useTaruStore((s) => s.completeOnboarding);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState<ArchetypeScores>({
    Warrior: 0,
    Lover: 0,
    Sage: 0,
    Seeker: 0,
  });
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<Archetype | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[questionIndex];

  const handleAnswer = (archetype: Archetype) => {
    const newScores: ArchetypeScores = {
      ...scores,
      [archetype]: scores[archetype] + 1,
    };
    setScores(newScores);

    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      const winner = computeArchetype(newScores);
      setResult(winner);
      setRevealed(true);
    }
  };

  const handleBegin = () => {
    if (!result) return;
    setArchetype(result);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  if (revealed && result) {
    const color = ArchetypeColors[result];
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.revealContent}>
          <Text style={[styles.revealLabel, { color: TaruColors.textSecondary }]}>
            You are
          </Text>
          <Text style={[styles.revealName, { color }]}>The {result}</Text>
          <View style={[styles.divider, { backgroundColor: color }]} />
          <Text style={styles.revealDesc}>{ARCHETYPE_DESCRIPTIONS[result]}</Text>
          <NeonButton
            label="Begin"
            color={color}
            onPress={handleBegin}
            style={styles.beginBtn}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.questionContent}>
        {/* Progress dots */}
        <View style={styles.progressRow}>
          {QUIZ_QUESTIONS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === questionIndex && styles.dotActive,
                i < questionIndex && styles.dotDone,
              ]}
            />
          ))}
        </View>

        <Text style={styles.questionNumber}>
          {questionIndex + 1} of {QUIZ_QUESTIONS.length}
        </Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.answersBlock}>
          {currentQuestion.answers.map((answer) => (
            <TouchableOpacity
              key={answer.archetype}
              style={styles.answerButton}
              onPress={() => handleAnswer(answer.archetype)}
              activeOpacity={0.7}
            >
              <Text style={styles.answerText}>{answer.text}</Text>
            </TouchableOpacity>
          ))}
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
  questionContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: TaruColors.textMuted,
  },
  dotActive: {
    backgroundColor: TaruColors.electricBlue,
    width: 24,
  },
  dotDone: {
    backgroundColor: TaruColors.textSecondary,
  },
  questionNumber: {
    fontSize: 13,
    color: TaruColors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 26,
    fontWeight: '700',
    color: TaruColors.textPrimary,
    lineHeight: 36,
    marginBottom: 48,
  },
  answersBlock: {
    gap: 14,
  },
  answerButton: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TaruColors.border,
    backgroundColor: TaruColors.surface,
  },
  answerText: {
    fontSize: 16,
    color: TaruColors.textPrimary,
    lineHeight: 22,
  },
  // Reveal styles
  revealContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: Dimensions.get('window').height * 0.12,
    paddingBottom: 60,
    alignItems: 'center',
    gap: 24,
  },
  revealLabel: {
    fontSize: 16,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  revealName: {
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 2,
    borderRadius: 1,
  },
  revealDesc: {
    fontSize: 18,
    color: TaruColors.textSecondary,
    lineHeight: 28,
    textAlign: 'center',
  },
  beginBtn: {
    width: '100%',
    marginTop: 24,
  },
});
