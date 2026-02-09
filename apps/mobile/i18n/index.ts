import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./resources/en";
import fr from "./resources/fr";
import sw from "./resources/sw";

const resources = {
	en: { translation: en },
	fr: { translation: fr },
	sw: { translation: sw },
};

i18n.use(initReactI18next).init({
	resources,
	lng: getLocales()[0]?.languageCode || "en",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false, // react already safes from xss
	},
	compatibilityJSON: "v3", // Required for Android
});

export default i18n;
