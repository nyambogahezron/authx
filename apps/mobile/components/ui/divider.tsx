/**
 * AuthX Mobile - Divider Component
 * Horizontal divider with optional label text
 */

import {
	type StyleProp,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from "react-native";
import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";

interface DividerProps {
	label?: string;
	style?: StyleProp<ViewStyle>;
}

export function Divider({ label, style }: DividerProps) {
	const theme = useTheme();

	if (!label) {
		return (
			<View
				style={[styles.line, { backgroundColor: theme.border.default }, style]}
			/>
		);
	}

	return (
		<View style={[styles.container, style]}>
			<View
				style={[styles.labelLine, { backgroundColor: theme.border.default }]}
			/>
			<Text style={[styles.label, { color: theme.text.tertiary }]}>
				{label}
			</Text>
			<View
				style={[styles.labelLine, { backgroundColor: theme.border.default }]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	line: {
		height: 1,
		width: "100%",
		marginVertical: Spacing.lg,
	},
	container: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: Spacing.lg,
	},
	labelLine: {
		flex: 1,
		height: 1,
	},
	label: {
		...Typography.caption,
		marginHorizontal: Spacing.md,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
});
