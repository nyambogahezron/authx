import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18next from "i18next";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Language = "en" | "fr" | "sw";

interface LanguageState {
	language: Language;
	setLanguage: (lang: Language) => void;
	initialize: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
	persist(
		(set, get) => ({
			language: "en",
			setLanguage: (lang) => {
				set({ language: lang });
				i18next.changeLanguage(lang);
			},
			initialize: async () => {
				const state = get();
				// If no persisted language, use device locale if supported, else default to 'en'
				if (!state.language) {
					const deviceLanguage = getLocales()[0]?.languageCode;
					const supportedLanguages = ["en", "fr", "sw"];
					const initialLang = supportedLanguages.includes(deviceLanguage || "")
						? (deviceLanguage as Language)
						: "en";

					set({ language: initialLang });
					i18next.changeLanguage(initialLang);
				} else {
					i18next.changeLanguage(state.language);
				}
			},
		}),
		{
			name: "language-storage",
			storage: createJSONStorage(() => AsyncStorage),
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.initialize();
				}
			},
		},
	),
);
