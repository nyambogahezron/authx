/**
 * AuthX Mobile - Mock Authorizations Data
 * Sample authorization events for activity log
 */

export type AuthorizationAction =
	| "login"
	| "logout"
	| "grant"
	| "revoke"
	| "mfa_enabled"
	| "mfa_disabled"
	| "password_changed"
	| "session_created"
	| "session_revoked";

export interface Authorization {
	id: string;
	appId: string | null;
	appName: string | null;
	action: AuthorizationAction;
	description: string;
	timestamp: Date;
	ip: string;
	location: string;
	deviceInfo: string;
	success: boolean;
}

export const mockAuthorizations: Authorization[] = [
	{
		id: "auth_001",
		appId: "app_github_001",
		appName: "GitHub",
		action: "login",
		description: "Signed in via GitHub OAuth",
		timestamp: new Date("2026-02-04T14:30:00Z"),
		ip: "192.168.1.100",
		location: "Nairobi, Kenya",
		deviceInfo: "iPhone 15 Pro, Safari",
		success: true,
	},
	{
		id: "auth_002",
		appId: null,
		appName: null,
		action: "mfa_enabled",
		description: "Enabled TOTP authentication",
		timestamp: new Date("2026-02-04T10:15:00Z"),
		ip: "192.168.1.100",
		location: "Nairobi, Kenya",
		deviceInfo: "iPhone 15 Pro, Safari",
		success: true,
	},
	{
		id: "auth_003",
		appId: "app_slack_002",
		appName: "Slack",
		action: "grant",
		description: "Granted access to read profile and email",
		timestamp: new Date("2026-02-03T16:45:00Z"),
		ip: "192.168.1.50",
		location: "Nairobi, Kenya",
		deviceInfo: "MacBook Pro, Chrome",
		success: true,
	},
	{
		id: "auth_004",
		appId: null,
		appName: null,
		action: "password_changed",
		description: "Password successfully changed",
		timestamp: new Date("2026-02-02T09:00:00Z"),
		ip: "192.168.1.100",
		location: "Nairobi, Kenya",
		deviceInfo: "iPhone 15 Pro, Safari",
		success: true,
	},
	{
		id: "auth_005",
		appId: "app_figma_003",
		appName: "Figma",
		action: "login",
		description: "Signed in via Figma OAuth",
		timestamp: new Date("2026-02-02T10:20:00Z"),
		ip: "10.0.0.25",
		location: "Mombasa, Kenya",
		deviceInfo: "iPad Air, Safari",
		success: true,
	},
	{
		id: "auth_006",
		appId: null,
		appName: null,
		action: "session_created",
		description: "New session started",
		timestamp: new Date("2026-02-01T08:30:00Z"),
		ip: "172.16.0.100",
		location: "Kisumu, Kenya",
		deviceInfo: "Samsung Galaxy S24, Chrome",
		success: true,
	},
	{
		id: "auth_007",
		appId: "app_notion_004",
		appName: "Notion",
		action: "grant",
		description: "Granted access to profile management",
		timestamp: new Date("2026-02-01T08:00:00Z"),
		ip: "192.168.1.100",
		location: "Nairobi, Kenya",
		deviceInfo: "iPhone 15 Pro, Safari",
		success: true,
	},
	{
		id: "auth_008",
		appId: null,
		appName: null,
		action: "login",
		description: "Failed login attempt",
		timestamp: new Date("2026-01-31T22:15:00Z"),
		ip: "45.33.22.11",
		location: "Unknown",
		deviceInfo: "Unknown Device",
		success: false,
	},
];

// Get action icon name
export function getActionIcon(action: AuthorizationAction): string {
	const icons: Record<AuthorizationAction, string> = {
		login: "log-in-outline",
		logout: "log-out-outline",
		grant: "checkmark-circle-outline",
		revoke: "close-circle-outline",
		mfa_enabled: "shield-checkmark-outline",
		mfa_disabled: "shield-outline",
		password_changed: "key-outline",
		session_created: "add-circle-outline",
		session_revoked: "remove-circle-outline",
	};
	return icons[action];
}

// Get action color
export function getActionColor(
	action: AuthorizationAction,
	success: boolean,
): string {
	if (!success) return "#EF4444"; // red for failures

	const colors: Record<AuthorizationAction, string> = {
		login: "#22C55E",
		logout: "#6B7280",
		grant: "#3B82F6",
		revoke: "#F59E0B",
		mfa_enabled: "#22C55E",
		mfa_disabled: "#F59E0B",
		password_changed: "#8B5CF6",
		session_created: "#22C55E",
		session_revoked: "#F59E0B",
	};
	return colors[action];
}

// Get action display name
export function getActionDisplayName(action: AuthorizationAction): string {
	const names: Record<AuthorizationAction, string> = {
		login: "Sign In",
		logout: "Sign Out",
		grant: "Access Granted",
		revoke: "Access Revoked",
		mfa_enabled: "MFA Enabled",
		mfa_disabled: "MFA Disabled",
		password_changed: "Password Changed",
		session_created: "Session Created",
		session_revoked: "Session Revoked",
	};
	return names[action];
}

// Filter authorizations by action type
export function filterByAction(
	authorizations: Authorization[],
	actions: AuthorizationAction[],
): Authorization[] {
	return authorizations.filter((auth) => actions.includes(auth.action));
}

// Group authorizations by date
export function groupByDate(
	authorizations: Authorization[],
): Record<string, Authorization[]> {
	return authorizations.reduce(
		(acc, auth) => {
			const dateKey = auth.timestamp.toISOString().split("T")[0];
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}
			acc[dateKey].push(auth);
			return acc;
		},
		{} as Record<string, Authorization[]>,
	);
}
