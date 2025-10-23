import { IImage } from "@designcombo/types";
import { useCallback, useState } from "react";

interface PexelsImage extends Partial<IImage> {
	metadata?: {
		pexels_id: number;
		avg_color: string;
		original_url: string;
	};
}

interface PexelsResponse {
	photos: PexelsImage[];
	total_results: number;
	page: number;
	per_page: number;
	next_page?: string;
	prev_page?: string;
}

interface UsePexelsImagesReturn {
	images: PexelsImage[];
	loading: boolean;
	error: string | null;
	totalResults: number;
	currentPage: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
	searchImages: (query: string, page?: number) => Promise<void>;
	loadCuratedImages: (page?: number) => Promise<void>;
	searchImagesAppend: (query: string, page?: number) => Promise<void>;
	loadCuratedImagesAppend: (page?: number) => Promise<void>;
	clearImages: () => void;
	refreshCuratedImages: (page?: number) => Promise<void>;
}

// Cache for curated images to avoid unnecessary API calls
interface CuratedImagesCache {
	data: PexelsResponse | null;
	timestamp: number;
	page: number;
}

const curatedImagesCache: CuratedImagesCache = {
	data: null,
	timestamp: 0,
	page: 1,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Function to clear the cache
const clearCuratedImagesCache = () => {
	curatedImagesCache.data = null;
	curatedImagesCache.timestamp = 0;
	curatedImagesCache.page = 1;
};

/**
 * Hook for fetching and managing Pexels images with caching support.
 *
 * Features:
 * - Caches curated images for 5 minutes to avoid unnecessary API calls
 * - Supports search functionality with real-time results
 * - Provides pagination for browsing large result sets
 * - Includes error handling and loading states
 *
 * Cache Behavior:
 * - Curated images are cached for 5 minutes
 * - Cache is automatically cleared when calling clearImages()
 * - Manual cache refresh available via refreshCuratedImages()
 * - Cache is page-specific (different pages have separate cache entries)
 */
export function usePexelsImages(): UsePexelsImagesReturn {
	const [images, setImages] = useState<PexelsImage[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalResults, setTotalResults] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [hasPrevPage, setHasPrevPage] = useState(false);

	const fetchImagesWithAuth = useCallback(
		async (url: string, apiKey: string) => {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch(url, {
					headers: {
						Authorization: apiKey,
					},
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();

				// Transform the data to match the expected format
				const transformedPhotos = data.photos.map((photo: any) => ({
					id: `pexels_${photo.id}`,
					details: {
						src: photo.src.large2x, // Use large2x for better quality
						width: photo.width,
						height: photo.height,
						photographer: photo.photographer,
						photographer_url: photo.photographer_url,
						alt: photo.alt,
					},
					preview: photo.src.medium, // Use medium for preview
					type: "image" as const,
					metadata: {
						pexels_id: photo.id,
						avg_color: photo.avg_color,
						original_url: photo.src.original,
					},
				}));

				const transformedData: PexelsResponse = {
					photos: transformedPhotos,
					total_results: data.total_results || 0,
					page: data.page,
					per_page: data.per_page,
					next_page: data.next_page,
					prev_page: data.prev_page,
				};

				setImages(transformedData.photos);
				setTotalResults(transformedData.total_results);
				setCurrentPage(transformedData.page);
				setHasNextPage(!!transformedData.next_page);
				setHasPrevPage(!!transformedData.prev_page);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to fetch images");
				setImages([]);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const searchImages = useCallback(
		async (query: string, page = 1) => {
			const apiKey = process.env.PEXELS_API_KEY;
			if (!apiKey) {
				setError("Pexels API key not configured");
				return;
			}
			const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=20`;
			await fetchImagesWithAuth(url, apiKey);
		},
		[fetchImagesWithAuth],
	);

	const searchImagesAppend = useCallback(async (query: string, page = 1) => {
		const apiKey = process.env.PEXELS_API_KEY;
		if (!apiKey) {
			setError("Pexels API key not configured");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=20`;
			const response = await fetch(url, {
				headers: {
					Authorization: apiKey,
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			// Transform the data to match the expected format
			const transformedPhotos = data.photos.map((photo: any) => ({
				id: `pexels_${photo.id}`,
				details: {
					src: photo.src.large2x, // Use large2x for better quality
					width: photo.width,
					height: photo.height,
					photographer: photo.photographer,
					photographer_url: photo.photographer_url,
					alt: photo.alt,
				},
				preview: photo.src.medium, // Use medium for preview
				type: "image" as const,
				metadata: {
					pexels_id: photo.id,
					avg_color: photo.avg_color,
					original_url: photo.src.original,
				},
			}));

			const transformedData: PexelsResponse = {
				photos: transformedPhotos,
				total_results: data.total_results || 0,
				page: data.page,
				per_page: data.per_page,
				next_page: data.next_page,
				prev_page: data.prev_page,
			};

			setImages((prevImages) => [...prevImages, ...transformedData.photos]);
			setTotalResults(transformedData.total_results);
			setCurrentPage(transformedData.page);
			setHasNextPage(!!transformedData.next_page);
			setHasPrevPage(!!transformedData.prev_page);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch images");
		} finally {
			setLoading(false);
		}
	}, []);

	const loadCuratedImages = useCallback(async (page = 1) => {
		// Check if we have cached data for this page and it's still valid
		const now = Date.now();
		const isCacheValid =
			curatedImagesCache.data &&
			curatedImagesCache.page === page &&
			now - curatedImagesCache.timestamp < CACHE_DURATION;

		if (isCacheValid && curatedImagesCache.data) {
			// Use cached data
			const data = curatedImagesCache.data;
			setImages(data.photos);
			setTotalResults(data.total_results);
			setCurrentPage(data.page);
			setHasNextPage(!!data.next_page);
			setHasPrevPage(!!data.prev_page);
			setError(null);
			return;
		}

		// Fetch fresh data
		const apiKey = process.env.PEXELS_API_KEY;
		if (!apiKey) {
			setError("Pexels API key not configured");
			return;
		}

		const url = `https://api.pexels.com/v1/curated?page=${page}&per_page=20`;
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(url, {
				headers: {
					Authorization: apiKey,
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			// Transform the data to match the expected format
			const transformedPhotos = data.photos.map((photo: any) => ({
				id: `pexels_${photo.id}`,
				details: {
					src: photo.src.large2x, // Use large2x for better quality
					width: photo.width,
					height: photo.height,
					photographer: photo.photographer,
					photographer_url: photo.photographer_url,
					alt: photo.alt,
				},
				preview: photo.src.medium, // Use medium for preview
				type: "image" as const,
				metadata: {
					pexels_id: photo.id,
					avg_color: photo.avg_color,
					original_url: photo.src.original,
				},
			}));

			const transformedData: PexelsResponse = {
				photos: transformedPhotos,
				total_results: data.total_results || 0,
				page: data.page,
				per_page: data.per_page,
				next_page: data.next_page,
				prev_page: data.prev_page,
			};

			// Cache the data
			curatedImagesCache.data = transformedData;
			curatedImagesCache.timestamp = now;
			curatedImagesCache.page = page;

			setImages(transformedData.photos);
			setTotalResults(transformedData.total_results);
			setCurrentPage(transformedData.page);
			setHasNextPage(!!transformedData.next_page);
			setHasPrevPage(!!transformedData.prev_page);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch images");
			setImages([]);
		} finally {
			setLoading(false);
		}
	}, []);

	const loadCuratedImagesAppend = useCallback(async (page = 1) => {
		const apiKey = process.env.PEXELS_API_KEY;
		if (!apiKey) {
			setError("Pexels API key not configured");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const url = `https://api.pexels.com/v1/curated?page=${page}&per_page=20`;
			const response = await fetch(url, {
				headers: {
					Authorization: apiKey,
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			// Transform the data to match the expected format
			const transformedPhotos = data.photos.map((photo: any) => ({
				id: `pexels_${photo.id}`,
				details: {
					src: photo.src.large2x, // Use large2x for better quality
					width: photo.width,
					height: photo.height,
					photographer: photo.photographer,
					photographer_url: photo.photographer_url,
					alt: photo.alt,
				},
				preview: photo.src.medium, // Use medium for preview
				type: "image" as const,
				metadata: {
					pexels_id: photo.id,
					avg_color: photo.avg_color,
					original_url: photo.src.original,
				},
			}));

			const transformedData: PexelsResponse = {
				photos: transformedPhotos,
				total_results: data.total_results || 0,
				page: data.page,
				per_page: data.per_page,
				next_page: data.next_page,
				prev_page: data.prev_page,
			};

			setImages((prevImages) => [...prevImages, ...transformedData.photos]);
			setTotalResults(transformedData.total_results);
			setCurrentPage(transformedData.page);
			setHasNextPage(!!transformedData.next_page);
			setHasPrevPage(!!transformedData.prev_page);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to fetch images");
		} finally {
			setLoading(false);
		}
	}, []);

	const clearImages = useCallback(() => {
		setImages([]);
		setError(null);
		setTotalResults(0);
		setCurrentPage(1);
		setHasNextPage(false);
		setHasPrevPage(false);
		// Also clear the cache when clearing images
		clearCuratedImagesCache();
	}, []);

	const refreshCuratedImages = useCallback(
		async (page = 1) => {
			// Clear cache and fetch fresh data
			clearCuratedImagesCache();
			await loadCuratedImages(page);
		},
		[loadCuratedImages],
	);

	return {
		images,
		loading,
		error,
		totalResults,
		currentPage,
		hasNextPage,
		hasPrevPage,
		searchImages,
		loadCuratedImages,
		searchImagesAppend,
		loadCuratedImagesAppend,
		clearImages,
		refreshCuratedImages,
	};
}
