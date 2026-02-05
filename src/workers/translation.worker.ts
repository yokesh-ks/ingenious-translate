// Translation Web Worker - handles ML inference off the main thread
import { env, pipeline } from "@xenova/transformers";

// Skip local model checks since we're loading from Hugging Face
env.allowLocalModels = false;
env.useBrowserCache = false;

// Add debugging
console.log("✅ Translation Worker initialized");
console.log("📦 transformers.js loaded:", typeof pipeline);

// Log environment configuration
console.log("🔧 env.allowLocalModels:", env.allowLocalModels);
console.log("🔧 env.useBrowserCache:", env.useBrowserCache);

// State
let translator:
	| ((text: string, options?: Record<string, unknown>) => Promise<unknown>)
	| null = null;
let currentModelId: string | null = null;

// Message handler
self.onmessage = async (
	event: MessageEvent<{
		type: string;
		payload: Record<string, unknown>;
	}>,
) => {
	const { type, payload } = event.data;

	console.log("📨 Received message:", type, payload);

	try {
		switch (type) {
			case "loadModel":
				console.log("🔄 Loading model:", payload);
				await handleLoadModel(
					payload as {
						modelId: string;
						sourceLang: string;
						targetLang: string;
					},
				);
				break;
			case "unloadModel":
				await handleUnloadModel();
				break;
			case "translate":
				console.log("🔄 Translating:", payload);
				await handleTranslate(
					payload as {
						text: string;
						sourceLang: string;
						targetLang: string;
					},
				);
				break;
			default:
				console.warn(`Unknown message type: ${type}`);
		}
	} catch (error) {
		console.error("❌ Worker error:", error);
		self.postMessage({
			type: "error",
			payload: {
				message: error instanceof Error ? error.message : String(error),
			},
		});
	}
};

async function handleLoadModel(payload: {
	modelId: string;
	sourceLang: string;
	targetLang: string;
}) {
	const { modelId, sourceLang, targetLang } = payload;
	console.log("🔄 handleLoadModel called with:", {
		modelId,
		sourceLang,
		targetLang,
	});

	// If already loaded, skip
	if (translator && currentModelId === modelId) {
		console.log("✅ Model already loaded, skipping");
		self.postMessage({
			type: "loaded",
			payload: { modelId, status: "ready" },
		});
		return;
	}

	self.postMessage({
		type: "status",
		payload: { status: "loading", message: "Loading model..." },
	});

	try {
		console.log("📦 Creating translation pipeline for:", modelId);
		// Create the translation pipeline
		translator = await pipeline("translation", modelId, {
			quantized: true,
			progress_callback: (data: {
				status: string;
				progress?: number;
				file?: string;
			}) => {
				console.log("📥 Progress:", data.status, data.progress, data.file);
				if (data.status === "progress") {
					self.postMessage({
						type: "progress",
						payload: {
							progress: data.progress || 0,
							status: `Downloading ${data.file || "model"}...`,
						},
					});
				}
			},
		});

		currentModelId = modelId;
		console.log("✅ Model loaded successfully");

		self.postMessage({
			type: "loaded",
			payload: { modelId, status: "ready" },
		});

		self.postMessage({
			type: "status",
			payload: { status: "ready", message: "Model loaded" },
		});
	} catch (error) {
		console.error("❌ Failed to load model:", error);
		throw new Error(
			`Failed to load model ${modelId}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

async function handleUnloadModel() {
	translator = null;
	currentModelId = null;

	// @ts-ignore - gc is a Node.js function, may not be available in all environments
	if (typeof gc === "function") {
		// @ts-ignore
		gc();
	}

	self.postMessage({
		type: "status",
		payload: { status: "idle", message: "Model unloaded" },
	});
}

async function handleTranslate(payload: {
	text: string;
	sourceLang: string;
	targetLang: string;
}) {
	const { text, sourceLang, targetLang } = payload;
	console.log("🔄 handleTranslate called with:", {
		text,
		sourceLang,
		targetLang,
	});

	if (!translator) {
		console.error("❌ Model not loaded");
		throw new Error("Model not loaded");
	}

	if (!text.trim()) {
		console.error("❌ Empty text to translate");
		throw new Error("Empty text to translate");
	}

	self.postMessage({
		type: "status",
		payload: { status: "translating", message: "Translating..." },
	});

	try {
		console.log("📝 Translating text:", text);

		// Perform translation with streaming support
		const result = await translator(text, {
			src_lang: sourceLang,
			tgt_lang: targetLang,
			// Streaming callback for partial outputs
			callback_function: (output: any) => {
				// Get the tokenizer from the translator pipeline
				const partialTranslation = (translator as any).tokenizer.decode(
					output[0].output_token_ids,
					{ skip_special_tokens: true },
				);

				console.log("📤 Streaming update:", partialTranslation);

				// Send partial translation to main thread
				self.postMessage({
					type: "update",
					payload: {
						translation: partialTranslation,
						isPartial: true,
					},
				});
			},
		});

		console.log("✅ Translation result:", result);

		// Send final translation
		self.postMessage({
			type: "result",
			payload: {
				translation: (result as any).translation_text,
				confidence: 1.0, // transformers.js doesn't provide confidence scores
				isPartial: false,
			},
		});

		self.postMessage({
			type: "status",
			payload: { status: "complete", message: "Translation complete" },
		});
	} catch (error) {
		console.error("❌ Translation failed:", error);
		throw new Error(
			`Translation failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
