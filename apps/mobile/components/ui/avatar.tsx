/**
 * AuthX Mobile - Avatar Component
 * User avatar with image, initials fallback, and status indicator
 */

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import {
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from "react-native";
import { Colors } from "@/constants/colors";
import { AvatarSize, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";

export type AvatarSizeKey =
	| "xs"
	| "sm"
	| "md"
	| "lg"
	| "xl"
	| "xxl"
	| "2xl"
	| "3xl";
export type StatusIndicator = "online" | "offline" | "away" | "busy" | "none";

interface AvatarProps {
	source?: string | null;
	name?: string;
	size?: AvatarSizeKey;
	status?: StatusIndicator;
	showEditBadge?: boolean;
	onPress?: () => void;
	onEditPress?: () => void;
	style?: StyleProp<ViewStyle>;
}

export function Avatar({
	source,
	name,
	size = "md",
	status = "none",
	showEditBadge = false,
	onPress,
	onEditPress,
	style,
}: AvatarProps) {
	const theme = useTheme();
	const [imageError, setImageError] = useState(false);
	const sizeValue = AvatarSize[size];
	const initials = getInitials(name || "");

	const handleImageError = () => setImageError(true);

	const avatarContent = (
		<>
			{source && !imageError ? (
				<Image
					source={{ uri: source }}
					style={[styles.image, { width: sizeValue, height: sizeValue }]}
					contentFit="cover"
					onError={handleImageError}
				/>
			) : (
				<View
					style={[
						styles.fallback,
						{
							width: sizeValue,
							height: sizeValue,
							backgroundColor: getColorFromName(name || ""),
						},
					]}
				>
					<Text style={[styles.initials, { fontSize: sizeValue * 0.4 }]}>
						{initials}
					</Text>
				</View>
			)}

			{status !== "none" && (
				<View
					style={[
						styles.statusIndicator,
						{
							backgroundColor: getStatusColor(status),
							width: sizeValue * 0.25,
							height: sizeValue * 0.25,
							borderRadius: sizeValue * 0.125,
							right: 0,
							bottom: 0,
							borderColor: theme.background.primary,
						},
					]}
				/>
			)}

			{showEditBadge && (
				<Pressable
					onPress={onEditPress}
					style={[
						styles.editBadge,
						{
							width: sizeValue * 0.35,
							height: sizeValue * 0.35,
							borderRadius: sizeValue * 0.175,
							backgroundColor: Colors.primary[600],
							right: -2,
							bottom: -2,
						},
					]}
				>
					<Ionicons
						name="camera"
						size={sizeValue * 0.18}
						color={Colors.white}
					/>
				</Pressable>
			)}
		</>
	);

	const containerStyle = [
		styles.container,
		{ width: sizeValue, height: sizeValue },
		style,
	];

	if (onPress) {
		return (
			<Pressable onPress={onPress} style={containerStyle}>
				{avatarContent}
			</Pressable>
		);
	}

	return <View style={containerStyle}>{avatarContent}</View>;
}

function getInitials(name: string): string {
	const parts = name.trim().split(" ").filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name: string): string {
	const colors = [
		Colors.primary[500],
		Colors.secondary[500],
		Colors.success[500],
		Colors.warning[500],
		Colors.info[500],
		"#EC4899", // Pink
		"#14B8A6", // Teal
		"#F97316", // Orange
	];

	const charCodeSum = name
		.split("")
		.reduce((sum, char) => sum + char.charCodeAt(0), 0);

	return colors[charCodeSum % colors.length];
}

function getStatusColor(status: StatusIndicator): string {
	switch (status) {
		case "online":
			return Colors.success[500];
		case "away":
			return Colors.warning[500];
		case "busy":
			return Colors.error[500];
		default:
			return Colors.gray[400];
	}
}

const styles = StyleSheet.create({
	container: {
		position: "relative",
	},
	image: {
		borderRadius: BorderRadius.full,
	},
	fallback: {
		borderRadius: BorderRadius.full,
		alignItems: "center",
		justifyContent: "center",
	},
	initials: {
		color: Colors.white,
		fontWeight: "600",
	},
	statusIndicator: {
		position: "absolute",
		borderWidth: 2,
	},
	editBadge: {
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: Colors.white,
	},
});
