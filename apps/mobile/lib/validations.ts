/**
 * AuthX Mobile - Zod Validation Schemas
 * Form validation using Zod v4
 */

import { z } from "zod";

// Email validation
export const emailSchema = z
	.string()
	.min(1, "Email is required")
	.email("Please enter a valid email address");

// Password validation
export const passwordSchema = z
	.string()
	.min(8, "Password must be at least 8 characters")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/\d/, "Password must contain at least one number");

// Username validation
export const usernameSchema = z
	.string()
	.min(3, "Username must be at least 3 characters")
	.max(20, "Username must be at most 20 characters")
	.regex(
		/^[a-zA-Z0-9_]+$/,
		"Username can only contain letters, numbers, and underscores",
	);

// Name validation
export const nameSchema = z
	.string()
	.min(1, "Name is required")
	.max(50, "Name must be at most 50 characters")
	.regex(
		/^[a-zA-Z\s'-]+$/,
		"Name can only contain letters, spaces, hyphens, and apostrophes",
	);

// Phone validation
export const phoneSchema = z
	.string()
	.regex(/^\+?[\d\s-()]{10,}$/, "Please enter a valid phone number")
	.optional()
	.or(z.literal(""));

// Bio validation
export const bioSchema = z
	.string()
	.max(160, "Bio must be at most 160 characters")
	.optional()
	.or(z.literal(""));

// Login form schema
export const loginSchema = z.object({
	email: emailSchema,
	password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register form schema
export const registerSchema = z
	.object({
		firstName: nameSchema,
		lastName: nameSchema,
		username: usernameSchema,
		email: emailSchema,
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
		acceptTerms: z.boolean().refine((val) => val === true, {
			message: "You must accept the terms and conditions",
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
	email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Change password schema
export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: passwordSchema,
		confirmPassword: z.string().min(1, "Please confirm your new password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	})
	.refine((data) => data.currentPassword !== data.newPassword, {
		message: "New password must be different from current password",
		path: ["newPassword"],
	});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// OTP schema
export const otpSchema = z.object({
	code: z
		.string()
		.length(6, "Code must be 6 digits")
		.regex(/^\d+$/, "Code must contain only numbers"),
});

export type OTPFormData = z.infer<typeof otpSchema>;

// Profile update schema
export const profileSchema = z.object({
	firstName: nameSchema,
	lastName: nameSchema,
	username: usernameSchema,
	phone: phoneSchema,
	bio: bioSchema,
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Helper to validate a single field
export function validateField<T extends z.ZodType>(
	schema: T,
	value: z.infer<T>,
): { success: boolean; error?: string } {
	const result = schema.safeParse(value);
	if (result.success) {
		return { success: true };
	}
	return { success: false, error: result.error.issues[0]?.message };
}

// Helper to validate form data
export function validateForm<T extends z.ZodType>(
	schema: T,
	data: unknown,
): { success: boolean; data?: z.infer<T>; errors?: Record<string, string> } {
	const result = schema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	}

	const errors: Record<string, string> = {};
	for (const issue of result.error.issues) {
		const path = issue.path.join(".");
		if (!errors[path]) {
			errors[path] = issue.message;
		}
	}
	return { success: false, errors };
}
