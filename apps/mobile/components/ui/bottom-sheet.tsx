import { Ionicons } from "@expo/vector-icons";
import {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
} from "react";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-color";

export interface BottomSheetRef {
	present: () => void;
	dismiss: () => void;
}

interface BottomSheetProps {
	title?: string;
	children: React.ReactNode;
	onDismiss?: () => void;
}

export const BottomSheet = React.forwardRef<BottomSheetRef, BottomSheetProps>(
	({ title, children, onDismiss }, ref) => {
		const theme = useTheme();
		const insets = useSafeAreaInsets();
		const bottomSheetModalRef = useRef<BottomSheetModal>(null);

		const snapPoints = useMemo(() => ["50%", "90%"], []);

		const renderBackdrop = useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop
					{...props}
					disappearsOnIndex={-1}
					appearsOnIndex={0}
					opacity={0.5}
				/>
			),
			[],
		);

		const handleSheetChanges = useCallback(
			(index: number) => {
				if (index === -1 && onDismiss) {
					onDismiss();
				}
			},
			[onDismiss],
		);

		useImperativeHandle(ref, () => ({
			present: () => {
				Keyboard.dismiss();
				bottomSheetModalRef.current?.present();
			},
			dismiss: () => {
				bottomSheetModalRef.current?.dismiss();
			},
		}));

		return (
			<BottomSheetModalProvider>
				<BottomSheetModal
					ref={bottomSheetModalRef}
					index={0} // Starts at 50%
					snapPoints={snapPoints}
					onChange={handleSheetChanges}
					backdropComponent={renderBackdrop}
					backgroundStyle={{
						backgroundColor: theme.background.secondary,
						borderRadius: BorderRadius["2xl"],
					}}
					handleIndicatorStyle={{
						backgroundColor: theme.border.default,
						width: 40,
						height: 4,
					}}
				>
					<BottomSheetView
						style={[
							styles.contentContainer,
							{ paddingBottom: insets.bottom + Spacing.xl },
						]}
					>
						{title && (
							<View style={styles.header}>
								<Text style={[styles.title, { color: theme.text.primary }]}>
									{title}
								</Text>
								<Pressable
									onPress={() => bottomSheetModalRef.current?.dismiss()}
									style={styles.closeButton}
								>
									<Ionicons
										name="close"
										size={24}
										color={theme.text.secondary}
									/>
								</Pressable>
							</View>
						)}
						<View style={styles.childContent}>{children}</View>
					</BottomSheetView>
				</BottomSheetModal>
			</BottomSheetModalProvider>
		);
	},
);

BottomSheet.displayName = "BottomSheet";

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		paddingHorizontal: Spacing.lg,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: Spacing.lg,
		paddingHorizontal: Spacing.xs,
		paddingTop: Spacing.sm,
	},
	title: {
		...Typography.h4,
	},
	closeButton: {
		padding: Spacing.xs,
	},
	childContent: {
		flex: 1,
	},
});
