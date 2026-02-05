import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTTS } from "@/hooks/useTTS";
// Main translation panel component
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowLeftRight } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { LanguageSelector } from "./LanguageSelector";
import { StatusIndicator } from "./StatusIndicator";
import { TTSSpeaker } from "./TTSSpeaker";
import { TextInput } from "./TextInput";
import { TextOutput } from "./TextOutput";
import { TranslateButton } from "./TranslateButton";

export function TranslationPanel() {
	const [state, actions] = useTranslation();
	const { speak, isSpeaking, stop } = useTTS();

	const handleSpeak = () => {
		if (state.outputText && isSpeaking) {
			stop();
		} else if (state.outputText) {
			speak(state.outputText, state.targetLang);
		}
	};

	const handleCopy = async () => {
		if (state.outputText) {
			await navigator.clipboard.writeText(state.outputText);
		}
	};

	return (
		<div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
			{/* Language Selection Row */}
			<div className="flex items-center gap-4">
				<LanguageSelector
					label="From"
					value={state.sourceLang}
					onValueChange={actions.setSourceLang}
					className="flex-1"
				/>

				<Button
					variant="neutral"
					size="icon"
					onClick={actions.swapLanguages}
					className="shrink-0"
					aria-label="Swap languages"
				>
					<ArrowLeftRight className="h-4 w-4" />
				</Button>

				<LanguageSelector
					label="To"
					value={state.targetLang}
					onValueChange={actions.setTargetLang}
					className="flex-1"
				/>
			</div>

			{/* Text Input/Output Row */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Card className="h-full">
					<CardContent className="space-y-2 p-4">
						<TextInput
							value={state.inputText}
							onChange={actions.setInputText}
							placeholder="Enter text to translate..."
							className="min-h-[200px]"
						/>
						{state.inputText && (
							<div className="flex justify-end">
								<Button variant="neutral" size="sm" onClick={actions.clear}>
									Clear
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="h-full">
					<CardContent className="space-y-2 p-4">
						<TextOutput
							value={state.outputText}
							placeholder="Translation will appear here..."
							className="min-h-[200px]"
						/>
						{state.outputText && (
							<div className="flex justify-end gap-2">
								<CopyButton />
								<TTSSpeaker onClick={handleSpeak} isSpeaking={isSpeaking} />
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Action and Status Row */}
			<div className="flex flex-col items-center gap-4">
				<TranslateButton
					onClick={actions.translate}
					disabled={!state.inputText.trim() || state.isTranslating}
					isLoading={state.isTranslating}
				/>

				<StatusIndicator
					status={state.status}
					progress={state.progress}
					error={state.error}
				/>
			</div>
		</div>
	);
}
