import {
	browserTTS,
	cancelSpeech,
	getVoices,
	isTTSAvailable,
} from "@/lib/tts/browser";
import type { TTSState } from "@/types/translation";
// Text-to-Speech hook
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_TTS_STATE: TTSState = {
	isSpeaking: false,
	isLoading: false,
	voices: [],
	selectedVoice: null,
};

export function useTTS() {
	const [state, setState] = useState<TTSState>(DEFAULT_TTS_STATE);
	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

	// Load available voices
	useEffect(() => {
		if (!isTTSAvailable()) {
			console.warn("Web Speech API not available");
			return;
		}

		const loadVoices = () => {
			const voices = getVoices();
			setState((prev) => ({
				...prev,
				voices,
				selectedVoice: prev.selectedVoice || voices[0] || null,
			}));
		};

		// Voices might not be available immediately
		loadVoices();
		speechSynthesis.addEventListener("voiceschanged", loadVoices);

		return () => {
			speechSynthesis.removeEventListener("voiceschanged", loadVoices);
		};
	}, []);

	const speak = useCallback(
		async (text: string, lang?: string) => {
			if (!text.trim()) return;

			// Cancel any ongoing speech
			cancelSpeech();

			setState((prev) => ({ ...prev, isLoading: true }));

			const utterance = browserTTS(text, {
				lang: lang || state.selectedVoice?.lang,
				voice: state.selectedVoice,
			});

			utterance.onstart = () => {
				setState((prev) => ({ ...prev, isSpeaking: true, isLoading: false }));
			};

			utterance.onend = () => {
				setState((prev) => ({ ...prev, isSpeaking: false }));
			};

			utterance.onerror = () => {
				setState((prev) => ({ ...prev, isSpeaking: false, isLoading: false }));
			};

			utteranceRef.current = utterance;
			speechSynthesis.speak(utterance);
		},
		[state.selectedVoice],
	);

	const stop = useCallback(() => {
		cancelSpeech();
		setState((prev) => ({ ...prev, isSpeaking: false }));
	}, []);

	const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
		setState((prev) => ({ ...prev, selectedVoice: voice }));
	}, []);

	const toggleSpeaking = useCallback(() => {
		if (state.isSpeaking) {
			stop();
		}
	}, [state.isSpeaking, stop]);

	return {
		speak,
		stop,
		setVoice,
		voices: state.voices,
		selectedVoice: state.selectedVoice,
		isSpeaking: state.isSpeaking,
		isLoading: state.isLoading,
		toggleSpeaking,
	};
}
