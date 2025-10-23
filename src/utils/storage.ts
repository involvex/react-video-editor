// Safe localStorage wrapper that checks if localStorage is available
// This prevents SSR errors when localStorage is accessed on the server side

export const safeLocalStorage = {
	getItem: (key: string): string | null => {
		if (typeof window === "undefined" || !window.localStorage) {
			return null;
		}
		try {
			return window.localStorage.getItem(key);
		} catch (error) {
			console.warn("localStorage.getItem failed:", error);
			return null;
		}
	},

	setItem: (key: string, value: string): void => {
		if (typeof window === "undefined" || !window.localStorage) {
			return;
		}
		try {
			window.localStorage.setItem(key, value);
		} catch (error) {
			console.warn("localStorage.setItem failed:", error);
		}
	},

	removeItem: (key: string): void => {
		if (typeof window === "undefined" || !window.localStorage) {
			return;
		}
		try {
			window.localStorage.removeItem(key);
		} catch (error) {
			console.warn("localStorage.removeItem failed:", error);
		}
	},

	clear: (): void => {
		if (typeof window === "undefined" || !window.localStorage) {
			return;
		}
		try {
			window.localStorage.clear();
		} catch (error) {
			console.warn("localStorage.clear failed:", error);
		}
	},
};

// Safe sessionStorage wrapper
export const safeSessionStorage = {
	getItem: (key: string): string | null => {
		if (typeof window === "undefined" || !window.sessionStorage) {
			return null;
		}
		try {
			return window.sessionStorage.getItem(key);
		} catch (error) {
			console.warn("sessionStorage.getItem failed:", error);
			return null;
		}
	},

	setItem: (key: string, value: string): void => {
		if (typeof window === "undefined" || !window.sessionStorage) {
			return;
		}
		try {
			window.sessionStorage.setItem(key, value);
		} catch (error) {
			console.warn("sessionStorage.setItem failed:", error);
		}
	},

	removeItem: (key: string): void => {
		if (typeof window === "undefined" || !window.sessionStorage) {
			return;
		}
		try {
			window.sessionStorage.removeItem(key);
		} catch (error) {
			console.warn("sessionStorage.removeItem failed:", error);
		}
	},

	clear: (): void => {
		if (typeof window === "undefined" || !window.sessionStorage) {
			return;
		}
		try {
			window.sessionStorage.clear();
		} catch (error) {
			console.warn("sessionStorage.clear failed:", error);
		}
	},
};
