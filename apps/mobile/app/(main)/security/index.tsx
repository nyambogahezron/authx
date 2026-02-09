import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
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
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore, useUser } from "@/stores";

interface SecurityItemProps {
	icon: keyof typeof Ionicons.glyphMap;
	title: string;
	description: string;
	enabled?: boolean;
	onToggle?: (value: boolean) => void;
	onPress?: () => void;
	showChevron?: boolean;
	badge?: string;
}

function SecurityItem({
	icon,
	title,
	description,
	enabled,
	onToggle,
	onPress,
	showChevron,
	badge,
}: SecurityItemProps) {
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
				<View style={styles.itemHeader}>
					<Text style={[styles.itemTitle, { color: theme.text.primary }]}>
						{title}
					</Text>
					{badge && (
						<Badge variant="success" size="sm">
							{badge}
						</Badge>
					)}
				</View>
				<Text style={[styles.itemDescription, { color: theme.text.tertiary }]}>
					{description}
				</Text>
			</View>
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

export default function SecurityScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { enableMFA, disableMFA } = useAuthStore();
	const user = useUser();

	const [mfaTotp, setMfaTotp] = useState(
		user?.mfaMethods.includes("totp") || false,
	);
	const [mfaEmail, setMfaEmail] = useState(
		user?.mfaMethods.includes("email") || false,
	);
	const [biometric, setBiometric] = useState(false);

	const handleToggleTOTP = useCallback(
		async (value: boolean) => {
			try {
				if (value) {
					const _result = await enableMFA("totp");
					setMfaTotp(true);
					Alert.alert(
						"MFA Enabled",
						"Authenticator app MFA has been enabled. Scan the QR code in your authenticator app.",
					);
				} else {
					await disableMFA("totp");
					setMfaTotp(false);
				}
			} catch (_error) {
				Alert.alert("Error", "Failed to update MFA settings");
			}
		},
		[enableMFA, disableMFA],
	);

	const handleToggleEmailMFA = useCallback(
		async (value: boolean) => {
			try {
				if (value) {
					await enableMFA("email");
					setMfaEmail(true);
				} else {
					await disableMFA("email");
					setMfaEmail(false);
				}
			} catch (_error) {
				Alert.alert("Error", "Failed to update email MFA settings");
			}
		},
		[enableMFA, disableMFA],
	);

	const handleToggleBiometric = useCallback((value: boolean) => {
		setBiometric(value);
		if (value) {
			Alert.alert("Biometric", "Biometric authentication enabled");
		}
	}, []);

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
					Security
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
				{/* Security Score */}
				<Animated.View
					entering={FadeIn.delay(100).duration(500)}
					style={styles.scoreSection}
				>
					<Card variant="elevated">
						<View style={styles.scoreHeader}>
							<View style={styles.scoreCircle}>
								<Text style={styles.scoreValue}>
									{mfaTotp || mfaEmail ? 85 : 60}
								</Text>
								<Text style={styles.scoreLabel}>Score</Text>
							</View>
							<View style={styles.scoreInfo}>
								<Text
									style={[styles.scoreTitle, { color: theme.text.primary }]}
								>
									{mfaTotp || mfaEmail ? "Strong Security" : "Good Security"}
								</Text>
								<Text
									style={[
										styles.scoreDescription,
										{ color: theme.text.secondary },
									]}
								>
									{mfaTotp || mfaEmail
										? "Your account is well protected with MFA enabled."
										: "Enable MFA to improve your security score."}
								</Text>
							</View>
						</View>
					</Card>
				</Animated.View>

				{/* Password */}
				<Animated.View
					entering={FadeInUp.delay(200).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						Password
					</Text>
					<Card variant="elevated" padding={0}>
						<SecurityItem
							icon="key-outline"
							title="Change Password"
							description="Last changed 30 days ago"
							onPress={() => router.push("/(main)/security/change-password")}
							showChevron
						/>
					</Card>
				</Animated.View>

				{/* Two-Factor Authentication */}
				<Animated.View
					entering={FadeInUp.delay(300).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						Two-Factor Authentication
					</Text>
					<Card variant="elevated" padding={0}>
						<SecurityItem
							icon="phone-portrait-outline"
							title="Authenticator App"
							description="Use apps like Google Authenticator"
							enabled={mfaTotp}
							onToggle={handleToggleTOTP}
							badge={mfaTotp ? "Active" : undefined}
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SecurityItem
							icon="mail-outline"
							title="Email Codes"
							description="Receive codes via email"
							enabled={mfaEmail}
							onToggle={handleToggleEmailMFA}
							badge={mfaEmail ? "Active" : undefined}
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SecurityItem
							icon="finger-print"
							title="Biometric Login"
							description="Use Face ID or fingerprint"
							enabled={biometric}
							onToggle={handleToggleBiometric}
						/>
					</Card>
				</Animated.View>

				{/* Sessions */}
				<Animated.View
					entering={FadeInUp.delay(400).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						Sessions
					</Text>
					<Card variant="elevated" padding={0}>
						<SecurityItem
							icon="laptop-outline"
							title="Active Sessions"
							description="View and manage your active sessions"
							onPress={() => router.push("/(main)/security/sessions")}
							showChevron
						/>
					</Card>
				</Animated.View>

				{/* Advanced Security */}
				<Animated.View
					entering={FadeInUp.delay(450).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						Advanced Security
					</Text>
					<Card variant="elevated" padding={0}>
						<SecurityItem
							icon="qr-code-outline"
							title="QR Code Login"
							description="Sign in to desktop by scanning a code"
							onPress={() => router.push("/(main)/security/qr-scanner")}
							showChevron
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SecurityItem
							icon="settings-outline"
							title="Setup Authenticator"
							description="Configure TOTP authentication app"
							onPress={() => router.push("/(main)/security/totp-setup")}
							showChevron
							badge={mfaTotp ? "Configured" : undefined}
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SecurityItem
							icon="document-lock-outline"
							title="Backup Codes"
							description="View or regenerate recovery codes"
							onPress={() => router.push("/(main)/security/backup-codes")}
							showChevron
						/>
					</Card>
				</Animated.View>

				{/* Account Activity */}
				<Animated.View
					entering={FadeInUp.delay(475).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
						Account Activity
					</Text>
					<Card variant="elevated" padding={0}>
						<SecurityItem
							icon="apps-outline"
							title="Connected Apps"
							description="Manage third-party app access"
							onPress={() => router.push("/(main)/apps")}
							showChevron
						/>
						<View
							style={[
								styles.divider,
								{ backgroundColor: theme.border.default },
							]}
						/>
						<SecurityItem
							icon="time-outline"
							title="Activity Log"
							description="Review recent security events"
							onPress={() => router.push("/(main)/authorizations")}
							showChevron
						/>
					</Card>
				</Animated.View>

				{/* Danger Zone */}
				<Animated.View
					entering={FadeInUp.delay(500).duration(500)}
					style={styles.section}
				>
					<Text style={[styles.sectionTitle, { color: Colors.error[600] }]}>
						Danger Zone
					</Text>
					<Card variant="outlined" padding="lg">
						<Text style={[styles.dangerTitle, { color: theme.text.primary }]}>
							Delete Account
						</Text>
						<Text
							style={[
								styles.dangerDescription,
								{ color: theme.text.secondary },
							]}
						>
							Permanently delete your account and all associated data. This
							action cannot be undone.
						</Text>
						<Button
							variant="danger"
							size="sm"
							onPress={() =>
								Alert.alert(
									"Delete Account",
									"Are you sure? This action is permanent and cannot be undone.",
									[
										{ text: "Cancel", style: "cancel" },
										{ text: "Delete", style: "destructive" },
									],
								)
							}
							style={{ marginTop: Spacing.md }}
						>
							Delete Account
						</Button>
					</Card>
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
	scoreSection: {
		marginBottom: Spacing.xl,
	},
	scoreHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.lg,
	},
	scoreCircle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: Colors.primary[600],
		alignItems: "center",
		justifyContent: "center",
	},
	scoreValue: {
		...Typography.h2,
		color: Colors.white,
		fontWeight: "700",
	},
	scoreLabel: {
		...Typography.caption,
		color: "rgba(255,255,255,0.8)",
		marginTop: -4,
	},
	scoreInfo: {
		flex: 1,
	},
	scoreTitle: {
		...Typography.h4,
		marginBottom: Spacing.xs,
	},
	scoreDescription: {
		...Typography.bodySmall,
		lineHeight: 20,
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
		width: 40,
		height: 40,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	itemContent: {
		flex: 1,
	},
	itemHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
	},
	itemTitle: {
		...Typography.body,
		fontWeight: "500",
	},
	itemDescription: {
		...Typography.caption,
		marginTop: 2,
	},
	divider: {
		height: 1,
		marginLeft: Spacing.lg + 40 + Spacing.md,
	},
	dangerTitle: {
		...Typography.body,
		fontWeight: "600",
	},
	dangerDescription: {
		...Typography.bodySmall,
		marginTop: Spacing.xs,
	},
});
