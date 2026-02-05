// Translate button component
import { Button } from "@/components/ui/button";
import { Languages, Loader2 } from "lucide-react";

interface TranslateButtonProps {
	onClick: () => void;
	disabled?: boolean;
	isLoading?: boolean;
}

export function TranslateButton({
	onClick,
	disabled = false,
	isLoading = false,
}: TranslateButtonProps) {
	return (
		<Button
			onClick={onClick}
			disabled={disabled || isLoading}
			size="lg"
			className="min-w-[200px]"
		>
			{isLoading ? (
				<>
					<Loader2 className="h-4 w-4 animate-spin" />
					Translating...
				</>
			) : (
				<>
					<Languages className="h-4 w-4" />
					Translate
				</>
			)}
		</Button>
	);
}
