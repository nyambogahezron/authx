import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
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
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { SocialButtonRow } from "@/components/ui/social-button";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/stores";

type Step = 1 | 2;

export default function SignUpScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { register, isLoading } = useAuthStore();

	const [step, setStep] = useState<Step>(1);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [acceptedTerms, setAcceptedTerms] = useState(false);

	const updateField = useCallback((field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: "" }));
	}, []);

	const validateStep1 = useCallback(() => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Full name is required";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email";
		}

		if (formData.username && formData.username.length < 3) {
			newErrors.username = "Username must be at least 3 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData]);

	const validateStep2 = useCallback(() => {
		const newErrors: Record<string, string> = {};

		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
			newErrors.password =
				"Password must include uppercase, lowercase, and number";
		}

		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		if (!acceptedTerms) {
			newErrors.terms = "You must accept the terms and conditions";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData, acceptedTerms]);

	const handleNext = useCallback(() => {
		if (step === 1 && validateStep1()) {
			setStep(2);
		}
	}, [step, validateStep1]);

	const handleBack = useCallback(() => {
		if (step === 2) {
			setStep(1);
		}
	}, [step]);

	const handleSignUp = useCallback(async () => {
		if (!validateStep2()) return;

		try {
			const names = formData.name.split(" ");
			await register({
				firstName: names[0] || "",
				lastName: names.slice(1).join(" ") || "",
				email: formData.email,
				username: formData.username,
				password: formData.password,
			});
			router.replace("/(auth)/verify-otp");
		} catch {
			Alert.alert(
				"Registration Failed",
				"Unable to create account. Please try again.",
			);
		}
	}, [formData, register, router, validateStep2]);

	const handleSocialSignUp = useCallback((_provider: string) => {
		// OAuth login not yet implemented in Zustand store
		Alert.alert("Coming Soon", "Social sign-up will be available soon.");
	}, []);

	const getPasswordStrength = useCallback((password: string) => {
		let strength = 0;
		if (password.length >= 8) strength++;
		if (/[a-z]/.test(password)) strength++;
		if (/[A-Z]/.test(password)) strength++;
		if (/\d/.test(password)) strength++;
		if (/[^a-zA-Z\d]/.test(password)) strength++;
		return strength;
	}, []);

	const passwordStrength = getPasswordStrength(formData.password);
	const strengthColors = [
		Colors.gray[300],
		Colors.error[500],
		Colors.warning[500],
		Colors.warning[400],
		Colors.success[400],
		Colors.success[500],
	];
	const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: theme.background.primary }]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView
				contentContainerStyle={[
					styles.scrollContent,
					{
						paddingTop: insets.top + Spacing.md,
						paddingBottom: insets.bottom + Spacing.xl,
					},
				]}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{/* Back Button */}
				{step === 2 && (
					<Pressable onPress={handleBack} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={theme.text.primary} />
					</Pressable>
				)}

				{/* Header */}
				<Animated.View
					entering={FadeInDown.delay(100).duration(500)}
					style={styles.header}
				>
					<Text style={[styles.title, { color: theme.text.primary }]}>
						Create Account
					</Text>
					<Text style={[styles.subtitle, { color: theme.text.secondary }]}>
						Step {step} of 2 - {step === 1 ? "Your Details" : "Secure Password"}
					</Text>

					{/* Progress */}
					<View style={styles.progressContainer}>
						<View
							style={[
								styles.progressBar,
								{ backgroundColor: Colors.gray[200] },
							]}
						>
							<Animated.View
								style={[
									styles.progressFill,
									{
										width: step === 1 ? "50%" : "100%",
										backgroundColor: Colors.primary[600],
									},
								]}
							/>
						</View>
					</View>
				</Animated.View>

				{/* Step 1: Basic Info */}
				{step === 1 && (
					<Animated.View
						entering={FadeIn.delay(200).duration(500)}
						style={styles.form}
					>
						<Input
							label="Full Name"
							placeholder="John Doe"
							value={formData.name}
							onChangeText={(v) => updateField("name", v)}
							error={errors.name}
							autoCapitalize="words"
							leftIcon="person-outline"
						/>

						<Input
							label="Email"
							placeholder="john@example.com"
							value={formData.email}
							onChangeText={(v) => updateField("email", v)}
							error={errors.email}
							keyboardType="email-address"
							autoCapitalize="none"
							leftIcon="mail-outline"
						/>

						<Input
							label="Username (optional)"
							placeholder="johndoe"
							value={formData.username}
							onChangeText={(v) => updateField("username", v)}
							error={errors.username}
							autoCapitalize="none"
							leftIcon="at-outline"
						/>

						<Button fullWidth onPress={handleNext}>
							Continue
						</Button>

						<Divider label="or sign up with" />
						<SocialButtonRow
							providers={["google", "facebook", "github"]}
							onProviderPress={handleSocialSignUp}
						/>
					</Animated.View>
				)}

				{/* Step 2: Password */}
				{step === 2 && (
					<Animated.View
						entering={FadeIn.delay(200).duration(500)}
						style={styles.form}
					>
						<Input
							label="Password"
							placeholder="Create a strong password"
							value={formData.password}
							onChangeText={(v) => updateField("password", v)}
							error={errors.password}
							secureTextEntry
							leftIcon="lock-closed-outline"
						/>

						{/* Password Strength */}
						{formData.password.length > 0 && (
							<View style={styles.strengthContainer}>
								<View style={styles.strengthBars}>
									{[1, 2, 3, 4, 5].map((level) => (
										<View
											key={level}
											style={[
												styles.strengthBar,
												{
													backgroundColor:
														level <= passwordStrength
															? strengthColors[passwordStrength]
															: Colors.gray[200],
												},
											]}
										/>
									))}
								</View>
								<Text
									style={[
										styles.strengthLabel,
										{ color: strengthColors[passwordStrength] },
									]}
								>
									{strengthLabels[passwordStrength]}
								</Text>
							</View>
						)}

						<Input
							label="Confirm Password"
							placeholder="Repeat your password"
							value={formData.confirmPassword}
							onChangeText={(v) => updateField("confirmPassword", v)}
							error={errors.confirmPassword}
							secureTextEntry
							leftIcon="lock-closed-outline"
						/>

						{/* Terms */}
						<Pressable
							style={styles.terms}
							onPress={() => setAcceptedTerms(!acceptedTerms)}
						>
							<Ionicons
								name={acceptedTerms ? "checkbox" : "square-outline"}
								size={22}
								color={acceptedTerms ? Colors.primary[600] : theme.icon}
							/>
							<Text style={[styles.termsText, { color: theme.text.secondary }]}>
								I agree to the{" "}
								<Text style={{ color: Colors.primary[600] }}>
									Terms of Service
								</Text>{" "}
								and{" "}
								<Text style={{ color: Colors.primary[600] }}>
									Privacy Policy
								</Text>
							</Text>
						</Pressable>
						{errors.terms && (
							<Text style={styles.termsError}>{errors.terms}</Text>
						)}

						<Button
							fullWidth
							onPress={handleSignUp}
							loading={isLoading}
							disabled={isLoading}
						>
							Create Account
						</Button>
					</Animated.View>
				)}

				{/* Footer */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(500)}
					style={styles.footer}
				>
					<Text style={[styles.footerText, { color: theme.text.secondary }]}>
						Already have an account?{" "}
					</Text>
					<Link href="/(auth)/login" asChild>
						<Pressable>
							<Text style={[styles.footerLink, { color: Colors.primary[600] }]}>
								Sign In
							</Text>
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
	backButton: {
		marginBottom: Spacing.md,
		padding: Spacing.xs,
		alignSelf: "flex-start",
	},
	header: {
		marginBottom: Spacing["2xl"],
	},
	title: {
		...Typography.h2,
		marginBottom: Spacing.xs,
	},
	subtitle: {
		...Typography.body,
		marginBottom: Spacing.lg,
	},
	progressContainer: {
		marginTop: Spacing.sm,
	},
	progressBar: {
		height: 4,
		borderRadius: BorderRadius.full,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		borderRadius: BorderRadius.full,
	},
	form: {
		marginBottom: Spacing.xl,
	},
	strengthContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: -Spacing.md,
		marginBottom: Spacing.lg,
		gap: Spacing.sm,
	},
	strengthBars: {
		flexDirection: "row",
		gap: 4,
		flex: 1,
	},
	strengthBar: {
		flex: 1,
		height: 4,
		borderRadius: 2,
	},
	strengthLabel: {
		...Typography.caption,
		fontWeight: "600",
		minWidth: 60,
		textAlign: "right",
	},
	terms: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Spacing.sm,
		marginBottom: Spacing.lg,
	},
	termsText: {
		...Typography.bodySmall,
		flex: 1,
		lineHeight: 20,
	},
	termsError: {
		...Typography.caption,
		color: Colors.error[500],
		marginTop: -Spacing.md,
		marginBottom: Spacing.lg,
		marginLeft: Spacing["2xl"],
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
