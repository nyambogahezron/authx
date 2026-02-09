import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	Spacing,
	SpringConfig,
	Typography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabConfig {
	name: string;
	icon: keyof typeof Ionicons.glyphMap;
	iconFocused: keyof typeof Ionicons.glyphMap;
	label: string;
}

const TAB_CONFIG: Record<string, TabConfig> = {
	index: {
		name: "index",
		icon: "home-outline",
		iconFocused: "home",
		label: "Home",
	},
	apps: {
		name: "apps",
		icon: "apps-outline",
		iconFocused: "apps",
		label: "Apps",
	},
	activity: {
		name: "activity",
		icon: "time-outline",
		iconFocused: "time",
		label: "Activity",
	},
	profile: {
		name: "profile",
		icon: "person-outline",
		iconFocused: "person",
		label: "Profile",
	},
};

interface TabItemProps {
	route: { name: string; key: string };
	isFocused: boolean;
	onPress: () => void;
	onLongPress: () => void;
	config: TabConfig;
	index: number;
	activeIndex: number;
}

function TabItem({
	route,
	isFocused,
	onPress,
	onLongPress,
	config,
	index,
	activeIndex,
}: TabItemProps) {
	const theme = useTheme();
	const scale = useSharedValue(1);
	const iconScale = useSharedValue(isFocused ? 1 : 0.9);

	React.useEffect(() => {
		iconScale.value = withSpring(isFocused ? 1 : 0.9, SpringConfig.gentle);
	}, [isFocused, iconScale]);

	const animatedContainerStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const animatedIconStyle = useAnimatedStyle(() => ({
		transform: [{ scale: iconScale.value }],
	}));

	const handlePressIn = useCallback(() => {
		scale.value = withSpring(0.9, SpringConfig.stiff);
	}, [scale]);

	const handlePressOut = useCallback(() => {
		scale.value = withSpring(1, SpringConfig.gentle);
	}, [scale]);

	const handlePress = useCallback(() => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onPress();
	}, [onPress]);

	const iconColor = isFocused ? Colors.primary[500] : theme.text.tertiary;
	const labelColor = isFocused ? Colors.primary[500] : theme.text.tertiary;

	return (
		<AnimatedPressable
			key={route.key}
			accessibilityRole="button"
			accessibilityState={isFocused ? { selected: true } : {}}
			onPress={handlePress}
			onLongPress={onLongPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			style={[styles.tabItem, animatedContainerStyle]}
		>
			<Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
				{isFocused && (
					<Animated.View
						style={[
							styles.activeBackground,
							{ backgroundColor: `${Colors.primary[500]}15` },
						]}
					/>
				)}
				<Ionicons
					name={isFocused ? config.iconFocused : config.icon}
					size={24}
					color={iconColor}
				/>
			</Animated.View>
			<Animated.Text
				style={[
					styles.label,
					{ color: labelColor },
					isFocused && styles.labelActive,
				]}
			>
				{config.label}
			</Animated.Text>
		</AnimatedPressable>
	);
}

export function AnimatedTabBar({
	state,
	descriptors,
	navigation,
}: BottomTabBarProps) {
	const theme = useTheme();
	const insets = useSafeAreaInsets();

	const activeIndex = state.index;
	const indicatorPosition = useSharedValue(activeIndex);

	React.useEffect(() => {
		indicatorPosition.value = withSpring(activeIndex, SpringConfig.gentle);
	}, [activeIndex, indicatorPosition]);

	const visibleTabs = state.routes.filter((route) => TAB_CONFIG[route.name]);
	const numTabs = visibleTabs.length;
	const tabWidth = numTabs > 0 ? 100 / numTabs : 33.33;

	const animatedIndicatorStyle = useAnimatedStyle(() => {
		"worklet";
		const translateX = indicatorPosition.value * tabWidth;

		return {
			left: `${translateX}%` as const,
			width: `${tabWidth}%` as const,
		};
	});

	return (
		<View
			style={[
				styles.container,
				{
					backgroundColor: theme.background.primary,
					borderTopColor: theme.border.default,
					paddingBottom: insets.bottom + Spacing.xs,
				},
			]}
		>
			{/* Animated Indicator */}
			<Animated.View style={[styles.indicator, animatedIndicatorStyle]}>
				<View
					style={[
						styles.indicatorPill,
						{ backgroundColor: Colors.primary[500] },
					]}
				/>
			</Animated.View>

			{/* Tab Items */}
			<View style={styles.tabsContainer}>
				{state.routes.map((route, index) => {
					const config = TAB_CONFIG[route.name];
					if (!config) return null;

					const { options } = descriptors[route.key];
					const isFocused = state.index === index;

					const onPress = () => {
						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name);
						}
					};

					const onLongPress = () => {
						navigation.emit({
							type: "tabLongPress",
							target: route.key,
						});
					};

					return (
						<TabItem
							key={route.key}
							route={route}
							isFocused={isFocused}
							onPress={onPress}
							onLongPress={onLongPress}
							config={config}
							index={index}
							activeIndex={activeIndex}
						/>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderTopWidth: 1,
		paddingTop: Spacing.sm,
		shadowColor: Colors.gray[900],
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 10,
	},
	tabsContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-around",
	},
	tabItem: {
		flex: 1,
		alignItems: "center",
		paddingVertical: Spacing.xs,
		gap: 4,
	},
	iconWrapper: {
		position: "relative",
		alignItems: "center",
		justifyContent: "center",
		width: 48,
		height: 32,
	},
	activeBackground: {
		position: "absolute",
		width: 48,
		height: 32,
		borderRadius: BorderRadius.lg,
	},
	label: {
		...Typography.caption,
		fontSize: 11,
	},
	labelActive: {
		fontWeight: "600",
	},
	indicator: {
		position: "absolute",
		top: 0,
		height: 3,
		alignItems: "center",
		justifyContent: "center",
	},
	indicatorPill: {
		width: 40,
		height: 3,
		borderRadius: 1.5,
	},
});

export default AnimatedTabBar;
