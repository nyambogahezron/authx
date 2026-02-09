import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheet, type BottomSheetRef } from "@/components/ui/bottom-sheet";
import { Colors } from "@/constants/colors";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { languages } from "@/data/mock-preferences";
import { useTheme } from "@/hooks/use-theme-color";
import { useLanguageStore } from "@/stores/language-store";

interface LanguageBottomSheetProps {
	onDismiss?: () => void;
}

export const LanguageBottomSheet = React.forwardRef<
	BottomSheetRef,
	LanguageBottomSheetProps
>(({ onDismiss }, ref) => {
	const theme = useTheme();
	const { t } = useTranslation();
	const { language: activeLanguage, setLanguage } = useLanguageStore();

	return (
		<BottomSheet ref={ref} title={t("settings.language")} onDismiss={onDismiss}>
			<View style={styles.container}>
				{languages.map((lang) => {
					const isSelected = activeLanguage === lang.code;
					return (
						<Pressable
							key={lang.code}
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
							onPress={() => setLanguage(lang.code as any)}
						>
							<Text style={styles.flag}>{lang.flag}</Text>
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
								{lang.name}
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

LanguageBottomSheet.displayName = "LanguageBottomSheet";

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
	flag: {
		fontSize: 24,
	},
	label: {
		...Typography.body,
		flex: 1,
		marginLeft: Spacing.sm,
	},
});
