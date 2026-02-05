// Worker message types for translation worker communication

export type WorkerRequest =
	| LoadModelRequest
	| UnloadModelRequest
	| TranslateRequest;

export type LoadModelRequest = { type: "loadModel"; payload: LoadModelPayload };
export type UnloadModelRequest = {
	type: "unloadModel";
	payload: Record<string, never>;
};
export type TranslateRequest = { type: "translate"; payload: TranslatePayload };

export type WorkerResponse =
	| StatusResponse
	| ProgressResponse
	| LoadedResponse
	| UpdateResponse
	| ResultResponse
	| ErrorResponse;

export type StatusResponse = { type: "status"; payload: StatusPayload };
export type ProgressResponse = { type: "progress"; payload: ProgressPayload };
export type LoadedResponse = { type: "loaded"; payload: LoadedPayload };
export type UpdateResponse = { type: "update"; payload: UpdatePayload };
export type ResultResponse = { type: "result"; payload: ResultPayload };
export type ErrorResponse = { type: "error"; payload: ErrorPayload };

// Load Model Payload
export interface LoadModelPayload {
	modelId: string;
	sourceLang: string;
	targetLang: string;
}

// Translate Payload
export interface TranslatePayload {
	text: string;
	sourceLang: string;
	targetLang: string;
}

// Progress Payload
export interface ProgressPayload {
	progress: number;
	status?: string;
}

// Update Payload (for streaming translations)
export interface UpdatePayload {
	translation: string;
	isPartial: boolean;
}

// Result Payload
export interface ResultPayload {
	translation: string;
	confidence?: number;
	isPartial?: boolean;
}

// Error Payload
export interface ErrorPayload {
	message: string;
	code?: string;
}

// Status Payload
export interface StatusPayload {
	status: "idle" | "loading" | "ready" | "translating" | "complete" | "error";
	message?: string;
}

// Loaded Payload
export interface LoadedPayload {
	modelId: string;
	status: string;
}
