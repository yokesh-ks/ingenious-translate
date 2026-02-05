// Translation-related type definitions

export interface LanguagePair {
	code: string;
	name: string;
	nativeName: string;
}

export interface ModelConfig {
	modelId: string;
	quantized: boolean;
	size: number;
	languages: [string, string];
}

export interface CacheStatus {
	isCached: boolean;
	size: number;
	version: string;
}

export interface TranslationState {
	sourceLang: string;
	targetLang: string;
	inputText: string;
	outputText: string;
	isLoading: boolean;
	isTranslating: boolean;
	progress: number;
	status: "idle" | "loading" | "ready" | "translating" | "complete" | "error";
	error: string | null;
}

export interface TranslationActions {
	setSourceLang: (lang: string) => void;
	setTargetLang: (lang: string) => void;
	setInputText: (text: string) => void;
	translate: () => Promise<void>;
	clear: () => void;
	swapLanguages: () => void;
}

export interface WorkerState {
	isReady: boolean;
	isLoading: boolean;
	progress: number;
	lastMessage: { type: string; payload: Record<string, unknown> } | null;
}

export interface TTSState {
	isSpeaking: boolean;
	isLoading: boolean;
	voices: SpeechSynthesisVoice[];
	selectedVoice: SpeechSynthesisVoice | null;
}

export interface TTSOptions {
	lang?: string;
	voice?: SpeechSynthesisVoice;
	pitch?: number;
	rate?: number;
}

export interface StorageUsage {
	used: number;
	quota: number;
}

export interface CachedModel {
	modelKey: string;
	size: number;
	version: string;
}
