import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, Loader2, Pause, Play } from "lucide-react";
import React, { useState, useEffect } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Voice, VoiceFilters } from "../interfaces/editor";

export const AiVoice = () => {
	const [text, setText] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [voices, setVoices] = useState<Voice[]>([]);
	const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
	const [loading, setLoading] = useState(false);
	const [filters, setFilters] = useState<VoiceFilters>({
		language: "all",
		gender: "all",
	});
	const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
		null,
	);
	const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
		null,
	);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	// Available filter options
	const filterOptions = {
		language: [
			"en",
			"hi",
			"es",
			"pl",
			"fr",
			"de",
			"tr",
			"hu",
			"it",
			"ru",
			"hr",
			"zh",
			"fil",
			"el",
			"fi",
			"ko",
			"no",
			"ta",
			"id",
			"ar",
			"ja",
			"ro",
			"pt",
			"cs",
			"vi",
			"sv",
			"nl",
			"da",
		],
		gender: ["female", "male", "neutral"],
	};

	// Language display names
	const languageNames: Record<string, string> = {
		en: "English",
		hi: "Hindi",
		es: "Spanish",
		pl: "Polish",
		fr: "French",
		de: "German",
		tr: "Turkish",
		hu: "Hungarian",
		it: "Italian",
		ru: "Russian",
		hr: "Croatian",
		zh: "Chinese",
		fil: "Filipino",
		el: "Greek",
		fi: "Finnish",
		ko: "Korean",
		no: "Norwegian",
		ta: "Tamil",
		id: "Indonesian",
		ar: "Arabic",
		ja: "Japanese",
		ro: "Romanian",
		pt: "Portuguese",
		cs: "Czech",
		vi: "Vietnamese",
		sv: "Swedish",
		nl: "Dutch",
		da: "Danish",
	};

	// Handle play/pause for a specific voice
	const handlePlayPause = (voiceId: string, previewUrl: string) => {
		if (currentlyPlayingId === voiceId) {
			if (audioElement) {
				audioElement.pause();
				setCurrentlyPlayingId(null);
				setAudioElement(null);
			}
			return;
		}

		if (audioElement) {
			audioElement.pause();
		}

		const newAudio = new Audio(previewUrl);
		newAudio.addEventListener("ended", () => {
			setCurrentlyPlayingId(null);
			setAudioElement(null);
		});

		newAudio.play();
		setCurrentlyPlayingId(voiceId);
		setAudioElement(newAudio);
	};

	// Cleanup audio on component unmount
	useEffect(() => {
		return () => {
			if (audioElement) {
				audioElement.pause();
			}
		};
	}, [audioElement]);

	// Fetch voices from external API directly
	const fetchVoices = async (queryParams?: any) => {
		setLoading(true);
		try {
			// Try the API call with better error handling
			const response = await fetch(
				"https://dubbing-152153811339.us-central1.run.app/search-voices",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						limit: 20,
						page: 1,
						query: queryParams || {},
					}),
				},
			);

			if (response.ok) {
				const data = await response.json();
				console.log("Voices API response:", data);
				setVoices(data.voices || []);
			} else {
				console.error(
					"Failed to fetch voices:",
					response.status,
					response.statusText,
				);
				// Set empty voices array on error
				setVoices([]);
			}
		} catch (error) {
			console.error("Error fetching voices:", error);
			// Set empty voices array on error
			setVoices([]);
		} finally {
			setLoading(false);
		}
	};

	// Load voices on component mount
	useEffect(() => {
		fetchVoices();
	}, []);

	// Apply filters automatically when filters change
	const applyFilters = (newFilters: VoiceFilters) => {
		const queryParams: any = {};
		if (newFilters.language && newFilters.language !== "all")
			queryParams.languages = [newFilters.language];
		if (newFilters.gender && newFilters.gender !== "all")
			queryParams.genders = [newFilters.gender];
		fetchVoices(queryParams);
	};

	const handleGenerate = async () => {
		if (!text.trim() || !selectedVoice) return;

		setIsGenerating(true);

		try {
			// TODO: Implement voice generation API call
			// For now, show a message that this feature is not yet implemented
			toast.info("Voice generation feature is coming soon!");

			// Placeholder for future implementation:
			// const response = await fetch("https://external-tts-api.com/generate", {
			//   method: "POST",
			//   headers: {
			//     "Content-Type": "application/json",
			//   },
			//   body: JSON.stringify({
			//     text: text.trim(),
			//     voiceId: selectedVoice.id,
			//   }),
			// });

			// if (!response.ok) {
			//   throw new Error(`HTTP ${response.status}`);
			// }

			// const data = await response.json();
			// Handle successful generation...
		} catch (error) {
			console.error("Error generating voice:", error);
			toast.error("Voice generation is not yet implemented.");
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className="flex flex-1 flex-col max-w-full">
			<div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
				AI Voice Generation
			</div>

			<div className="space-y-4 p-4">
				{/* Text Input */}
				<div className="space-y-2">
					<Label className="font-sans text-xs font-semibold">
						Enter your script
					</Label>

					<Textarea
						id="text-input"
						placeholder="Type or paste your text here to generate AI voice..."
						value={text}
						onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
							setText(e.target.value)
						}
						className="min-h-[120px] resize-none"
						disabled={isGenerating}
					/>
				</div>

				{/* Voice Selection */}
				<div className="space-y-3">
					<div className="flex gap-2 min-w-0 flex-col">
						<Label className="font-sans text-xs font-semibold">
							Select voice
						</Label>
						<Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
							<PopoverTrigger asChild>
								{selectedVoice ? (
									(() => {
										const displayName = selectedVoice.name.split("-")[0].trim();
										return (
											<div
												aria-label="Change selected voice"
												onClick={(e) => {
													if (
														(e.target as HTMLElement).closest(
															".voice-preview-btn",
														)
													)
														return;
												}}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														if (
															(e.target as HTMLElement).closest(
																".voice-preview-btn",
															)
														)
															return;
														e.preventDefault();
														e.currentTarget.click();
													}
												}}
												className={cn(
													buttonVariants({ variant: "outline" }),
													"flex-1 min-w-0 h-7 justify-between text-xs w-full relative",
												)}
											>
												<div className="flex items-center gap-2 flex-1 min-w-0">
													<Button
														size="icon"
														variant="ghost"
														className="h-5 w-5 flex-shrink-0 p-0 hover:bg-transparent voice-preview-btn"
														onClick={(e) => {
															e.stopPropagation();
															handlePlayPause(
																selectedVoice.id,
																selectedVoice.previewUrl,
															);
														}}
													>
														{currentlyPlayingId === selectedVoice.id ? (
															<Pause className="h-3 w-3" />
														) : (
															<Play className="h-3 w-3" />
														)}
													</Button>
													<span className="truncate">{displayName}</span>
												</div>
												<ChevronDown className="h-4 w-4 flex-shrink-0" />
											</div>
										);
									})()
								) : (
									<Button
										variant="outline"
										className="flex-1 min-w-0 h-7 justify-between text-xs w-full"
										type="button"
									>
										<span className="truncate">Select voice</span>
										<ChevronDown className="h-4 w-4 flex-shrink-0" />
									</Button>
								)}
							</PopoverTrigger>
							<PopoverContent
								side="bottom"
								className="w-[420px] max-h-[500px] overflow-hidden bg-zinc-900 text-white p-0"
								align="start"
							>
								<div className="space-y-4">
									{/* Filters Row */}
									<div className="flex gap-2 mb-2 p-2">
										<Select
											value={filters.language}
											onValueChange={(value) => {
												const newFilters = { ...filters, language: value };
												setFilters(newFilters);
												applyFilters(newFilters);
											}}
										>
											<SelectTrigger
												id="language-select"
												className="w-1/2 bg-zinc-800 border-zinc-700"
											>
												<span className="flex items-center gap-2">
													<span className="fi fi-{filters.language}" />
													<SelectValue placeholder="Language" />
												</span>
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Languages</SelectItem>
												{filterOptions.language.map((lang) => (
													<SelectItem key={lang} value={lang}>
														{languageNames[lang] || lang}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Select
											value={filters.gender}
											onValueChange={(value) => {
												const newFilters = { ...filters, gender: value };
												setFilters(newFilters);
												applyFilters(newFilters);
											}}
										>
											<SelectTrigger
												id="gender-select"
												className="w-1/2 bg-zinc-800 border-zinc-700"
											>
												<SelectValue placeholder="Gender" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">Gender</SelectItem>
												{filterOptions.gender.map((gender) => (
													<SelectItem key={gender} value={gender}>
														{gender.charAt(0).toUpperCase() + gender.slice(1)}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									{/* Voice List */}
									<ScrollArea className="h-[400px] pr-2 text-sm">
										<div className="flex flex-col gap-1">
											{voices.map((voice) => {
												const isRowSelected = selectedVoice?.id === voice.id;
												return (
													<div
														key={voice.id}
														className={`flex items-center px-2 rounded-lg  py-2 cursor-pointer transition-colors ${isRowSelected ? "bg-blue-600 text-white" : "hover:bg-zinc-800/80 text-white/90"}`}
														onClick={() => {
															setSelectedVoice(voice);
															setIsPopoverOpen(false);
														}}
													>
														{/* Voice Info */}
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																{/* Play Button */}
																<Button
																	size="icon"
																	variant={
																		isRowSelected ? "secondary" : "ghost"
																	}
																	className={`flex-shrink-0 ${isRowSelected ? "bg-white/20 text-white" : "text-white/80"}`}
																	onClick={(e) => {
																		e.stopPropagation();
																		handlePlayPause(voice.id, voice.previewUrl);
																	}}
																>
																	{currentlyPlayingId === voice.id ? (
																		<Pause className="h-5 w-5" />
																	) : (
																		<Play className="h-5 w-5" />
																	)}
																</Button>
																<div className="flex items-center gap-2">
																	{(() => {
																		const parts = voice.name.split(" - ");
																		const name = parts[0];
																		const description = parts[1];

																		return (
																			<div className="truncate">
																				<span>{name}</span>
																				{description && (
																					<span className="text-muted-foreground">
																						{" "}
																						- {description}
																					</span>
																				)}
																			</div>
																		);
																	})()}
																</div>
															</div>

															<div className="flex flex-wrap gap-1 mt-1">
																<Badge
																	variant="secondary"
																	className="text-xs bg-zinc-700/60 border-none text-white/90 rounded-sm"
																>
																	{voice.gender.charAt(0).toUpperCase() +
																		voice.gender.slice(1)}
																</Badge>
																{voice.age && (
																	<Badge
																		variant="secondary"
																		className="text-xs bg-zinc-700/60 border-none text-white/90 rounded-sm"
																	>
																		{voice.age.charAt(0).toUpperCase() +
																			voice.age.slice(1)}
																	</Badge>
																)}
																{voice.useCase && (
																	<Badge
																		variant="secondary"
																		className="text-xs bg-zinc-700/60 border-none text-white/90 rounded-sm"
																	>
																		{voice.useCase}
																	</Badge>
																)}

																{voice.category && (
																	<Badge
																		variant="secondary"
																		className="text-xs bg-zinc-700/60 border-none text-white/90 rounded-sm"
																	>
																		{voice.category}
																	</Badge>
																)}
															</div>
														</div>
													</div>
												);
											})}
											{voices.length === 0 && !loading && (
												<div className="text-center py-8 text-muted-foreground">
													<p>No voices found. Try adjusting your filters.</p>
												</div>
											)}
										</div>
									</ScrollArea>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				<div className="flex items-center justify-between">
					<Button
						onClick={handleGenerate}
						disabled={!text.trim() || !selectedVoice || isGenerating}
						className="flex items-center gap-2 w-full"
						size={"sm"}
					>
						{isGenerating ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Generating...
							</>
						) : (
							"Generate Voice"
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};
