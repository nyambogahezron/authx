import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LanguageBottomSheet } from "@/components/settings/language-sheet";
import { ThemeBottomSheet } from "@/components/settings/theme-sheet";
import { ThemedText as Text } from "@/components/themed-text";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { BottomSheetRef } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Shadows,
	Spacing,
	Typography,
} from "@/constants/theme";
import { formatRelativeTime } from "@/data/mock-sessions";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore, useLanguageStore, useUser } from "@/stores";

interface MenuItemProps {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	description?: string;
	onPress: () => void;
	badge?: string;
	danger?: boolean;
}

function MenuItem({
	icon,
	label,
	description,
	onPress,
	badge,
	danger,
}: MenuItemProps) {
	const theme = useTheme();
	return (
		<Pressable
			style={({ pressed }) => [
				styles.menuItem,
				pressed && styles.menuItemPressed,
			]}
			onPress={onPress}
		>
			<View
				style={[
					styles.menuIcon,
					{
						backgroundColor: danger
							? `${Colors.error[500]}15`
							: `${Colors.primary[500]}15`,
					},
				]}
			>
				<Ionicons
					name={icon}
					size={20}
					color={danger ? Colors.error[500] : Colors.primary[600]}
				/>
			</View>
			<View style={styles.menuContent}>
				<Text
					style={[
						styles.menuLabel,
						{ color: danger ? Colors.error[700] : theme.text.primary },
					]}
				>
					{label}
				</Text>
				{description && (
					<Text
						style={[styles.menuDescription, { color: theme.text.tertiary }]}
					>
						{description}
					</Text>
				)}
			</View>
			{badge && (
				<Badge variant="primary" size="sm">
					{badge}
				</Badge>
			)}
			<Ionicons name="chevron-forward" size={20} color={theme.icon} />
		</Pressable>
	);
}

