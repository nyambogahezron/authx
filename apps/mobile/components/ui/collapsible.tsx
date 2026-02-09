import { type PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function Collapsible({
	children,
	title,
}: PropsWithChildren & { title: string }) {
	const [isOpen, setIsOpen] = useState(false);
	const colorScheme = useColorScheme() ?? "light";
	const iconColor =
		colorScheme === "light" ? Colors.gray[600] : Colors.gray[400];

	return (
		<ThemedView>
			<TouchableOpacity
				style={styles.heading}
				onPress={() => setIsOpen((value) => !value)}
				activeOpacity={0.8}
			>
				<IconSymbol
					name="chevron.right"
					size={18}
					weight="medium"
					color={iconColor}
					style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
				/>

				<ThemedText type="defaultSemiBold">{title}</ThemedText>
			</TouchableOpacity>
			{isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	heading: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	content: {
		marginTop: 6,
		marginLeft: 24,
	},
});
