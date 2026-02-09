/**
 * AuthX Mobile - Badge Component
 * Status and notification badges with semantic colors
 */

import type React from "react";
import {
	type StyleProp,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { BorderRadius, Spacing } from "@/constants/theme";

export type BadgeVariant =
	| "primary"
	| "secondary"
	| "success"
	| "warning"
	| "error"
	| "info"
	| "neutral";
export type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
	children?: React.ReactNode;
	variant?: BadgeVariant;
	size?: BadgeSize;
	count?: number;
	maxCount?: number;
	dot?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function Badge({
	children,
	variant = "primary",
	size = "md",
	count,
	maxCount = 99,
	dot = false,
	style,
}: BadgeProps) {
	const variantStyles = getVariantStyles(variant);
	const sizeStyles = getSizeStyles(size, dot);

	if (dot) {
		return (
			<Animated.View
				entering={FadeIn.duration(200)}
				exiting={FadeOut.duration(200)}
				style={[
					styles.dot,
					sizeStyles.container,
					variantStyles.container,
					style,
				]}
			/>
		);
	}

	const displayText =
		count !== undefined
			? count > maxCount
				? `${maxCount}+`
				: count.toString()
			: children;

	if (count === 0) return null;

	return (
		<Animated.View
			entering={FadeIn.duration(200)}
			exiting={FadeOut.duration(200)}
			style={[
				styles.badge,
				sizeStyles.container,
				variantStyles.container,
				style,
			]}
		>
			<Text style={[styles.text, sizeStyles.text, variantStyles.text]}>
				{displayText}
			</Text>
		</Animated.View>
	);
}

// Positioned badge wrapper for overlays
interface BadgeOverlayProps {
	children: React.ReactNode;
	badge?: React.ReactNode;
	position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function BadgeOverlay({
	children,
	badge,
	position = "top-right",
}: BadgeOverlayProps) {
	const positionStyle = getPositionStyle(position);

	return (
		<View style={styles.overlayContainer}>
			{children}
			{badge && (
				<View style={[styles.overlayBadge, positionStyle]}>{badge}</View>
			)}
		</View>
	);
}

function getVariantStyles(variant: BadgeVariant) {
	switch (variant) {
		case "primary":
			return {
				container: { backgroundColor: Colors.primary[600] },
				text: { color: Colors.white },
			};
		case "secondary":
			return {
				container: { backgroundColor: Colors.secondary[600] },
				text: { color: Colors.white },
			};
		case "success":
			return {
				container: { backgroundColor: Colors.success[600] },
				text: { color: Colors.white },
			};
		case "warning":
			return {
				container: { backgroundColor: Colors.warning[600] },
				text: { color: Colors.white },
			};
		case "error":
			return {
				container: { backgroundColor: Colors.error[600] },
				text: { color: Colors.white },
			};
		case "info":
			return {
				container: { backgroundColor: Colors.info[600] },
				text: { color: Colors.white },
			};
		case "neutral":
			return {
				container: { backgroundColor: Colors.gray[200] },
				text: { color: Colors.gray[700] },
			};
		default:
			return {
				container: { backgroundColor: Colors.primary[600] },
				text: { color: Colors.white },
			};
	}
}

function getSizeStyles(size: BadgeSize, dot: boolean) {
	if (dot) {
		switch (size) {
			case "sm":
				return { container: { width: 6, height: 6 }, text: {} };
			case "lg":
				return { container: { width: 12, height: 12 }, text: {} };
			default:
				return { container: { width: 8, height: 8 }, text: {} };
		}
	}

	switch (size) {
		case "sm":
			return {
				container: {
					minWidth: 16,
					height: 16,
					paddingHorizontal: Spacing.xs,
				},
				text: { fontSize: 10 },
			};
		case "lg":
			return {
				container: {
					minWidth: 24,
					height: 24,
					paddingHorizontal: Spacing.sm,
				},
				text: { fontSize: 14 },
			};
		default:
			return {
				container: {
					minWidth: 20,
					height: 20,
					paddingHorizontal: Spacing.xs + 2,
				},
				text: { fontSize: 12 },
			};
	}
}

function getPositionStyle(position: BadgeOverlayProps["position"]) {
	switch (position) {
		case "top-left":
			return { top: -4, left: -4 };
		case "bottom-right":
			return { bottom: -4, right: -4 };
		case "bottom-left":
			return { bottom: -4, left: -4 };
		default:
			return { top: -4, right: -4 };
	}
}

const styles = StyleSheet.create({
	badge: {
		borderRadius: BorderRadius.full,
		alignItems: "center",
		justifyContent: "center",
	},
	dot: {
		borderRadius: BorderRadius.full,
	},
	text: {
		fontWeight: "600",
		textAlign: "center",
	},
	overlayContainer: {
		position: "relative",
	},
	overlayBadge: {
		position: "absolute",
	},
});