export default function ProfileScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { logout } = useAuthStore();
	const user = useUser();
	const { language } = useLanguageStore();
	const { t } = useTranslation();

	const themeSheetRef = useRef<BottomSheetRef>(null);
	const languageSheetRef = useRef<BottomSheetRef>(null);

	const handleLogout = useCallback(() => {
		Alert.alert(t("settings.logout"), t("common.confirm"), [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("settings.logout"),
				style: "destructive",
				onPress: async () => {
					await logout();
					router.replace("/(auth)/login");
				},
			},
		]);
	}, [logout, router, t]);

	if (!user) {
		return null;
	}

	return (
		<ScrollView
			style={[
				styles.container,
				{ backgroundColor: theme.background.secondary },
			]}
			contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
			showsVerticalScrollIndicator={false}
		>
			{/* Header */}
			<Animated.View
				entering={FadeIn.delay(100).duration(500)}
				style={[styles.header, { paddingTop: insets.top + Spacing.xl }]}
			>
				<View style={styles.headerActions}>
					<Text style={[styles.headerTitle, { color: theme.text.primary }]}>
						{t("profile.title")}
					</Text>
					<Pressable onPress={() => router.push("/(main)/settings")}>
						<Ionicons name="settings-outline" size={24} color={theme.icon} />
					</Pressable>
				</View>
			</Animated.View>

			{/* Profile Card */}
			<Animated.View
				entering={FadeInDown.delay(200).duration(500)}
				style={styles.profileCard}
			>
				<Card variant="elevated" padding="xl">
					<View style={styles.profileHeader}>
						<Avatar
							source={user.avatar}
							name={user.name}
							size="xl"
							status={user.isEmailVerified ? "online" : "away"}
							showEditBadge
							onEditPress={() => router.push("/(main)/profile/edit")}
						/>
						<View style={styles.profileInfo}>
							<Text style={[styles.profileName, { color: theme.text.primary }]}>
								{user.name}
							</Text>
							<Text
								style={[styles.profileEmail, { color: theme.text.secondary }]}
							>
								{user.email}
							</Text>
							<View style={styles.verificationBadge}>
								{user.isEmailVerified ? (
									<Badge variant="success" size="sm">
										{t("profile.verified")}
									</Badge>
								) : (
									<Badge variant="warning" size="sm">
										{t("profile.unverified")}
									</Badge>
								)}
							</View>
						</View>
					</View>

					<Button
						variant="outline"
						fullWidth
						onPress={() => router.push("/(main)/profile/edit")}
						icon={
							<Ionicons name="pencil" size={16} color={Colors.primary[600]} />
						}
					>
						{t("profile.editProfile")}
					</Button>
				</Card>
			</Animated.View>

			{/* Stats */}
			<Animated.View
				entering={FadeInUp.delay(300).duration(500)}
				style={styles.statsContainer}
			>
				<View style={styles.statsRow}>
					<View
						style={[
							styles.statItem,
							{ backgroundColor: theme.surface.default },
							Shadows.sm,
						]}
					>
						<Ionicons
							name="shield-checkmark"
							size={24}
							color={Colors.success[500]}
						/>
						<Text style={[styles.statValue, { color: theme.text.primary }]}>
							{user.mfaEnabled ? t("profile.enabled") : t("profile.disabled")}
						</Text>
						<Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
							{t("profile.mfaStatus")}
						</Text>
					</View>
					<View
						style={[
							styles.statItem,
							{ backgroundColor: theme.surface.default },
							Shadows.sm,
						]}
					>
						<Ionicons name="time-outline" size={24} color={Colors.info[500]} />
						<Text style={[styles.statValue, { color: theme.text.primary }]}>
							{formatRelativeTime(user.lastLoginAt)}
						</Text>
						<Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
							{t("profile.lastLogin")}
						</Text>
					</View>
				</View>
			</Animated.View>

			{/* Menu Sections */}
			<Animated.View
				entering={FadeInUp.delay(400).duration(500)}
				style={styles.menuSection}
			>
				<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
					{t("profile.account")}
				</Text>
				<Card variant="elevated" padding={0}>
					<MenuItem
						icon="person-outline"
						label={t("profile.editProfile")}
						description={t("profile.updateInfo")}
						onPress={() => router.push("/(main)/profile/edit")}
					/>
					<View
						style={[
							styles.menuDivider,
							{ backgroundColor: theme.border.default },
						]}
					/>
					<MenuItem
						icon="shield-outline"
						label={t("settings.security")}
						description={t("profile.securityDesc")}
						onPress={() => router.push("/(main)/security")}
						badge={user.mfaEnabled ? undefined : t("profile.setupMfa")}
					/>
					<View
						style={[
							styles.menuDivider,
							{ backgroundColor: theme.border.default },
						]}
					/>
					<MenuItem
						icon="notifications-outline"
						label={t("settings.notifications")}
						description={t("profile.notificationsDesc")}
						onPress={() => router.push("/(main)/settings")}
					/>
				</Card>
			</Animated.View>

			<Animated.View
				entering={FadeInUp.delay(500).duration(500)}
				style={styles.menuSection}
			>
				<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
					{t("profile.preferences")}
				</Text>
				<Card variant="elevated" padding={0}>
					<MenuItem
						icon="color-palette-outline"
						label={t("settings.theme")}
						description={t("profile.themeDesc")}
						onPress={() => themeSheetRef.current?.present()}
					/>
					<View
						style={[
							styles.menuDivider,
							{ backgroundColor: theme.border.default },
						]}
					/>
					<MenuItem
						icon="language-outline"
						label={t("settings.language")}
						description={language === "fr" ? "Français" : language === "sw" ? "Kiswahili" : "English"}
						onPress={() => languageSheetRef.current?.present()}
					/>
					<View
						style={[
							styles.menuDivider,
							{ backgroundColor: theme.border.default },
						]}
					/>
					<MenuItem
						icon="notifications-outline"
						label={t("settings.notifications")}
						description={t("profile.notificationsDesc")}
						onPress={() => router.push("/(main)/settings")}
					/>
				</Card>
			</Animated.View>

			<Animated.View
				entering={FadeInUp.delay(600).duration(500)}
				style={styles.menuSection}
			>
				<Card variant="elevated" padding={0}>
					<MenuItem
						icon="log-out-outline"
						label={t("settings.logout")}
						onPress={handleLogout}
						danger
					/>
				</Card>
			</Animated.View>

			{/* Version */}
			<Animated.View
				entering={FadeIn.delay(700).duration(500)}
				style={styles.version}
			>
				<Text style={[styles.versionText, { color: theme.text.tertiary }]}>
					AuthX v1.0.0
				</Text>
			</Animated.View>

			<ThemeBottomSheet ref={themeSheetRef} />
			<LanguageBottomSheet ref={languageSheetRef} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: ScreenPadding.horizontal,
		marginBottom: Spacing.lg,
	},
	headerActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	headerTitle: {
		...Typography.h2,
	},
	profileCard: {
		paddingHorizontal: ScreenPadding.horizontal,
		marginBottom: Spacing.xl,
	},
	profileHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Spacing.xl,
	},
	profileInfo: {
		flex: 1,
		marginLeft: Spacing.lg,
	},
	profileName: {
		...Typography.h4,
		marginBottom: Spacing.xs,
	},
	profileEmail: {
		...Typography.bodySmall,
		marginBottom: Spacing.sm,
	},
	verificationBadge: {
		alignSelf: "flex-start",
	},
	statsContainer: {
		paddingHorizontal: ScreenPadding.horizontal,
		marginBottom: Spacing.xl,
	},
	statsRow: {
		flexDirection: "row",
		gap: Spacing.md,
	},
	statItem: {
		flex: 1,
		alignItems: "center",
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		gap: Spacing.xs,
	},
	statValue: {
		...Typography.h4,
		marginTop: Spacing.xs,
	},
	statLabel: {
		...Typography.caption,
	},
	menuSection: {
		paddingHorizontal: ScreenPadding.horizontal,
		marginBottom: Spacing.xl,
	},
	sectionTitle: {
		...Typography.label,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: Spacing.sm,
		marginLeft: Spacing.xs,
	},
	menuItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.lg,
		gap: Spacing.md,
	},
	menuItemPressed: {
		opacity: 0.7,
	},
	menuIcon: {
		width: 36,
		height: 36,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	menuContent: {
		flex: 1,
	},
	menuLabel: {
		...Typography.body,
		fontWeight: "500",
	},
	menuDescription: {
		...Typography.caption,
		marginTop: 2,
	},
	menuDivider: {
		height: 1,
		marginLeft: Spacing.lg + 36 + Spacing.md,
	},
	version: {
		alignItems: "center",
		marginTop: Spacing.xl,
	},
	versionText: {
		...Typography.caption,
	},
});
