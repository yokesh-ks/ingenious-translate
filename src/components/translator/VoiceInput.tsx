import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Mic, MicOff } from "lucide-react";
import { useEffect, useState } from "react";

interface VoiceInputProps {
	onTranscript: (text: string, isFinal: boolean) => void;
	lang?: string;
	className?: string;
}

export function VoiceInput({
	onTranscript,
	lang = "en-US",
	className,
}: VoiceInputProps) {
	const [error, setError] = useState<string | null>(null);

	const { isListening, isSupported, startListening, stopListening } =
		useSpeechRecognition({
			onResult: (text, isFinal) => {
				onTranscript(text, isFinal);
			},
			onError: (err) => {
				setError(err);
				// Clear error after 3 seconds
				setTimeout(() => setError(null), 3000);
			},
		});

	const handleClick = () => {
		if (isListening) {
			stopListening();
		} else {
			// Convert generic lang code (e.g. "en") to specific region if needed
			// Web Speech API usually handles "en" as "en-US", but let's be safe
			let speechLang = lang;
			if (lang === "en") speechLang = "en-US";
			// Add more mappings if necessary

			startListening(speechLang);
		}
	};

	if (!isSupported) {
		return null; // Don't render if not supported
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={isListening ? "default" : "neutral"}
						size="icon"
						onClick={handleClick}
						className={`${className} ${isListening ? "animate-pulse" : ""}`}
						type="button"
						aria-label={isListening ? "Stop listening" : "Start voice input"}
					>
						{isListening ? (
							<Mic className="h-4 w-4" />
						) : (
							<Mic className="h-4 w-4" />
						)}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>
						{error
							? `Error: ${error}`
							: isListening
								? "Stop listening"
								: "Voice input"}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
