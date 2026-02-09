import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import {
	type ConnectedApp,
	formatScopeNames,
	mockConnectedApps,
} from "@/data/mock-apps";
import { formatRelativeTime } from "@/data/mock-sessions";
import { useTheme } from "@/hooks/use-theme-color";

interface AppItemProps {
	app: ConnectedApp;
	onPress: () => void;
	index: number;
}

function AppItem({ app, onPress, index }: AppItemProps) {
	const theme = useTheme();
	const { t } = useTranslation();

	return (
		<Animated.View entering={FadeInUp.delay(100 * index).duration(400)}>
			<Pressable
				style={({ pressed }) => [
					styles.appItem,
					{ backgroundColor: theme.surface.default },
					pressed && styles.appItemPressed,
				]}
				onPress={onPress}
			>
				<View
					style={[
						styles.appIconContainer,
						{ backgroundColor: `${Colors.primary[500]}15` },
					]}
				>
					<Ionicons
						name={app.icon as keyof typeof Ionicons.glyphMap}
						size={28}
						color={Colors.primary[500]}
					/>
				</View>

				<View style={styles.appInfo}>
					<View style={styles.appHeader}>
						<Text style={[styles.appName, { color: theme.text.primary }]}>
							{app.name}
						</Text>
						{app.isVerified && (
							<Ionicons
								name="checkmark-circle"
								size={16}
								color={Colors.primary[500]}
							/>
						)}
					</View>
					<Text
						style={[styles.appScopes, { color: theme.text.secondary }]}
						numberOfLines={1}
					>
						{formatScopeNames(app.scopes)}
					</Text>
					<Text style={[styles.appLastUsed, { color: theme.text.tertiary }]}>
						{t("apps.lastUsed")} {formatRelativeTime(app.lastUsed)}
					</Text>
				</View>

				<Ionicons
					name="chevron-forward"
					size={20}
					color={theme.text.tertiary}
				/>
			</Pressable>
		</Animated.View>
	);
}

export default function AppsTabScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { t } = useTranslation();
	const [refreshing, setRefreshing] = useState(false);
	const [apps, setApps] = useState(mockConnectedApps);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setApps(mockConnectedApps);
		setRefreshing(false);
	}, []);

	const handleAppPress = useCallback(
		(appId: string) => {
			router.push(`/(main)/apps/${appId}`);
		},
		[router],
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
				<Text style={[styles.headerTitle, { color: theme.text.primary }]}>
					{t("apps.title")}
				</Text>
			</View>

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
						onRefresh={onRefresh}
						tintColor={Colors.primary[500]}
					/>
				}
			>
				{/* Info Banner */}
				<Animated.View
					entering={FadeIn.delay(100).duration(500)}
					style={[
						styles.infoBanner,
						{ backgroundColor: `${Colors.primary[500]}10` },
					]}
				>
					<Ionicons
						name="information-circle-outline"
						size={20}
						color={Colors.primary[600]}
					/>
					<Text style={[styles.infoText, { color: Colors.primary[700] }]}>
						{t("apps.banner")}
					</Text>
				</Animated.View>

				{/* Apps Count */}
				<View style={styles.sectionHeader}>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						{apps.length} {t("apps.connectedApps")}
					</Text>
				</View>

				{/* Apps List */}
				{apps.length > 0 ? (
					<View style={styles.appsList}>
						{apps.map((app, index) => (
							<AppItem
								key={app.id}
								app={app}
								onPress={() => handleAppPress(app.id)}
								index={index}
							/>
						))}
					</View>
				) : (
					<Animated.View
						entering={FadeIn.delay(200).duration(500)}
						style={styles.emptyState}
					>
						<Ionicons
							name="apps-outline"
							size={64}
							color={theme.text.tertiary}
						/>
						<Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
							{t("apps.noApps")}
						</Text>
						<Text style={[styles.emptyText, { color: theme.text.secondary }]}>
							{t("apps.noAppsDesc")}
						</Text>
					</Animated.View>
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
		paddingHorizontal: ScreenPadding.horizontal,
		paddingBottom: Spacing.md,
	},
	headerTitle: {
		...Typography.h2,
	},
	scrollView: {
		flex: 1,
	},
	content: {
		paddingHorizontal: ScreenPadding.horizontal,
	},
	infoBanner: {
		flexDirection: "row",
		alignItems: "flex-start",
		padding: Spacing.md,
		borderRadius: BorderRadius.lg,
		marginBottom: Spacing.xl,
		gap: Spacing.sm,
	},
	infoText: {
		...Typography.bodySmall,
		flex: 1,
		lineHeight: 20,
	},
	sectionHeader: {
		marginBottom: Spacing.md,
	},
	sectionTitle: {
		...Typography.label,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	appsList: {
		gap: Spacing.sm,
	},
	appItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		gap: Spacing.md,
	},
	appItemPressed: {
		opacity: 0.7,
	},
	appIconContainer: {
		width: 52,
		height: 52,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	appInfo: {
		flex: 1,
		gap: 2,
	},
	appHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs,
	},
	appName: {
		...Typography.body,
		fontWeight: "600",
	},
	appScopes: {
		...Typography.bodySmall,
	},
	appLastUsed: {
		...Typography.caption,
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: Spacing["4xl"],
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
