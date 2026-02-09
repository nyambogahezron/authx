/**
 * AuthX Mobile - Animated Logo Component
 * Splash screen logo with pulse and rotation effects
 */

import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";

interface AnimatedLogoProps {
	size?: number;
	showRing?: boolean;
}

export function AnimatedLogo({
	size = 100,
	showRing = true,
}: AnimatedLogoProps) {
	const scale = useSharedValue(1);
	const ringScale = useSharedValue(1);
	const ringOpacity = useSharedValue(0.5);
	const rotation = useSharedValue(0);

	useEffect(() => {
		// Pulse animation for logo
		scale.value = withRepeat(
			withSequence(
				withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
				withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
			),
			-1,
			false,
		);

		// Ring expansion animation
		if (showRing) {
			ringScale.value = withRepeat(
				withSequence(
					withTiming(1.3, { duration: 1500, easing: Easing.out(Easing.ease) }),
					withTiming(1, { duration: 0 }),
				),
				-1,
				false,
			);

			ringOpacity.value = withRepeat(
				withSequence(
					withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
					withTiming(0.5, { duration: 0 }),
				),
				-1,
				false,
			);
		}

		// Subtle rotation
		rotation.value = withRepeat(
			withTiming(360, { duration: 20000, easing: Easing.linear }),
			-1,
			false,
		);
	}, [scale, ringScale, ringOpacity, rotation, showRing]);

	const logoAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const ringAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: ringScale.value }, { rotate: `${rotation.value}deg` }],
		opacity: ringOpacity.value,
	}));

	return (
		<View style={[styles.container, { width: size * 1.5, height: size * 1.5 }]}>
			{showRing && (
				<Animated.View
					style={[
						styles.ring,
						{
							width: size * 1.3,
							height: size * 1.3,
							borderRadius: size * 0.65,
							borderColor: Colors.primary[400],
						},
						ringAnimatedStyle,
					]}
				/>
			)}

			<Animated.View
				style={[
					styles.logoContainer,
					{
						width: size,
						height: size,
						borderRadius: size / 2,
						backgroundColor: Colors.primary[600],
					},
					logoAnimatedStyle,
				]}
			>
				<Ionicons
					name="shield-checkmark"
					size={size * 0.5}
					color={Colors.white}
				/>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
	},
	ring: {
		position: "absolute",
		borderWidth: 2,
		borderStyle: "dashed",
	},
	logoContainer: {
		alignItems: "center",
		justifyContent: "center",
		shadowColor: Colors.primary[600],
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 16,
		elevation: 8,
	},
});
