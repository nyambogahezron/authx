import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheet, type BottomSheetRef } from "@/components/ui/bottom-sheet";
import { Colors } from "@/constants/colors";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";
import { useThemeStore } from "@/stores/theme-store";

interface ThemeBottomSheetProps {
	onDismiss?: () => void;
}

export const ThemeBottomSheet = React.forwardRef<
	BottomSheetRef,
	ThemeBottomSheetProps
>(({ onDismiss }, ref) => {
	const theme = useTheme();
	const { t } = useTranslation();
	const { theme: activeTheme, setTheme } = useThemeStore();

	const options = [
		{ id: "light", label: t("common.light"), icon: "sunny-outline" },
		{ id: "dark", label: t("common.dark"), icon: "moon-outline" },
		{ id: "system", label: t("common.system"), icon: "phone-portrait-outline" },
	] as const;

	return (
		<BottomSheet ref={ref} title={t("settings.theme")} onDismiss={onDismiss}>
			<View style={styles.container}>
				{options.map((option) => {
					const isSelected = activeTheme === option.id;
					return (
						<Pressable
							key={option.id}
							style={({ pressed }) => [
								styles.option,
								{
									backgroundColor: isSelected
										? `${Colors.primary[500]}15`
										: theme.surface.default,
									borderColor: isSelected
										? Colors.primary[500]
										: theme.border.default,
								},
								pressed && styles.optionPressed,
							]}
							onPress={() => {
								setTheme(option.id);
								// Optional: close on select?
								// Let's keep it open or let parent handle, but usually selection implies closing or feedback.
								// For now just set theme. Parent can dismiss ref if needed, or user dismisses manually.
							}}
						>
							<View
								style={[
									styles.iconContainer,
									{
										backgroundColor: isSelected
											? Colors.primary[500]
											: theme.surface.input,
									},
								]}
							>
								<Ionicons
									name={option.icon as any}
									size={20}
									color={isSelected ? Colors.white : theme.text.secondary}
								/>
							</View>
							<Text
								style={[
									styles.label,
									{
										color: isSelected
											? Colors.primary[700]
											: theme.text.primary,
										fontWeight: isSelected ? "600" : "400",
									},
								]}
							>
								{option.label}
							</Text>
							{isSelected && (
								<Ionicons
									name="checkmark-circle"
									size={24}
									color={Colors.primary[500]}
								/>
							)}
						</Pressable>
					);
				})}
			</View>
		</BottomSheet>
	);
});

ThemeBottomSheet.displayName = "ThemeBottomSheet";

const styles = StyleSheet.create({
	container: {
		gap: Spacing.md,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		padding: Spacing.md,
		borderRadius: BorderRadius.lg,
		borderWidth: 1,
		gap: Spacing.md,
	},
	optionPressed: {
		opacity: 0.7,
	},
	iconContainer: {
		width: 36,
		height: 36,
		borderRadius: BorderRadius.md,
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		...Typography.body,
		flex: 1,
	},
});
