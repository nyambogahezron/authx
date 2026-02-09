/**
 * AuthX Mobile - Card Component
 * Reusable card with elevation, glassmorphism, and press animations
 */

import * as Haptics from "expo-haptics";
import type React from "react";
import { useCallback } from "react";
import {
	Pressable,
	type StyleProp,
	StyleSheet,
	View,
	type ViewStyle,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import {
	BorderRadius,
	Shadows,
	Spacing,
	SpringConfig,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type CardVariant = "elevated" | "outlined" | "filled";

interface CardProps {
	children: React.ReactNode;
	variant?: CardVariant;
	onPress?: () => void;
	disabled?: boolean;
	style?: StyleProp<ViewStyle>;
	padding?: keyof typeof Spacing | number;
}

export function Card({
	children,
	variant = "elevated",
	onPress,
	disabled = false,
	style,
	padding = "lg",
}: CardProps) {
	const theme = useTheme();
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = useCallback(() => {
		if (onPress) {
			scale.value = withSpring(0.98, SpringConfig.stiff);
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
	}, [onPress, scale]);

	const handlePressOut = useCallback(() => {
		if (onPress) {
			scale.value = withSpring(1, SpringConfig.gentle);
		}
	}, [onPress, scale]);

	const variantStyles = getVariantStyles(variant, theme);
	const paddingValue = typeof padding === "number" ? padding : Spacing[padding];

	const cardContent = <View style={{ padding: paddingValue }}>{children}</View>;

	if (onPress) {
		return (
			<AnimatedPressable
				onPress={onPress}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				disabled={disabled}
				style={[
					styles.base,
					variantStyles,
					disabled && styles.disabled,
					animatedStyle,
					style,
				]}
			>
				{cardContent}
			</AnimatedPressable>
		);
	}

	return <View style={[styles.base, variantStyles, style]}>{cardContent}</View>;
}

function getVariantStyles(
	variant: CardVariant,
	theme: typeof import("@/constants/colors").LightTheme,
) {
	switch (variant) {
		case "elevated":
			return {
				backgroundColor: theme.surface.card,
				...Shadows.md,
			};
		case "outlined":
			return {
				backgroundColor: theme.surface.card,
				borderWidth: 1,
				borderColor: theme.border.default,
			};
		case "filled":
			return {
				backgroundColor: theme.background.secondary,
			};
		default:
			return {
				backgroundColor: theme.surface.card,
				...Shadows.md,
			};
	}
}

const styles = StyleSheet.create({
	base: {
		borderRadius: BorderRadius.xl,
		overflow: "hidden",
	},
	disabled: {
		opacity: 0.5,
	},
});
