import { Stack } from "expo-router";
import { Colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import "@/i18n";

export default function MainLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: isDark ? Colors.gray[950] : Colors.white,
				},
				animation: "slide_from_right",
			}}
		>
			{/* Tabs group - main navigation */}
			<Stack.Screen
				name="(tabs)"
				options={{
					headerShown: false,
				}}
			/>

			{/* Detail screens */}
			<Stack.Screen
				name="apps/index"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="apps/[id]"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="authorizations/index"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="profile/edit"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="security/index"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="security/sessions"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="security/change-password"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="security/sudo-mode"
				options={{
					presentation: "modal",
					animation: "slide_from_bottom",
				}}
			/>
			<Stack.Screen
				name="security/qr-scanner"
				options={{
					presentation: "fullScreenModal",
					animation: "fade",
				}}
			/>
			<Stack.Screen
				name="security/totp-setup"
				options={{
					presentation: "modal",
					animation: "slide_from_bottom",
				}}
			/>
			<Stack.Screen
				name="security/backup-codes"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="settings/index"
				options={{
					animation: "slide_from_right",
				}}
			/>
		</Stack>
	);
}
