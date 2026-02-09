import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Alert,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/stores/auth-store";

const OTP_LENGTH = 6;
const MOCK_SECRET = "JBSWY3DPEHPK3PXP";

type SetupStep = "intro" | "qrcode" | "verify" | "success";

export default function TOTPSetupScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { enableMFA } = useAuthStore();
	const { t } = useTranslation();

	const [step, setStep] = useState<SetupStep>("intro");
	const [otp, setOtp] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [error, setError] = useState("");
	const inputRefs = useRef<(TextInput | null)[]>([]);

	const handleOtpChange = useCallback(
		(text: string, index: number) => {
			const newOtp = otp.split("");
			newOtp[index] = text;
			const updatedOtp = newOtp.join("");
			setOtp(updatedOtp);
			setError("");

			// Auto-focus next input
			if (text && index < OTP_LENGTH - 1) {
				inputRefs.current[index + 1]?.focus();
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
		if (otp.length !== OTP_LENGTH) {
			setError("Please enter the complete code");
			return;
		}

		setIsVerifying(true);
		setError("");

		// Simulate verification
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// Accept any 6-digit code for demo
		if (otp.length === 6) {
			await enableMFA("totp");
			setStep("success");
		} else {
			setError("Invalid code. Please try again.");
		}

		setIsVerifying(false);
	}, [otp, enableMFA]);

	const handleCopySecret = useCallback(() => {
		// In a real app, use Clipboard.setString(MOCK_SECRET)
		Alert.alert("Copied!", "Secret key copied to clipboard");
	}, []);

	const handleClose = useCallback(() => {
		router.back();
	}, [router]);

	const renderIntro = () => (
		<>
			<Animated.View
				entering={FadeIn.delay(100).duration(500)}
				style={[
					styles.iconContainer,
					{ backgroundColor: `${Colors.success[500]}15` },
				]}
			>
				<Ionicons
					name="shield-checkmark"
					size={48}
					color={Colors.success[500]}
				/>
			</Animated.View>

			<Animated.Text
				entering={FadeInUp.delay(200).duration(500)}
				style={[styles.title, { color: theme.text.primary }]}
			>
				{t("security.totp.title")}
			</Animated.Text>

			<Animated.Text
				entering={FadeInUp.delay(300).duration(500)}
				style={[styles.description, { color: theme.text.secondary }]}
			>
				{t("security.totp.description")}
			</Animated.Text>

			<Animated.View
				entering={FadeInUp.delay(400).duration(500)}
				style={styles.featureList}
			>
				<View style={styles.featureItem}>
					<Ionicons
						name="checkmark-circle"
						size={20}
						color={Colors.success[500]}
					/>
					<Text style={[styles.featureText, { color: theme.text.primary }]}>
						{t("security.totp.feature1")}
					</Text>
				</View>
				<View style={styles.featureItem}>
					<Ionicons
						name="checkmark-circle"
						size={20}
						color={Colors.success[500]}
					/>
					<Text style={[styles.featureText, { color: theme.text.primary }]}>
						{t("security.totp.feature2")}
					</Text>
				</View>
				<View style={styles.featureItem}>
					<Ionicons
						name="checkmark-circle"
						size={20}
						color={Colors.success[500]}
					/>
					<Text style={[styles.featureText, { color: theme.text.primary }]}>
						{t("security.totp.feature3")}
					</Text>
				</View>
			</Animated.View>

			<View style={styles.buttonContainer}>
				<Button fullWidth onPress={() => setStep("qrcode")}>
					{t("security.totp.getStarted")}
				</Button>
				<Button variant="ghost" fullWidth onPress={handleClose}>
					{t("security.totp.maybeLater")}
				</Button>
			</View>
		</>
	);

	const renderQRCode = () => (
		<>
			<Animated.View
				entering={FadeIn.delay(100).duration(500)}
				style={styles.stepIndicator}
			>
				<Badge variant="primary" size="sm">
					Step 1 of 2
				</Badge>
			</Animated.View>

			<Animated.Text
				entering={FadeInUp.delay(200).duration(500)}
				style={[styles.title, { color: theme.text.primary }]}
			>
				Scan QR Code
			</Animated.Text>

			<Animated.Text
				entering={FadeInUp.delay(300).duration(500)}
				style={[styles.description, { color: theme.text.secondary }]}
			>
				Open your authenticator app and scan this QR code to add your account.
			</Animated.Text>

			{/* Mock QR Code */}
			<Animated.View
				entering={FadeIn.delay(400).duration(500)}
				style={[styles.qrContainer, { backgroundColor: theme.surface.default }]}
			>
				<View
					style={[styles.qrPlaceholder, { backgroundColor: Colors.gray[900] }]}
				>
					<Ionicons name="qr-code" size={120} color={Colors.white} />
				</View>
			</Animated.View>

			{/* Manual Entry */}
			<Animated.View
				entering={FadeInUp.delay(500).duration(500)}
				style={styles.manualEntry}
			>
				<Text style={[styles.manualLabel, { color: theme.text.secondary }]}>
					{t("security.totp.manualEntry")}
				</Text>
				<Pressable
					style={[
						styles.secretContainer,
						{ backgroundColor: theme.surface.default },
					]}
					onPress={handleCopySecret}
				>
					<Text style={[styles.secretText, { color: theme.text.primary }]}>
						{MOCK_SECRET}
					</Text>
					<Ionicons name="copy-outline" size={20} color={theme.text.tertiary} />
				</Pressable>
			</Animated.View>

			<View style={styles.buttonContainer}>
				<Button fullWidth onPress={() => setStep("verify")}>
					{t("security.totp.continue")}
				</Button>
				<Button variant="ghost" fullWidth onPress={() => setStep("intro")}>
					{t("security.totp.back")}
				</Button>
			</View>
		</>
	);

	const renderVerify = () => (
		<>
			<Animated.View
				entering={FadeIn.delay(100).duration(500)}
				style={styles.stepIndicator}
			>
				<Badge variant="primary" size="sm">
					Step 2 of 2
				</Badge>
			</Animated.View>

			<Animated.Text
				entering={FadeInUp.delay(200).duration(500)}
				style={[styles.title, { color: theme.text.primary }]}
			>
				{t("security.totp.verifyCode")}
			</Animated.Text>

			<Animated.Text
				entering={FadeInUp.delay(300).duration(500)}
				style={[styles.description, { color: theme.text.secondary }]}
			>
				{t("security.totp.enterCode")}
			</Animated.Text>

			{/* OTP Input */}
			<Animated.View
				entering={FadeInUp.delay(400).duration(500)}
				style={styles.otpContainer}
			>
				{Array.from({ length: OTP_LENGTH }).map((_, index) => (
					<TextInput
						key={`otp-${index}`}
						ref={(ref) => {
							inputRefs.current[index] = ref;
						}}
						style={[
							styles.otpInput,
							{
								backgroundColor: theme.surface.default,
								borderColor: error
									? Colors.error[500]
									: otp[index]
										? Colors.primary[500]
										: theme.border.default,
								color: theme.text.primary,
							},
						]}
						value={otp[index] || ""}
						onChangeText={(text) => handleOtpChange(text.slice(-1), index)}
						onKeyPress={({ nativeEvent }) =>
							handleKeyPress(nativeEvent.key, index)
						}
						keyboardType="number-pad"
						maxLength={1}
						selectTextOnFocus
					/>
				))}
			</Animated.View>

			{error && (
				<Animated.Text entering={FadeIn.duration(200)} style={styles.errorText}>
					{error}
				</Animated.Text>
			)}

			<View style={styles.buttonContainer}>
				<Button
					fullWidth
					onPress={handleVerify}
					loading={isVerifying}
					disabled={otp.length !== OTP_LENGTH}
				>
					{t("security.totp.verifyAndEnable")}
				</Button>
				<Button variant="ghost" fullWidth onPress={() => setStep("qrcode")}>
					{t("security.totp.back")}
				</Button>
			</View>
		</>
	);

	const renderSuccess = () => (
		<>
			<Animated.View
				entering={FadeIn.delay(100).duration(500)}
				style={[
					styles.iconContainer,
					{ backgroundColor: `${Colors.success[500]}15` },
				]}
			>
				<Ionicons
					name="checkmark-circle"
					size={64}
					color={Colors.success[500]}
				/>
			</Animated.View>

			<Animated.Text
				entering={FadeInUp.delay(200).duration(500)}
				style={[styles.title, { color: theme.text.primary }]}
			>
				{t("security.totp.successTitle")}
			</Animated.Text>

			<Animated.Text
				entering={FadeInUp.delay(300).duration(500)}
				style={[styles.description, { color: theme.text.secondary }]}
			>
				{t("security.totp.successDescription")}
			</Animated.Text>

			<Animated.View
				entering={FadeInUp.delay(400).duration(500)}
				style={[
					styles.infoBox,
					{ backgroundColor: `${Colors.warning[500]}10` },
				]}
			>
				<Ionicons
					name="warning-outline"
					size={20}
					color={Colors.warning[700]}
				/>
				<Text style={[styles.infoText, { color: Colors.warning[700] }]}>
					{t("security.totp.warning")}
				</Text>
			</Animated.View>

			<View style={styles.buttonContainer}>
				<Button
					fullWidth
					onPress={() => router.push("/(main)/security/backup-codes")}
				>
					{t("security.totp.viewBackupCodes")}
				</Button>
				<Button variant="secondary" fullWidth onPress={handleClose}>
					{t("security.totp.done")}
				</Button>
			</View>
		</>
	);

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: theme.background.secondary },
			]}
		>
			{/* Header */}
			<View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
				<Pressable onPress={handleClose} style={styles.closeButton}>
					<Ionicons name="close" size={28} color={theme.text.primary} />
				</Pressable>
				<Text style={[styles.headerTitle, { color: theme.text.primary }]}>
					{t("security.totp.headerTitle")}
				</Text>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: insets.bottom + Spacing.xl },
				]}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{step === "intro" && renderIntro()}
				{step === "qrcode" && renderQRCode()}
				{step === "verify" && renderVerify()}
				{step === "success" && renderSuccess()}
			</ScrollView>
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
	scrollView: {
		flex: 1,
	},
	content: {
		paddingHorizontal: ScreenPadding.horizontal,
		alignItems: "center",
		paddingTop: Spacing.xl,
	},
	stepIndicator: {
		marginBottom: Spacing.lg,
	},
	iconContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
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
		marginBottom: Spacing.xl,
		maxWidth: 320,
		lineHeight: 24,
	},
	featureList: {
		gap: Spacing.md,
		marginBottom: Spacing["2xl"],
	},
	featureItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
	},
	featureText: {
		...Typography.body,
	},
	qrContainer: {
		padding: Spacing.xl,
		borderRadius: BorderRadius.xl,
		marginBottom: Spacing.xl,
	},
	qrPlaceholder: {
		width: 160,
		height: 160,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	manualEntry: {
		width: "100%",
		marginBottom: Spacing.xl,
	},
	manualLabel: {
		...Typography.bodySmall,
		textAlign: "center",
		marginBottom: Spacing.sm,
	},
	secretContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		gap: Spacing.sm,
	},
	secretText: {
		...Typography.body,
		fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
		letterSpacing: 1,
	},
	otpContainer: {
		flexDirection: "row",
		gap: Spacing.sm,
		marginBottom: Spacing.lg,
	},
	otpInput: {
		width: 48,
		height: 56,
		borderRadius: BorderRadius.md,
		borderWidth: 2,
		textAlign: "center",
		...Typography.h3,
	},
	errorText: {
		...Typography.caption,
		color: Colors.error[500],
		marginBottom: Spacing.lg,
	},
	infoBox: {
		flexDirection: "row",
		alignItems: "flex-start",
		padding: Spacing.md,
		borderRadius: BorderRadius.lg,
		marginBottom: Spacing.xl,
		gap: Spacing.sm,
		width: "100%",
	},
	infoText: {
		...Typography.bodySmall,
		flex: 1,
		lineHeight: 20,
	},
	buttonContainer: {
		width: "100%",
		gap: Spacing.sm,
		marginTop: "auto",
	},
});
