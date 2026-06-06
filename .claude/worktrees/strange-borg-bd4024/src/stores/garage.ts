"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type GarageBike = {
  motorcycleId: string;
  brand: string;
  model: string;
  year: number;
  nickname?: string | null;
};

type State = {
  /** Aktif motor (filtre için kullanılır) */
  active: GarageBike | null;
  hasHydrated: boolean;
  setActive: (bike: GarageBike | null) => void;
};

export const useGarage = create<State>()(
  persist(
    (set) => ({
      active: null,
      hasHydrated: false,
      setActive: (bike) => set({ active: bike }),
    }),
    {
      name: "galaksi-garage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : {
              getItem: () => null,
              setItem: () => undefined,
              removeItem: () => undefined,
            }
      ),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useGarage.setState({ hasHydrated: true });
      },
    }
  )
);
