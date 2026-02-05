import { getModelId } from "@/lib/translation/models";
import type { TranslationActions, TranslationState } from "@/types/translation";
// Translation hook for managing translation state
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWorker } from "./useWorker";

const DEFAULT_STATE: TranslationState = {
	sourceLang: "en",
	targetLang: "es",
	inputText: "",
	outputText: "",
	isLoading: false,
	isTranslating: false,
	progress: 0,
	status: "idle",
	error: null,
};

export function useTranslation(): [TranslationState, TranslationActions] {
	const [state, setState] = useState<TranslationState>(DEFAULT_STATE);

	const { isReady, isLoading, progress, workerStatus, loadModel, translate } =
		useWorker();

	// Load model when language pair changes and not ready
	useEffect(() => {
		console.log("🔍 useTranslation: Checking if model needs to load", {
			sourceLang: state.sourceLang,
			targetLang: state.targetLang,
		});

		// For direct translation, we don't need to pre-load the model
		// The model will be loaded when the first translation is requested
		// But we can still show a loading state
		setState((prev) => ({
			...prev,
			status: "ready",
		}));
	}, [state.sourceLang, state.targetLang]);

	// Handle worker messages
	useEffect(() => {
		if (!workerStatus.lastMessage) {
			console.log("🔍 No lastMessage in workerStatus");
			return;
		}

		const { type, payload } = workerStatus.lastMessage;
		console.log("📨 useEffect received message:", type, payload);

		switch (type) {
			case "update": {
				// Handle partial translation updates (streaming)
				const updatePayload = payload as { translation: string };
				setState((prev) => ({
					...prev,
					outputText: updatePayload.translation,
					isTranslating: true,
					status: "translating",
				}));
				break;
			}
			case "result": {
				console.log("✅ Processing result:", payload);
				const translationResult = payload as { translation: string };
				console.log(
					"📝 Extracted translation:",
					translationResult?.translation,
				);
				setState((prev) => ({
					...prev,
					outputText: translationResult?.translation || "Translation failed",
					isTranslating: false,
					status: "complete",
					error: null,
				}));
				break;
			}
			case "progress":
				setState((prev) => ({
					...prev,
					progress: (payload as { progress: number }).progress,
				}));
				break;
			case "error":
				console.error("❌ Error from worker:", payload);
				setState((prev) => ({
					...prev,
					error: (payload as { message: string }).message,
					isTranslating: false,
					status: "error",
				}));
				break;
			case "loaded":
				console.log("✅ Model loaded");
				setState((prev) => ({
					...prev,
					isLoading: false,
					status: "ready",
				}));
				break;
			case "status": {
				console.log("📝 Status update:", payload);
				const statusPayload = payload as { status: string; message?: string };
				// Don't overwrite status if we are already translating (to avoid flickering)
				if (statusPayload.status !== "translating" || !state.isTranslating) {
					setState((prev) => ({
						...prev,
						status: statusPayload.status as TranslationState["status"],
					}));
				}
				break;
			}
			default:
				console.warn("⚠️ Unknown message type:", type);
		}
	}, [workerStatus.lastMessage]);

	// Actions
	const setSourceLang = useCallback((lang: string) => {
		setState((prev) => ({
			...prev,
			sourceLang: lang,
			outputText: "",
			status: "idle",
		}));
	}, []);

	const setTargetLang = useCallback((lang: string) => {
		setState((prev) => ({
			...prev,
			targetLang: lang,
			outputText: "",
			status: "idle",
		}));
	}, []);

	const setInputText = useCallback((text: string) => {
		setState((prev) => ({
			...prev,
			inputText: text,
		}));
	}, []);

	const handleTranslate = useCallback(async () => {
		console.log("🔍 handleTranslate called:", {
			hasInput: !!state.inputText.trim(),
			inputText: state.inputText,
			sourceLang: state.sourceLang,
			targetLang: state.targetLang,
			isReady,
		});

		if (!state.inputText.trim()) {
			console.log("⏭️ Translation skipped: Empty input");
			return;
		}

		// Ensure model is loaded (the worker handles this logic internally or we trigger loadModel)
		// For now, let's assume the worker handles lazy loading or we just trigger translation

		console.log("🚀 Starting worker translation...");
		setState((prev) => ({
			...prev,
			isTranslating: true,
			status: "translating",
			error: null,
			outputText: "", // Clear previous output
		}));

		// Use worker for translation
		translate(state.inputText, state.sourceLang, state.targetLang);
	}, [state.inputText, state.sourceLang, state.targetLang, translate, isReady]);

	const clear = useCallback(() => {
		setState((prev) => ({
			...prev,
			inputText: "",
			outputText: "",
			error: null,
		}));
	}, []);

	const swapLanguages = useCallback(() => {
		setState((prev) => ({
			...prev,
			sourceLang: prev.targetLang,
			targetLang: prev.sourceLang,
			inputText: prev.outputText,
			outputText: "",
			status: "idle",
		}));
	}, []);

	const actions = useMemo<TranslationActions>(
		() => ({
			setSourceLang,
			setTargetLang,
			setInputText,
			translate: handleTranslate,
			clear,
			swapLanguages,
		}),
		[
			setSourceLang,
			setTargetLang,
			setInputText,
			handleTranslate,
			clear,
			swapLanguages,
		],
	);

	return [state, actions];
}
