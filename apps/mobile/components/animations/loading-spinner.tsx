/**
 * AuthX Mobile - Loading Spinner Component
 * Custom animated loading indicator
 */

import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

export type SpinnerSize = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
	size?: SpinnerSize;
	color?: string;
}

const sizeMap: Record<SpinnerSize, number> = {
	sm: 20,
	md: 32,
	lg: 48,
};

export function LoadingSpinner({
	size = "md",
	color = Colors.primary[600],
}: LoadingSpinnerProps) {
	const rotation = useSharedValue(0);
	const sizeValue = sizeMap[size];

	useEffect(() => {
		rotation.value = withRepeat(
			withTiming(360, {
				duration: 1000,
				easing: Easing.linear,
			}),
			-1,
			false,
		);
	}, [rotation]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotation.value}deg` }],
	}));

	return (
		<View style={[styles.container, { width: sizeValue, height: sizeValue }]}>
			<Animated.View
				style={[
					styles.spinner,
					{
						width: sizeValue,
						height: sizeValue,
						borderWidth: sizeValue * 0.1,
						borderRadius: sizeValue / 2,
						borderColor: `${color}30`,
						borderTopColor: color,
					},
					animatedStyle,
				]}
			/>
		</View>
	);
}

// Full screen loading overlay
interface LoadingOverlayProps {
	visible?: boolean;
	message?: string;
}

export function LoadingOverlay({
	visible = true,
	message,
}: LoadingOverlayProps) {
	if (!visible) return null;

	return (
		<View style={styles.overlay}>
			<View style={styles.overlayContent}>
				<LoadingSpinner size="lg" />
				{message && (
					<Animated.Text style={styles.message}>{message}</Animated.Text>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
	},
	spinner: {
		borderStyle: "solid",
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 999,
	},
	overlayContent: {
		backgroundColor: "white",
		borderRadius: 16,
		padding: 24,
		alignItems: "center",
		gap: 16,
	},
	message: {
		fontSize: 14,
		color: Colors.gray[600],
		marginTop: 8,
	},
});
