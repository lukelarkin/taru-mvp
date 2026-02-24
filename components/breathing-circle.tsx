import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface BreathingCircleProps {
  color: string;
  size?: number;
}

export function BreathingCircle({ color, size = 120 }: BreathingCircleProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    // 4s inhale → 1s hold → 4s exhale → 1s pause
    scale.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.35, { duration: 1000 }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const containerSize = size * 1.8;

  return (
    <View
      style={[
        styles.container,
        { width: containerSize, height: containerSize },
      ]}
    >
      {/* Outer glow ring */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 1.6,
            height: size * 1.6,
            borderRadius: size * 0.8,
            borderWidth: 1,
            borderColor: color,
          },
          animatedStyle,
        ]}
      />
      {/* Middle glow ring */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size * 1.2,
            height: size * 1.2,
            borderRadius: size * 0.6,
            borderWidth: 1,
            borderColor: color,
            opacity: 0.5,
          },
          animatedStyle,
        ]}
      />
      {/* Core circle */}
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 20,
            elevation: 10,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
