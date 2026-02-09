/**
 * AuthX Mobile - Button Component
 * Animated button with multiple variants and loading states
 */

import * as Haptics from "expo-haptics";
import type React from "react";
import { useCallback } from "react";
import {
	ActivityIndicator,
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
	type TextStyle,
	View,
	type ViewStyle,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ButtonHeight,
	Spacing,
	SpringConfig,
	Typography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant =
	| "primary"
	| "secondary"
	| "outline"
	| "ghost"
	| "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
	children: React.ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	onPress?: () => void;
	disabled?: boolean;
	loading?: boolean;
	icon?: React.ReactNode;
	iconPosition?: "left" | "right";
	fullWidth?: boolean;
	style?: StyleProp<ViewStyle>;
	textStyle?: StyleProp<TextStyle>;
}

export function Button({
	children,
	variant = "primary",
	size = "md",
	onPress,
	disabled = false,
	loading = false,
	icon,
	iconPosition = "left",
	fullWidth = false,
	style,
	textStyle,
}: ButtonProps) {
	const theme = useTheme();
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handlePressIn = useCallback(() => {
		scale.value = withSpring(0.96, SpringConfig.stiff);
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	}, [scale]);

	const handlePressOut = useCallback(() => {
		scale.value = withSpring(1, SpringConfig.gentle);
	}, [scale]);

	const handlePress = useCallback(() => {
		if (!disabled && !loading && onPress) {
			onPress();
		}
	}, [disabled, loading, onPress]);

	const variantStyles = getVariantStyles(variant, theme, disabled);
	const sizeStyles = getSizeStyles(size);

	const isDisabled = disabled || loading;

	return (
		<AnimatedPressable
			onPress={handlePress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			disabled={isDisabled}
			style={[
				styles.base,
				variantStyles.container,
				sizeStyles.container,
				fullWidth && styles.fullWidth,
				isDisabled && styles.disabled,
				animatedStyle,
				style,
			]}
		>
			{loading ? (
				<ActivityIndicator size="small" color={variantStyles.text.color} />
			) : (
				<View style={styles.content}>
					{icon && iconPosition === "left" && (
						<View style={styles.iconLeft}>{icon}</View>
					)}
					<Text
						style={[
							styles.text,
							variantStyles.text,
							sizeStyles.text,
							textStyle,
						]}
					>
						{children}
					</Text>
					{icon && iconPosition === "right" && (
						<View style={styles.iconRight}>{icon}</View>
					)}
				</View>
			)}
		</AnimatedPressable>
	);
}

function getVariantStyles(
	variant: ButtonVariant,
	theme: typeof import("@/constants/colors").LightTheme,
	disabled: boolean,
) {
	const opacity = disabled ? 0.5 : 1;

	switch (variant) {
		case "primary":
			return {
				container: {
					backgroundColor: Colors.primary[600],
					opacity,
				},
				text: {
					color: Colors.white,
				},
			};
		case "secondary":
			return {
				container: {
					backgroundColor: Colors.secondary[600],
					opacity,
				},
				text: {
					color: Colors.white,
				},
			};
		case "outline":
			return {
				container: {
					backgroundColor: "transparent",
					borderWidth: 1.5,
					borderColor: Colors.primary[600],
					opacity,
				},
				text: {
					color: Colors.primary[600],
				},
			};
		case "ghost":
			return {
				container: {
					backgroundColor: "transparent",
					opacity,
				},
				text: {
					color: theme.text.primary,
				},
			};
		case "danger":
			return {
				container: {
					backgroundColor: Colors.error[600],
					opacity,
				},
				text: {
					color: Colors.white,
				},
			};
		default:
			return {
				container: {
					backgroundColor: Colors.primary[600],
					opacity,
				},
				text: {
					color: Colors.white,
				},
			};
	}
}

function getSizeStyles(size: ButtonSize) {
	switch (size) {
		case "sm":
			return {
				container: {
					height: ButtonHeight.sm,
					paddingHorizontal: Spacing.md,
				},
				text: {
					...Typography.buttonSmall,
				},
			};
		case "lg":
			return {
				container: {
					height: ButtonHeight.lg,
					paddingHorizontal: Spacing["2xl"],
				},
				text: {
					...Typography.button,
				},
			};
		default:
			return {
				container: {
					height: ButtonHeight.md,
					paddingHorizontal: Spacing.xl,
				},
				text: {
					...Typography.button,
				},
			};
	}
}

const styles = StyleSheet.create({
	base: {
		borderRadius: BorderRadius.lg,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		textAlign: "center",
	},
	fullWidth: {
		width: "100%",
	},
	disabled: {
		opacity: 0.5,
	},
	iconLeft: {
		marginRight: Spacing.sm,
	},
	iconRight: {
		marginLeft: Spacing.sm,
	},
});
