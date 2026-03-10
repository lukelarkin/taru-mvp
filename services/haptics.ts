import * as Haptics from 'expo-haptics';

const BILATERAL_PATTERN = {
  duration: 60000, // 60 seconds
  interval: 300,   // 300ms between pulses
};

let timer: ReturnType<typeof setInterval> | null = null;
let completionTimer: ReturnType<typeof setTimeout> | null = null;

export function startBilateral(
  onBeat: (side: 'left' | 'right') => void,
  onComplete: () => void,
): void {
  stopBilateral();

  let side: 'left' | 'right' = 'left';

  // Fire first beat immediately
  onBeat(side);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

  timer = setInterval(() => {
    side = side === 'left' ? 'right' : 'left';
    onBeat(side);
    Haptics.impactAsync(
      side === 'left'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Light,
    );
  }, BILATERAL_PATTERN.interval);

  completionTimer = setTimeout(() => {
    stopBilateral();
    onComplete();
  }, BILATERAL_PATTERN.duration);
}

export function stopBilateral(): void {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  if (completionTimer !== null) {
    clearTimeout(completionTimer);
    completionTimer = null;
  }
}
