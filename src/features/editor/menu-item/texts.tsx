import Draggable from "@/components/shared/draggable";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dispatch } from "@designcombo/events";
import { ADD_AUDIO, ADD_IMAGE, ADD_TEXT } from "@designcombo/state";
import { nanoid } from "nanoid";
import { TEXT_ADD_PAYLOAD } from "../constants/payload";
import { useIsDraggingOverTimeline } from "../hooks/is-dragging-over-timeline";

export const Texts = () => {
	const isDraggingOverTimeline = useIsDraggingOverTimeline();

	const handleAddText = () => {
		dispatch(ADD_TEXT, {
			payload: { ...TEXT_ADD_PAYLOAD, id: nanoid() },
			options: {},
		});
	};

	return (
		<div className="flex flex-1 flex-col">
			<div className="text-text-primary flex h-12 flex-none items-center px-4 text-sm font-medium">
				Text
			</div>
			<div className="flex flex-col gap-2 px-4">
				<Draggable
					data={TEXT_ADD_PAYLOAD}
					renderCustomPreview={
						<Button variant="secondary" className="w-60">
							Add text
						</Button>
					}
					shouldDisplayPreview={!isDraggingOverTimeline}
				>
					<div
						onClick={handleAddText}
						className={cn(
							buttonVariants({ variant: "default" }),
							"cursor-pointer",
						)}
					>
						Add text
					</div>
				</Draggable>
			</div>
		</div>
	);
};
