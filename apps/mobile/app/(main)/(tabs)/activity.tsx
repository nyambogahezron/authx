import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/ui/badge";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import {
	type Authorization,
	getActionColor,
	getActionDisplayName,
	getActionIcon,
	mockAuthorizations,
} from "@/data/mock-authorizations";
import { formatRelativeTime } from "@/data/mock-sessions";
import { useTheme } from "@/hooks/use-theme-color";

interface AuthItemProps {
	auth: Authorization;
	index: number;
}

function AuthItem({ auth, index }: AuthItemProps) {
	const theme = useTheme();
	const { t } = useTranslation();
	const iconColor = getActionColor(auth.action, auth.success);

	return (
		<Animated.View
			entering={FadeInUp.delay(50 * index).duration(400)}
			style={[styles.authItem, { backgroundColor: theme.surface.default }]}
		>
			<View
				style={[
					styles.authIconContainer,
					{ backgroundColor: `${iconColor}15` },
				]}
			>
				<Ionicons
					name={getActionIcon(auth.action) as keyof typeof Ionicons.glyphMap}
					size={20}
					color={iconColor}
				/>
			</View>

			<View style={styles.authContent}>
				<View style={styles.authHeader}>
					<Text style={[styles.authAction, { color: theme.text.primary }]}>
						{getActionDisplayName(auth.action)}
					</Text>
					{!auth.success && (
						<Badge variant="error" size="sm">
							{t("activity.failed")}
						</Badge>
					)}
				</View>

				<Text style={[styles.authDescription, { color: theme.text.secondary }]}>
					{auth.description}
				</Text>

				<View style={styles.authMeta}>
					<Ionicons
						name="location-outline"
						size={12}
						color={theme.text.tertiary}
					/>
					<Text style={[styles.authMetaText, { color: theme.text.tertiary }]}>
						{auth.location}
					</Text>
					<Text style={[styles.authMetaDot, { color: theme.text.tertiary }]}>
						•
					</Text>
					<Ionicons name="time-outline" size={12} color={theme.text.tertiary} />
					<Text style={[styles.authMetaText, { color: theme.text.tertiary }]}>
						{formatRelativeTime(auth.timestamp)}
					</Text>
				</View>
			</View>
		</Animated.View>
	);
}

export default function ActivityTabScreen() {
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { t } = useTranslation();
	const [refreshing, setRefreshing] = useState(false);
	const [authorizations, setAuthorizations] = useState(mockAuthorizations);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setAuthorizations(mockAuthorizations);
		setRefreshing(false);
	}, []);

	// Group by date
	const groupedAuth = authorizations.reduce(
		(acc, auth) => {
			const dateKey = auth.timestamp.toLocaleDateString("en-US", {
				weekday: "long",
				month: "short",
				day: "numeric",
			});
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}
			acc[dateKey].push(auth);
			return acc;
		},
		{} as Record<string, Authorization[]>,
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
					{t("activity.title")}
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
						name="shield-checkmark-outline"
						size={20}
						color={Colors.primary[600]}
					/>
					<Text style={[styles.infoText, { color: Colors.primary[700] }]}>
						{t("activity.banner")}
					</Text>
				</Animated.View>

				{/* Grouped Activity */}
				{Object.entries(groupedAuth).map(([date, items], groupIndex) => (
					<View key={date} style={styles.dateGroup}>
						<Text style={[styles.dateHeader, { color: theme.text.secondary }]}>
							{date}
						</Text>
						<View style={styles.authList}>
							{items.map((auth, index) => (
								<AuthItem
									key={auth.id}
									auth={auth}
									index={groupIndex * 3 + index}
								/>
							))}
						</View>
					</View>
				))}

				{authorizations.length === 0 && (
					<Animated.View
						entering={FadeIn.delay(200).duration(500)}
						style={styles.emptyState}
					>
						<Ionicons
							name="document-text-outline"
							size={64}
							color={theme.text.tertiary}
						/>
						<Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
							{t("activity.noActivity")}
						</Text>
						<Text style={[styles.emptyText, { color: theme.text.secondary }]}>
							{t("activity.noActivityDesc")}
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
	dateGroup: {
		marginBottom: Spacing.xl,
	},
	dateHeader: {
		...Typography.label,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: Spacing.md,
	},
	authList: {
		gap: Spacing.sm,
	},
	authItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		gap: Spacing.md,
	},
	authIconContainer: {
		width: 40,
		height: 40,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	authContent: {
		flex: 1,
	},
	authHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
		marginBottom: 2,
	},
	authAction: {
		...Typography.body,
		fontWeight: "600",
	},
	authDescription: {
		...Typography.bodySmall,
		marginBottom: Spacing.xs,
	},
	authMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	authMetaText: {
		...Typography.caption,
	},
	authMetaDot: {
		...Typography.caption,
		marginHorizontal: 2,
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
	},
});
