import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInUp,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedLogo } from "@/components/animations";
import { Colors } from "@/constants/colors";
import { Spacing, Typography } from "@/constants/theme";
import { useAuthLoading, useIsAuthenticated } from "@/stores";

export default function SplashScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const isAuthenticated = useIsAuthenticated();
	const isLoading = useAuthLoading();
	const taglineOpacity = useSharedValue(0);

	useEffect(() => {
		taglineOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
	}, [taglineOpacity]);

	useEffect(() => {
		if (!isLoading) {
			const timer = setTimeout(() => {
				if (isAuthenticated) {
					router.replace("/local-auth");
				} else {
					router.replace("/onboarding");
				}
			}, 1500);

			return () => clearTimeout(timer);
		}
	}, [isLoading, isAuthenticated, router]);

	const taglineStyle = useAnimatedStyle(() => ({
		opacity: taglineOpacity.value,
	}));

	return (
		<LinearGradient
			colors={[Colors.primary[600], Colors.secondary[700]]}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
			style={styles.container}
		>
			<View
				style={[
					styles.content,
					{ paddingTop: insets.top, paddingBottom: insets.bottom },
				]}
			>
				<Animated.View
					entering={FadeIn.delay(200).duration(500)}
					style={styles.logoContainer}
				>
					<AnimatedLogo size={120} showRing={true} />
				</Animated.View>

				<Animated.View
					entering={FadeInUp.delay(600).duration(500)}
					style={styles.textContainer}
				>
					<Animated.Text style={styles.title}>AuthX</Animated.Text>
					<Animated.Text style={[styles.tagline, taglineStyle]}>
						Secure Authentication Made Simple
					</Animated.Text>
				</Animated.View>

				<Animated.View
					entering={FadeIn.delay(1200).duration(500)}
					style={styles.footer}
				>
					<Animated.Text style={styles.version}>Version 1.0.0</Animated.Text>
				</Animated.View>
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Spacing["2xl"],
	},
	logoContainer: {
		marginBottom: Spacing["3xl"],
	},
	textContainer: {
		alignItems: "center",
	},
	title: {
		...Typography.h1,
		color: Colors.white,
		fontWeight: "700",
		letterSpacing: 2,
		marginBottom: Spacing.sm,
	},
	tagline: {
		...Typography.body,
		color: "rgba(255, 255, 255, 0.8)",
		textAlign: "center",
	},
	footer: {
		position: "absolute",
		bottom: Spacing["4xl"],
	},
	version: {
		...Typography.caption,
		color: "rgba(255, 255, 255, 0.5)",
	},
});
