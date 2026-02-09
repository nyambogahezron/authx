/**
 * AuthX Mobile - Mock Connected Apps Data
 * Sample OAuth connected applications for UI development
 */

export interface AppScope {
	id: string;
	name: string;
	description: string;
}

export interface ConnectedApp {
	id: string;
	name: string;
	icon: string;
	description: string;
	website: string;
	scopes: AppScope[];
	connectedAt: Date;
	lastUsed: Date;
	isVerified: boolean;
}

export const appScopes: Record<string, AppScope> = {
	"read:profile": {
		id: "read:profile",
		name: "Read Profile",
		description: "View your basic profile information",
	},
	"read:email": {
		id: "read:email",
		name: "Read Email",
		description: "View your email address",
	},
	"write:profile": {
		id: "write:profile",
		name: "Update Profile",
		description: "Modify your profile information",
	},
	"read:sessions": {
		id: "read:sessions",
		name: "Read Sessions",
		description: "View your active sessions",
	},
	"write:sessions": {
		id: "write:sessions",
		name: "Manage Sessions",
		description: "Create and revoke sessions",
	},
};

export const mockConnectedApps: ConnectedApp[] = [
	{
		id: "app_github_001",
		name: "GitHub",
		icon: "logo-github",
		description: "Where the world builds software",
		website: "https://github.com",
		scopes: [appScopes["read:profile"], appScopes["read:email"]],
		connectedAt: new Date("2025-12-15T10:00:00Z"),
		lastUsed: new Date("2026-02-04T14:30:00Z"),
		isVerified: true,
	},
	{
		id: "app_slack_002",
		name: "Slack",
		icon: "chatbubbles-outline",
		description: "Where work happens",
		website: "https://slack.com",
		scopes: [
			appScopes["read:profile"],
			appScopes["read:email"],
			appScopes["read:sessions"],
		],
		connectedAt: new Date("2026-01-08T09:15:00Z"),
		lastUsed: new Date("2026-02-04T16:45:00Z"),
		isVerified: true,
	},
	{
		id: "app_figma_003",
		name: "Figma",
		icon: "color-palette-outline",
		description: "The collaborative design tool",
		website: "https://figma.com",
		scopes: [appScopes["read:profile"]],
		connectedAt: new Date("2026-01-22T11:30:00Z"),
		lastUsed: new Date("2026-02-02T10:20:00Z"),
		isVerified: true,
	},
	{
		id: "app_notion_004",
		name: "Notion",
		icon: "document-text-outline",
		description: "All-in-one workspace",
		website: "https://notion.so",
		scopes: [appScopes["read:profile"], appScopes["write:profile"]],
		connectedAt: new Date("2026-02-01T08:00:00Z"),
		lastUsed: new Date("2026-02-03T17:00:00Z"),
		isVerified: true,
	},
	{
		id: "app_custom_005",
		name: "DevPortal",
		icon: "code-slash-outline",
		description: "Internal developer portal",
		website: "https://dev.internal.io",
		scopes: [
			appScopes["read:profile"],
			appScopes["read:email"],
			appScopes["read:sessions"],
			appScopes["write:sessions"],
		],
		connectedAt: new Date("2025-11-20T14:00:00Z"),
		lastUsed: new Date("2026-02-04T09:00:00Z"),
		isVerified: false,
	},
];

// Get connected app by ID
export function getAppById(id: string): ConnectedApp | undefined {
	return mockConnectedApps.find((app) => app.id === id);
}

// Format scope list for display
export function formatScopeNames(scopes: AppScope[]): string {
	return scopes.map((s) => s.name).join(", ");
}

// Get app icon name (for Ionicons)
export function getAppIcon(app: ConnectedApp): string {
	return app.icon;
}
