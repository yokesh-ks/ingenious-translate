// Web Worker communication hook
import type {
	LoadModelPayload,
	TranslatePayload,
	WorkerRequest,
	WorkerResponse,
} from "@/types/worker";
import { useCallback, useEffect, useRef, useState } from "react";

interface WorkerStatus {
	isReady: boolean;
	isLoading: boolean;
	progress: number;
	lastMessage: WorkerResponse | null;
}

export function useWorker() {
	const workerRef = useRef<Worker | null>(null);
	const [status, setStatus] = useState<WorkerStatus>({
		isReady: false,
		isLoading: false,
		progress: 0,
		lastMessage: null,
	});

	useEffect(() => {
		// Initialize worker
		workerRef.current = new Worker(
			new URL("../workers/translation.worker.ts", import.meta.url),
			{ type: "module" },
		);

		const worker = workerRef.current;

		worker.onmessage = (event) => {
			const response = event.data as WorkerResponse;
			console.log("📨 useWorker received:", response.type, response);
			setStatus((prev) => ({
				...prev,
				lastMessage: response,
			}));

			if (response.type === "loaded") {
				setStatus((prev) => ({
					...prev,
					isReady: true,
					isLoading: false,
					progress: 100,
				}));
			} else if (response.type === "progress") {
				setStatus((prev) => ({
					...prev,
					progress: response.payload.progress || 0,
					isLoading: true,
				}));
			}
		};

		worker.onerror = (error) => {
			console.error("Worker error:", error);
			setStatus((prev) => ({
				...prev,
				isLoading: false,
				lastMessage: {
					type: "error",
					payload: { message: error.message },
				} as WorkerResponse,
			}));
		};

		return () => {
			worker.terminate();
		};
	}, []);

	const postMessage = useCallback((message: WorkerRequest) => {
		if (workerRef.current) {
			workerRef.current.postMessage(message);
		}
	}, []);

	const loadModel = useCallback(
		(modelId: string, sourceLang: string, targetLang: string) => {
			setStatus((prev) => ({
				...prev,
				isLoading: true,
				progress: 0,
				isReady: false,
			}));

			postMessage({
				type: "loadModel",
				payload: { modelId, sourceLang, targetLang },
			} as WorkerRequest);
		},
		[postMessage],
	);

	const unloadModel = useCallback(() => {
		postMessage({
			type: "unloadModel",
			payload: {},
		} as WorkerRequest);
		setStatus((prev) => ({
			...prev,
			isReady: false,
		}));
	}, [postMessage]);

	const translate = useCallback(
		(text: string, sourceLang: string, targetLang: string) => {
			postMessage({
				type: "translate",
				payload: { text, sourceLang, targetLang },
			} as WorkerRequest);
		},
		[postMessage],
	);

	return {
		postMessage,
		loadModel,
		unloadModel,
		translate,
		isReady: status.isReady,
		isLoading: status.isLoading,
		progress: status.progress,
		workerStatus: status,
	};
}
