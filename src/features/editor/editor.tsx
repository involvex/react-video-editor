"use client";
const DynamicTimeline = dynamic(() => import("./timeline"), { ssr: false });
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsLargeScreen } from "@/hooks/use-media-query";
import { useSceneStore } from "@/store/use-scene-store";
import { dispatch } from "@designcombo/events";
import StateManager, { DESIGN_LOAD } from "@designcombo/state";
import { ITrackItem } from "@designcombo/types";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { SECONDARY_FONT, SECONDARY_FONT_URL } from "./constants/constants";
const DynamicControlItem = dynamic(
	() => import("./control-item").then((mod) => mod.ControlItem),
	{ ssr: false },
);
const DynamicControlItemHorizontal = dynamic(
	() => import("./control-item-horizontal"),
	{ ssr: false },
);
const DynamicFloatingControl = dynamic(
	() => import("./control-item/floating-controls/floating-control"),
	{ ssr: false },
);
const DynamicCropModal = dynamic(() => import("./crop-modal/crop-modal"), {
	ssr: false,
});
import { FONTS } from "./data/fonts";
import useTimelineEvents from "./hooks/use-timeline-events";
const DynamicMenuItem = dynamic(
	() => import("./menu-item").then((mod) => mod.MenuItem),
	{ ssr: false },
);
const DynamicMenuList = dynamic(() => import("./menu-list"), { ssr: false });
const DynamicMenuListHorizontal = dynamic(
	() => import("./menu-list-horizontal"),
	{ ssr: false },
);
import { design } from "./mock";
const DynamicNavbar = dynamic(() => import("./navbar"), { ssr: false });
const DynamicScene = dynamic(() => import("./scene"), { ssr: false });
import { SceneRef } from "./scene/scene.types";
import useDataState from "./store/use-data-state";
import useLayoutStore from "./store/use-layout-store";
import useStore from "./store/use-store";
import { getCompactFontData, loadFonts } from "./utils/fonts";

const stateManager = new StateManager({
	size: {
		width: 1080,
		height: 1920,
	},
});

const Editor = ({ tempId, id }: { tempId?: string; id?: string }) => {
	const [projectName, setProjectName] = useState<string>("Untitled video");
	const { scene } = useSceneStore();
	const timelinePanelRef = useRef<ImperativePanelHandle>(null);
	const sceneRef = useRef<SceneRef>(null);
	const { timeline, playerRef } = useStore();
	const { activeIds, trackItemsMap, transitionsMap } = useStore();
	const [loaded, setLoaded] = useState(false);
	const [trackItem, setTrackItem] = useState<ITrackItem | null>(null);
	const {
		setTrackItem: setLayoutTrackItem,
		setFloatingControl,
		setLabelControlItem,
		setTypeControlItem,
	} = useLayoutStore();
	const isLargeScreen = useIsLargeScreen();

	useTimelineEvents();

	const { setCompactFonts, setFonts } = useDataState();

	useEffect(() => {
		dispatch(DESIGN_LOAD, { payload: design });
	}, []);

	useEffect(() => {
		setCompactFonts(getCompactFontData(FONTS));
		setFonts(FONTS);
	}, []);

	useEffect(() => {
		loadFonts([
			{
				name: SECONDARY_FONT,
				url: SECONDARY_FONT_URL,
			},
		]);
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const screenHeight = window.innerHeight;
			const desiredHeight = 300;
			const percentage = (desiredHeight / screenHeight) * 100;
			timelinePanelRef.current?.resize(percentage);
		}
	}, []);
	const handleTimelineResize = () => {
		const timelineContainer = document.getElementById("timeline-container");
		if (!timelineContainer) return;

		timeline?.resize(
			{
				height: timelineContainer.clientHeight - 90,
				width: timelineContainer.clientWidth - 40,
			},
			{
				force: true,
			},
		);

		// Trigger zoom recalculation when timeline is resized
		setTimeout(() => {
			sceneRef.current?.recalculateZoom();
		}, 100);
	};

	useEffect(() => {
		if (typeof window !== "undefined") {
			const onResize = () => handleTimelineResize();
			window.addEventListener("resize", onResize);
			return () => window.removeEventListener("resize", onResize);
		}
	}, [timeline]);
	// useEffect(() => {
	//   if (activeIds.length === 1) {
	//     const [id] = activeIds;
	//     const trackItem = trackItemsMap[id];
	//     if (trackItem) {
	//       setTrackItem(trackItem);
	//       setLayoutTrackItem(trackItem);
	//     } else console.log(transitionsMap[id]);
	//   } else {
	//     setTrackItem(null);
	//     setLayoutTrackItem(null);
	//   }
	// }, [activeIds, trackItemsMap]);

	useEffect(() => {
		setFloatingControl("");
		setLabelControlItem("");
		setTypeControlItem("");
	}, [isLargeScreen]);

	useEffect(() => {
		setLoaded(true);
	}, []);

	return (
		<div className="flex h-screen w-screen flex-col">
			<DynamicNavbar
				projectName={projectName}
				user={null}
				stateManager={stateManager}
				setProjectName={setProjectName}
			/>{" "}
			<div className="flex flex-1">
				{isLargeScreen && (
					<div className="bg-muted  flex flex-none border-r border-border/80 h-[calc(100vh-44px)]">
						<DynamicMenuList /> <DynamicMenuItem />
					</div>
				)}
				<ResizablePanelGroup className="flex-1" direction="vertical">
					<ResizablePanel className="relative" defaultSize={70}>
						<DynamicFloatingControl />{" "}
						<div className="flex h-full flex-1">
							{/* Sidebar only on large screens - conditionally mounted */}

							<div className="relative h-full w-full flex-1 overflow-hidden">
								<DynamicCropModal />{" "}
								<DynamicScene ref={sceneRef} stateManager={stateManager} />
							</div>
						</div>
					</ResizablePanel>
					<ResizableHandle />
					<ResizablePanel
						className="min-h-[50px]"
						ref={timelinePanelRef}
						defaultSize={30}
						onResize={handleTimelineResize}
					>
						{playerRef && <DynamicTimeline stateManager={stateManager} />}
					</ResizablePanel>
					{!isLargeScreen && !trackItem && loaded && (
						<DynamicMenuListHorizontal />
					)}
					{!isLargeScreen && trackItem && <DynamicControlItemHorizontal />}
				</ResizablePanelGroup>
				<DynamicControlItem />{" "}
			</div>
		</div>
	);
};

export default Editor;
