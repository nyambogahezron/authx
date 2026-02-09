import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInUp, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	ScreenPadding,
	Spacing,
	Typography,
} from "@/constants/theme";
import {
	formatRelativeTime,
	getDeviceIcon,
	mockSessions,
	type Session,
} from "@/data/mock-sessions";
import { useTheme } from "@/hooks/use-theme-color";

function SessionCard({
	session,
	onRevoke,
}: {
	session: Session;
	onRevoke: (sessionId: string) => void;
}) {
	const theme = useTheme();

	return (
		<Animated.View layout={Layout.springify()}>
			<Card
				variant={session.isCurrent ? "filled" : "elevated"}
				padding="lg"
				style={[
					styles.sessionCard,
					session.isCurrent && {
						borderWidth: 2,
						borderColor: Colors.primary[500],
					},
				]}
			>
				<View style={styles.sessionHeader}>
					<View
						style={[
							styles.deviceIcon,
							{ backgroundColor: `${Colors.primary[500]}15` },
						]}
					>
						<Ionicons
							name={getDeviceIcon(session.deviceType) as any}
							size={24}
							color={Colors.primary[600]}
						/>
					</View>
					<View style={styles.sessionInfo}>
						<View style={styles.sessionNameRow}>
							<Text style={[styles.deviceName, { color: theme.text.primary }]}>
								{session.deviceName}
							</Text>
							{session.isCurrent && (
								<Badge variant="primary" size="sm">
									Current
								</Badge>
							)}
							{session.isTrusted && !session.isCurrent && (
								<Badge variant="success" size="sm">
									Trusted
								</Badge>
							)}
						</View>
						<Text style={[styles.browserInfo, { color: theme.text.secondary }]}>
							{session.browser} · {session.os}
						</Text>
					</View>
				</View>

				<View
					style={[styles.sessionDetails, { borderColor: theme.border.default }]}
				>
					<View style={styles.detailRow}>
						<Ionicons name="location-outline" size={16} color={theme.icon} />
						<Text style={[styles.detailText, { color: theme.text.tertiary }]}>
							{session.location}
						</Text>
					</View>
					<View style={styles.detailRow}>
						<Ionicons name="globe-outline" size={16} color={theme.icon} />
						<Text style={[styles.detailText, { color: theme.text.tertiary }]}>
							{session.ip}
						</Text>
					</View>
					<View style={styles.detailRow}>
						<Ionicons name="time-outline" size={16} color={theme.icon} />
						<Text style={[styles.detailText, { color: theme.text.tertiary }]}>
							Active {formatRelativeTime(session.lastActive)}
						</Text>
					</View>
				</View>

				{!session.isCurrent && (
					<Button
						variant="outline"
						size="sm"
						onPress={() => onRevoke(session.id)}
						icon={
							<Ionicons
								name="log-out-outline"
								size={16}
								color={Colors.error[500]}
							/>
						}
						style={styles.revokeButton}
						textStyle={{ color: Colors.error[500] }}
					>
						Revoke Session
					</Button>
				)}
			</Card>
		</Animated.View>
	);
}

export default function SessionsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const [sessions, setSessions] = useState(mockSessions);

	const handleRevokeSession = useCallback((sessionId: string) => {
		Alert.alert(
			"Revoke Session",
			"Are you sure you want to sign out of this session?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Revoke",
					style: "destructive",
					onPress: () => {
						setSessions((prev) => prev.filter((s) => s.id !== sessionId));
					},
				},
			],
		);
	}, []);

	const handleRevokeAll = useCallback(() => {
		Alert.alert(
			"Sign Out All Devices",
			"This will sign you out of all devices except this one. Continue?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Sign Out All",
					style: "destructive",
					onPress: () => {
						setSessions((prev) => prev.filter((s) => s.isCurrent));
					},
				},
			],
		);
	}, []);

	const otherSessions = sessions.filter((s) => !s.isCurrent);

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
					Active Sessions
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
				{/* Info Banner */}
				<Animated.View
					entering={FadeIn.delay(100).duration(500)}
					style={styles.infoBanner}
				>
					<View
						style={[
							styles.infoCard,
							{ backgroundColor: `${Colors.info[500]}10` },
						]}
					>
						<Ionicons
							name="information-circle"
							size={20}
							color={Colors.info[600]}
						/>
						<Text style={[styles.infoText, { color: Colors.info[700] }]}>
							You have {sessions.length} active session
							{sessions.length !== 1 ? "s" : ""}.{"\n"}Revoke any session you
							don't recognize.
						</Text>
					</View>
				</Animated.View>

				{/* Current Session */}
				<Animated.View
					entering={FadeInUp.delay(200).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						This Device
					</Text>
					{sessions
						.filter((s) => s.isCurrent)
						.map((session) => (
							<SessionCard
								key={session.id}
								session={session}
								onRevoke={handleRevokeSession}
							/>
						))}
				</Animated.View>

				{/* Other Sessions */}
				{otherSessions.length > 0 && (
					<Animated.View
						entering={FadeInUp.delay(300).duration(500)}
						style={styles.section}
					>
						<View style={styles.sectionHeader}>
							<Text
								style={[styles.sectionTitle, { color: theme.text.secondary }]}
							>
								Other Sessions ({otherSessions.length})
							</Text>
							<Pressable onPress={handleRevokeAll}>
								<Text
									style={[styles.revokeAllText, { color: Colors.error[600] }]}
								>
									Sign Out All
								</Text>
							</Pressable>
						</View>
						{otherSessions.map((session, index) => (
							<Animated.View
								key={session.id}
								entering={FadeInUp.delay(350 + index * 50).duration(500)}
							>
								<SessionCard session={session} onRevoke={handleRevokeSession} />
							</Animated.View>
						))}
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
	infoBanner: {
		marginBottom: Spacing.xl,
	},
	infoCard: {
		flexDirection: "row",
		alignItems: "flex-start",
		padding: Spacing.md,
		borderRadius: BorderRadius.lg,
		gap: Spacing.sm,
	},
	infoText: {
		...Typography.bodySmall,
		flex: 1,
		lineHeight: 20,
	},
	section: {
		marginBottom: Spacing.xl,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: Spacing.sm,
	},
	sectionTitle: {
		...Typography.label,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: Spacing.sm,
		marginLeft: Spacing.xs,
	},
	revokeAllText: {
		...Typography.bodySmall,
		fontWeight: "600",
	},
	sessionCard: {
		marginBottom: Spacing.md,
	},
	sessionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
		marginBottom: Spacing.md,
	},
	deviceIcon: {
		width: 48,
		height: 48,
		borderRadius: BorderRadius.lg,
		alignItems: "center",
		justifyContent: "center",
	},
	sessionInfo: {
		flex: 1,
	},
	sessionNameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
		flexWrap: "wrap",
	},
	deviceName: {
		...Typography.body,
		fontWeight: "600",
	},
	browserInfo: {
		...Typography.bodySmall,
		marginTop: 2,
	},
	sessionDetails: {
		borderTopWidth: 1,
		paddingTop: Spacing.md,
		gap: Spacing.sm,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	detailText: {
		...Typography.caption,
	},
	revokeButton: {
		marginTop: Spacing.md,
		borderColor: Colors.error[300],
	},
});
