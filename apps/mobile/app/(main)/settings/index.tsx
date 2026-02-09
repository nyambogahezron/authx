import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	useColorScheme,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LanguageBottomSheet } from "@/components/settings/language-sheet";
import { ThemeBottomSheet } from "@/components/settings/theme-sheet";
import type { BottomSheetRef } from "@/components/ui/bottom-sheet";
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import { languages, mockPreferences } from "@/data/mock-preferences";
import { useTheme } from "@/hooks/use-theme-color";
import { useLanguageStore } from "@/stores/language-store";
import { useThemeStore } from "@/stores/theme-store";

interface SettingItemProps {
	icon: keyof typeof Ionicons.glyphMap;
	title: string;
	description?: string;
	value?: string;
	enabled?: boolean;
	onToggle?: (value: boolean) => void;
	onPress?: () => void;
	showChevron?: boolean;
}

function SettingItem({
	icon,
	title,
	description,
	value,
	enabled,
	onToggle,
	onPress,
	showChevron,
}: SettingItemProps) {
	const theme = useTheme();

	const content = (
		<>
			<View
				style={[
					styles.itemIcon,
					{ backgroundColor: `${Colors.primary[500]}15` },
				]}
			>
				<Ionicons name={icon} size={20} color={Colors.primary[600]} />
			</View>
			<View style={styles.itemContent}>
				<Text style={[styles.itemTitle, { color: theme.text.primary }]}>
					{title}
				</Text>
				{description && (
					<Text
						style={[styles.itemDescription, { color: theme.text.tertiary }]}
					>
						{description}
					</Text>
				)}
			</View>
			{value && (
				<Text style={[styles.itemValue, { color: theme.text.secondary }]}>
					{value}
				</Text>
			)}
			{onToggle !== undefined && (
				<Switch
					value={enabled}
					onValueChange={onToggle}
					trackColor={{ false: Colors.gray[300], true: Colors.primary[500] }}
					thumbColor={Colors.white}
				/>
			)}
			{showChevron && (
				<Ionicons name="chevron-forward" size={20} color={theme.icon} />
			)}
		</>
	);

	if (onPress) {
		return (
			<Pressable
				style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
				onPress={onPress}
			>
				{content}
			</Pressable>
		);
	}

	return <View style={styles.item}>{content}</View>;
}

