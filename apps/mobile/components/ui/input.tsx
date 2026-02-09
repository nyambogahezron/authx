/**
 * AuthX Mobile - Input Component
 * Form input with validation states, icons, and animations
 */

import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useCallback, useState } from "react";
import {
	Pressable,
	type StyleProp,
	StyleSheet,
	Text,
	TextInput,
	type TextInputProps,
	View,
	type ViewStyle,
} from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import {
	BorderRadius,
	Duration,
	InputHeight,
	Spacing,
	Typography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";

const AnimatedView = Animated.createAnimatedComponent(View);

export type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<TextInputProps, "style"> {
	label?: string;
	error?: string;
	hint?: string;
	size?: InputSize;
	leftIcon?: keyof typeof Ionicons.glyphMap;
	rightIcon?: keyof typeof Ionicons.glyphMap;
	onRightIconPress?: () => void;
	containerStyle?: StyleProp<ViewStyle>;
	inputStyle?: StyleProp<ViewStyle>;
	disabled?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
	(
		{
			label,
			error,
			hint,
			size = "md",
			leftIcon,
			rightIcon,
			onRightIconPress,
			containerStyle,
			inputStyle,
			disabled = false,
			secureTextEntry,
			...rest
		},
		ref,
	) => {
		const theme = useTheme();
		const [isFocused, setIsFocused] = useState(false);
		const [isPasswordVisible, setIsPasswordVisible] = useState(false);
		const focusProgress = useSharedValue(0);

		const animatedBorderStyle = useAnimatedStyle(() => ({
			borderColor: interpolateColor(
				focusProgress.value,
				[0, 1],
				[
					error ? Colors.error[500] : theme.border.default,
					error ? Colors.error[500] : Colors.primary[500],
				],
			),
		}));

		const handleFocus = useCallback(
			(e: any) => {
				setIsFocused(true);
				focusProgress.value = withTiming(1, { duration: Duration.normal });
				rest.onFocus?.(e);
			},
			[focusProgress, rest],
		);

		const handleBlur = useCallback(
			(e: any) => {
				setIsFocused(false);
				focusProgress.value = withTiming(0, { duration: Duration.normal });
				rest.onBlur?.(e);
			},
			[focusProgress, rest],
		);

		const togglePasswordVisibility = useCallback(() => {
			setIsPasswordVisible((prev) => !prev);
		}, []);

		const sizeStyles = getSizeStyles(size);
		const isPassword = secureTextEntry !== undefined;
		const showPassword = isPassword && !isPasswordVisible;

		return (
			<View style={[styles.container, containerStyle]}>
				{label && (
					<Text style={[styles.label, { color: theme.text.secondary }]}>
						{label}
					</Text>
				)}

				<AnimatedView
					style={[
						styles.inputContainer,
						sizeStyles.container,
						{
							backgroundColor: disabled ? Colors.gray[100] : theme.surface.card,
						},
						animatedBorderStyle,
					]}
				>
					{leftIcon && (
						<Ionicons
							name={leftIcon}
							size={20}
							color={isFocused ? Colors.primary[500] : theme.icon}
							style={styles.leftIcon}
						/>
					)}

					<TextInput
						ref={ref}
						style={[
							styles.input,
							sizeStyles.input,
							{ color: theme.text.primary },
							leftIcon && styles.inputWithLeftIcon,
							(rightIcon || isPassword) && styles.inputWithRightIcon,
							inputStyle,
						]}
						placeholderTextColor={theme.text.tertiary}
						onFocus={handleFocus}
						onBlur={handleBlur}
						editable={!disabled}
						secureTextEntry={showPassword}
						{...rest}
					/>

					{isPassword ? (
						<Pressable
							onPress={togglePasswordVisibility}
							style={styles.rightIcon}
							hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
						>
							<Ionicons
								name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
								size={20}
								color={theme.icon}
							/>
						</Pressable>
					) : rightIcon ? (
						<Pressable
							onPress={onRightIconPress}
							style={styles.rightIcon}
							hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
						>
							<Ionicons name={rightIcon} size={20} color={theme.icon} />
						</Pressable>
					) : null}
				</AnimatedView>

				{(error || hint) && (
					<Text
						style={[
							styles.helperText,
							{ color: error ? Colors.error[500] : theme.text.tertiary },
						]}
					>
						{error || hint}
					</Text>
				)}
			</View>
		);
	},
);

Input.displayName = "Input";

function getSizeStyles(size: InputSize) {
	switch (size) {
		case "sm":
			return {
				container: { height: InputHeight.sm },
				input: { ...Typography.bodySmall },
			};
		case "lg":
			return {
				container: { height: InputHeight.lg },
				input: { ...Typography.bodyLarge },
			};
		default:
			return {
				container: { height: InputHeight.md },
				input: { ...Typography.body },
			};
	}
}

const styles = StyleSheet.create({
	container: {
		marginBottom: Spacing.lg,
	},
	label: {
		...Typography.label,
		marginBottom: Spacing.sm,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: BorderRadius.lg,
		borderWidth: 1.5,
		paddingHorizontal: Spacing.lg,
	},
	input: {
		flex: 1,
		height: "100%",
	},
	inputWithLeftIcon: {
		paddingLeft: Spacing.xs,
	},
	inputWithRightIcon: {
		paddingRight: Spacing.xs,
	},
	leftIcon: {
		marginRight: Spacing.sm,
	},
	rightIcon: {
		marginLeft: Spacing.sm,
	},
	helperText: {
		...Typography.caption,
		marginTop: Spacing.xs,
		marginLeft: Spacing.xs,
	},
});
