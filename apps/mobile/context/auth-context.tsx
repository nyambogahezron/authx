/**
 * AuthX Mobile - Auth Context
 * Global authentication state management with mock data
 */

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import {
	mockCurrentUser,
	mockUnverifiedUser,
	type User,
} from "@/data/mock-user";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
	user: User | null;
	status: AuthStatus;
	isAuthenticated: boolean;
	isLoading: boolean;
}

interface AuthContextValue extends AuthState {
	login: (email: string, password: string) => Promise<void>;
	loginWithOAuth: (provider: string) => Promise<void>;
	register: (data: RegisterData) => Promise<void>;
	logout: () => Promise<void>;
	verifyOTP: (code: string) => Promise<boolean>;
	requestPasswordReset: (email: string) => Promise<void>;
	resetPassword: (token: string, newPassword: string) => Promise<void>;
	updateProfile: (data: Partial<User>) => Promise<void>;
	changePassword: (
		currentPassword: string,
		newPassword: string,
	) => Promise<void>;
	enableMFA: (
		method: "totp" | "email" | "sms",
	) => Promise<{ secret?: string; qrCode?: string }>;
	disableMFA: (method: "totp" | "email" | "sms") => Promise<void>;
	refreshUser: () => Promise<void>;
}

interface RegisterData {
	name: string;
	email: string;
	password: string;
	username?: string;
	phone?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Simulate async delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<AuthState>({
		user: null,
		status: "idle",
		isAuthenticated: false,
		isLoading: true,
	});

	// Check for existing session on mount
	useEffect(() => {
		const checkAuth = async () => {
			await delay(1500); // Simulate checking stored tokens

			// For demo: start as unauthenticated
			setState({
				user: null,
				status: "unauthenticated",
				isAuthenticated: false,
				isLoading: false,
			});
		};

		checkAuth();
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		setState((prev) => ({ ...prev, status: "loading", isLoading: true }));

		await delay(1500); // Simulate API call

		// Mock validation
		if (email === "demo@example.com" && password === "password123") {
			setState({
				user: mockCurrentUser,
				status: "authenticated",
				isAuthenticated: true,
				isLoading: false,
			});
		} else if (email && password) {
			// Accept any email/password for demo
			setState({
				user: { ...mockCurrentUser, email, name: email.split("@")[0] },
				status: "authenticated",
				isAuthenticated: true,
				isLoading: false,
			});
		} else {
			setState((prev) => ({
				...prev,
				status: "unauthenticated",
				isLoading: false,
			}));
			throw new Error("Invalid credentials");
		}
	}, []);

	const loginWithOAuth = useCallback(async (_provider: string) => {
		setState((prev) => ({ ...prev, status: "loading", isLoading: true }));

		await delay(2000); // Simulate OAuth flow

		setState({
			user: mockCurrentUser,
			status: "authenticated",
			isAuthenticated: true,
			isLoading: false,
		});
	}, []);

	const register = useCallback(async (data: RegisterData) => {
		setState((prev) => ({ ...prev, status: "loading", isLoading: true }));

		await delay(1500);

		// Create unverified user
		const newUser: User = {
			...mockUnverifiedUser,
			name: data.name,
			email: data.email,
			username: data.username || data.email.split("@")[0],
			phone: data.phone || "",
		};

		setState({
			user: newUser,
			status: "authenticated",
			isAuthenticated: true,
			isLoading: false,
		});
	}, []);

	const logout = useCallback(async () => {
		setState((prev) => ({ ...prev, isLoading: true }));

		await delay(500);

		setState({
			user: null,
			status: "unauthenticated",
			isAuthenticated: false,
			isLoading: false,
		});
	}, []);

	const verifyOTP = useCallback(async (code: string): Promise<boolean> => {
		await delay(1000);

		// Accept any 6-digit code for demo
		if (code.length === 6) {
			setState((prev) => ({
				...prev,
				user: prev.user ? { ...prev.user, isEmailVerified: true } : null,
			}));
			return true;
		}
		return false;
	}, []);

	const requestPasswordReset = useCallback(async (_email: string) => {
		await delay(1500);
		// Simulates sending reset email
	}, []);

	const resetPassword = useCallback(
		async (_token: string, _newPassword: string) => {
			await delay(1500);
			// Simulates password reset
		},
		[],
	);

	const updateProfile = useCallback(async (data: Partial<User>) => {
		await delay(1000);

		setState((prev) => ({
			...prev,
			user: prev.user ? { ...prev.user, ...data, updatedAt: new Date() } : null,
		}));
	}, []);

	const changePassword = useCallback(
		async (_currentPassword: string, _newPassword: string) => {
			await delay(1500);
			// Simulates password change
		},
		[],
	);

	const enableMFA = useCallback(async (method: "totp" | "email" | "sms") => {
		await delay(1000);

		setState((prev) => ({
			...prev,
			user: prev.user
				? {
						...prev.user,
						mfaEnabled: true,
						mfaMethods: [...new Set([...prev.user.mfaMethods, method])],
					}
				: null,
		}));

		if (method === "totp") {
			return {
				secret: "JBSWY3DPEHPK3PXP",
				qrCode:
					"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/AuthX:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AuthX",
			};
		}

		return {};
	}, []);

	const disableMFA = useCallback(async (method: "totp" | "email" | "sms") => {
		await delay(1000);

		setState((prev) => {
			if (!prev.user) return prev;

			const updatedMethods = prev.user.mfaMethods.filter((m) => m !== method);

			return {
				...prev,
				user: {
					...prev.user,
					mfaEnabled: updatedMethods.length > 0,
					mfaMethods: updatedMethods,
				},
			};
		});
	}, []);

	const refreshUser = useCallback(async () => {
		await delay(500);
		// Simulates refreshing user data from server
	}, []);

	const value: AuthContextValue = {
		...state,
		login,
		loginWithOAuth,
		register,
		logout,
		verifyOTP,
		requestPasswordReset,
		resetPassword,
		updateProfile,
		changePassword,
		enableMFA,
		disableMFA,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