export default function SettingsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const systemColorScheme = useColorScheme();
	const { theme: activeTheme } = useThemeStore();
	const { language } = useLanguageStore();
	const { t } = useTranslation();

	const themeSheetRef = useRef<BottomSheetRef>(null);
	const languageSheetRef = useRef<BottomSheetRef>(null);

	const [preferences, setPreferences] = useState(mockPreferences);

	const updatePreference = useCallback((path: string, value: any) => {
		setPreferences((prev) => {
			const newPrefs = { ...prev };
			const keys = path.split(".");
			let obj: any = newPrefs;
			for (let i = 0; i < keys.length - 1; i++) {
				obj = obj[keys[i]];
			}
			obj[keys[keys.length - 1]] = value;
			return newPrefs;
		});
	}, []);

	const handleThemeChange = useCallback(() => {
		themeSheetRef.current?.present();
	}, []);

	const handleLanguageChange = useCallback(() => {
		languageSheetRef.current?.present();
	}, []);

	const themeLabel =
		activeTheme === "system"
			? `${t("common.system")} (${systemColorScheme === "dark" ? t("common.dark") : t("common.light")})`
			: activeTheme === "dark"
				? t("common.dark")
				: t("common.light");

	const currentLanguage = languages.find((l) => l.code === language);

	return (
		<View
			style={[styles.container, { backgroundColor: theme.background.primary }]}
		>
			{/* Header */}
			<View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={theme.text.primary} />
				</Pressable>
				<Text style={[styles.headerTitle, { color: theme.text.primary }]}>
					{t("settings.title")}
				</Text>
				<View style={styles.headerSpacer} />
			</View>

			<ScrollView
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: insets.bottom + Spacing.xl },
				]}
				showsVerticalScrollIndicator={false}
			>
				{/* Appearance */}
				<Animated.View
					entering={FadeIn.delay(100).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						{t("settings.theme")}
					</Text>
					<Card variant="elevated" padding={0}>
						<SettingItem
							icon="color-palette-outline"
							title={t("settings.theme")}
							value={themeLabel}
							onPress={handleThemeChange}
							showChevron
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SettingItem
							icon="language-outline"
							title={t("settings.language")}
							value={
								currentLanguage
									? `${currentLanguage.flag} ${currentLanguage.name}`
									: "English"
							}
							onPress={handleLanguageChange}
							showChevron
						/>
					</Card>
				</Animated.View>

				{/* Notifications */}
				<Animated.View
					entering={FadeInUp.delay(200).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						{t("settings.notifications")}
					</Text>
					<Card variant="elevated" padding={0}>
						<SettingItem
							icon="notifications-outline"
							title={t("settings.pushNotifications")}
							description={t("settings.pushDescription")}
							enabled={preferences.notifications.push}
							onToggle={(v) => updatePreference("notifications.push", v)}
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SettingItem
							icon="mail-outline"
							title={t("settings.emailNotifications")}
							description={t("settings.emailDescription")}
							enabled={preferences.notifications.email}
							onToggle={(v) => updatePreference("notifications.email", v)}
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SettingItem
							icon="megaphone-outline"
							title={t("settings.marketingEmails")}
							description={t("settings.marketingDescription")}
							enabled={preferences.notifications.marketing}
							onToggle={(v) => updatePreference("notifications.marketing", v)}
						/>
					</Card>
				</Animated.View>

				{/* Privacy */}
				<Animated.View
					entering={FadeInUp.delay(300).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						{t("settings.privacy")}
					</Text>
					<Card variant="elevated" padding={0}>
						<SettingItem
							icon="eye-outline"
							title={t("settings.onlineStatus")}
							description={t("settings.onlineDescription")}
							enabled={preferences.privacy.showOnlineStatus}
							onToggle={(v) => updatePreference("privacy.showOnlineStatus", v)}
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SettingItem
							icon="time-outline"
							title={t("settings.lastSeen")}
							description={t("settings.lastSeenDescription")}
							enabled={preferences.privacy.showLastSeen}
							onToggle={(v) => updatePreference("privacy.showLastSeen", v)}
						/>
					</Card>
				</Animated.View>

				{/* About */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						{t("settings.about")}
					</Text>
					<Card variant="elevated" padding={0}>
						<SettingItem
							icon="document-text-outline"
							title={t("settings.terms")}
							onPress={() => Alert.alert(t("settings.alertTerms"), t("settings.alertTermsDesc"))}
							showChevron
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SettingItem
							icon="shield-outline"
							title={t("settings.privacyPolicy")}
							onPress={() => Alert.alert(t("settings.alertPrivacy"), t("settings.alertPrivacyDesc"))}
							showChevron
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SettingItem
							icon="help-circle-outline"
							title={t("settings.helpSupport")}
							onPress={() => Alert.alert(t("settings.alertSupport"), t("settings.alertSupportDesc"))}
							showChevron
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SettingItem
							icon="information-circle-outline"
							title={t("settings.version")}
							value="1.0.0 (Build 1)"
						/>
					</Card>
				</Animated.View>
			</ScrollView>

			<ThemeBottomSheet ref={themeSheetRef} />
			<LanguageBottomSheet ref={languageSheetRef} />
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
	},
	headerTitle: {
		...Typography.h3,
		flex: 1,
		textAlign: "center",
	},
	headerSpacer: {
		width: 40,
	},
	content: {
		paddingHorizontal: ScreenPadding.horizontal,
	},
	section: {
		marginBottom: Spacing.xl,
	},
	sectionTitle: {
		...Typography.label,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: Spacing.sm,
		marginLeft: Spacing.xs,
	},
	item: {
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.lg,
		gap: Spacing.md,
	},
	itemPressed: {
		opacity: 0.7,
	},
	itemIcon: {
		width: 36,
		height: 36,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	itemContent: {
		flex: 1,
	},
	itemTitle: {
		...Typography.body,
		fontWeight: "500",
	},
	itemDescription: {
		...Typography.caption,
		marginTop: 2,
	},
	itemValue: {
		...Typography.bodySmall,
	},
	divider: {
		height: 1,
		marginLeft: Spacing.lg + 36 + Spacing.md,
	},
});
