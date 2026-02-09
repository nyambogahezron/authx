import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
	Dimensions,
	FlatList,
	StyleSheet,
	View,
	type ViewToken,
} from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Colors } from "@/constants/colors";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
	id: string;
	icon: keyof typeof Ionicons.glyphMap;
	title: string;
	description: string;
	iconColor: string;
}

const slides: OnboardingSlide[] = [
	{
		id: "1",
		icon: "shield-checkmark",
		title: "Secure Authentication",
		description:
			"Industry-standard security with multi-factor authentication, device fingerprinting, and encrypted sessions.",
		iconColor: Colors.primary[500],
	},
	{
		id: "2",
		icon: "finger-print",
		title: "Multiple Login Methods",
		description:
			"Sign in with email, phone, magic links, or your favorite social accounts. Choose what works best for you.",
		iconColor: Colors.secondary[500],
	},
	{
		id: "3",
		icon: "settings",
		title: "Complete Control",
		description:
			"Manage your profile, sessions, and security settings all in one place. Your data, your rules.",
		iconColor: Colors.success[500],
	},
];

export default function OnboardingScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const theme = useTheme();
	const [currentIndex, setCurrentIndex] = useState(0);
	const flatListRef = useRef<FlatList>(null);

	const onViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: ViewToken[] }) => {
			if (viewableItems.length > 0) {
				setCurrentIndex(viewableItems[0].index || 0);
			}
		},
		[],
	);

	const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

	const handleNext = useCallback(() => {
		if (currentIndex < slides.length - 1) {
			flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
		} else {
			router.replace("/(auth)/login");
		}
	}, [currentIndex, router]);

	const handleSkip = useCallback(() => {
		router.replace("/(auth)/login");
	}, [router]);

	const renderSlide = ({
		item,
		index,
	}: {
		item: OnboardingSlide;
		index: number;
	}) => (
		<View style={[styles.slide, { width }]}>
			<Animated.View
				entering={FadeIn.delay(300).duration(500)}
				style={[
					styles.iconContainer,
					{ backgroundColor: `${item.iconColor}15` },
				]}
			>
				<Ionicons name={item.icon} size={80} color={item.iconColor} />
			</Animated.View>

			<Animated.Text
				entering={FadeInUp.delay(400).duration(500)}
				style={[styles.title, { color: theme.text.primary }]}
			>
				{item.title}
			</Animated.Text>

			<Animated.Text
				entering={FadeInUp.delay(500).duration(500)}
				style={[styles.description, { color: theme.text.secondary }]}
			>
				{item.description}
			</Animated.Text>
		</View>
	);

	return (
		<View
			style={[styles.container, { backgroundColor: theme.background.primary }]}
		>
			<View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
				<Button variant="ghost" size="sm" onPress={handleSkip}>
					Skip
				</Button>
			</View>

			<FlatList
				ref={flatListRef}
				data={slides}
				renderItem={renderSlide}
				keyExtractor={(item) => item.id}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={viewabilityConfig}
				bounces={false}
			/>

			<View
				style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
			>
				{/* Pagination dots */}
				<View style={styles.pagination}>
					{slides.map((slide, index) => (
						<View
							key={slide.id}
							style={[
								styles.dot,
								{
									backgroundColor:
										index === currentIndex
											? Colors.primary[600]
											: Colors.gray[300],
									width: index === currentIndex ? 24 : 8,
								},
							]}
						/>
					))}
				</View>

				<Button fullWidth onPress={handleNext}>
					{currentIndex === slides.length - 1 ? "Get Started" : "Next"}
				</Button>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		justifyContent: "flex-end",
		paddingHorizontal: Spacing.lg,
	},
	slide: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing["3xl"],
	},
	iconContainer: {
		width: 160,
		height: 160,
		borderRadius: 80,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Spacing["4xl"],
	},
	title: {
		...Typography.h2,
		textAlign: "center",
		marginBottom: Spacing.lg,
	},
	description: {
		...Typography.body,
		textAlign: "center",
		lineHeight: 24,
	},
	footer: {
		paddingHorizontal: Spacing.xl,
		gap: Spacing["2xl"],
	},
	pagination: {
		flexDirection: "row",
		justifyContent: "center",
		gap: Spacing.sm,
	},
	dot: {
		height: 8,
		borderRadius: BorderRadius.full,
	},
});
