// Copy button component
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
	onClick?: () => void;
}

export function CopyButton({ onClick }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleClick = async () => {
		// Get the translated text from the output textarea
		const outputText = document.querySelector(
			"#translated-text",
		) as HTMLTextAreaElement;

		if (outputText?.value) {
			await navigator.clipboard.writeText(outputText.value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}

		onClick?.();
	};

	return (
		<Button
			variant="neutral"
			size="icon"
			onClick={handleClick}
			aria-label="Copy to clipboard"
		>
			{copied ? (
				<Check className="h-4 w-4 text-green-500" />
			) : (
				<Copy className="h-4 w-4" />
			)}
		</Button>
	);
}
