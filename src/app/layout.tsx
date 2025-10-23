import { QueryProvider } from "@/components/query-provider";
import {
	BackgroundUploadRunner,
	StoreInitializer,
} from "@/components/store-initializer";
import { Toaster } from "@/components/ui/sonner";
import { baseUrl, createMetadata } from "@/utils/metadata";
import { safeLocalStorage } from "@/utils/storage";

import { Geist, Geist_Mono } from "next/font/google";
import { Outfit } from "next/font/google";

import "./globals.css";
import { ThemeProviders } from "@/components/theme-provider"; // Added this line

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const geist = Geist({
	variable: "--font-geist",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
	variable: "--font-outfit",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

export const metadata = createMetadata({
	title: {
		template: "%s | Combo",
		default: "Combo",
	},
	description: "AI Video generator for the next gen web.",
	metadataBase: baseUrl,
});

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head></head>
			<body
				className={`${geistMono.variable} ${geist.variable} ${outfit.variable} antialiased dark font-sans bg-muted`}
			>
				<script
					dangerouslySetInnerHTML={{
						__html: `
              if (typeof globalThis !== 'undefined' && !globalThis.localStorage) {
                globalThis.localStorage = {
                  getItem: (key) => null,
                  setItem: (key, value) => {},
                  removeItem: (key) => {},
                  clear: () => {},
                  length: 0,
                  key: (index) => null,
                };
              }
            `,
					}}
				/>
				<QueryProvider>
					<ThemeProviders
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						{" "}
						// Wrapped children with ThemeProviders
						{children}
					</ThemeProviders>
					<StoreInitializer />
					<BackgroundUploadRunner />
					<Toaster />
				</QueryProvider>

			</body>
		</html>
	);
}
