import { useCallback, useEffect, useRef, useState } from "react";

// Define strict types for Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
	error: string;
	message: string;
}

interface SpeechRecognitionEvent extends Event {
	resultIndex: number;
	results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
	length: number;
	item(index: number): SpeechRecognitionResult;
	[index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
	isFinal: boolean;
	length: number;
	item(index: number): SpeechRecognitionAlternative;
	[index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
	transcript: string;
	confidence: number;
}

interface SpeechRecognition extends EventTarget {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	start(): void;
	stop(): void;
	abort(): void;
	onresult: ((event: SpeechRecognitionEvent) => void) | null;
	onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
	onend: (() => void) | null;
}

// Window interface augmentation
declare global {
	interface Window {
		SpeechRecognition: {
			new (): SpeechRecognition;
		};
		webkitSpeechRecognition: {
			new (): SpeechRecognition;
		};
	}
}

interface UseSpeechRecognitionProps {
	onResult?: (text: string, isFinal: boolean) => void;
	onError?: (error: string) => void;
}

export function useSpeechRecognition({
	onResult,
	onError,
}: UseSpeechRecognitionProps = {}) {
	const [isListening, setIsListening] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const recognitionRef = useRef<SpeechRecognition | null>(null);

	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			(window.SpeechRecognition || window.webkitSpeechRecognition)
		) {
			setIsSupported(true);
		}
	}, []);

	const startListening = useCallback(
		(lang = "en-US") => {
			if (!isSupported) {
				console.error("Speech recognition not supported");
				return;
			}

			// Clean up previous instance
			if (recognitionRef.current) {
				recognitionRef.current.abort();
			}

			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			const recognition = new SpeechRecognition();

			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = lang;

			recognition.onresult = (event: SpeechRecognitionEvent) => {
				let interimTranscript = "";
				let finalTranscript = "";

				for (let i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						finalTranscript += event.results[i][0].transcript;
					} else {
						interimTranscript += event.results[i][0].transcript;
					}
				}

				if (onResult) {
					// Prefer final transcript, otherwise send interim
					// If we have final transcript, we send it as final
					if (finalTranscript) {
						onResult(finalTranscript, true);
					}
					// If we have interim transcript, we can send it as partial
					// Note: The UI consuming this needs to handle appending or replacing
					if (interimTranscript) {
						onResult(interimTranscript, false);
					}
				}
			};

			recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
				console.error("Speech recognition error", event.error);
				if (onError) onError(event.error);
				setIsListening(false);
			};

			recognition.onend = () => {
				setIsListening(false);
			};

			try {
				recognition.start();
				setIsListening(true);
				recognitionRef.current = recognition;
			} catch (error) {
				console.error("Failed to start recognition", error);
				setIsListening(false);
			}
		},
		[isSupported, onResult, onError],
	);

	const stopListening = useCallback(() => {
		if (recognitionRef.current) {
			recognitionRef.current.stop();
			setIsListening(false);
		}
	}, []);

	return {
		isListening,
		isSupported,
		startListening,
		stopListening,
	};
}
