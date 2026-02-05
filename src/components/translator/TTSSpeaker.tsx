import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTTS } from "@/hooks/useTTS";
import { Loader2, Play, Square, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

interface TTSSpeakerProps {
	text: string;
	lang: string;
	className?: string;
	label?: string;
}

export function TTSSpeaker({
	text,
	lang,
	className,
	label = "Listen",
}: TTSSpeakerProps) {
	const { speak, stop, isPlaying, isSupported, error } = useTTS();
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		if (error) {
			setHasError(true);
			const timer = setTimeout(() => setHasError(false), 3000);
			return () => clearTimeout(timer);
		}
	}, [error]);

	const handleClick = () => {
		if (isPlaying) {
			stop();
		} else {
			speak(text, lang);
		}
	};

	if (!isSupported) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="neutral"
							size="icon"
							disabled
							className={className}
							aria-label="Text-to-speech not supported"
						>
							<VolumeX className="h-4 w-4 opacity-50" />
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						<p>Text-to-speech not supported</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="neutral"
						size="icon"
						onClick={handleClick}
						disabled={!text}
						className={className}
						aria-label={isPlaying ? "Stop speaking" : label}
					>
						{isPlaying ? (
							<Square className="h-4 w-4 fill-current" />
						) : hasError ? (
							<VolumeX className="h-4 w-4 text-destructive" />
						) : (
							<Volume2 className="h-4 w-4" />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{isPlaying ? "Stop" : error ? "Error" : label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
