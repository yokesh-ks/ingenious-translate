import { useCallback, useEffect, useState } from "react";
import {
	getVoices,
	isTTSAvailable,
	speak as browserSpeak,
	stop as browserStop,
	type Voice,
} from "@/lib/tts/browser";

interface TTSState {
	isSupported: boolean;
	isPlaying: boolean;
	voices: Voice[];
	error: string | null;
}

export function useTTS() {
	const [state, setState] = useState<TTSState>({
		isSupported: false,
		isPlaying: false,
		voices: [],
		error: null,
	});

	useEffect(() => {
		const supported = isTTSAvailable();
		setState((prev) => ({ ...prev, isSupported: supported }));

		if (supported) {
			getVoices().then((voices) => {
				setState((prev) => ({ ...prev, voices }));
			});
		}
	}, []);

	const speak = useCallback(
		(text: string, lang: string) => {
			if (!state.isSupported) {
				setState((prev) => ({
					...prev,
					error: "Text-to-speech is not supported in this browser",
				}));
				return;
			}

			setState((prev) => ({ ...prev, isPlaying: true, error: null }));

			browserSpeak(
				text,
				lang,
				() => {
					// onStart
					setState((prev) => ({ ...prev, isPlaying: true }));
				},
				() => {
					// onEnd
					setState((prev) => ({ ...prev, isPlaying: false }));
				},
				(error) => {
					// onError
					console.error("TTS Error:", error);
					setState((prev) => ({
						...prev,
						isPlaying: false,
						error: "Failed to play audio",
					}));
				},
			);
		},
		[state.isSupported],
	);

	const stop = useCallback(() => {
		browserStop();
		setState((prev) => ({ ...prev, isPlaying: false }));
	}, []);

	return {
		...state,
		speak,
		stop,
	};
}
