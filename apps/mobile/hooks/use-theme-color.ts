/**
 * AuthX Mobile - Theme Color Hooks
 * Access theme colors with proper typing for light/dark mode
 */

import { Colors, DarkTheme, LightTheme } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ThemeType = typeof LightTheme;
type ThemeKey = keyof ThemeType;

/**
 * Get a specific color value based on current theme
 * Used by ThemedText and ThemedView components
 */
export function useThemeColor(
	props: { light?: string; dark?: string },
	colorName: "text" | "background" | "tint" | "icon",
): string {
	const colorScheme = useColorScheme() ?? "light";
	const colorFromProps = props[colorScheme];

	if (colorFromProps) {
		return colorFromProps;
	}

	// Return the primary color for the given type
	const theme = colorScheme === "dark" ? DarkTheme : LightTheme;

	switch (colorName) {
		case "text":
			return theme.text.primary;
		case "background":
			return theme.background.primary;
		case "tint":
			return theme.tint;
		case "icon":
			return theme.icon;
		default:
			return theme.text.primary;
	}
}

/**
 * Get the full theme object based on current color scheme
 * Used by custom screens for comprehensive theming
 */
export function useTheme() {
	const colorScheme = useColorScheme() ?? "light";
	return colorScheme === "dark" ? DarkTheme : LightTheme;
}

/**
 * Get whether current scheme is dark
 */
export function useIsDark() {
	const colorScheme = useColorScheme() ?? "light";
	return colorScheme === "dark";
}

/**
 * Get the Colors palette (static, not theme-dependent)
 */
export { Colors };
