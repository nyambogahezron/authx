import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	FlatList,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/ui/badge";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import { type ConnectedApp, mockConnectedApps } from "@/data/mock-apps";
import { useTheme } from "@/hooks/use-theme-color";

export default function ConnectedAppsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		// Simulate refresh
		setTimeout(() => {
			setRefreshing(false);
		}, 1000);
	}, []);

	const renderItem = useCallback(
		({ item, index }: { item: ConnectedApp; index: number }) => (
			<Link href={`./apps/${item.id}`} asChild>
				<Pressable
					style={({ pressed }) => [
						styles.item,
						{
							backgroundColor: theme.surface.default,
							borderColor: theme.border.subtle,
						},
						pressed && { opacity: 0.7 },
					]}
				>
					<View
						style={[
							styles.appIcon,
							{ backgroundColor: `${Colors.primary[500]}10` },
						]}
					>
						<Ionicons
							name={item.icon as keyof typeof Ionicons.glyphMap}
							size={24}
							color={Colors.primary[600]}
						/>
					</View>

					<View style={styles.itemContent}>
						<View style={styles.nameRow}>
							<Text style={[styles.appName, { color: theme.text.primary }]}>
								{item.name}
							</Text>
							{item.isVerified && (
								<Badge variant="success" size="sm">
									Verified
								</Badge>
							)}
						</View>
						<Text
							style={[styles.appDescription, { color: theme.text.secondary }]}
							numberOfLines={1}
						>
							{item.description}
						</Text>
						<Text style={[styles.connectedAt, { color: theme.text.tertiary }]}>
							Connected {item.connectedAt.toLocaleDateString()}
						</Text>
					</View>

					<Ionicons name="chevron-forward" size={20} color={theme.icon} />
				</Pressable>
			</Link>
		),
		[theme],
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
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={theme.text.primary} />
				</Pressable>
				<Text style={[styles.headerTitle, { color: theme.text.primary }]}>
					Connected Apps
				</Text>
				<View style={styles.headerSpacer} />
			</View>

			<FlatList
				data={mockConnectedApps}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				contentContainerStyle={[
					styles.listContent,
					{ paddingBottom: insets.bottom + Spacing.xl },
				]}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={theme.tint}
					/>
				}
				ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Text style={[styles.emptyText, { color: theme.text.secondary }]}>
							No connected applications.
						</Text>
					</View>
				}
			/>
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
	headerSpacer: {
		width: 40,
	},
	listContent: {
		padding: ScreenPadding.horizontal,
	},
	item: {
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.md,
		borderRadius: BorderRadius.lg,
		borderWidth: 1,
		gap: Spacing.md,
	},
	appIcon: {
		width: 48,
		height: 48,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	itemContent: {
		flex: 1,
		gap: 2,
	},
	nameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs,
	},
	appName: {
		...Typography.body,
		fontWeight: "600",
	},
	appDescription: {
		...Typography.caption,
	},
	connectedAt: {
		fontSize: 11,
		marginTop: 2,
	},
	emptyState: {
		padding: Spacing.xl,
		alignItems: "center",
	},
	emptyText: {
		...Typography.body,
	},
});
