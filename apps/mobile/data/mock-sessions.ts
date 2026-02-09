/**
 * AuthX Mobile - Mock Sessions Data
 * Sample active sessions for UI development
 */

export interface Session {
	id: string;
	deviceName: string;
	browser: string;
	os: string;
	deviceType: "desktop" | "mobile" | "tablet";
	ip: string;
	location: string;
	lastActive: Date;
	createdAt: Date;
	isCurrent: boolean;
	isTrusted: boolean;
}

export const mockSessions: Session[] = [
	{
		id: "sess_current_001",
		deviceName: "iPhone 15 Pro",
		browser: "Safari Mobile",
		os: "iOS 18.1",
		deviceType: "mobile",
		ip: "192.168.1.100",
		location: "Nairobi, Kenya",
		lastActive: new Date(),
		createdAt: new Date("2026-02-04T08:00:00Z"),
		isCurrent: true,
		isTrusted: true,
	},
	{
		id: "sess_desktop_002",
		deviceName: "MacBook Pro",
		browser: "Chrome 121",
		os: "macOS Sonoma",
		deviceType: "desktop",
		ip: "192.168.1.50",
		location: "Nairobi, Kenya",
		lastActive: new Date("2026-02-04T16:30:00Z"),
		createdAt: new Date("2026-01-15T10:00:00Z"),
		isCurrent: false,
		isTrusted: true,
	},
	{
		id: "sess_tablet_003",
		deviceName: "iPad Air",
		browser: "Safari",
		os: "iPadOS 17.3",
		deviceType: "tablet",
		ip: "10.0.0.25",
		location: "Mombasa, Kenya",
		lastActive: new Date("2026-02-03T09:15:00Z"),
		createdAt: new Date("2026-02-01T14:00:00Z"),
		isCurrent: false,
		isTrusted: false,
	},
	{
		id: "sess_mobile_004",
		deviceName: "Samsung Galaxy S24",
		browser: "Chrome Mobile",
		os: "Android 14",
		deviceType: "mobile",
		ip: "172.16.0.100",
		location: "Kisumu, Kenya",
		lastActive: new Date("2026-02-02T11:45:00Z"),
		createdAt: new Date("2026-01-28T16:30:00Z"),
		isCurrent: false,
		isTrusted: false,
	},
];

// Get device icon name based on device type
export function getDeviceIcon(deviceType: Session["deviceType"]): string {
	switch (deviceType) {
		case "desktop":
			return "desktop-outline";
		case "mobile":
			return "phone-portrait-outline";
		case "tablet":
			return "tablet-portrait-outline";
		default:
			return "hardware-chip-outline";
	}
}

// Format relative time
export function formatRelativeTime(date: Date | string): string {
	const now = new Date();
	const dateObj = date instanceof Date ? date : new Date(date);
	const diffMs = now.getTime() - dateObj.getTime();
	const diffMinutes = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMinutes < 1) return "Just now";
	if (diffMinutes < 60) return `${diffMinutes}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return dateObj.toLocaleDateString();
}
