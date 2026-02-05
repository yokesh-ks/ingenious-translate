// Copy button component
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
	text?: string;
	className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleClick = async () => {
		if (text) {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
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
