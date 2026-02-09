import { Platform } from "react-native";

export const Spacing = {
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	"2xl": 24,
	"3xl": 32,
	"4xl": 40,
	"5xl": 48,
	"6xl": 64,
	"7xl": 80,
	"8xl": 96,
} as const;

export const BorderRadius = {
	none: 0,
	sm: 4,
	md: 8,
	lg: 12,
	xl: 16,
	"2xl": 20,
	"3xl": 24,
	full: 9999,
} as const;

export const FontSize = {
	xs: 12,
	sm: 14,
	base: 16,
	lg: 18,
	xl: 20,
	"2xl": 24,
	"3xl": 30,
	"4xl": 36,
	"5xl": 48,
} as const;

export const LineHeight = {
	tight: 1.25,
	normal: 1.5,
	relaxed: 1.75,
} as const;

export const FontWeight = {
	regular: "400" as const,
	medium: "500" as const,
	semibold: "600" as const,
	bold: "700" as const,
	extrabold: "800" as const,
};

export const FontFamily = Platform.select({
	ios: {
		sans: "System",
		serif: "Georgia",
		mono: "Menlo",
	},
	android: {
		sans: "Roboto",
		serif: "serif",
		mono: "monospace",
	},
	default: {
		sans: "System",
		serif: "serif",
		mono: "monospace",
	},
})!;

export const Typography = {
	h1: {
		fontSize: FontSize["4xl"],
		fontWeight: FontWeight.bold,
		lineHeight: FontSize["4xl"] * LineHeight.tight,
	},
	h2: {
		fontSize: FontSize["3xl"],
		fontWeight: FontWeight.bold,
		lineHeight: FontSize["3xl"] * LineHeight.tight,
	},
	h3: {
		fontSize: FontSize["2xl"],
		fontWeight: FontWeight.semibold,
		lineHeight: FontSize["2xl"] * LineHeight.tight,
	},
	h4: {
		fontSize: FontSize.xl,
		fontWeight: FontWeight.semibold,
		lineHeight: FontSize.xl * LineHeight.tight,
	},
	bodyLarge: {
		fontSize: FontSize.lg,
		fontWeight: FontWeight.regular,
		lineHeight: FontSize.lg * LineHeight.normal,
	},
	body: {
		fontSize: FontSize.base,
		fontWeight: FontWeight.regular,
		lineHeight: FontSize.base * LineHeight.normal,
	},
	bodySmall: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.regular,
		lineHeight: FontSize.sm * LineHeight.normal,
	},
	label: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.medium,
		lineHeight: FontSize.sm * LineHeight.tight,
	},
	caption: {
		fontSize: FontSize.xs,
		fontWeight: FontWeight.regular,
		lineHeight: FontSize.xs * LineHeight.normal,
	},
	button: {
		fontSize: FontSize.base,
		fontWeight: FontWeight.semibold,
		lineHeight: FontSize.base * LineHeight.tight,
	},
	buttonSmall: {
		fontSize: FontSize.sm,
		fontWeight: FontWeight.semibold,
		lineHeight: FontSize.sm * LineHeight.tight,
	},
} as const;

export const Shadows = {
	none: {
		shadowColor: "transparent",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0,
		shadowRadius: 0,
		elevation: 0,
	},
	sm: {
		shadowColor: "transparent",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0,
		shadowRadius: 0,
		elevation: 0,
	},
	md: {
		shadowColor: "transparent",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0,
		shadowRadius: 0,
		elevation: 0,
	},
	lg: {
		shadowColor: "transparent",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0,
		shadowRadius: 0,
		elevation: 0,
	},
	xl: {
		shadowColor: "transparent",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0,
		shadowRadius: 0,
		elevation: 0,
	},
	"2xl": {
		shadowColor: "transparent",
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0,
		shadowRadius: 0,
		elevation: 0,
	},
} as const;

export const Duration = {
	instant: 0,
	fast: 100,
	normal: 200,
	slow: 300,
	slower: 400,
	slowest: 500,
} as const;

export const Easing = {
	ease: "ease",
	easeIn: "ease-in",
	easeOut: "ease-out",
	easeInOut: "ease-in-out",
	linear: "linear",
} as const;

export const SpringConfig = {
	gentle: {
		damping: 15,
		stiffness: 150,
		mass: 1,
	},
	bouncy: {
		damping: 10,
		stiffness: 180,
		mass: 1,
	},
	stiff: {
		damping: 20,
		stiffness: 250,
		mass: 1,
	},
	wobbly: {
		damping: 8,
		stiffness: 200,
		mass: 1,
	},
} as const;

export const IconSize = {
	xs: 16,
	sm: 20,
	md: 24,
	lg: 28,
	xl: 32,
	"2xl": 40,
	"3xl": 48,
} as const;

export const AvatarSize = {
	xs: 24,
	sm: 32,
	md: 40,
	lg: 56,
	xl: 72,
	xxl: 84,
	"2xl": 96,
	"3xl": 128,
} as const;

export const HitSlop = {
	sm: { top: 8, right: 8, bottom: 8, left: 8 },
	md: { top: 12, right: 12, bottom: 12, left: 12 },
	lg: { top: 16, right: 16, bottom: 16, left: 16 },
} as const;

export const ScreenPadding = {
	horizontal: Spacing.lg,
	vertical: Spacing.xl,
} as const;

export const InputHeight = {
	sm: 40,
	md: 48,
	lg: 56,
} as const;

export const ButtonHeight = {
	sm: 36,
	md: 44,
	lg: 52,
} as const;

export const ZIndex = {
	base: 0,
	dropdown: 10,
	sticky: 20,
	overlay: 30,
	modal: 40,
	toast: 50,
} as const;

export const Theme = {
	spacing: Spacing,
	borderRadius: BorderRadius,
	fontSize: FontSize,
	lineHeight: LineHeight,
	fontWeight: FontWeight,
	fontFamily: FontFamily,
	typography: Typography,
	shadows: Shadows,
	duration: Duration,
	easing: Easing,
	springConfig: SpringConfig,
	iconSize: IconSize,
	avatarSize: AvatarSize,
	hitSlop: HitSlop,
	screenPadding: ScreenPadding,
	inputHeight: InputHeight,
	buttonHeight: ButtonHeight,
	zIndex: ZIndex,
} as const;

export const Fonts = FontFamily;
