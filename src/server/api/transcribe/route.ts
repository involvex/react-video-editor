import { GoogleGenerativeAI } from "@google/generative-ai";
// app/api/transcribe/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;

		if (!file) {
			return NextResponse.json(
				{ message: "No file found in the request" },
				{ status: 400 },
			);
		}

		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
		const model = genAI.getGenerativeModel({ model: "gemini-pro" });

		const audioBytes = await file.arrayBuffer();
		const audioBase64 = Buffer.from(audioBytes).toString("base64");

		const audioPart = {
			inlineData: {
				data: audioBase64,
				mimeType: file.type,
			},
		};

		const result = await model.generateContent([
			"Please transcribe this audio.",
			audioPart,
		]);

		const response = result.response;
		const text = response.text();

		return NextResponse.json({ text }, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
