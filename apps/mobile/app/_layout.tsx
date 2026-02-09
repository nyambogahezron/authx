import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
					<Stack
						screenOptions={{
							headerShown: false,
							contentStyle: {
								backgroundColor: isDark ? Colors.gray[900] : Colors.white,
							},
						}}
					>
						<Stack.Screen
							name="index"
							options={{
								animation: "fade",
							}}
						/>
						<Stack.Screen
							name="onboarding"
							options={{
								animation: "slide_from_right",
							}}
						/>
						<Stack.Screen name="(auth)" options={{ headerShown: false }} />
						<Stack.Screen name="(main)" options={{ headerShown: false }} />
					</Stack>
					<StatusBar style={isDark ? "light" : "dark"} />
				</ThemeProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
