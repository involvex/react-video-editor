"use client";
import type { Upload } from "@/lib/types";
import { useEffect } from "react";

interface InitialData {
	uploads?: Upload[];
}

export function StoreInitializer() {
	// No-op, removed user store logic
	return null;
}

export function BackgroundUploadRunner() {
	return null;
}
