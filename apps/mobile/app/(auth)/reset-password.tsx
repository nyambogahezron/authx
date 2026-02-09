import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/hooks/use-theme-color";

export default function ResetPasswordScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { resetPassword } = useAuth();

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState<{
		password?: string;
		confirmPassword?: string;
	}>({});
	const [isLoading, setIsLoading] = useState(false);
	const [resetComplete, setResetComplete] = useState(false);

	const getPasswordStrength = useCallback((pwd: string) => {
		let strength = 0;
		if (pwd.length >= 8) strength++;
		if (/[a-z]/.test(pwd)) strength++;
		if (/[A-Z]/.test(pwd)) strength++;
		if (/\d/.test(pwd)) strength++;
		if (/[^a-zA-Z\d]/.test(pwd)) strength++;
		return strength;
	}, []);

	const validateForm = useCallback(() => {
		const newErrors: typeof errors = {};

		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
			newErrors.password = "Include uppercase, lowercase, and number";
		}

		if (password !== confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [password, confirmPassword]);

	const handleSubmit = useCallback(async () => {
		if (!validateForm()) return;

		setIsLoading(true);
		try {
			await resetPassword("mock-token", password);
			setResetComplete(true);
		} catch (_err) {
			Alert.alert("Error", "Unable to reset password. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, [password, resetPassword, validateForm]);

	const passwordStrength = getPasswordStrength(password);
	const strengthColors = [
		Colors.gray[300],
		Colors.error[500],
		Colors.warning[500],
		Colors.warning[400],
		Colors.success[400],
		Colors.success[500],
	];
	const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];

	if (resetComplete) {
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
						Password Reset!
					</Animated.Text>

					<Animated.Text
						entering={FadeInUp.delay(300).duration(500)}
						style={[styles.successText, { color: theme.text.secondary }]}
					>
						Your password has been successfully reset. You can now sign in with
						your new password.
					</Animated.Text>

					<Animated.View
						entering={FadeInUp.delay(400).duration(500)}
						style={styles.successActions}
					>
						<Button fullWidth onPress={() => router.replace("/(auth)/login")}>
							Sign In
						</Button>
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
							name="lock-closed-outline"
							size={48}
							color={Colors.primary[600]}
						/>
					</View>
					<Text style={[styles.title, { color: theme.text.primary }]}>
						Reset Password
					</Text>
					<Text style={[styles.subtitle, { color: theme.text.secondary }]}>
						Create a new secure password for your account.
					</Text>
				</Animated.View>

				{/* Form */}
				<Animated.View
					entering={FadeIn.delay(300).duration(500)}
					style={styles.form}
				>
					<Input
						label="New Password"
						placeholder="Create a strong password"
						value={password}
						onChangeText={(v) => {
							setPassword(v);
							setErrors((e) => ({ ...e, password: "" }));
						}}
						error={errors.password}
						secureTextEntry
						leftIcon="lock-closed-outline"
					/>

					{/* Password Strength */}
					{password.length > 0 && (
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
						value={confirmPassword}
						onChangeText={(v) => {
							setConfirmPassword(v);
							setErrors((e) => ({ ...e, confirmPassword: "" }));
						}}
						error={errors.confirmPassword}
						secureTextEntry
						leftIcon="lock-closed-outline"
					/>

					{/* Password Requirements */}
					<View style={styles.requirements}>
						<Text
							style={[
								styles.requirementsTitle,
								{ color: theme.text.secondary },
							]}
						>
							Password must contain:
						</Text>
						<RequirementItem
							met={password.length >= 8}
							text="At least 8 characters"
						/>
						<RequirementItem
							met={/[A-Z]/.test(password)}
							text="One uppercase letter"
						/>
						<RequirementItem
							met={/[a-z]/.test(password)}
							text="One lowercase letter"
						/>
						<RequirementItem met={/\d/.test(password)} text="One number" />
					</View>

					<Button
						fullWidth
						onPress={handleSubmit}
						loading={isLoading}
						disabled={isLoading}
					>
						Reset Password
					</Button>
				</Animated.View>
			</View>
		</KeyboardAvoidingView>
	);
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
	const theme = useTheme();
	return (
		<View style={styles.requirementItem}>
			<Ionicons
				name={met ? "checkmark-circle" : "ellipse-outline"}
				size={16}
				color={met ? Colors.success[500] : theme.icon}
			/>
			<Text
				style={[
					styles.requirementText,
					{ color: met ? Colors.success[600] : theme.text.tertiary },
				]}
			>
				{text}
			</Text>
		</View>
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
		marginBottom: Spacing["2xl"],
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
	},
	form: {
		flex: 1,
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
	requirements: {
		marginBottom: Spacing.xl,
		gap: Spacing.xs,
	},
	requirementsTitle: {
		...Typography.bodySmall,
		marginBottom: Spacing.xs,
	},
	requirementItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	requirementText: {
		...Typography.caption,
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
	},
});
