/**
 * AuthX Mobile - SlideIn Animation Component
 * Wrapper for slide entrance animations with spring physics
 */

import type React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
	SlideInDown,
	SlideInLeft,
	SlideInRight,
	SlideInUp,
} from "react-native-reanimated";
import { Duration, SpringConfig } from "@/constants/theme";

export type SlideDirection = "up" | "down" | "left" | "right";

interface SlideInViewProps {
	children: React.ReactNode;
	direction?: SlideDirection;
	delay?: number;
	duration?: number;
	springy?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function SlideInView({
	children,
	direction = "up",
	delay = 0,
	duration = Duration.slower,
	springy = true,
	style,
}: SlideInViewProps) {
	const getEnteringAnimation = () => {
		let animation;

		switch (direction) {
			case "up":
				animation = SlideInDown;
				break;
			case "down":
				animation = SlideInUp;
				break;
			case "left":
				animation = SlideInRight;
				break;
			case "right":
				animation = SlideInLeft;
				break;
			default:
				animation = SlideInDown;
		}

		if (springy) {
			return animation
				.delay(delay)
				.springify()
				.damping(SpringConfig.gentle.damping)
				.stiffness(SpringConfig.gentle.stiffness);
		}

		return animation.delay(delay).duration(duration);
	};

	return (
		<Animated.View entering={getEnteringAnimation()} style={style}>
			{children}
		</Animated.View>
	);
}
