import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	TextInput,
	View,
} from "react-native";
import Animated, {
	FadeIn,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore, useUser } from "@/stores";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function VerifyOTPScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { verifyOTP, isLoading } = useAuthStore();
	const user = useUser();

	const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
	const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
	const [canResend, setCanResend] = useState(false);
	const inputRefs = useRef<(TextInput | null)[]>([]);
	const shakeX = useSharedValue(0);

	// Countdown timer
	useEffect(() => {
		if (resendTimer > 0) {
			const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
			return () => clearTimeout(timer);
		} else {
			setCanResend(true);
		}
	}, [resendTimer]);

	const shakeStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: shakeX.value }],
	}));

	const triggerShake = useCallback(() => {
		shakeX.value = withSequence(
			withTiming(-10, { duration: 50 }),
			withTiming(10, { duration: 50 }),
			withTiming(-10, { duration: 50 }),
			withTiming(10, { duration: 50 }),
			withTiming(0, { duration: 50 }),
		);
	}, [shakeX]);

	const handleOtpChange = useCallback(
		(value: string, index: number) => {
			if (value.length > 1) {
				// Handle paste
				const pastedCode = value.slice(0, OTP_LENGTH).split("");
				const newOtp = [...otp];
				pastedCode.forEach((char, i) => {
					if (index + i < OTP_LENGTH) {
						newOtp[index + i] = char;
					}
				});
				setOtp(newOtp);
				const nextIndex = Math.min(index + pastedCode.length, OTP_LENGTH - 1);
				inputRefs.current[nextIndex]?.focus();
			} else {
				const newOtp = [...otp];
				newOtp[index] = value;
				setOtp(newOtp);

				// Auto-focus next input
				if (value && index < OTP_LENGTH - 1) {
					inputRefs.current[index + 1]?.focus();
				}
			}
		},
		[otp],
	);

	const handleKeyPress = useCallback(
		(key: string, index: number) => {
			if (key === "Backspace" && !otp[index] && index > 0) {
				inputRefs.current[index - 1]?.focus();
			}
		},
		[otp],
	);

	const handleVerify = useCallback(async () => {
		const code = otp.join("");
		if (code.length !== OTP_LENGTH) {
			triggerShake();
			return;
		}

		const success = await verifyOTP(code);
		if (success) {
			router.replace("/(main)/profile");
		} else {
			triggerShake();
			Alert.alert(
				"Invalid Code",
				"The code you entered is incorrect. Please try again.",
			);
			setOtp(Array(OTP_LENGTH).fill(""));
			inputRefs.current[0]?.focus();
		}
	}, [otp, verifyOTP, router, triggerShake]);

	const handleResend = useCallback(() => {
		if (!canResend) return;
		setCanResend(false);
		setResendTimer(RESEND_COOLDOWN);
		// Simulate resend
		Alert.alert(
			"Code Sent",
			"A new verification code has been sent to your email.",
		);
	}, [canResend]);

	const isComplete = otp.every((digit) => digit !== "");

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: theme.background.primary }]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<View
				style={[
					styles.content,
					{
						paddingTop: insets.top + Spacing["3xl"],
						paddingBottom: insets.bottom + Spacing.xl,
					},
				]}
			>
				{/* Header */}
				<Animated.View
					entering={FadeIn.delay(100).duration(500)}
					style={styles.header}
				>
					<View style={styles.iconContainer}>
						<Ionicons
							name="mail-open-outline"
							size={48}
							color={Colors.primary[600]}
						/>
					</View>
					<ThemedText style={styles.title}>Verify Your Email</ThemedText>
					<ThemedText style={styles.subtitle} lightColor={theme.text.secondary}>
						{"We've sent a 6-digit code to\n"}
						<ThemedText style={{ fontWeight: "600" }}>
							{user?.email || "your email"}
						</ThemedText>
					</ThemedText>
				</Animated.View>

				{/* OTP Input */}
				<Animated.View
					entering={FadeInUp.delay(300).duration(500)}
					style={[styles.otpContainer, shakeStyle]}
				>
					{Array(OTP_LENGTH)
						.fill(0)
						.map((_, index) => (
							<TextInput
								key={index}
								ref={(ref) => {
									inputRefs.current[index] = ref;
								}}
								style={[
									styles.otpInput,
									{
										backgroundColor: theme.surface.card,
										borderColor: otp[index]
											? Colors.primary[500]
											: theme.border.default,
										color: theme.text.primary,
									},
								]}
								maxLength={index === 0 ? OTP_LENGTH : 1}
								keyboardType="number-pad"
								value={otp[index]}
								onChangeText={(value) => handleOtpChange(value, index)}
								onKeyPress={({ nativeEvent }) =>
									handleKeyPress(nativeEvent.key, index)
								}
								selectTextOnFocus
								autoFocus={index === 0}
							/>
						))}
				</Animated.View>

				{/* Resend */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(500)}
					style={styles.resendContainer}
				>
					<ThemedText
						style={styles.resendText}
						lightColor={theme.text.secondary}
					>
						{"Didn't receive the code? "}
					</ThemedText>
					<Pressable onPress={handleResend} disabled={!canResend}>
						<ThemedText
							style={styles.resendLink}
							lightColor={canResend ? Colors.primary[600] : theme.text.tertiary}
						>
							{canResend ? "Resend" : `Resend in ${resendTimer}s`}
						</ThemedText>
					</Pressable>
				</Animated.View>

				{/* Verify Button */}
				<Animated.View
					entering={FadeInUp.delay(500).duration(500)}
					style={styles.buttonContainer}
				>
					<Button
						fullWidth
						onPress={handleVerify}
						loading={isLoading}
						disabled={!isComplete || isLoading}
					>
						Verify Email
					</Button>
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
	header: {
		alignItems: "center",
		marginBottom: Spacing["4xl"],
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
	otpContainer: {
		flexDirection: "row",
		justifyContent: "center",
		gap: Spacing.sm,
		marginBottom: Spacing["2xl"],
	},
	otpInput: {
		width: 48,
		height: 56,
		borderRadius: BorderRadius.lg,
		borderWidth: 2,
		fontSize: 24,
		fontWeight: "700",
		textAlign: "center",
	},
	resendContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: Spacing["3xl"],
	},
	resendText: {
		...Typography.body,
	},
	resendLink: {
		...Typography.body,
		fontWeight: "600",
	},
	buttonContainer: {
		marginTop: "auto",
	},
});
