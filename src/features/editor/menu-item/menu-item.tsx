import { useIsLargeScreen } from "@/hooks/use-media-query";
import useLayoutStore from "../store/use-layout-store";
import { AiVoice } from "./ai-voice";
import { Audios } from "./audios";
import { Captions } from "./captions";
import { Elements } from "./elements";
import { Images } from "./images";
import { Texts } from "./texts";
import { Transitions } from "./transitions";
import { Uploads } from "./uploads";
import { Videos } from "./videos";
import { VoiceOver } from "./voice-over";

const ActiveMenuItem = () => {
	const { activeMenuItem } = useLayoutStore();

	if (activeMenuItem === "transitions") {
		return <Transitions />;
	}
	if (activeMenuItem === "texts") {
		return <Texts />;
	}
	if (activeMenuItem === "shapes") {
		return <Elements />;
	}
	if (activeMenuItem === "videos") {
		return <Videos />;
	}
	if (activeMenuItem === "captions") {
		return <Captions />;
	}

	if (activeMenuItem === "audios") {
		return <Audios />;
	}

	if (activeMenuItem === "images") {
		return <Images />;
	}

	if (activeMenuItem === "voiceOver") {
		return <VoiceOver />;
	}
	if (activeMenuItem === "elements") {
		return <Elements />;
	}
	if (activeMenuItem === "uploads") {
		return <Uploads />;
	}

	if (activeMenuItem === "ai-voice") {
		return <AiVoice />;
	}

	return null;
};

export const MenuItem = () => {
	const isLargeScreen = useIsLargeScreen();

	return (
		<div className={`${isLargeScreen ? "w-[300px]" : "w-full"} flex-1 flex`}>
			<ActiveMenuItem />
		</div>
	);
};
