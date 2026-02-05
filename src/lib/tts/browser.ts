// Web Speech API wrapper for Text-to-Speech

export interface TTSOptions {
	lang?: string;
	voice?: SpeechSynthesisVoice | null;
	pitch?: number;
	rate?: number;
	volume?: number;
}

// Create a speech utterance
export function browserTTS(
	text: string,
	options?: TTSOptions,
): SpeechSynthesisUtterance {
	const utterance = new SpeechSynthesisUtterance(text);

	if (options?.lang) {
		utterance.lang = options.lang;
	}

	if (options?.voice) {
		utterance.voice = options.voice;
	}

	if (options?.pitch !== undefined) {
		utterance.pitch = options.pitch;
	}

	if (options?.rate !== undefined) {
		utterance.rate = options.rate;
	}

	if (options?.volume !== undefined) {
		utterance.volume = options.volume;
	}

	return utterance;
}

// Get all available voices
export function getVoices(): SpeechSynthesisVoice[] {
	return speechSynthesis.getVoices();
}

// Get voices for a specific language
export function getVoicesForLang(lang: string): SpeechSynthesisVoice[] {
	const voices = getVoices();
	return voices.filter((voice) => voice.lang.startsWith(lang));
}

// Check if TTS is available
export function isTTSAvailable(): boolean {
	return "speechSynthesis" in window;
}

// Get the default voice for a language
export function getDefaultVoiceForLang(
	lang: string,
): SpeechSynthesisVoice | null {
	const voices = getVoicesForLang(lang);
	return voices[0] || null;
}

// Cancel any ongoing speech
export function cancelSpeech(): void {
	speechSynthesis.cancel();
}

// Speak text with options
export function speak(
	text: string,
	options?: TTSOptions,
): SpeechSynthesisUtterance | null {
	if (!text.trim()) return null;

	const utterance = browserTTS(text, options);

	utterance.onstart = () => {
		// Speech started
	};

	utterance.onend = () => {
		// Speech ended
	};

	utterance.onerror = (event) => {
		console.error("TTS error:", event.error);
	};

	speechSynthesis.speak(utterance);
	return utterance;
}

// Check if currently speaking
export function isSpeaking(): boolean {
	return speechSynthesis.speaking;
}

// Pause speech
export function pauseSpeech(): void {
	speechSynthesis.pause();
}

// Resume speech
export function resumeSpeech(): void {
	speechSynthesis.resume();
}
