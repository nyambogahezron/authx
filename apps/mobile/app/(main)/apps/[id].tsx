import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import { type AppScope, getAppById } from "@/data/mock-apps";
import { formatRelativeTime } from "@/data/mock-sessions";
import { useTheme } from "@/hooks/use-theme-color";

interface ScopeItemProps {
	scope: AppScope;
	index: number;
}

function ScopeItem({ scope, index }: ScopeItemProps) {
	const theme = useTheme();

	return (
		<Animated.View
			entering={FadeInUp.delay(100 + index * 50).duration(400)}
			style={[styles.scopeItem, { backgroundColor: theme.surface.default }]}
		>
			<View style={styles.scopeIconContainer}>
				<Ionicons
					name="checkmark-circle"
					size={20}
					color={Colors.success[500]}
				/>
			</View>
			<View style={styles.scopeInfo}>
				<Text style={[styles.scopeName, { color: theme.text.primary }]}>
					{scope.name}
				</Text>
				<Text
					style={[styles.scopeDescription, { color: theme.text.secondary }]}
				>
					{scope.description}
				</Text>
			</View>
		</Animated.View>
	);
}

export default function AppDetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const [revoking, setRevoking] = useState(false);

	const app = getAppById(id);

	const handleRevoke = useCallback(() => {
		Alert.alert(
			"Revoke Access",
			`Are you sure you want to revoke ${app?.name}'s access to your account? This app will no longer be able to access your data.`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Revoke",
					style: "destructive",
					onPress: async () => {
						setRevoking(true);
						// Simulate API call
						await new Promise((resolve) => setTimeout(resolve, 1500));
						setRevoking(false);
						Alert.alert(
							"Access Revoked",
							`${app?.name} can no longer access your account.`,
						);
						router.back();
					},
				},
			],
		);
	}, [app, router]);

	if (!app) {
		return (
			<View
				style={[
					styles.container,
					{ backgroundColor: theme.background.primary },
				]}
			>
				<View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
					<Pressable onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color={theme.text.primary} />
					</Pressable>
					<Text style={[styles.headerTitle, { color: theme.text.primary }]}>
						App Not Found
					</Text>
					<View style={styles.headerSpacer} />
				</View>
				<View style={styles.errorState}>
					<Ionicons
						name="warning-outline"
						size={64}
						color={theme.text.tertiary}
					/>
					<Text style={[styles.errorText, { color: theme.text.secondary }]}>
						This app could not be found.
					</Text>
				</View>
			</View>
		);
	}

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
					App Details
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
			>
				{/* App Info */}
				<Animated.View
					entering={FadeIn.delay(100).duration(500)}
					style={styles.appInfoSection}
				>
					<View
						style={[
							styles.appIconLarge,
							{ backgroundColor: `${Colors.primary[500]}15` },
						]}
					>
						<Ionicons
							name={app.icon as keyof typeof Ionicons.glyphMap}
							size={48}
							color={Colors.primary[500]}
						/>
					</View>

					<View style={styles.appTitleRow}>
						<Text style={[styles.appName, { color: theme.text.primary }]}>
							{app.name}
						</Text>
						{app.isVerified && (
							<Badge variant="success" size="sm">
								Verified
							</Badge>
						)}
					</View>

					<Text
						style={[styles.appDescription, { color: theme.text.secondary }]}
					>
						{app.description}
					</Text>

					<Text style={[styles.appWebsite, { color: Colors.primary[600] }]}>
						{app.website}
					</Text>
				</Animated.View>

				{/* Connection Info */}
				<Animated.View
					entering={FadeInUp.delay(200).duration(500)}
					style={[styles.infoCard, { backgroundColor: theme.surface.default }]}
				>
					<View style={styles.infoRow}>
						<Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>
							Connected
						</Text>
						<Text style={[styles.infoValue, { color: theme.text.primary }]}>
							{app.connectedAt.toLocaleDateString()}
						</Text>
					</View>
					<View
						style={[styles.divider, { backgroundColor: theme.border.default }]}
					/>
					<View style={styles.infoRow}>
						<Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>
							Last Used
						</Text>
						<Text style={[styles.infoValue, { color: theme.text.primary }]}>
							{formatRelativeTime(app.lastUsed)}
						</Text>
					</View>
				</Animated.View>

				{/* Permissions */}
				<View style={styles.section}>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						Permissions Granted
					</Text>
					<View style={styles.scopesList}>
						{app.scopes.map((scope, index) => (
							<ScopeItem key={scope.id} scope={scope} index={index} />
						))}
					</View>
				</View>

				{/* Warning Banner */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(500)}
					style={[
						styles.warningBanner,
						{ backgroundColor: `${Colors.warning[500]}15` },
					]}
				>
					<Ionicons
						name="alert-circle-outline"
						size={20}
						color={Colors.warning[700]}
					/>
					<Text style={[styles.warningText, { color: Colors.warning[700] }]}>
						Revoking access will sign you out of {app.name} and prevent future
						logins until you reconnect.
					</Text>
				</Animated.View>

				{/* Revoke Button */}
				<Animated.View entering={FadeInUp.delay(500).duration(500)}>
					<Button
						variant="danger"
						fullWidth
						onPress={handleRevoke}
						loading={revoking}
					>
						Revoke Access
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
	headerSpacer: {
		width: 40,
	},
	scrollView: {
		flex: 1,
	},
	content: {
		paddingHorizontal: ScreenPadding.horizontal,
	},
	errorState: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.md,
	},
	errorText: {
		...Typography.body,
	},
	appInfoSection: {
		alignItems: "center",
		marginBottom: Spacing.xl,
	},
	appIconLarge: {
		width: 88,
		height: 88,
		borderRadius: BorderRadius.xl,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing.lg,
	},
	appTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
		marginBottom: Spacing.xs,
	},
	appName: {
		...Typography.h3,
	},
	appDescription: {
		...Typography.body,
		textAlign: "center",
		marginBottom: Spacing.xs,
	},
	appWebsite: {
		...Typography.bodySmall,
	},
	infoCard: {
		padding: Spacing.lg,
		borderRadius: BorderRadius.lg,
		marginBottom: Spacing.xl,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	infoLabel: {
		...Typography.bodySmall,
	},
	infoValue: {
		...Typography.bodySmall,
		fontWeight: "600",
	},
	divider: {
		height: 1,
		marginVertical: Spacing.md,
	},
	section: {
		marginBottom: Spacing.xl,
	},
	sectionTitle: {
		...Typography.label,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: Spacing.md,
	},
	scopesList: {
		gap: Spacing.sm,
	},
	scopeItem: {
		flexDirection: "row",
		alignItems: "flex-start",
		padding: Spacing.md,
		borderRadius: BorderRadius.md,
		gap: Spacing.md,
	},
	scopeIconContainer: {
		marginTop: 2,
	},
	scopeInfo: {
		flex: 1,
	},
	scopeName: {
		...Typography.body,
		fontWeight: "600",
		marginBottom: 2,
	},
	scopeDescription: {
		...Typography.bodySmall,
	},
	warningBanner: {
		flexDirection: "row",
		alignItems: "flex-start",
		padding: Spacing.md,
		borderRadius: BorderRadius.lg,
		marginBottom: Spacing.lg,
		gap: Spacing.sm,
	},
	warningText: {
		...Typography.bodySmall,
		flex: 1,
		lineHeight: 20,
	},
});
