// Direct translation service that runs on the main thread
// This bypasses worker communication issues

import { env, pipeline } from "@xenova/transformers";

// Configure environment
env.allowLocalModels = false;
env.useBrowserCache = false;

let translator:
	| ((text: string, options?: Record<string, unknown>) => Promise<unknown>)
	| null = null;
let currentModelId: string | null = null;

export async function directTranslate(
	text: string,
	sourceLang: string,
	targetLang: string,
): Promise<string> {
	const modelId = `Xenova/opus-mt-${sourceLang}-${targetLang}`;

	console.log("🚀 Starting direct translation:", { modelId, text });

	// Initialize translator if needed
	if (!translator || currentModelId !== modelId) {
		console.log("📦 Loading model:", modelId);
		translator = await pipeline("translation", modelId, {
			quantized: true,
		});
		currentModelId = modelId;
		console.log("✅ Model loaded:", modelId);
	}

	// Perform translation
	console.log("🔄 Translating:", text);
	const result = await translator(text, {
		src_lang: sourceLang,
		tgt_lang: targetLang,
	});

	console.log("✅ Translation result:", result);

	// Handle both array and object results
	if (Array.isArray(result)) {
		return result[0]?.translation_text || "Translation failed";
	}

	return (
		(result as { translation_text?: string }).translation_text ||
		"Translation failed"
	);
}

export function isDirectTranslationReady(): boolean {
	return translator !== null;
}

export function resetDirectTranslation(): void {
	translator = null;
	currentModelId = null;
}
