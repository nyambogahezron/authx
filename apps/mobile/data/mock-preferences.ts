
export interface Preferences {
	theme: "light" | "dark" | "system";
	language: string;
	notifications: {
		enabled: boolean;
		email: boolean;
		push: boolean;
		marketing: boolean;
	};
	security: {
		biometricEnabled: boolean;
		rememberDevice: boolean;
		sessionTimeout: number; // minutes
	};
	privacy: {
		showOnlineStatus: boolean;
		showLastSeen: boolean;
	};
}

export const mockPreferences: Preferences = {
	theme: "system",
	language: "en",
	notifications: {
		enabled: true,
		email: true,
		push: true,
		marketing: false,
	},
	security: {
		biometricEnabled: true,
		rememberDevice: true,
		sessionTimeout: 30,
	},
	privacy: {
		showOnlineStatus: true,
		showLastSeen: true,
	},
};

// Available languages
export const languages = [
	{ code: "en", name: "English", flag: "🇺🇸" },
	{ code: "fr", name: "Français", flag: "🇫🇷" },
	{ code: "sw", name: "Kiswahili", flag: "🇰🇪" },
];

// Session timeout options (minutes)
export const sessionTimeoutOptions = [
	{ value: 15, label: "15 minutes" },
	{ value: 30, label: "30 minutes" },
	{ value: 60, label: "1 hour" },
	{ value: 120, label: "2 hours" },
	{ value: 480, label: "8 hours" },
	{ value: 1440, label: "24 hours" },
];
