/**
 * AuthX Mobile - FadeIn Animation Component
 * Wrapper for fade-in entrance animations
 */

import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInLeft,
	FadeInRight,
	FadeInUp,
} from "react-native-reanimated";
import { Duration } from "@/constants/theme";

export type FadeDirection = "none" | "up" | "down" | "left" | "right";

interface FadeInViewProps {
	children: React.ReactNode;
	direction?: FadeDirection;
	delay?: number;
	duration?: number;
	style?: StyleProp<ViewStyle>;
}

export function FadeInView({
	children,
	direction = "none",
	delay = 0,
	duration = Duration.slow,
	style,
}: FadeInViewProps) {
	const getEnteringAnimation = () => {
		switch (direction) {
			case "up":
				return FadeInUp.delay(delay).duration(duration);
			case "down":
				return FadeInDown.delay(delay).duration(duration);
			case "left":
				return FadeInLeft.delay(delay).duration(duration);
			case "right":
				return FadeInRight.delay(delay).duration(duration);
			default:
				return FadeIn.delay(delay).duration(duration);
		}
	};

	return (
		<Animated.View entering={getEnteringAnimation()} style={style}>
			{children}
		</Animated.View>
	);
}
