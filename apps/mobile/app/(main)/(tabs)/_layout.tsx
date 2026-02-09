import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { AnimatedTabBar } from "@/components/navigation/animated-tab-bar";
import { Colors } from "@/constants/colors";

export default function TabsLayout() {
	const colorScheme = useColorScheme();
	const isDark = colorScheme === "dark";

	return (
		<Tabs
			tabBar={(props) => <AnimatedTabBar {...props} />}
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: isDark ? Colors.gray[900] : Colors.white,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
				}}
			/>
			<Tabs.Screen
				name="apps"
				options={{
					title: "Apps",
				}}
			/>
			<Tabs.Screen
				name="activity"
				options={{
					title: "Activity",
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
				}}
			/>
		</Tabs>
	);
}
