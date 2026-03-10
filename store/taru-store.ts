import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Archetype } from '@/constants/archetypes';
import type { SurrenderQuadrant } from '@/constants/surrender-states';

export interface SurrenderEntry {
  timestamp: number;
  emotionalState: string;
  quadrant?: SurrenderQuadrant;
  archetypeAtTime: string;
}

export interface RelapseEntry {
  timestamp: number;
  emotionalState: string;
  patternNotes: string[];
  honestSentence: string;
}

export interface AccountabilityContact {
  name: string;
  phone: string;
  message: string;
}

interface TaruState {
  archetype: Archetype | null;
  onboardingComplete: boolean;
  surrenders: SurrenderEntry[];
  relapses: RelapseEntry[];
  groundingPhotos: string[];
  accountabilityContact: AccountabilityContact | null;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setArchetype: (a: Archetype) => void;
  completeOnboarding: () => void;
  logSurrender: (emotionalState: string, quadrant?: SurrenderQuadrant) => void;
  logRelapse: (
    emotionalState: string,
    patternNotes: string[],
    honestSentence: string
  ) => void;
  setGroundingPhotos: (uris: string[]) => void;
  setAccountabilityContact: (contact: AccountabilityContact | null) => void;
}

export const useTaruStore = create<TaruState>()(
  persist(
    (set, get) => ({
      archetype: null,
      onboardingComplete: false,
      surrenders: [],
      relapses: [],
      groundingPhotos: [],
      accountabilityContact: null,
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      setArchetype: (a) => set({ archetype: a }),

      completeOnboarding: () => set({ onboardingComplete: true }),

      logSurrender: (emotionalState, quadrant) =>
        set((state) => ({
          surrenders: [
            ...state.surrenders,
            {
              timestamp: Date.now(),
              emotionalState,
              quadrant,
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

      setGroundingPhotos: (uris) => set({ groundingPhotos: uris }),

      setAccountabilityContact: (contact) =>
        set({ accountabilityContact: contact }),
    }),
    {
      name: 'taru-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        archetype: state.archetype,
        onboardingComplete: state.onboardingComplete,
        surrenders: state.surrenders,
        relapses: state.relapses,
        groundingPhotos: state.groundingPhotos,
        accountabilityContact: state.accountabilityContact,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const selectSelfTrustScore = (state: TaruState): number =>
  state.surrenders.length * 2 + state.relapses.length * 3;
