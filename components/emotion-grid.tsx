// components/emotion-grid.tsx
import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  SurrenderQuadrant,
  QUADRANT_EMOTIONS,
  QUADRANT_ACCENT,
  GRID_CORNER_COLORS,
  positionToQuadrant,
  lerpColor,
} from '@/constants/surrender-states';
import { TaruColors } from '@/constants/theme';

const COLUMNS: number = 24;

interface EmotionGridProps {
  onSelect: (quadrant: SurrenderQuadrant, emotionalState: string) => void;
}

export function EmotionGrid({ onSelect }: EmotionGridProps) {
  const containerRef = useRef<View>(null);
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 });
  const [activeQuadrant, setActiveQuadrant] = useState<SurrenderQuadrant | null>(null);

  const dotX = useSharedValue(-100);
  const dotY = useSharedValue(-100);
  const dotScale = useSharedValue(0);
  const dotOpacity = useSharedValue(0);

  const wordsTranslateY = useSharedValue(80);
  const wordsOpacity = useSharedValue(0);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dotX.value - 20 },
      { translateY: dotY.value - 20 },
      { scale: dotScale.value },
    ],
    opacity: dotOpacity.value,
  }));

  const wordsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: wordsTranslateY.value }],
    opacity: wordsOpacity.value,
  }));

  function handleTap(x: number, y: number) {
    const xPct = x / containerSize.width;
    const yPct = y / containerSize.height;
    const quadrant = positionToQuadrant(xPct, yPct);

    dotX.value = x;
    dotY.value = y;
    dotScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    dotOpacity.value = withTiming(1, { duration: 150 });

    wordsOpacity.value = withTiming(1, { duration: 250 });
    wordsTranslateY.value = withSpring(0, { damping: 14, stiffness: 180 });

    setActiveQuadrant(quadrant);
  }

  const tapGesture = Gesture.Tap().onEnd((e) => {
    runOnJS(handleTap)(e.x, e.y);
  });

  const columns = Array.from({ length: COLUMNS }, (_, i) => {
    const t = COLUMNS === 1 ? 0 : i / (COLUMNS - 1);
    const topColor = lerpColor(GRID_CORNER_COLORS.topLeft, GRID_CORNER_COLORS.topRight, t);
    const bottomColor = lerpColor(GRID_CORNER_COLORS.bottomLeft, GRID_CORNER_COLORS.bottomRight, t);
    return { topColor, bottomColor };
  });

  const accentColor = activeQuadrant ? QUADRANT_ACCENT[activeQuadrant] : TaruColors.electricBlue;
  const emotions = activeQuadrant ? QUADRANT_EMOTIONS[activeQuadrant] : [];

  return (
    <View style={styles.container}>
      <GestureDetector gesture={tapGesture}>
        <View
          ref={containerRef}
          style={styles.gradientContainer}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setContainerSize({ width, height });
          }}
        >
          <View style={styles.gradientRow}>
            {columns.map((col, i) => (
              <LinearGradient
                key={i}
                colors={[col.topColor, col.bottomColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.gradientColumn}
              />
            ))}
          </View>

          <Text style={[styles.axisLabel, styles.axisTop]}>HIGH ENERGY</Text>
          <Text style={[styles.axisLabel, styles.axisBottom]}>LOW ENERGY</Text>
          <Text style={[styles.axisLabel, styles.axisLeft]}>UNPLEASANT</Text>
          <Text style={[styles.axisLabel, styles.axisRight]}>PLEASANT</Text>

          {!activeQuadrant && (
            <View style={styles.promptContainer}>
              <Text style={styles.promptText}>Touch where you are</Text>
            </View>
          )}

          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: accentColor, shadowColor: accentColor },
              dotStyle,
            ]}
            pointerEvents="none"
          />
        </View>
      </GestureDetector>

      {activeQuadrant && (
        <Animated.View style={[styles.wordsPanel, wordsStyle]}>
          <Text style={styles.wordsPrompt}>Which word fits?</Text>
          <View style={styles.wordsRow}>
            {emotions.map((word) => (
              <TouchableOpacity
                key={word}
                style={[styles.wordChip, { borderColor: accentColor }]}
                onPress={() => onSelect(activeQuadrant, word)}
                activeOpacity={0.7}
              >
                <Text style={[styles.wordText, { color: accentColor }]}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TaruColors.background,
  },
  gradientContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gradientColumn: {
    flex: 1,
  },
  axisLabel: {
    position: 'absolute',
    fontSize: 9,
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.18)',
    textTransform: 'uppercase',
  },
  axisTop: {
    top: 10,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  axisBottom: {
    bottom: 10,
    alignSelf: 'center',
    left: '50%',
    transform: [{ translateX: -38 }],
  },
  axisLeft: {
    left: 8,
    top: '50%',
    transform: [{ rotate: '-90deg' }, { translateX: -30 }],
  },
  axisRight: {
    right: 8,
    top: '50%',
    transform: [{ rotate: '90deg' }, { translateX: -24 }],
  },
  promptContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 12,
  },
  wordsPanel: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
    backgroundColor: TaruColors.background,
  },
  wordsPrompt: {
    fontSize: 13,
    color: TaruColors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  wordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  wordChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    backgroundColor: TaruColors.surface,
  },
  wordText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
