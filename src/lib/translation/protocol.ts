// Worker message protocol definitions
import type {
	ErrorPayload,
	ErrorResponse,
	LoadModelPayload,
	LoadModelRequest,
	LoadedPayload,
	LoadedResponse,
	ProgressPayload,
	ProgressResponse,
	ResultPayload,
	ResultResponse,
	StatusPayload,
	StatusResponse,
	TranslatePayload,
	TranslateRequest,
	UnloadModelRequest,
	UpdatePayload,
	UpdateResponse,
	WorkerRequest,
	WorkerResponse,
} from "@/types/worker";

// Request messages (Main Thread -> Worker)
export const WorkerRequests = {
	loadModel: (payload: LoadModelPayload): LoadModelRequest => ({
		type: "loadModel",
		payload,
	}),

	unloadModel: (): UnloadModelRequest => ({
		type: "unloadModel",
		payload: {},
	}),

	translate: (payload: TranslatePayload): TranslateRequest => ({
		type: "translate",
		payload,
	}),
};

// Response messages (Worker -> Main Thread)
export const WorkerResponses = {
	status: (payload: StatusPayload): StatusResponse => ({
		type: "status",
		payload,
	}),

	progress: (payload: ProgressPayload): ProgressResponse => ({
		type: "progress",
		payload,
	}),

	loaded: (payload: LoadedPayload): LoadedResponse => ({
		type: "loaded",
		payload,
	}),

	update: (payload: UpdatePayload): UpdateResponse => ({
		type: "update",
		payload,
	}),

	result: (payload: ResultPayload): ResultResponse => ({
		type: "result",
		payload,
	}),

	error: (payload: ErrorPayload): ErrorResponse => ({
		type: "error",
		payload,
	}),
};

// Message type guards
export function isProgressMessage(
	message: WorkerResponse,
): message is ProgressResponse {
	return message.type === "progress";
}

export function isUpdateMessage(
	message: WorkerResponse,
): message is UpdateResponse {
	return message.type === "update";
}

export function isResultMessage(
	message: WorkerResponse,
): message is ResultResponse {
	return message.type === "result";
}

export function isErrorMessage(
	message: WorkerResponse,
): message is ErrorResponse {
	return message.type === "error";
}

export function isLoadedMessage(
	message: WorkerResponse,
): message is LoadedResponse {
	return message.type === "loaded";
}
