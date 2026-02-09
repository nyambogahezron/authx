import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/colors";

export default function AuthLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<Stack
			screenOptions={{
				headerShown: false,
				contentStyle: {
					backgroundColor: isDark ? Colors.gray[900] : Colors.white,
				},
				animation: "slide_from_right",
			}}
		>
			<Stack.Screen
				name="login"
				options={{
					animation: "slide_from_bottom",
				}}
			/>
			<Stack.Screen
				name="signup"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="verify-otp"
				options={{
					animation: "slide_from_right",
					presentation: "modal",
				}}
			/>
			<Stack.Screen
				name="forgot-password"
				options={{
					animation: "slide_from_right",
				}}
			/>
			<Stack.Screen
				name="reset-password"
				options={{
					animation: "slide_from_right",
				}}
			/>
		</Stack>
	);
}
