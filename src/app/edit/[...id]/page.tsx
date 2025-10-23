import Editor from "@/features/editor";

export async function generateStaticParams() {
	// Generate static params for common editor scenarios
	return [
		{ id: [] }, // Default editor without specific ID
		{ id: ["new"] }, // New project
	];
}

export default async function Page({
	params,
}: {
	params: Promise<{ id: string[] }>;
}) {
	const { id } = await params;

	// Use the first ID from the route or undefined for default editor
	const sceneId = id.length > 0 ? id[0] : undefined;

	return <Editor id={sceneId} />;
}
