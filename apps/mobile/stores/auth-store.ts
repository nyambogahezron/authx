import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "@/data/mock-user";
import { mockCurrentUser } from "@/data/mock-user";

export type MFAMethod = "totp" | "email" | "sms";

interface AuthState {
	// State
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;

	// Actions
	login: (email: string, password: string) => Promise<boolean>;
	register: (data: RegisterData) => Promise<boolean>;
	logout: () => Promise<void>;
	verifyOTP: (code: string) => Promise<boolean>;
	resetPassword: (email: string) => Promise<boolean>;
	changePassword: (
		currentPassword: string,
		newPassword: string,
	) => Promise<boolean>;
	updateProfile: (data: Partial<User>) => Promise<boolean>;
	enableMFA: (method: MFAMethod) => Promise<boolean>;
	disableMFA: (method: MFAMethod) => Promise<boolean>;
	clearError: () => void;
	setLoading: (loading: boolean) => void;
}

interface RegisterData {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	username: string;
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			// Initial state
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,

			// Login action
			login: async (email: string, password: string) => {
				set({ isLoading: true, error: null });
				try {
					await delay(1500);

					// Mock validation
					if (email === "demo@authx.dev" && password === "password123") {
						set({
							user: mockCurrentUser,
							isAuthenticated: true,
							isLoading: false,
							error: null,
						});
						return true;
					}

					set({ error: "Invalid email or password", isLoading: false });
					return false;
				} catch {
					set({ error: "Login failed. Please try again.", isLoading: false });
					return false;
				}
			},

			// Register action
			register: async (data: RegisterData) => {
				set({ isLoading: true, error: null });
				try {
					await delay(1500);

					const newUser: User = {
						...mockCurrentUser,
						id: `user_${Date.now()}`,
						email: data.email,
						name: `${data.firstName} ${data.lastName}`,
						username: data.username,
						isEmailVerified: false,
						createdAt: new Date(),
					};

					set({
						user: newUser,
						isAuthenticated: false, // Need to verify email first
						isLoading: false,
						error: null,
					});
					return true;
				} catch {
					set({
						error: "Registration failed. Please try again.",
						isLoading: false,
					});
					return false;
				}
			},

			// Logout action
			logout: async () => {
				set({ isLoading: true });
				await delay(500);
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
					error: null,
				});
			},

			// Verify OTP
			verifyOTP: async (code: string) => {
				set({ isLoading: true, error: null });
				try {
					await delay(1000);

					if (code === "123456" || code.length === 6) {
						const { user } = get();
						if (user) {
							set({
								user: { ...user, isEmailVerified: true },
								isAuthenticated: true,
								isLoading: false,
							});
						}
						return true;
					}

					set({ error: "Invalid verification code", isLoading: false });
					return false;
				} catch {
					set({ error: "Verification failed", isLoading: false });
					return false;
				}
			},

			// Reset password
			resetPassword: async () => {
				set({ isLoading: true, error: null });
				try {
					await delay(1000);
					set({ isLoading: false });
					return true;
				} catch {
					set({ error: "Password reset failed", isLoading: false });
					return false;
				}
			},

			// Change password
			changePassword: async (currentPassword: string) => {
				set({ isLoading: true, error: null });
				try {
					await delay(1000);

					if (currentPassword === "password123") {
						set({ isLoading: false });
						return true;
					}

					set({ error: "Current password is incorrect", isLoading: false });
					return false;
				} catch {
					set({ error: "Password change failed", isLoading: false });
					return false;
				}
			},

			// Update profile
			updateProfile: async (data: Partial<User>) => {
				set({ isLoading: true, error: null });
				try {
					await delay(800);

					const { user } = get();
					if (user) {
						set({
							user: { ...user, ...data },
							isLoading: false,
						});
					}
					return true;
				} catch {
					set({ error: "Profile update failed", isLoading: false });
					return false;
				}
			},

			// Enable MFA
			enableMFA: async (method: MFAMethod) => {
				set({ isLoading: true, error: null });
				try {
					await delay(800);

					const { user } = get();
					if (user) {
						const existingMethods = user.mfaMethods || [];
						if (!existingMethods.includes(method)) {
							set({
								user: {
									...user,
									mfaEnabled: true,
									mfaMethods: [...existingMethods, method],
								},
								isLoading: false,
							});
						}
					}
					return true;
				} catch {
					set({ error: "Failed to enable MFA", isLoading: false });
					return false;
				}
			},

			// Disable MFA
			disableMFA: async (method: MFAMethod) => {
				set({ isLoading: true, error: null });
				try {
					await delay(800);

					const { user } = get();
					if (user) {
						const remainingMethods = (user.mfaMethods || []).filter(
							(m) => m !== method,
						);
						set({
							user: {
								...user,
								mfaEnabled: remainingMethods.length > 0,
								mfaMethods: remainingMethods,
							},
							isLoading: false,
						});
					}
					return true;
				} catch {
					set({ error: "Failed to disable MFA", isLoading: false });
					return false;
				}
			},

			// Clear error
			clearError: () => set({ error: null }),

			// Set loading
			setLoading: (loading: boolean) => set({ isLoading: loading }),
		}),
		{
			name: "authx-auth-storage",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
	useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
