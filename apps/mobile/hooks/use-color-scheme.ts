import { useColorScheme as useNativeColorScheme } from "react-native";
import { useThemeStore } from "@/stores/theme-store";

export function useColorScheme() {
	const { theme } = useThemeStore();
	const systemColorScheme = useNativeColorScheme();

	if (theme === "system") {
		return systemColorScheme;
	}

	return theme;
}
