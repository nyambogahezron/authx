import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import {
	SocialButtonRow,
	type SocialProvider,
} from "@/components/ui/social-button";
import { Colors } from "@/constants/colors";
import { ScreenPadding, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { loginSchema, validateForm } from "@/lib/validations";
import { useAuthStore } from "@/stores";

export default function LoginScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { login, isLoading } = useAuthStore();
	const { t } = useTranslation();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleLogin = useCallback(async () => {
		const result = validateForm(loginSchema, { email, password });

		if (!result.success) {
			setErrors(result.errors || {});
			return;
		}

		setErrors({});
		const success = await login(email, password);

		if (success) {
			router.replace("/(main)/profile");
		} else {
			Alert.alert(
				"Login Failed",
				"Invalid email or password. Please try again.",
			);
		}
	}, [email, password, login, router]);

	const handleSocialLogin = useCallback(
		async (provider: SocialProvider) => {
			// Mock social login - just log in with mock data
			const success = await login("demo@authx.dev", "password123");
			if (success) {
				router.replace("/(main)/profile");
			} else {
				Alert.alert("OAuth Error", `Failed to sign in with ${provider}`);
			}
		},
		[login, router],
	);

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: theme.background.primary }]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					{
						paddingTop: insets.top + Spacing["2xl"],
						paddingBottom: insets.bottom + Spacing.xl,
					},
				]}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<Animated.View
					entering={FadeInDown.delay(100).duration(500)}
					style={styles.header}
				>
					<View style={styles.logoContainer}>
						<Ionicons
							name="shield-checkmark"
							size={48}
							color={Colors.primary[600]}
						/>
					</View>
					<ThemedText style={styles.title}>{t("auth.welcomeBack")}</ThemedText>
					<ThemedText style={styles.subtitle} lightColor={theme.text.secondary}>
						{t("auth.signInToContinue")}
					</ThemedText>
				</Animated.View>

				{/* Form */}
				<Animated.View
					entering={FadeIn.delay(300).duration(500)}
					style={styles.form}
				>
					<Input
						label="Email"
						placeholder="Enter your email"
						value={email}
						onChangeText={(v) => {
							setEmail(v);
							setErrors((e) => ({ ...e, email: "" }));
						}}
						error={errors.email}
						keyboardType="email-address"
						autoCapitalize="none"
						autoComplete="email"
						leftIcon="mail-outline"
					/>

					<Input
						label="Password"
						placeholder="Enter your password"
						value={password}
						onChangeText={(v) => {
							setPassword(v);
							setErrors((e) => ({ ...e, password: "" }));
						}}
						error={errors.password}
						secureTextEntry
						autoComplete="password"
						leftIcon="lock-closed-outline"
					/>

					<View style={styles.options}>
						<Pressable
							style={styles.rememberMe}
							onPress={() => setRememberMe(!rememberMe)}
						>
							<Ionicons
								name={rememberMe ? "checkbox" : "square-outline"}
								size={20}
								color={rememberMe ? Colors.primary[600] : theme.icon}
							/>
							<ThemedText
								style={styles.rememberText}
								lightColor={theme.text.secondary}
							>
								Remember me
							</ThemedText>
						</Pressable>

						<Link href="/(auth)/forgot-password" asChild>
							<Pressable>
								<ThemedText
									style={styles.forgotPassword}
									lightColor={Colors.primary[600]}
								>
									Forgot Password?
								</ThemedText>
							</Pressable>
						</Link>
					</View>

					<Button
						fullWidth
						onPress={handleLogin}
						loading={isLoading}
						disabled={isLoading}
					>
						{t("auth.signIn")}
					</Button>
				</Animated.View>

				{/* Social Login */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(500)}
					style={styles.social}
				>
					<Divider label="or continue with" />
					<SocialButtonRow
						providers={["google", "facebook", "github"]}
						onProviderPress={handleSocialLogin}
					/>
				</Animated.View>

				{/* Footer */}
				<Animated.View
					entering={FadeInUp.delay(500).duration(500)}
					style={styles.footer}
				>
					<ThemedText
						style={styles.footerText}
						lightColor={theme.text.secondary}
					>
						{t("auth.dontHaveAccount")}{" "}
					</ThemedText>
					<Link href="/(auth)/signup" asChild>
						<Pressable>
							<ThemedText
								style={styles.footerLink}
								lightColor={Colors.primary[600]}
							>
								{t("auth.signup")}
							</ThemedText>
						</Pressable>
					</Link>
				</Animated.View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingHorizontal: ScreenPadding.horizontal,
	},
	header: {
		alignItems: "center",
		marginBottom: Spacing["3xl"],
	},
	logoContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
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
	},
	form: {
		marginBottom: Spacing.xl,
	},
	options: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Spacing.xl,
		marginTop: -Spacing.sm,
	},
	rememberMe: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	rememberText: {
		...Typography.bodySmall,
	},
	forgotPassword: {
		...Typography.bodySmall,
		fontWeight: "600",
	},
	social: {
		marginBottom: Spacing.xl,
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
});
