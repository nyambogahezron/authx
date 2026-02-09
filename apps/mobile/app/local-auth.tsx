import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import Animated, {
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import { ScreenPadding, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/stores";

export default function LocalAuthScreen() {
	const router = useRouter();
	const theme = useTheme();
	const { isAuthenticated } = useAuthStore();
	const [isAuthenticating, setIsAuthenticating] = useState(false);

	// Animation for the lock icon
	const scale = useSharedValue(1);

	const checkAvailability = useCallback(async () => {
		const compatible = await LocalAuthentication.hasHardwareAsync();
		const enrolled = await LocalAuthentication.isEnrolledAsync();
		return compatible && enrolled;
	}, []);

	const authenticate = useCallback(async () => {
		try {
			setIsAuthenticating(true);
			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: "Unlock AuthX",
				fallbackLabel: "Use Passcode",
				disableDeviceFallback: false,
				cancelLabel: "Cancel",
			});

			if (result.success) {
				// Success animation
				scale.value = withSpring(1.2, {}, () => {
					scale.value = withSpring(0);
				});

				// Small delay for animation
				setTimeout(() => {
					router.replace("/(main)/(tabs)");
				}, 500);
			}
		} catch (error) {
			console.error("Local auth error:", error);
			Alert.alert(
				"Error",
				"An unexpected error occurred during authentication.",
			);
		} finally {
			setIsAuthenticating(false);
		}
	}, [router, scale]);

	useEffect(() => {
		// Check if we should even show this screen
		if (!isAuthenticated) {
			router.replace("/(auth)/login");
			return;
		}

		checkAvailability().then((canAuth) => {
			if (canAuth) {
				authenticate();
			} else {
				router.replace("/(main)/(tabs)");
			}
		});
	}, [isAuthenticated, router, checkAvailability, authenticate]);

	const animatedIconStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<View
			style={[styles.container, { backgroundColor: theme.background.primary }]}
		>
			<Animated.View
				entering={FadeInUp.delay(200).duration(600)}
				style={styles.content}
			>
				<Animated.View style={[styles.iconContainer, animatedIconStyle]}>
					<Ionicons name="lock-closed" size={64} color={Colors.primary[500]} />
				</Animated.View>

				<Text style={[styles.title, { color: theme.text.primary }]}>
					AuthX Locked
				</Text>

				<Text style={[styles.subtitle, { color: theme.text.secondary }]}>
					Please authenticate to access your accounts.
				</Text>

				<View style={styles.buttonContainer}>
					<Button
						onPress={authenticate}
						loading={isAuthenticating}
						size="lg"
						fullWidth
					>
						Unlock
					</Button>

					<Button
						variant="ghost"
						onPress={() => {
							// Option to logout if they can't unlock
							router.replace("/(auth)/login");
						}}
						fullWidth
					>
						Switch Account
					</Button>
				</View>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		width: "100%",
		paddingHorizontal: ScreenPadding.horizontal,
		alignItems: "center",
		gap: Spacing.xl,
	},
	iconContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: `${Colors.primary[500]}15`,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.md,
	},
	title: {
		...Typography.h2,
		textAlign: "center",
	},
	subtitle: {
		...Typography.body,
		textAlign: "center",
		maxWidth: "80%",
		marginBottom: Spacing.lg,
	},
	buttonContainer: {
		width: "100%",
		gap: Spacing.md,
	},
});
