import { Label } from "@/components/ui/label";
// Text output component for translated text
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface TextOutputProps {
	value: string;
	placeholder?: string;
	className?: string;
}

export function TextOutput({
	value,
	placeholder = "Translation will appear here...",
	className,
}: TextOutputProps) {
	return (
		<div className={cn("space-y-2", className)}>
			<Label htmlFor="translated-text" className="font-medium text-sm">
				Translated Text
			</Label>
			<Textarea
				id="translated-text"
				value={value}
				placeholder={placeholder}
				readOnly
				className="min-h-[150px] resize-none bg-muted/30"
			/>
		</div>
	);
}
