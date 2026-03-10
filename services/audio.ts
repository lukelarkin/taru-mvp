// Audio service for Vagal Hum intervention
// Requires: expo-av (installed), audio files in assets/audio/
// Files needed: hum-60hz.mp3, hum-80hz.mp3, hum-100hz.mp3

import { Audio } from 'expo-av';

let sound: Audio.Sound | null = null;

export async function playHum(hz: 60 | 80 | 100): Promise<void> {
  await stopHum();

  // TODO: add audio files to assets/audio/ and uncomment:
  // const sources = {
  //   60:  require('../assets/audio/hum-60hz.mp3'),
  //   80:  require('../assets/audio/hum-80hz.mp3'),
  //   100: require('../assets/audio/hum-100hz.mp3'),
  // };
  // const { sound: s } = await Audio.Sound.createAsync(sources[hz], { shouldPlay: true, isLooping: true });
  // sound = s;
}

export async function stopHum(): Promise<void> {
  if (sound) {
    await sound.stopAsync();
    await sound.unloadAsync();
    sound = null;
  }
}
