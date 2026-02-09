import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeState {
	theme: ThemePreference;
	setTheme: (theme: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
	persist(
		(set) => ({
			theme: "system",
			setTheme: (theme) => set({ theme }),
		}),
		{
			name: "authx-theme-storage",
			storage: createJSONStorage(() => AsyncStorage),
		},
	),
);
