// TTS Speaker button component
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface TTSSpeakerProps {
	onClick: () => void;
	isSpeaking?: boolean;
	disabled?: boolean;
}

export function TTSSpeaker({
	onClick,
	isSpeaking = false,
	disabled = false,
}: TTSSpeakerProps) {
	return (
		<Button
			variant="neutral"
			size="icon"
			onClick={onClick}
			disabled={disabled}
			aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
		>
			{isSpeaking ? (
				<VolumeX className="h-4 w-4" />
			) : (
				<Volume2 className="h-4 w-4" />
			)}
		</Button>
	);
}
