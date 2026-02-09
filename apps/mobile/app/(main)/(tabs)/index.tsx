import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
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
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";

const copyToClipboard = async (text: string): Promise<void> => {
	console.log("Copied:", text);
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TOTPAccount {
	id: string;
	issuer: string;
	account: string;
	secret: string;
	icon: keyof typeof Ionicons.glyphMap;
	color: string;
}

const MOCK_ACCOUNTS: TOTPAccount[] = [
	{
		id: "1",
		issuer: "GitHub",
		account: "developer@example.com",
		secret: "JBSWY3DPEHPK3PXP",
		icon: "logo-github",
		color: "#333333",
	},
	{
		id: "2",
		issuer: "Google",
		account: "user@gmail.com",
		secret: "HXDMVJECJJWSRB3H",
		icon: "logo-google",
		color: "#4285F4",
	},
	{
		id: "3",
		issuer: "Amazon AWS",
		account: "admin@company.com",
		secret: "GEZDGNBVGY3TQOJQ",
		icon: "cloud-outline",
		color: "#FF9900",
	},
	{
		id: "4",
		issuer: "Microsoft",
		account: "user@outlook.com",
		secret: "KRUGS4ZANFZSAZLO",
		icon: "logo-microsoft",
		color: "#00A4EF",
	},
];

// Simple TOTP generator (mock - in production use a proper library)
function generateTOTP(secret: string, timeStep: number = 30): string {
	// This is a simplified mock - in production use otplib or similar
	const time = Math.floor(Date.now() / 1000 / timeStep);
	let hash = 0;
	for (let i = 0; i < secret.length; i++) {
		hash = ((hash << 5) - hash + secret.charCodeAt(i) + time) | 0;
	}
	const code = Math.abs(hash % 1000000)
		.toString()
		.padStart(6, "0");
	return code;
}

interface TOTPCardProps {
	account: TOTPAccount;
	timeRemaining: number;
	index: number;
}



function TOTPCard({ account, timeRemaining, index }: TOTPCardProps) {
	const theme = useTheme();
	const { t } = useTranslation();
	const [code, setCode] = useState(() => generateTOTP(account.secret));
	const [copied, setCopied] = useState(false);
	const scale = useSharedValue(1);

	useEffect(() => {
		if (timeRemaining === 30) {
			setCode(generateTOTP(account.secret));
		}
	}, [timeRemaining, account.secret]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const handleCopy = useCallback(async () => {
		await copyToClipboard(code);
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [code]);

	const handlePress = useCallback(() => {
		scale.value = withSequence(
			withTiming(0.97, { duration: 100 }),
			withTiming(1, { duration: 100 }),
		);
		handleCopy();
	}, [scale, handleCopy]);

	const formattedCode = `${code.slice(0, 3)} ${code.slice(3)}`;

	const isLow = timeRemaining <= 5;
	const codeColor = isLow ? Colors.error[500] : theme.text.primary;

	return (
		<AnimatedPressable onPress={handlePress} style={animatedStyle}>
			<Animated.View entering={FadeInUp.delay(100 + index * 80).duration(400)}>
				<Card variant="elevated" padding={0} style={styles.totpCard}>
					<View style={styles.cardContent}>
						{/* Icon */}
						<View
							style={[
								styles.issuerIcon,
								{ backgroundColor: `${account.color}15` },
							]}
						>
							<Ionicons name={account.icon} size={24} color={account.color} />
						</View>

						{/* Info */}
						<View style={styles.accountInfo}>
							<Text style={[styles.issuer, { color: theme.text.primary }]}>
								{account.issuer}
							</Text>
							<Text
								style={[styles.account, { color: theme.text.tertiary }]}
								numberOfLines={1}
							>
								{account.account}
							</Text>
						</View>

						{/* Code */}
						<View style={styles.codeContainer}>
							<Text style={[styles.code, { color: codeColor }]}>
								{formattedCode}
							</Text>
							{copied && (
								<Animated.View entering={FadeIn.duration(200)}>
									<Text style={styles.copiedText}>{t("home.copied")}</Text>
								</Animated.View>
							)}
						</View>
					</View>

					{/* Progress bar */}
					<View
						style={[
							styles.progressBar,
							{ backgroundColor: theme.border.default },
						]}
					>
						<Animated.View
							style={[
								styles.progressFill,
								{
									width: `${(timeRemaining / 30) * 100}%`,
									backgroundColor: isLow
										? Colors.error[500]
										: Colors.primary[500],
								},
							]}
						/>
					</View>
				</Card>
			</Animated.View>
		</AnimatedPressable>
	);
}

export default function HomeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { t } = useTranslation();
	const [timeRemaining, setTimeRemaining] = useState(30);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			const seconds = 30 - (Math.floor(Date.now() / 1000) % 30);
			setTimeRemaining(seconds);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setRefreshing(false);
	}, []);

	const handleScan = useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.push("/(main)/security/qr-scanner");
	}, [router]);

	const handleAddAccount = useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.push("/(main)/security/totp-setup");
	}, [router]);

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: theme.background.secondary },
			]}
		>
			{/* Header */}
			<View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
				<View>
					<Text style={[styles.greeting, { color: theme.text.secondary }]}>
						{t("home.welcomeBack")}
					</Text>
					<Text style={[styles.title, { color: theme.text.primary }]}>
						{t("home.yourCodes")}
					</Text>
				</View>

				{/* Timer */}
				<Animated.View
					entering={FadeIn.delay(200).duration(400)}
					style={[
						styles.timerBadge,
						{ backgroundColor: theme.surface.default },
					]}
				>
					<Ionicons
						name="time-outline"
						size={16}
						color={timeRemaining <= 5 ? Colors.error[500] : Colors.primary[500]}
					/>
					<Text
						style={[
							styles.timerText,
							{
								color:
									timeRemaining <= 5 ? Colors.error[500] : theme.text.primary,
							},
						]}
					>
						{timeRemaining}s
					</Text>
				</Animated.View>
			</View>

			{/* Scan Button */}
			<Animated.View
				entering={FadeInUp.delay(100).duration(500)}
				style={styles.scanSection}
			>
				<Pressable
					onPress={handleScan}
					style={({ pressed }) => [
						styles.scanButton,
						{ backgroundColor: Colors.primary[500] },
						pressed && styles.scanButtonPressed,
					]}
				>
					<View style={styles.scanButtonContent}>
						<View style={styles.scanIcon}>
							<Ionicons name="scan-outline" size={32} color={Colors.white} />
						</View>
						<View>
							<Text style={styles.scanTitle}>{t("home.scanQr")}</Text>
							<Text style={styles.scanSubtitle}>{t("home.scanSubtitle")}</Text>
						</View>
					</View>
					<Ionicons name="chevron-forward" size={24} color={Colors.white} />
				</Pressable>
			</Animated.View>

			{/* TOTP List */}
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: insets.bottom + 100 },
				]}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						tintColor={Colors.primary[500]}
					/>
				}
			>
				{/* Section Header */}
				<View style={styles.sectionHeader}>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						{t("home.totpSection")}
					</Text>
					<Pressable onPress={handleAddAccount} hitSlop={8}>
						<Ionicons name="add-circle" size={24} color={Colors.primary[500]} />
					</Pressable>
				</View>

				{/* TOTP Cards */}
				<View style={styles.totpList}>
					{MOCK_ACCOUNTS.map((account, index) => (
						<TOTPCard
							key={account.id}
							account={account}
							timeRemaining={timeRemaining}
							index={index}
						/>
					))}
				</View>

				{/* Empty State (when no accounts) */}
				{MOCK_ACCOUNTS.length === 0 && (
					<View style={styles.emptyState}>
						<Ionicons
							name="key-outline"
							size={64}
							color={theme.text.tertiary}
						/>
						<Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
							{t("home.noAccounts")}
						</Text>
						<Text style={[styles.emptyText, { color: theme.text.secondary }]}>
							{t("home.noAccountsDesc")}
						</Text>
					</View>
				)}
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
		justifyContent: "space-between",
		paddingHorizontal: ScreenPadding.horizontal,
		paddingBottom: Spacing.lg,
	},
	greeting: {
		...Typography.bodySmall,
	},
	title: {
		...Typography.h2,
	},
	timerBadge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.sm,
		borderRadius: BorderRadius.full,
		gap: Spacing.xs,
	},
	timerText: {
		...Typography.body,
		fontWeight: "700",
		fontVariant: ["tabular-nums"],
	},
	scanSection: {
		paddingHorizontal: ScreenPadding.horizontal,
		marginBottom: Spacing.lg,
	},
	scanButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: Spacing.lg,
		borderRadius: BorderRadius.xl,
	},
	scanButtonPressed: {
		opacity: 0.9,
		transform: [{ scale: 0.98 }],
	},
	scanButtonContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
	},
	scanIcon: {
		width: 56,
		height: 56,
		borderRadius: BorderRadius.lg,
		backgroundColor: "rgba(255,255,255,0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
	scanTitle: {
		...Typography.h4,
		color: Colors.white,
	},
	scanSubtitle: {
		...Typography.bodySmall,
		color: "rgba(255,255,255,0.8)",
	},
	scrollView: {
		flex: 1,
	},
	content: {
		paddingHorizontal: ScreenPadding.horizontal,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: Spacing.md,
	},
	sectionTitle: {
		...Typography.label,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	totpList: {
		gap: Spacing.sm,
	},
	totpCard: {
		overflow: "hidden",
	},
	cardContent: {
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.lg,
		gap: Spacing.md,
	},
	issuerIcon: {
		width: 48,
		height: 48,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	accountInfo: {
		flex: 1,
	},
	issuer: {
		...Typography.body,
		fontWeight: "600",
	},
	account: {
		...Typography.caption,
	},
	codeContainer: {
		alignItems: "flex-end",
	},
	code: {
		...Typography.h3,
		fontVariant: ["tabular-nums"],
		letterSpacing: 2,
	},
	copiedText: {
		...Typography.caption,
		color: Colors.success[500],
	},
	progressBar: {
		height: 3,
	},
	progressFill: {
		height: "100%",
		borderRadius: 1.5,
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: Spacing["3xl"],
		gap: Spacing.md,
	},
	emptyTitle: {
		...Typography.h4,
	},
	emptyText: {
		...Typography.body,
		textAlign: "center",
		maxWidth: 280,
	},
});
