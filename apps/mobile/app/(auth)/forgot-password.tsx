import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { ScreenPadding, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/stores";

export default function ForgotPasswordScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { resetPassword } = useAuthStore();

	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const validateEmail = useCallback(() => {
		if (!email.trim()) {
			setError("Email is required");
			return false;
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError("Please enter a valid email");
			return false;
		}
		setError("");
		return true;
	}, [email]);

	const handleSubmit = useCallback(async () => {
		if (!validateEmail()) return;

		setIsLoading(true);
		try {
			await resetPassword(email);
			setEmailSent(true);
		} catch {
			Alert.alert("Error", "Unable to send reset email. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, [email, resetPassword, validateEmail]);

	if (emailSent) {
		return (
			<View
				style={[
					styles.container,
					{ backgroundColor: theme.background.primary },
				]}
			>
				<View
					style={[
						styles.successContent,
						{
							paddingTop: insets.top + Spacing["4xl"],
							paddingBottom: insets.bottom + Spacing.xl,
						},
					]}
				>
					<Animated.View
						entering={FadeIn.delay(100).duration(500)}
						style={styles.successIcon}
					>
						<View style={styles.successCircle}>
							<Ionicons name="checkmark" size={48} color={Colors.white} />
						</View>
					</Animated.View>

					<Animated.Text
						entering={FadeInUp.delay(200).duration(500)}
						style={[styles.successTitle, { color: theme.text.primary }]}
					>
						Check Your Email
					</Animated.Text>

					<Animated.Text
						entering={FadeInUp.delay(300).duration(500)}
						style={[styles.successText, { color: theme.text.secondary }]}
					>
						We&apos;ve sent password reset instructions to{"\n"}
						<Text style={{ fontWeight: "600", color: theme.text.primary }}>
							{email}
						</Text>
					</Animated.Text>

					<Animated.View
						entering={FadeInUp.delay(400).duration(500)}
						style={styles.successActions}
					>
						<Button fullWidth onPress={() => router.replace("/(auth)/login")}>
							Back to Login
						</Button>

						<Pressable
							onPress={() => setEmailSent(false)}
							style={styles.tryAgain}
						>
							<Text
								style={[styles.tryAgainText, { color: Colors.primary[600] }]}
							>
								Didn&apos;t receive email? Try again
							</Text>
						</Pressable>
					</Animated.View>
				</View>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: theme.background.primary }]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<View
				style={[
					styles.content,
					{
						paddingTop: insets.top + Spacing.md,
						paddingBottom: insets.bottom + Spacing.xl,
					},
				]}
			>
				{/* Back Button */}
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={theme.text.primary} />
				</Pressable>

				{/* Header */}
				<Animated.View
					entering={FadeInDown.delay(100).duration(500)}
					style={styles.header}
				>
					<View style={styles.iconContainer}>
						<Ionicons
							name="key-outline"
							size={48}
							color={Colors.primary[600]}
						/>
					</View>
					<Text style={[styles.title, { color: theme.text.primary }]}>
						Forgot Password?
					</Text>
					<Text style={[styles.subtitle, { color: theme.text.secondary }]}>
						No worries! Enter your email and we&apos;ll send you reset
						instructions.
					</Text>
				</Animated.View>

				{/* Form */}
				<Animated.View
					entering={FadeIn.delay(300).duration(500)}
					style={styles.form}
				>
					<Input
						label="Email Address"
						placeholder="Enter your email"
						value={email}
						onChangeText={(v) => {
							setEmail(v);
							setError("");
						}}
						error={error}
						keyboardType="email-address"
						autoCapitalize="none"
						autoComplete="email"
						leftIcon="mail-outline"
					/>

					<Button
						fullWidth
						onPress={handleSubmit}
						loading={isLoading}
						disabled={isLoading}
					>
						Send Reset Link
					</Button>
				</Animated.View>

				{/* Footer */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(500)}
					style={styles.footer}
				>
					<Text style={[styles.footerText, { color: theme.text.secondary }]}>
						Remember your password?{" "}
					</Text>
					<Link href="/(auth)/login" asChild>
						<Pressable>
							<Text style={[styles.footerLink, { color: Colors.primary[600] }]}>
								Sign In
							</Text>
						</Pressable>
					</Link>
				</Animated.View>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: ScreenPadding.horizontal,
	},
	backButton: {
		marginBottom: Spacing.lg,
		padding: Spacing.xs,
		alignSelf: "flex-start",
	},
	header: {
		alignItems: "center",
		marginBottom: Spacing["3xl"],
	},
	iconContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: `${Colors.primary[600]}15`,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.xl,
	},
	title: {
		...Typography.h2,
		marginBottom: Spacing.sm,
	},
	subtitle: {
		...Typography.body,
		textAlign: "center",
		lineHeight: 24,
	},
	form: {
		gap: Spacing.sm,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: "auto",
	},
	footerText: {
		...Typography.body,
	},
	footerLink: {
		...Typography.body,
		fontWeight: "600",
	},
	// Success state
	successContent: {
		flex: 1,
		paddingHorizontal: ScreenPadding.horizontal,
		alignItems: "center",
		justifyContent: "center",
	},
	successIcon: {
		marginBottom: Spacing["2xl"],
	},
	successCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: Colors.success[500],
		alignItems: "center",
		justifyContent: "center",
	},
	successTitle: {
		...Typography.h2,
		marginBottom: Spacing.md,
		textAlign: "center",
	},
	successText: {
		...Typography.body,
		textAlign: "center",
		lineHeight: 24,
		marginBottom: Spacing["3xl"],
	},
	successActions: {
		width: "100%",
		gap: Spacing.lg,
	},
	tryAgain: {
		alignItems: "center",
	},
	tryAgainText: {
		...Typography.body,
		fontWeight: "600",
	},
});
