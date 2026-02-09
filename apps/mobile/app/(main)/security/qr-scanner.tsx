import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	Alert,
	Dimensions,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, {
	Easing,
	FadeIn,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
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

const { width } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

type ScanState = "scanning" | "detected" | "confirming" | "success" | "error";

interface DetectedDevice {
	browser: string;
	os: string;
	location: string;
	ip: string;
}

export default function QRScannerScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();

	const [scanState, setScanState] = useState<ScanState>("scanning");
	const [detectedDevice, setDetectedDevice] = useState<DetectedDevice | null>(
		null,
	);
	const [isProcessing, setIsProcessing] = useState(false);

	// Scanning animation
	const scanLineY = useSharedValue(0);
	const pulseScale = useSharedValue(1);

	useEffect(() => {
		scanLineY.value = withRepeat(
			withTiming(SCAN_AREA_SIZE - 4, { duration: 2000, easing: Easing.linear }),
			-1,
			true,
		);
		pulseScale.value = withRepeat(
			withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
			-1,
			true,
		);
	}, [scanLineY, pulseScale]);

	const scanLineStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: scanLineY.value }],
	}));

	const pulseStyle = useAnimatedStyle(() => ({
		transform: [{ scale: pulseScale.value }],
	}));

	// Simulate QR detection (in real app, use expo-camera or expo-barcode-scanner)
	const simulateDetection = useCallback(() => {
		setScanState("detected");
		setDetectedDevice({
			browser: "Chrome 121",
			os: "macOS Sonoma",
			location: "Nairobi, Kenya",
			ip: "192.168.1.50",
		});
		setTimeout(() => setScanState("confirming"), 500);
	}, []);

	const handleApprove = useCallback(async () => {
		setIsProcessing(true);
		// Simulate approval
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setScanState("success");
		setIsProcessing(false);
	}, []);

	const handleDeny = useCallback(() => {
		Alert.alert(
			"Deny Login",
			"Are you sure you want to deny this login request?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Deny",
					style: "destructive",
					onPress: () => {
						setScanState("error");
					},
				},
			],
		);
	}, []);

	const handleClose = useCallback(() => {
		router.back();
	}, [router]);

	const handleRescan = useCallback(() => {
		setScanState("scanning");
		setDetectedDevice(null);
	}, []);

	const renderScanning = () => (
		<>
			{/* Camera Placeholder */}
			<View style={styles.cameraContainer}>
				<View
					style={[
						styles.cameraPlaceholder,
						{ backgroundColor: Colors.gray[900] },
					]}
				>
					{/* Scan Area */}
					<Animated.View style={[styles.scanArea, pulseStyle]}>
						{/* Corner Brackets */}
						<View style={[styles.corner, styles.cornerTL]} />
						<View style={[styles.corner, styles.cornerTR]} />
						<View style={[styles.corner, styles.cornerBL]} />
						<View style={[styles.corner, styles.cornerBR]} />

						{/* Scan Line */}
						<Animated.View style={[styles.scanLine, scanLineStyle]} />
					</Animated.View>

					{/* Instructions */}
					<View style={styles.scanInstructions}>
						<Ionicons name="qr-code" size={24} color={Colors.white} />
						<Text style={styles.scanText}>
							Point your camera at the QR code on the screen
						</Text>
					</View>
				</View>
			</View>

			{/* Demo Button */}
			<View
				style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
			>
				<Button variant="secondary" fullWidth onPress={simulateDetection}>
					Simulate QR Detection (Demo)
				</Button>
				<Button variant="ghost" fullWidth onPress={handleClose}>
					Cancel
				</Button>
			</View>
		</>
	);

	const renderConfirming = () => (
		<View style={styles.confirmContainer}>
			<Animated.View
				entering={FadeIn.delay(100).duration(500)}
				style={[
					styles.iconContainer,
					{ backgroundColor: `${Colors.warning[500]}15` },
				]}
			>
				<Ionicons
					name="desktop-outline"
					size={48}
					color={Colors.warning[500]}
				/>
			</Animated.View>

			<Animated.Text
				entering={FadeInUp.delay(200).duration(500)}
				style={[styles.title, { color: theme.text.primary }]}
			>
				Login Request
			</Animated.Text>

			<Animated.Text
				entering={FadeInUp.delay(300).duration(500)}
				style={[styles.description, { color: theme.text.secondary }]}
			>
				Someone is trying to sign in to your account from a new device.
			</Animated.Text>

			{/* Device Details */}
			<Animated.View
				entering={FadeInUp.delay(400).duration(500)}
				style={[styles.deviceCard, { backgroundColor: theme.surface.default }]}
			>
				<View style={styles.deviceRow}>
					<Ionicons
						name="globe-outline"
						size={18}
						color={theme.text.tertiary}
					/>
					<Text style={[styles.deviceLabel, { color: theme.text.tertiary }]}>
						Browser
					</Text>
					<Text style={[styles.deviceValue, { color: theme.text.primary }]}>
						{detectedDevice?.browser}
					</Text>
				</View>
				<View
					style={[styles.divider, { backgroundColor: theme.border.default }]}
				/>
				<View style={styles.deviceRow}>
					<Ionicons
						name="laptop-outline"
						size={18}
						color={theme.text.tertiary}
					/>
					<Text style={[styles.deviceLabel, { color: theme.text.tertiary }]}>
						System
					</Text>
					<Text style={[styles.deviceValue, { color: theme.text.primary }]}>
						{detectedDevice?.os}
					</Text>
				</View>
				<View
					style={[styles.divider, { backgroundColor: theme.border.default }]}
				/>
				<View style={styles.deviceRow}>
					<Ionicons
						name="location-outline"
						size={18}
						color={theme.text.tertiary}
					/>
					<Text style={[styles.deviceLabel, { color: theme.text.tertiary }]}>
						Location
					</Text>
					<Text style={[styles.deviceValue, { color: theme.text.primary }]}>
						{detectedDevice?.location}
					</Text>
				</View>
			</Animated.View>

			{/* Warning */}
			<Animated.View
				entering={FadeInUp.delay(500).duration(500)}
				style={[
					styles.warningBox,
					{ backgroundColor: `${Colors.error[500]}10` },
				]}
			>
				<Ionicons
					name="alert-circle-outline"
					size={18}
					color={Colors.error[700]}
				/>
				<Text style={[styles.warningText, { color: Colors.error[700] }]}>
					Only approve if you initiated this login request.
				</Text>
			</Animated.View>

			{/* Actions */}
			<View
				style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
			>
				<Button fullWidth onPress={handleApprove} loading={isProcessing}>
					Approve Sign In
				</Button>
				<Button
					variant="danger"
					fullWidth
					onPress={handleDeny}
					disabled={isProcessing}
				>
					Deny
				</Button>
			</View>
		</View>
	);

	const renderSuccess = () => (
		<View style={styles.confirmContainer}>
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
				Sign In Approved!
			</Animated.Text>

			<Animated.Text
				entering={FadeInUp.delay(300).duration(500)}
				style={[styles.description, { color: theme.text.secondary }]}
			>
				You&apos;re now signed in on{"\n"}
				{detectedDevice?.browser} • {detectedDevice?.os}
			</Animated.Text>

			<View
				style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
			>
				<Button fullWidth onPress={handleClose}>
					Done
				</Button>
			</View>
		</View>
	);

	const renderError = () => (
		<View style={styles.confirmContainer}>
			<Animated.View
				entering={FadeIn.delay(100).duration(500)}
				style={[
					styles.iconContainer,
					{ backgroundColor: `${Colors.error[500]}15` },
				]}
			>
				<Ionicons name="close-circle" size={64} color={Colors.error[500]} />
			</Animated.View>

			<Animated.Text
				entering={FadeInUp.delay(200).duration(500)}
				style={[styles.title, { color: theme.text.primary }]}
			>
				Login Denied
			</Animated.Text>

			<Animated.Text
				entering={FadeInUp.delay(300).duration(500)}
				style={[styles.description, { color: theme.text.secondary }]}
			>
				The login request was denied. If you didn&apos;t make this request,
				consider changing your password.
			</Animated.Text>

			<View
				style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
			>
				<Button fullWidth onPress={handleRescan}>
					Scan Another Code
				</Button>
				<Button variant="ghost" fullWidth onPress={handleClose}>
					Close
				</Button>
			</View>
		</View>
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
					<Ionicons
						name="close"
						size={28}
						color={scanState === "scanning" ? Colors.white : theme.text.primary}
					/>
				</Pressable>
				<Text
					style={[
						styles.headerTitle,
						{
							color:
								scanState === "scanning" ? Colors.white : theme.text.primary,
						},
					]}
				>
					{scanState === "scanning" ? "Scan QR Code" : "Confirm Login"}
				</Text>
				<View style={styles.headerSpacer} />
			</View>

			{scanState === "scanning" && renderScanning()}
			{(scanState === "detected" || scanState === "confirming") &&
				renderConfirming()}
			{scanState === "success" && renderSuccess()}
			{scanState === "error" && renderError()}
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
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 10,
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
	cameraContainer: {
		flex: 1,
	},
	cameraPlaceholder: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	scanArea: {
		width: SCAN_AREA_SIZE,
		height: SCAN_AREA_SIZE,
		position: "relative",
	},
	corner: {
		position: "absolute",
		width: 30,
		height: 30,
		borderColor: Colors.primary[500],
		borderWidth: 3,
	},
	cornerTL: {
		top: 0,
		left: 0,
		borderRightWidth: 0,
		borderBottomWidth: 0,
	},
	cornerTR: {
		top: 0,
		right: 0,
		borderLeftWidth: 0,
		borderBottomWidth: 0,
	},
	cornerBL: {
		bottom: 0,
		left: 0,
		borderRightWidth: 0,
		borderTopWidth: 0,
	},
	cornerBR: {
		bottom: 0,
		right: 0,
		borderLeftWidth: 0,
		borderTopWidth: 0,
	},
	scanLine: {
		position: "absolute",
		left: 10,
		right: 10,
		height: 2,
		backgroundColor: Colors.primary[500],
		shadowColor: Colors.primary[500],
		shadowOffset: { width: 0, height: 0 },
		shadowOpacity: 0.8,
		shadowRadius: 8,
	},
	scanInstructions: {
		position: "absolute",
		bottom: -80,
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
		paddingHorizontal: Spacing.xl,
	},
	scanText: {
		...Typography.body,
		color: Colors.white,
		textAlign: "center",
	},
	confirmContainer: {
		flex: 1,
		paddingHorizontal: ScreenPadding.horizontal,
		paddingTop: 100,
		alignItems: "center",
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
		maxWidth: 300,
		lineHeight: 24,
	},
	deviceCard: {
		width: "100%",
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		marginBottom: Spacing.lg,
	},
	deviceRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	deviceLabel: {
		...Typography.bodySmall,
		flex: 1,
	},
	deviceValue: {
		...Typography.body,
		fontWeight: "600",
	},
	divider: {
		height: 1,
		marginVertical: Spacing.md,
	},
	warningBox: {
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		gap: Spacing.sm,
		marginBottom: Spacing.xl,
	},
	warningText: {
		...Typography.bodySmall,
		flex: 1,
	},
	footer: {
		width: "100%",
		gap: Spacing.sm,
		marginTop: "auto",
		paddingHorizontal: ScreenPadding.horizontal,
	},
});
