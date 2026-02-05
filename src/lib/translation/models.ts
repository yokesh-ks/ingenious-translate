// Model configuration and language definitions

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

// Supported languages for translation
export const SUPPORTED_LANGUAGES: LanguagePair[] = [
	{ code: "en", name: "English", nativeName: "English" },
	{ code: "es", name: "Spanish", nativeName: "Español" },
	{ code: "fr", name: "French", nativeName: "Français" },
	{ code: "de", name: "German", nativeName: "Deutsch" },
	{ code: "zh", name: "Chinese", nativeName: "中文" },
	{ code: "ja", name: "Japanese", nativeName: "日本語" },
	{ code: "ko", name: "Korean", nativeName: "한국어" },
	{ code: "pt", name: "Portuguese", nativeName: "Português" },
	{ code: "ru", name: "Russian", nativeName: "Русский" },
	{ code: "ar", name: "Arabic", nativeName: "العربية" },
	{ code: "hi", name: "Hindi", nativeName: "हिन्दी" },
	{ code: "it", name: "Italian", nativeName: "Italiano" },
	{ code: "nl", name: "Dutch", nativeName: "Nederlands" },
	{ code: "pl", name: "Polish", nativeName: "Polski" },
	{ code: "tr", name: "Turkish", nativeName: "Türkçe" },
	{ code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
	{ code: "th", name: "Thai", nativeName: "ไทย" },
	{ code: "uk", name: "Ukrainian", nativeName: "Українська" },
];

// Model configurations for common language pairs
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
	"en-es": {
		modelId: "Xenova/opus-mt-en-es",
		quantized: true,
		size: 50,
		languages: ["en", "es"],
	},
	"en-fr": {
		modelId: "Xenova/opus-mt-en-fr",
		quantized: true,
		size: 45,
		languages: ["en", "fr"],
	},
	"en-de": {
		modelId: "Xenova/opus-mt-en-de",
		quantized: true,
		size: 48,
		languages: ["en", "de"],
	},
	"en-zh": {
		modelId: "Xenova/opus-mt-en-zh",
		quantized: true,
		size: 55,
		languages: ["en", "zh"],
	},
	"en-ja": {
		modelId: "Xenova/opus-mt-en-ja",
		quantized: true,
		size: 60,
		languages: ["en", "ja"],
	},
	"en-ko": {
		modelId: "Xenova/opus-mt-en-ko",
		quantized: true,
		size: 52,
		languages: ["en", "ko"],
	},
	"en-pt": {
		modelId: "Xenova/opus-mt-en-pt",
		quantized: true,
		size: 47,
		languages: ["en", "pt"],
	},
	"en-ru": {
		modelId: "Xenova/opus-mt-en-ru",
		quantized: true,
		size: 58,
		languages: ["en", "ru"],
	},
	"en-ar": {
		modelId: "Xenova/opus-mt-en-ar",
		quantized: true,
		size: 54,
		languages: ["en", "ar"],
	},
	"en-hi": {
		modelId: "Xenova/opus-mt-en-hi",
		quantized: true,
		size: 51,
		languages: ["en", "hi"],
	},
	"en-it": {
		modelId: "Xenova/opus-mt-en-it",
		quantized: true,
		size: 46,
		languages: ["en", "it"],
	},
	"es-en": {
		modelId: "Xenova/opus-mt-es-en",
		quantized: true,
		size: 49,
		languages: ["es", "en"],
	},
	"fr-en": {
		modelId: "Xenova/opus-mt-fr-en",
		quantized: true,
		size: 44,
		languages: ["fr", "en"],
	},
	"de-en": {
		modelId: "Xenova/opus-mt-de-en",
		quantized: true,
		size: 47,
		languages: ["de", "en"],
	},
	"zh-en": {
		modelId: "Xenova/opus-mt-zh-en",
		quantized: true,
		size: 52,
		languages: ["zh", "en"],
	},
	"ja-en": {
		modelId: "Xenova/opus-mt-ja-en",
		quantized: true,
		size: 55,
		languages: ["ja", "en"],
	},
	"ko-en": {
		modelId: "Xenova/opus-mt-ko-en",
		quantized: true,
		size: 48,
		languages: ["ko", "en"],
	},
	"ru-en": {
		modelId: "Xenova/opus-mt-ru-en",
		quantized: true,
		size: 58,
		languages: ["ru", "en"],
	},
	"ar-en": {
		modelId: "Xenova/opus-mt-ar-en",
		quantized: true,
		size: 54,
		languages: ["ar", "en"],
	},
	"fr-de": {
		modelId: "Xenova/opus-mt-fr-de",
		quantized: true,
		size: 45,
		languages: ["fr", "de"],
	},
	"es-fr": {
		modelId: "Xenova/opus-mt-es-fr",
		quantized: true,
		size: 42,
		languages: ["es", "fr"],
	},
	"it-en": {
		modelId: "Xenova/opus-mt-it-en",
		quantized: true,
		size: 46,
		languages: ["it", "en"],
	},
	"pt-en": {
		modelId: "Xenova/opus-mt-pt-en",
		quantized: true,
		size: 47,
		languages: ["pt", "en"],
	},
};

// Get model ID for a language pair
export function getModelId(sourceLang: string, targetLang: string): string {
	const key = `${sourceLang}-${targetLang}`;
	return (
		MODEL_CONFIGS[key]?.modelId || `Xenova/opus-mt-${sourceLang}-${targetLang}`
	);
}

// Get model config for a language pair
export function getModelConfig(
	sourceLang: string,
	targetLang: string,
): ModelConfig | null {
	const key = `${sourceLang}-${targetLang}`;
	return MODEL_CONFIGS[key] || null;
}

// Check if a language pair is supported
export function isLanguagePairSupported(
	sourceLang: string,
	targetLang: string,
): boolean {
	const key = `${sourceLang}-${targetLang}`;
	return key in MODEL_CONFIGS;
}

// Get all supported language pairs
export function getSupportedLanguagePairs(): string[] {
	return Object.keys(MODEL_CONFIGS);
}

// Get language by code
export function getLanguageByCode(code: string): LanguagePair | undefined {
	return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}
