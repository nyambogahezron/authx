/**
 * AuthX Mobile - Mock User Data
 * Sample user profiles for UI development
 */

export interface User {
	id: string;
	name: string;
	email: string;
	username: string;
	phone: string;
	avatar: string | null;
	bio: string;
	role: "user" | "admin" | "moderator";
	isEmailVerified: boolean;
	isPhoneVerified: boolean;
	mfaEnabled: boolean;
	mfaMethods: ("totp" | "email" | "sms")[];
	lastLoginAt: Date;
	lastLoginIP: string;
	createdAt: Date;
	updatedAt: Date;
}

export const mockUsers: User[] = [
	{
		id: "usr_1a2b3c4d5e6f",
		name: "John Doe",
		email: "john.doe@example.com",
		username: "johndoe",
		phone: "+1 (555) 123-4567",
		avatar:
			"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
		bio: "Full-stack developer passionate about building secure applications. Open source enthusiast.",
		role: "user",
		isEmailVerified: true,
		isPhoneVerified: true,
		mfaEnabled: true,
		mfaMethods: ["totp", "email"],
		lastLoginAt: new Date("2026-02-04T18:30:00Z"),
		lastLoginIP: "192.168.1.100",
		createdAt: new Date("2025-06-15T10:00:00Z"),
		updatedAt: new Date("2026-02-04T18:30:00Z"),
	},
	{
		id: "usr_7g8h9i0j1k2l",
		name: "Jane Smith",
		email: "jane.smith@example.com",
		username: "janesmith",
		phone: "+1 (555) 987-6543",
		avatar:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
		bio: "Product manager and UX enthusiast.",
		role: "admin",
		isEmailVerified: true,
		isPhoneVerified: false,
		mfaEnabled: true,
		mfaMethods: ["totp"],
		lastLoginAt: new Date("2026-02-04T14:15:00Z"),
		lastLoginIP: "10.0.0.50",
		createdAt: new Date("2025-03-20T08:00:00Z"),
		updatedAt: new Date("2026-02-03T09:00:00Z"),
	},
];

// Default mock user for demo
export const mockCurrentUser: User = mockUsers[0];

// Unverified user for testing
export const mockUnverifiedUser: User = {
	id: "usr_new123456",
	name: "New User",
	email: "newuser@example.com",
	username: "newuser",
	phone: "",
	avatar: null,
	bio: "",
	role: "user",
	isEmailVerified: false,
	isPhoneVerified: false,
	mfaEnabled: false,
	mfaMethods: [],
	lastLoginAt: new Date(),
	lastLoginIP: "",
	createdAt: new Date(),
	updatedAt: new Date(),
};
