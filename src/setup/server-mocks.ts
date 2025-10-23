if (typeof globalThis !== "undefined" && !globalThis.localStorage) {
	globalThis.localStorage = {
		getItem: (key: string) => null,
		setItem: (key: string, value: string) => {},
		removeItem: (key: string) => {},
		clear: () => {},
		length: 0,
		key: (index: number) => null,
	};
}
