import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Archetype } from '@/constants/archetypes';

export interface SurrenderEntry {
  timestamp: number;
  emotionalState: string;
  archetypeAtTime: string;
}

export interface RelapseEntry {
  timestamp: number;
  emotionalState: string;
  patternNotes: string[];
  honestSentence: string;
}

interface TaruState {
  archetype: Archetype | null;
  onboardingComplete: boolean;
  surrenders: SurrenderEntry[];
  relapses: RelapseEntry[];
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setArchetype: (a: Archetype) => void;
  completeOnboarding: () => void;
  logSurrender: (emotionalState: string) => void;
  logRelapse: (
    emotionalState: string,
    patternNotes: string[],
    honestSentence: string
  ) => void;
}

export const useTaruStore = create<TaruState>()(
  persist(
    (set, get) => ({
      archetype: null,
      onboardingComplete: false,
      surrenders: [],
      relapses: [],
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      setArchetype: (a) => set({ archetype: a }),

      completeOnboarding: () => set({ onboardingComplete: true }),

      logSurrender: (emotionalState) =>
        set((state) => ({
          surrenders: [
            ...state.surrenders,
            {
              timestamp: Date.now(),
              emotionalState,
              archetypeAtTime: state.archetype ?? 'unknown',
            },
          ],
        })),

      logRelapse: (emotionalState, patternNotes, honestSentence) =>
        set((state) => ({
          relapses: [
            ...state.relapses,
            {
              timestamp: Date.now(),
              emotionalState,
              patternNotes,
              honestSentence,
            },
          ],
        })),
    }),
    {
      name: 'taru-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        archetype: state.archetype,
        onboardingComplete: state.onboardingComplete,
        surrenders: state.surrenders,
        relapses: state.relapses,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const selectSelfTrustScore = (state: TaruState): number =>
  state.surrenders.length * 2 + state.relapses.length * 3;
