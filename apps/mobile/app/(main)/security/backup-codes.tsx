import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
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

// Mock backup codes
const MOCK_BACKUP_CODES = [
	"ABCD-1234-EFGH",
	"IJKL-5678-MNOP",
	"QRST-9012-UVWX",
	"YZAB-3456-CDEF",
	"GHIJ-7890-KLMN",
	"OPQR-1234-STUV",
	"WXYZ-5678-ABCD",
	"EFGH-9012-IJKL",
];

export default function BackupCodesScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { t } = useTranslation();
	const [codes, setCodes] = useState(MOCK_BACKUP_CODES);
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [showCodes, setShowCodes] = useState(true);

	const handleCopyAll = useCallback(() => {
		// In a real app: Clipboard.setString(codes.join('\n'))
		Alert.alert(t("security.backup.copied"), t("security.backup.copiedText"));
	}, [t]);

	const handleRegenerate = useCallback(() => {
		Alert.alert(
			t("security.backup.regenerateConfirmTitle"),
			t("security.backup.regenerateConfirmText"),
			[
				{ text: t("common.cancel"), style: "cancel" },
				{
					text: t("security.backup.regenerate"),
					style: "destructive",
					onPress: async () => {
						setIsRegenerating(true);
						// Simulate API call
						await new Promise((resolve) => setTimeout(resolve, 1500));

						// Generate new mock codes
						const newCodes = Array.from({ length: 8 }, () => {
							const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
							const segment = (len: number) =>
								Array.from(
									{ length: len },
									() => chars[Math.floor(Math.random() * chars.length)],
								).join("");
							return `${segment(4)}-${segment(4)}-${segment(4)}`;
						});

						setCodes(newCodes);
						setIsRegenerating(false);
						Alert.alert(
							t("security.backup.regenerateSuccessTitle"),
							t("security.backup.regenerateSuccessText"),
						);
					},
				},
			],
		);
	}, [t]);

	const handleClose = useCallback(() => {
		router.back();
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
				<Pressable onPress={handleClose} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={theme.text.primary} />
				</Pressable>
				<Text style={[styles.headerTitle, { color: theme.text.primary }]}>
					{t("security.backup.title")}
				</Text>
				<Pressable
					onPress={() => setShowCodes(!showCodes)}
					style={styles.visibilityButton}
				>
					<Ionicons
						name={showCodes ? "eye-off-outline" : "eye-outline"}
						size={24}
						color={theme.text.primary}
					/>
				</Pressable>
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: insets.bottom + Spacing.xl },
				]}
				showsVerticalScrollIndicator={false}
			>
				{/* Warning Banner */}
				<Animated.View
					entering={FadeIn.delay(100).duration(500)}
					style={[
						styles.warningBanner,
						{ backgroundColor: `${Colors.warning[500]}15` },
					]}
				>
					<Ionicons
						name="warning-outline"
						size={24}
						color={Colors.warning[700]}
					/>
					<View style={styles.warningContent}>
						<Text style={[styles.warningTitle, { color: Colors.warning[700] }]}>
							{t("security.backup.warningTitle")}
						</Text>
						<Text style={[styles.warningText, { color: Colors.warning[700] }]}>
							{t("security.backup.warningText")}
						</Text>
					</View>
				</Animated.View>

				{/* Description */}
				<Animated.Text
					entering={FadeInUp.delay(200).duration(500)}
					style={[styles.description, { color: theme.text.secondary }]}
				>
					{t("security.backup.description")}
				</Animated.Text>

				{/* Codes Grid */}
				<Animated.View
					entering={FadeInUp.delay(300).duration(500)}
					style={[
						styles.codesContainer,
						{ backgroundColor: theme.surface.default },
					]}
				>
					<View style={styles.codesGrid}>
						{codes.map((code, index) => (
							<View key={code} style={styles.codeItem}>
								<Text
									style={[styles.codeNumber, { color: theme.text.tertiary }]}
								>
									{index + 1}.
								</Text>
								<Text
									style={[
										styles.codeText,
										{ color: theme.text.primary },
										!showCodes && styles.codeHidden,
									]}
								>
									{showCodes ? code : "••••-••••-••••"}
								</Text>
							</View>
						))}
					</View>

					{/* Copy Button */}
					<Pressable
						style={[styles.copyButton, { borderColor: theme.border.default }]}
						onPress={handleCopyAll}
					>
						<Ionicons
							name="copy-outline"
							size={18}
							color={Colors.primary[600]}
						/>
						<Text style={[styles.copyText, { color: Colors.primary[600] }]}>
							{t("security.backup.copyAll")}
						</Text>
					</Pressable>
				</Animated.View>

				{/* Info Cards */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(500)}
					style={styles.infoCards}
				>
					<View
						style={[
							styles.infoCard,
							{ backgroundColor: theme.surface.default },
						]}
					>
						<Ionicons
							name="information-circle-outline"
							size={20}
							color={Colors.primary[500]}
						/>
						<Text
							style={[styles.infoCardText, { color: theme.text.secondary }]}
						>
							{t("security.backup.remaining", { count: codes.length })}
						</Text>
					</View>

					<View
						style={[
							styles.infoCard,
							{ backgroundColor: theme.surface.default },
						]}
					>
						<Ionicons
							name="refresh-outline"
							size={20}
							color={Colors.primary[500]}
						/>
						<Text
							style={[styles.infoCardText, { color: theme.text.secondary }]}
						>
							{t("security.backup.regenerateWarning")}
						</Text>
					</View>
				</Animated.View>

				{/* Regenerate Button */}
				<Animated.View entering={FadeInUp.delay(500).duration(500)}>
					<Button
						variant="secondary"
						fullWidth
						onPress={handleRegenerate}
						loading={isRegenerating}
					>
						{t("security.backup.regenerate")}
					</Button>
				</Animated.View>
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
	backButton: {
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
	visibilityButton: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
		marginRight: -Spacing.sm,
	},
	scrollView: {
		flex: 1,
	},
	content: {
		paddingHorizontal: ScreenPadding.horizontal,
	},
	warningBanner: {
		flexDirection: "row",
		alignItems: "flex-start",
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		marginBottom: Spacing.lg,
		gap: Spacing.md,
	},
	warningContent: {
		flex: 1,
	},
	warningTitle: {
		...Typography.body,
		fontWeight: "600",
		marginBottom: 4,
	},
	warningText: {
		...Typography.bodySmall,
		lineHeight: 20,
	},
	description: {
		...Typography.body,
		marginBottom: Spacing.lg,
		lineHeight: 24,
	},
	codesContainer: {
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		marginBottom: Spacing.lg,
	},
	codesGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.md,
		marginBottom: Spacing.lg,
	},
	codeItem: {
		flexDirection: "row",
		alignItems: "center",
		width: "48%",
		gap: Spacing.sm,
	},
	codeNumber: {
		...Typography.bodySmall,
		width: 20,
	},
	codeText: {
		...Typography.body,
		fontFamily: "monospace",
		letterSpacing: 0.5,
	},
	codeHidden: {
		letterSpacing: 2,
	},
	copyButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: Spacing.md,
		borderTopWidth: 1,
		gap: Spacing.sm,
	},
	copyText: {
		...Typography.body,
		fontWeight: "600",
	},
	infoCards: {
		gap: Spacing.sm,
		marginBottom: Spacing.xl,
	},
	infoCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		gap: Spacing.md,
	},
	infoCardText: {
		...Typography.bodySmall,
		flex: 1,
	},
});
