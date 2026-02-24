import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BreathingCircle } from '@/components/breathing-circle';
import { NeonButton } from '@/components/neon-button';
import { TaruColors, ArchetypeColors } from '@/constants/theme';
import {
  SURRENDER_EMOTIONAL_STATES,
  INTERVENTIONS,
  type Archetype,
  type SurrenderEmotionalState,
} from '@/constants/archetypes';
import { useTaruStore } from '@/store/taru-store';

const { height } = Dimensions.get('window');

export default function SurrenderScreen() {
  const router = useRouter();
  const archetype = useTaruStore((s) => s.archetype) as Archetype | null;
  const logSurrender = useTaruStore((s) => s.logSurrender);

  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [selectedEmotion, setSelectedEmotion] = useState<SurrenderEmotionalState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const accentColor = archetype ? ArchetypeColors[archetype] : TaruColors.electricBlue;

  // Phase 1: auto-advance at 5s
  useEffect(() => {
    if (phase === 1) {
      timerRef.current = setTimeout(() => setPhase(2), 5000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  // Phase 2: auto-advance at 15s if no selection
  useEffect(() => {
    if (phase === 2) {
      timerRef.current = setTimeout(() => {
        if (!selectedEmotion) setSelectedEmotion('Stress');
        setPhase(3);
      }, 15000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  const handleEmotionSelect = (emotion: SurrenderEmotionalState) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedEmotion(emotion);
    setPhase(3);
  };

  const handleDismiss = () => {
    const emotion = selectedEmotion ?? 'Stress';
    logSurrender(emotion);
    router.back();
  };

  const interventionText =
    archetype && selectedEmotion
      ? INTERVENTIONS[archetype][selectedEmotion]
      : archetype
        ? INTERVENTIONS[archetype]['Stress']
        : 'Take three slow breaths. You are already doing the hard thing.';

  return (
    <SafeAreaView style={styles.container}>
      {/* Phase 1: Breathe */}
      {phase === 1 && (
        <View style={styles.phaseContainer}>
          <Text style={styles.bigHeading}>Stop.{'\n'}Breathe.</Text>
          <BreathingCircle color={accentColor} size={100} />
          <Text style={styles.subText}>Follow the circle</Text>
        </View>
      )}

      {/* Phase 2: Name It */}
      {phase === 2 && (
        <View style={styles.phaseContainer}>
          <Text style={styles.phaseHeading}>What's underneath this?</Text>
          <View style={styles.emotionGrid}>
            {SURRENDER_EMOTIONAL_STATES.map((emotion) => (
              <TouchableOpacity
                key={emotion}
                style={[
                  styles.emotionChip,
                  selectedEmotion === emotion && {
                    borderColor: accentColor,
                    backgroundColor: TaruColors.surface,
                  },
                ]}
                onPress={() => handleEmotionSelect(emotion)}
                activeOpacity={0.7}
              >
                <Text style={styles.emotionText}>{emotion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Phase 3: Reset */}
      {phase === 3 && (
        <View style={styles.phaseContainer}>
          <View style={styles.interventionBlock}>
            {archetype && (
              <Text style={[styles.archetypeLabel, { color: accentColor }]}>
                The {archetype}
              </Text>
            )}
            <Text style={styles.interventionText}>{interventionText}</Text>
          </View>
          <View style={styles.confirmBlock}>
            <Text style={styles.confirmText}>Urge logged. You stayed.</Text>
            <NeonButton
              label="Done"
              color={accentColor}
              onPress={handleDismiss}
              style={styles.doneBtn}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TaruColors.background,
  },
  phaseContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 36,
    paddingVertical: height * 0.08,
  },
  bigHeading: {
    fontSize: 52,
    fontWeight: '900',
    color: TaruColors.textPrimary,
    textAlign: 'center',
    lineHeight: 60,
    letterSpacing: 2,
  },
  phaseHeading: {
    fontSize: 32,
    fontWeight: '800',
    color: TaruColors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
  },
  subText: {
    fontSize: 13,
    color: TaruColors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    width: '100%',
  },
  emotionChip: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TaruColors.border,
    backgroundColor: TaruColors.surfaceAlt,
    minWidth: '44%',
    alignItems: 'center',
  },
  emotionText: {
    fontSize: 18,
    color: TaruColors.textPrimary,
    fontWeight: '600',
  },
  interventionBlock: {
    gap: 20,
    width: '100%',
  },
  archetypeLabel: {
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  interventionText: {
    fontSize: 22,
    color: TaruColors.textPrimary,
    lineHeight: 34,
    fontWeight: '400',
  },
  confirmBlock: {
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  confirmText: {
    fontSize: 16,
    color: TaruColors.textSecondary,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  doneBtn: {
    width: '100%',
  },
});
