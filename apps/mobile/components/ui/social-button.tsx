/**
 * AuthX Mobile - Social Button Component
 * OAuth provider buttons with branded styling
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import {
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
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

export type SocialProvider =
	| "google"
	| "facebook"
	| "github"
	| "linkedin"
	| "apple"
	| "twitter";

interface SocialButtonProps {
	provider: SocialProvider;
	onPress?: () => void;
	disabled?: boolean;
	fullWidth?: boolean;
	showLabel?: boolean;
	style?: StyleProp<ViewStyle>;
}

const providerConfig: Record<
	SocialProvider,
	{
		label: string;
		icon: keyof typeof Ionicons.glyphMap;
		color: string;
		textColor: string;
	}
> = {
	google: {
		label: "Google",
		icon: "logo-google",
		color: Colors.social.google,
		textColor: Colors.white,
	},
	facebook: {
		label: "Facebook",
		icon: "logo-facebook",
		color: Colors.social.facebook,
		textColor: Colors.white,
	},
	github: {
		label: "GitHub",
		icon: "logo-github",
		color: Colors.social.github,
		textColor: Colors.white,
	},
	linkedin: {
		label: "LinkedIn",
		icon: "logo-linkedin",
		color: Colors.social.linkedin,
		textColor: Colors.white,
	},
	apple: {
		label: "Apple",
		icon: "logo-apple",
		color: Colors.social.apple,
		textColor: Colors.white,
	},
	twitter: {
		label: "Twitter",
		icon: "logo-twitter",
		color: Colors.social.twitter,
		textColor: Colors.white,
	},
};

export function SocialButton({
	provider,
	onPress,
	disabled = false,
	fullWidth = false,
	showLabel = true,
	style,
}: SocialButtonProps) {
	const _theme = useTheme();
	const scale = useSharedValue(1);
	const config = providerConfig[provider];

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

	return (
		<AnimatedPressable
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			disabled={disabled}
			style={[
				styles.button,
				{
					backgroundColor: config.color,
					borderColor: config.color,
				},
				fullWidth && styles.fullWidth,
				!showLabel && styles.iconOnly,
				disabled && styles.disabled,
				animatedStyle,
				style,
			]}
		>
			<Ionicons name={config.icon} size={20} color={config.textColor} />
			{showLabel && (
				<Text style={[styles.label, { color: config.textColor }]}>
					{config.label}
				</Text>
			)}
		</AnimatedPressable>
	);
}

// Row of social buttons
interface SocialButtonRowProps {
	providers: SocialProvider[];
	onProviderPress?: (provider: SocialProvider) => void;
	showLabels?: boolean;
}

export function SocialButtonRow({
	providers,
	onProviderPress,
	showLabels = false,
}: SocialButtonRowProps) {
	return (
		<Animated.View style={styles.row}>
			{providers.map((provider) => (
				<SocialButton
					key={provider}
					provider={provider}
					showLabel={showLabels}
					onPress={() => onProviderPress?.(provider)}
					style={styles.rowButton}
				/>
			))}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	button: {
		height: ButtonHeight.md,
		borderRadius: BorderRadius.lg,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing.xl,
		borderWidth: 1,
	},
	label: {
		...Typography.button,
		marginLeft: Spacing.sm,
	},
	fullWidth: {
		width: "100%",
	},
	iconOnly: {
		width: ButtonHeight.md,
		paddingHorizontal: 0,
	},
	disabled: {
		opacity: 0.5,
	},
	row: {
		flexDirection: "row",
		justifyContent: "center",
		gap: Spacing.md,
	},
	rowButton: {
		flex: 1,
		maxWidth: ButtonHeight.lg,
	},
});
