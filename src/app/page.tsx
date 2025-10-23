"use client";
import dynamic from "next/dynamic";

// Dynamically import Editor with no SSR to prevent localStorage errors
const Editor = dynamic(() => import("@/features/editor"), {
	ssr: false,
	loading: () => <div>Loading...</div>,
});

export default function Home() {
	return <Editor />;
}
