"use client";

import { ThemeProviderProps } from "next-themes";
import dynamic from "next/dynamic";

const DynamicThemeProvider = dynamic(
	() => import("next-themes").then((mod) => mod.ThemeProvider),
	{ ssr: false },
);

export function ThemeProviders({ children, ...props }: ThemeProviderProps) {
	return <DynamicThemeProvider {...props}>{children}</DynamicThemeProvider>;
}
