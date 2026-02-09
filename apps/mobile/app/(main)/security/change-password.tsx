import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/hooks/use-theme-color";

export default function ChangePasswordScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { changePassword } = useAuth();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [saving, setSaving] = useState(false);

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
		const newErrors: Record<string, string> = {};

		if (!currentPassword) {
			newErrors.currentPassword = "Current password is required";
		}

		if (!newPassword) {
			newErrors.newPassword = "New password is required";
		} else if (newPassword.length < 8) {
			newErrors.newPassword = "Password must be at least 8 characters";
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
			newErrors.newPassword = "Include uppercase, lowercase, and number";
		}

		if (newPassword === currentPassword) {
			newErrors.newPassword = "New password must be different";
		}

		if (newPassword !== confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [currentPassword, newPassword, confirmPassword]);

	const handleSubmit = useCallback(async () => {
		if (!validateForm()) return;

		setSaving(true);
		try {
			await changePassword(currentPassword, newPassword);
			Alert.alert("Success", "Your password has been changed successfully.", [
				{ text: "OK", onPress: () => router.back() },
			]);
		} catch (_error) {
			Alert.alert("Error", "Failed to change password. Please try again.");
		} finally {
			setSaving(false);
		}
	}, [currentPassword, newPassword, changePassword, validateForm, router]);

	const passwordStrength = getPasswordStrength(newPassword);
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
			<View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
				<Pressable onPress={() => router.back()} style={styles.closeButton}>
					<Ionicons name="close" size={28} color={theme.text.primary} />
				</Pressable>
				<Text style={[styles.headerTitle, { color: theme.text.primary }]}>
					Change Password
				</Text>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: insets.bottom + Spacing.xl },
				]}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{/* Info */}
				<Animated.View
					entering={FadeIn.delay(100).duration(500)}
					style={styles.infoSection}
				>
					<View
						style={[
							styles.infoCard,
							{ backgroundColor: `${Colors.info[500]}10` },
						]}
					>
						<Ionicons
							name="shield-checkmark"
							size={20}
							color={Colors.info[600]}
						/>
						<Text style={[styles.infoText, { color: Colors.info[700] }]}>
							Choose a strong password with at least 8 characters, including
							uppercase, lowercase, and numbers.
						</Text>
					</View>
				</Animated.View>

				{/* Form */}
				<Animated.View
					entering={FadeInUp.delay(200).duration(500)}
					style={styles.form}
				>
					<Input
						label="Current Password"
						placeholder="Enter your current password"
						value={currentPassword}
						onChangeText={(v) => {
							setCurrentPassword(v);
							setErrors((e) => ({ ...e, currentPassword: "" }));
						}}
						error={errors.currentPassword}
						secureTextEntry
						leftIcon="lock-closed-outline"
					/>

					<Input
						label="New Password"
						placeholder="Create a new password"
						value={newPassword}
						onChangeText={(v) => {
							setNewPassword(v);
							setErrors((e) => ({ ...e, newPassword: "" }));
						}}
						error={errors.newPassword}
						secureTextEntry
						leftIcon="key-outline"
					/>

					{/* Password Strength */}
					{newPassword.length > 0 && (
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
						label="Confirm New Password"
						placeholder="Repeat your new password"
						value={confirmPassword}
						onChangeText={(v) => {
							setConfirmPassword(v);
							setErrors((e) => ({ ...e, confirmPassword: "" }));
						}}
						error={errors.confirmPassword}
						secureTextEntry
						leftIcon="lock-closed-outline"
					/>

					{/* Requirements */}
					<View style={styles.requirements}>
						<Text
							style={[
								styles.requirementsTitle,
								{ color: theme.text.secondary },
							]}
						>
							Password requirements:
						</Text>
						<RequirementItem
							met={newPassword.length >= 8}
							text="At least 8 characters"
						/>
						<RequirementItem
							met={/[A-Z]/.test(newPassword)}
							text="One uppercase letter"
						/>
						<RequirementItem
							met={/[a-z]/.test(newPassword)}
							text="One lowercase letter"
						/>
						<RequirementItem met={/\d/.test(newPassword)} text="One number" />
					</View>
				</Animated.View>

				<Button
					fullWidth
					onPress={handleSubmit}
					loading={saving}
					disabled={saving}
				>
					Update Password
				</Button>
			</ScrollView>
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
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: ScreenPadding.horizontal,
		paddingBottom: Spacing.md,
	},
	closeButton: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		...Typography.h4,
		flex: 1,
		textAlign: "center",
	},
	headerSpacer: {
		width: 40,
	},
	content: {
		paddingHorizontal: ScreenPadding.horizontal,
		flexGrow: 1,
	},
	infoSection: {
		marginBottom: Spacing.xl,
	},
	infoCard: {
		flexDirection: "row",
		alignItems: "flex-start",
		padding: Spacing.md,
		borderRadius: BorderRadius.lg,
		gap: Spacing.sm,
	},
	infoText: {
		...Typography.bodySmall,
		flex: 1,
		lineHeight: 20,
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
	requirements: {
		marginTop: Spacing.sm,
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
});
