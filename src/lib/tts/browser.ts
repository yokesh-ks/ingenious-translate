// Basic wrapper for Web Speech API's SpeechSynthesis

export interface Voice {
	name: string;
	lang: string;
	default: boolean;
	localService: boolean;
	voiceURI: string;
}

export function isTTSAvailable(): boolean {
	return "speechSynthesis" in window;
}

export function getVoices(): Promise<Voice[]> {
	return new Promise((resolve) => {
		if (!isTTSAvailable()) {
			resolve([]);
			return;
		}

		const voices = window.speechSynthesis.getVoices();
		if (voices.length > 0) {
			resolve(
				voices.map((v) => ({
					name: v.name,
					lang: v.lang,
					default: v.default,
					localService: v.localService,
					voiceURI: v.voiceURI,
				})),
			);
			return;
		}

		// Voices might be loaded asynchronously
		window.speechSynthesis.onvoiceschanged = () => {
			const voices = window.speechSynthesis.getVoices();
			resolve(
				voices.map((v) => ({
					name: v.name,
					lang: v.lang,
					default: v.default,
					localService: v.localService,
					voiceURI: v.voiceURI,
				})),
			);
		};
	});
}

export function speak(
	text: string,
	lang: string,
	onStart?: () => void,
	onEnd?: () => void,
	onError?: (error: any) => void,
): void {
	if (!isTTSAvailable() || !text) return;

	// Cancel any ongoing speech
	window.speechSynthesis.cancel();

	const utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = lang;

	// Try to match voice to language better if possible
	// This is a simple heuristic, can be improved
	// const voices = window.speechSynthesis.getVoices();
	// const matchingVoice = voices.find(v => v.lang.startsWith(lang));
	// if (matchingVoice) {
	//   utterance.voice = matchingVoice;
	// }

	if (onStart) utterance.onstart = onStart;
	if (onEnd) utterance.onend = onEnd;
	if (onError) utterance.onerror = onError;

	window.speechSynthesis.speak(utterance);
}

export function stop(): void {
	if (!isTTSAvailable()) return;
	window.speechSynthesis.cancel();
}
