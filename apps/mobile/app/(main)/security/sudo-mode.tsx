import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";

export default function SudoModeScreen() {
	const router = useRouter();
	const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { t } = useTranslation();
	const inputRef = useRef<TextInput>(null);

	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [attempts, setAttempts] = useState(0);

	const shakeX = useSharedValue(0);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: shakeX.value }],
	}));

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const handleShake = useCallback(() => {
		shakeX.value = withSequence(
			withSpring(-10, { damping: 2 }),
			withSpring(10, { damping: 2 }),
			withSpring(-10, { damping: 2 }),
			withSpring(10, { damping: 2 }),
			withSpring(0, { damping: 2 }),
		);
	}, [shakeX]);

	const handleSubmit = useCallback(async () => {
		if (!password.trim()) {
			setError(t("security.pleaseEnterPassword"));
			handleShake();
			return;
		}

		setIsSubmitting(true);
		setError("");

		// Simulate API verification
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// Mock validation - password123 is the demo password
		if (password === "password123") {
			// Success - would store sudo session timestamp
			if (returnTo) {
				router.replace(returnTo as any);
			} else {
				router.back();
			}
		} else {
			setAttempts((prev) => prev + 1);
			setError(t("security.incorrectPassword"));
			setPassword("");
			handleShake();

			if (attempts >= 2) {
				Alert.alert(
					t("security.tooManyAttemptsTitle"),
					t("security.tooManyAttemptsMessage"),
					[
						{
							text: t("security.resetPassword"),
							onPress: () => router.push("/(auth)/forgot-password"),
						},
						{ text: t("common.ok"), style: "cancel" },
					],
				);
			}
		}

		setIsSubmitting(false);
	}, [password, returnTo, router, attempts, handleShake, t]);

	const handleCancel = useCallback(() => {
		router.back();
	}, [router]);

	return (
		<KeyboardAvoidingView
			style={[
				styles.container,
				{ backgroundColor: theme.background.secondary },
			]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			{/* Header */}
			<View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
				<Pressable onPress={handleCancel} style={styles.closeButton}>
					<Ionicons name="close" size={28} color={theme.text.primary} />
				</Pressable>
				<Text style={[styles.headerTitle, { color: theme.text.primary }]}>
					{t("security.sudoMode")}
				</Text>
				<View style={styles.headerSpacer} />
			</View>

			<View style={styles.content}>
				{/* Icon */}
				<Animated.View
					entering={FadeIn.delay(100).duration(500)}
					style={[
						styles.iconContainer,
						{ backgroundColor: `${Colors.warning[500]}15` },
					]}
				>
					<Ionicons
						name="shield-checkmark"
						size={48}
						color={Colors.warning[500]}
					/>
				</Animated.View>

				{/* Title */}
				<Animated.Text
					entering={FadeInUp.delay(200).duration(500)}
					style={[styles.title, { color: theme.text.primary }]}
				>
					Sudo Mode Required
				</Animated.Text>

				<Animated.Text
					entering={FadeInUp.delay(300).duration(500)}
					style={[styles.description, { color: theme.text.secondary }]}
				>
					{t("security.sudoDescription")}
				</Animated.Text>

				{/* Password Input */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(500)}
					style={[animatedStyle, styles.inputWrapper]}
				>
					<View
						style={[
							styles.inputContainer,
							{
								backgroundColor: theme.surface.default,
								borderColor: error ? Colors.error[500] : theme.border.default,
							},
						]}
					>
						<Ionicons
							name="lock-closed-outline"
							size={20}
							color={error ? Colors.error[500] : Colors.gray[400]}
						/>
						<TextInput
							ref={inputRef}
							style={[styles.input, { color: theme.text.primary }]}
							placeholder="Enter your password"
							placeholderTextColor={Colors.gray[400]}
							secureTextEntry={!showPassword}
							value={password}
							onChangeText={(text) => {
								setPassword(text);
								setError("");
							}}
							onSubmitEditing={handleSubmit}
							autoCapitalize="none"
							autoCorrect={false}
							editable={!isSubmitting}
						/>
						<Pressable
							onPress={() => setShowPassword(!showPassword)}
							hitSlop={8}
						>
							<Ionicons
								name={showPassword ? "eye-off-outline" : "eye-outline"}
								size={20}
								color={theme.text.tertiary}
							/>
						</Pressable>
					</View>

					{error && (
						<Animated.Text
							entering={FadeIn.duration(200)}
							style={styles.errorText}
						>
							{error}
						</Animated.Text>
					)}
				</Animated.View>

				{/* Timer Info */}
				<Animated.View
					entering={FadeInUp.delay(500).duration(500)}
					style={[
						styles.infoBox,
						{ backgroundColor: `${Colors.primary[500]}10` },
					]}
				>
					<Ionicons name="time-outline" size={16} color={Colors.primary[600]} />
					<Text style={[styles.infoText, { color: Colors.primary[700] }]}>
						After confirming, sudo mode will remain active for 15 minutes.
					</Text>
				</Animated.View>
			</View>

			{/* Buttons */}
			<View
				style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
			>
				<Button
					fullWidth
					onPress={handleSubmit}
					loading={isSubmitting}
					disabled={!password.trim()}
				>
					Confirm
				</Button>
				<Button variant="ghost" fullWidth onPress={handleCancel}>
					Cancel
				</Button>
			</View>
		</KeyboardAvoidingView>
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
		marginLeft: -Spacing.sm,
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
		flex: 1,
		paddingHorizontal: ScreenPadding.horizontal,
		alignItems: "center",
		justifyContent: "center",
	},
	iconContainer: {
		width: 88,
		height: 88,
		borderRadius: 44,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.xl,
	},
	title: {
		...Typography.h3,
		textAlign: "center",
		marginBottom: Spacing.md,
	},
	description: {
		...Typography.body,
		textAlign: "center",
		marginBottom: Spacing["2xl"],
		maxWidth: 320,
		lineHeight: 24,
	},
	inputWrapper: {
		width: "100%",
		marginBottom: Spacing.lg,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: Spacing.lg,
		height: 56,
		borderRadius: BorderRadius.lg,
		borderWidth: 1,
		gap: Spacing.md,
	},
	input: {
		flex: 1,
		...Typography.body,
		height: "100%",
	},
	errorText: {
		...Typography.caption,
		color: Colors.error[500],
		marginTop: Spacing.sm,
		marginLeft: Spacing.xs,
	},
	infoBox: {
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		gap: Spacing.sm,
		marginTop: Spacing.md,
	},
	infoText: {
		...Typography.caption,
		flex: 1,
	},
	footer: {
		paddingHorizontal: ScreenPadding.horizontal,
		gap: Spacing.sm,
	},
});
