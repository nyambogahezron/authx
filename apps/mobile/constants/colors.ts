/**
 * AuthX Mobile - Colors System
 * Comprehensive color palette with light/dark mode support
 */

export const Colors = {
	// Brand colors - Primary gradient
	primary: {
		50: "#EEF2FF",
		100: "#E0E7FF",
		200: "#C7D2FE",
		300: "#A5B4FC",
		400: "#818CF8",
		500: "#6366F1", // Main primary
		600: "#4F46E5",
		700: "#4338CA",
		800: "#3730A3",
		900: "#312E81",
	},

	// Secondary accent
	secondary: {
		50: "#F5F5F4",
		100: "#E7E5E4",
		200: "#D6D3D1",
		300: "#A8A29E",
		400: "#78716C",
		500: "#57534E",
		600: "#44403C",
		700: "#292524",
		800: "#1C1917",
		900: "#0C0A09",
	},
	// Semantic colors
	success: {
		50: "#ECFDF5", // emerald-50
		500: "#10B981", // emerald-500
		700: "#047857", // emerald-700
	},
	warning: {
		50: "#FFFBEB", // amber-50
		500: "#F59E0B", // amber-500
		700: "#B45309", // amber-700
	},
	error: {
		50: "#FEF2F2", // red-50
		500: "#EF4444", // red-500
		700: "#B91C1C", // red-700
	},
	info: {
		50: "#EFF6FF", // blue-50
		500: "#3B82F6", // blue-500
		700: "#1D4ED8", // blue-700
	},
	// Neutrals - Slate (Cool Gray)
	gray: {
		50: "#F8FAFC",
		100: "#F1F5F9",
		200: "#E2E8F0",
		300: "#CBD5E1",
		400: "#94A3B8",
		500: "#64748B",
		600: "#475569",
		700: "#334155",
		800: "#1E293B",
		900: "#0F172A",
		950: "#020617",
	},
	white: "#FFFFFF",
	black: "#000000",
	transparent: "transparent",

	// Social & OAuth
	social: {
		github: "#24292F",
		google: "#DB4437",
		facebook: "#1877F2",
		linkedin: "#0A66C2",
		apple: "#000000",
		twitter: "#1DA1F2",
	},
};

export const LightTheme = {
	text: {
		primary: Colors.gray[900],
		secondary: Colors.gray[600],
		tertiary: Colors.gray[500],
		inverse: Colors.white,
		link: Colors.primary[700],
	},
	background: {
		primary: Colors.white,
		secondary: Colors.gray[50], // Light Grey background
		tertiary: Colors.gray[100],
		inverse: Colors.gray[900],
	},
	surface: {
		default: Colors.white,
		secondary: Colors.gray[50],
		tertiary: Colors.gray[100],
		input: Colors.gray[50],
	},
	border: {
		default: Colors.gray[200],
		subtle: Colors.gray[100],
		strong: Colors.gray[300],
		focus: Colors.primary[500],
	},
	tint: Colors.primary[700],
	icon: Colors.gray[500],
	tabBar: {
		background: Colors.white,
		active: Colors.primary[700],
		inactive: Colors.gray[400],
	},
};

export const DarkTheme = {
	text: {
		primary: Colors.gray[50],
		secondary: Colors.gray[300],
		tertiary: Colors.gray[400],
		inverse: Colors.gray[900],
		link: Colors.primary[300],
	},
	background: {
		primary: Colors.gray[950], // Deep Navy/Dark Slate
		secondary: Colors.gray[900],
		tertiary: Colors.gray[800],
		inverse: Colors.white,
	},
	surface: {
		default: Colors.gray[900],
		secondary: Colors.gray[800],
		tertiary: Colors.gray[700],
		input: Colors.gray[800],
	},
	border: {
		default: Colors.gray[800],
		subtle: Colors.gray[800],
		strong: Colors.gray[700],
		focus: Colors.primary[500],
	},
	tint: Colors.primary[300],
	icon: Colors.gray[400],
	tabBar: {
		background: Colors.gray[900],
		active: Colors.primary[300],
		inactive: Colors.gray[600],
	},
};

// Gradients
export const Gradients = {
	primary: ["#6366F1", "#8B5CF6"] as const,
	secondary: ["#8B5CF6", "#A855F7"] as const,
	success: ["#10B981", "#34D399"] as const,
	warm: ["#F59E0B", "#EF4444"] as const,
	cool: ["#3B82F6", "#6366F1"] as const,
	dark: ["#1F2937", "#111827"] as const,
};

// Theme colors lookup
export const ThemeColors = {
	light: LightTheme,
	dark: DarkTheme,
};
