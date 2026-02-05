// Model cache manager with IndexedDB storage
import {
	deleteModel,
	getAllModels,
	getMetadata,
	getModel,
	hasModel,
	saveModel,
	setMetadata,
} from "@/lib/storage/indexeddb";
import { MODEL_CONFIGS, getModelId } from "./models";

export interface CacheStatus {
	isCached: boolean;
	size: number;
	version: string;
}

// Check if a model is cached
export async function isModelCached(
	sourceLang: string,
	targetLang: string,
): Promise<CacheStatus> {
	const modelKey = `${sourceLang}-${targetLang}`;
	const config = MODEL_CONFIGS[modelKey];

	if (!config) {
		// Try dynamic model loading
		const dynamicModelId = getModelId(sourceLang, targetLang);
		const cached = await getModel(dynamicModelId);
		return {
			isCached: !!cached,
			size: cached?.size || 0,
			version: cached?.version || "unknown",
		};
	}

	const cached = await getModel(config.modelId);
	return {
		isCached: !!cached,
		size: cached?.size || 0,
		version: cached?.version || "unknown",
	};
}

// Download and cache a model
export async function downloadAndCacheModel(
	sourceLang: string,
	targetLang: string,
	onProgress?: (progress: number) => void,
): Promise<void> {
	const modelKey = `${sourceLang}-${targetLang}`;
	const config = MODEL_CONFIGS[modelKey];

	if (!config) {
		throw new Error(
			`No model configuration for ${sourceLang} -> ${targetLang}`,
		);
	}

	// Check if already cached
	const cached = await getModel(config.modelId);
	if (cached) {
		return;
	}

	// Download model from Hugging Face
	const response = await fetch(
		`https://huggingface.co/${config.modelId}/resolve/main/model.onnx`,
	);

	if (!response.ok) {
		throw new Error(`Failed to download model: ${response.statusText}`);
	}

	const reader = response.body?.getReader();
	if (!reader) {
		throw new Error("Response body is not readable");
	}

	const contentLength = response.headers.get("Content-Length");
	const total = Number.parseInt(contentLength || "0", 10);
	let received = 0;

	const chunks: BlobPart[] = [];

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;

		chunks.push(value.buffer);
		received += value.length;

		if (total > 0 && onProgress) {
			onProgress((received / total) * 100);
		}
	}

	const blob = new Blob(chunks);
	await saveModel(modelKey, config.modelId, blob, config.modelId);

	// Update version metadata
	await setMetadata(`version-${config.modelId}`, new Date().toISOString());
}

// Remove a cached model
export async function removeModel(
	sourceLang: string,
	targetLang: string,
): Promise<void> {
	const modelKey = `${sourceLang}-${targetLang}`;
	const config = MODEL_CONFIGS[modelKey];

	if (config) {
		await deleteModel(config.modelId);
	}
}

// Get all cached models
export async function getCachedModels(): Promise<
	Array<{
		modelKey: string;
		size: number;
		version: string;
	}>
> {
	const models = await getAllModels();
	return models.map((m) => ({
		modelKey: m.name,
		size: m.size,
		version: m.version,
	}));
}

// Clear all cached models
export async function clearAllCachedModels(): Promise<void> {
	const models = await getAllModels();
	for (const model of models) {
		await deleteModel(model.name);
	}
}

// Get the size of a cached model in MB
export async function getCachedModelSize(
	sourceLang: string,
	targetLang: string,
): Promise<number> {
	const modelKey = `${sourceLang}-${targetLang}`;
	const config = MODEL_CONFIGS[modelKey];

	if (!config) {
		return 0;
	}

	const cached = await getModel(config.modelId);
	return cached?.size || 0;
}

// Check if a newer version of a model is available
export async function checkForModelUpdate(
	sourceLang: string,
	targetLang: string,
): Promise<boolean> {
	const modelKey = `${sourceLang}-${targetLang}`;
	const config = MODEL_CONFIGS[modelKey];

	if (!config) {
		return false;
	}

	// In a real implementation, you would check against a remote version
	// For now, we'll assume no updates are available
	const cachedVersion = await getMetadata<string>(`version-${config.modelId}`);

	return !cachedVersion;
}
