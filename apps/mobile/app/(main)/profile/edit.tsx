import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Colors } from "@/constants/colors";
import { ScreenPadding, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/stores/auth-store";

export default function EditProfileScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const { user, updateProfile, isLoading } = useAuthStore();

	const [formData, setFormData] = useState({
		name: user?.name || "",
		username: user?.username || "",
		email: user?.email || "",
		phone: user?.phone || "",
		bio: user?.bio || "",
		avatar: user?.avatar || null,
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [saving, setSaving] = useState(false);

	const updateField = useCallback((field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: "" }));
	}, []);

	const pickImage = useCallback(async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission Required",
				"Please allow access to your photo library.",
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setFormData((prev) => ({ ...prev, avatar: result.assets[0].uri }));
		}
	}, []);

	const validateForm = useCallback(() => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		}

		if (formData.username && formData.username.length < 3) {
			newErrors.username = "Username must be at least 3 characters";
		}

		if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
			newErrors.phone = "Please enter a valid phone number";
		}

		if (formData.bio && formData.bio.length > 200) {
			newErrors.bio = "Bio must be under 200 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}, [formData]);

	const handleSave = useCallback(async () => {
		if (!validateForm()) return;

		setSaving(true);
		try {
			await updateProfile({
				name: formData.name,
				username: formData.username,
				phone: formData.phone,
				bio: formData.bio,
				avatar: formData.avatar,
			});
			Alert.alert("Success", "Profile updated successfully");
			router.back();
		} catch (_error) {
			Alert.alert("Error", "Failed to update profile. Please try again.");
		} finally {
			setSaving(false);
		}
	}, [formData, updateProfile, validateForm, router]);

	const hasChanges =
		formData.name !== user?.name ||
		formData.username !== user?.username ||
		formData.phone !== user?.phone ||
		formData.bio !== user?.bio ||
		formData.avatar !== user?.avatar;

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: theme.background.primary }]}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
				<Pressable onPress={() => router.back()} style={styles.closeButton}>
					<Ionicons name="close" size={28} color={theme.text.primary} />
				</Pressable>
				<Text style={[styles.headerTitle, { color: theme.text.primary }]}>
					Edit Profile
				</Text>
				<Button
					variant="ghost"
					size="sm"
					onPress={handleSave}
					loading={saving}
					disabled={!hasChanges || saving}
				>
					Save
				</Button>
			</View>

			<ScrollView
				contentContainerStyle={[
					styles.content,
					{ paddingBottom: insets.bottom + Spacing.xl },
				]}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{/* Avatar Section */}
				<Animated.View
					entering={FadeIn.delay(100).duration(500)}
					style={styles.avatarSection}
				>
					<Pressable onPress={pickImage}>
						<Avatar
							source={formData.avatar}
							name={formData.name}
							size="xxl"
							showEditBadge
							onEditPress={pickImage}
						/>
					</Pressable>
					<Pressable onPress={pickImage}>
						<Text
							style={[styles.changePhotoText, { color: Colors.primary[600] }]}
						>
							Change Profile Photo
						</Text>
					</Pressable>
				</Animated.View>

				{/* Form */}
				<Animated.View
					entering={FadeInUp.delay(200).duration(500)}
					style={styles.form}
				>
					<Input
						label="Full Name"
						placeholder="Your full name"
						value={formData.name}
						onChangeText={(v) => updateField("name", v)}
						error={errors.name}
						autoCapitalize="words"
						leftIcon="person-outline"
					/>

					<Input
						label="Username"
						placeholder="@username"
						value={formData.username}
						onChangeText={(v) => updateField("username", v)}
						error={errors.username}
						autoCapitalize="none"
						leftIcon="at-outline"
					/>

					<Input
						label="Email"
						placeholder="Your email"
						value={formData.email}
						disabled
						hint="Email cannot be changed"
						leftIcon="mail-outline"
					/>

					<Input
						label="Phone Number"
						placeholder="+1 (555) 123-4567"
						value={formData.phone}
						onChangeText={(v) => updateField("phone", v)}
						error={errors.phone}
						keyboardType="phone-pad"
						leftIcon="call-outline"
					/>

					<View>
						<Input
							label="Bio"
							placeholder="Tell us about yourself..."
							value={formData.bio}
							onChangeText={(v) => updateField("bio", v)}
							error={errors.bio}
							multiline
							numberOfLines={3}
							leftIcon="document-text-outline"
						/>
						<Text style={[styles.charCount, { color: theme.text.tertiary }]}>
							{formData.bio.length}/200
						</Text>
					</View>
				</Animated.View>

				{/* Account Info */}
				<Animated.View
					entering={FadeInUp.delay(300).duration(500)}
					style={styles.infoSection}
				>
					<Text style={[styles.infoTitle, { color: theme.text.secondary }]}>
						Account Information
					</Text>
					<View
						style={[
							styles.infoCard,
							{ backgroundColor: theme.surface.default },
						]}
					>
						<View style={styles.infoRow}>
							<Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>
								Member Since
							</Text>
							<Text style={[styles.infoValue, { color: theme.text.primary }]}>
								{user?.createdAt
									? new Date(user.createdAt).toLocaleDateString()
									: "N/A"}
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={[styles.infoLabel, { color: theme.text.tertiary }]}>
								Account ID
							</Text>
							<Text style={[styles.infoValue, { color: theme.text.primary }]}>
								{user?.id?.slice(0, 12)}...
							</Text>
						</View>
					</View>
				</Animated.View>
			</ScrollView>
		</KeyboardAvoidingView>
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
		paddingBottom: Spacing.md,
	},
	closeButton: {
		width: 40,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		...Typography.h4,
	},
	content: {
		paddingHorizontal: ScreenPadding.horizontal,
	},
	avatarSection: {
		alignItems: "center",
		marginBottom: Spacing["3xl"],
	},
	changePhotoText: {
		...Typography.bodySmall,
		fontWeight: "600",
		marginTop: Spacing.md,
	},
	form: {
		gap: Spacing.sm,
		marginBottom: Spacing.xl,
	},
	charCount: {
		...Typography.caption,
		textAlign: "right",
		marginTop: -Spacing.md,
	},
	infoSection: {
		marginTop: Spacing.md,
	},
	infoTitle: {
		...Typography.label,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: Spacing.sm,
	},
	infoCard: {
		padding: Spacing.lg,
		borderRadius: 12,
		gap: Spacing.md,
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
});
