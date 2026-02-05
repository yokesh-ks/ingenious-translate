import { Button } from "@/components/ui/button";
// Text input component for source text
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TextInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function TextInput({
	value,
	onChange,
	placeholder = "Enter text to translate...",
	className,
	disabled = false,
}: TextInputProps) {
	const charCount = value.length;
	const maxChars = 500;

	return (
		<div className={cn("space-y-2", className)}>
			<div className="flex items-center justify-between">
				<Label htmlFor="source-text" className="font-medium text-sm">
					Source Text
				</Label>
				<span className="text-muted-foreground text-xs">
					{charCount}/{maxChars}
				</span>
			</div>
			<div className="relative">
				<Textarea
					id="source-text"
					value={value}
					onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
					placeholder={placeholder}
					disabled={disabled}
					className="min-h-[150px] resize-none pr-10"
				/>
				{value && (
					<Button
						type="button"
						variant="neutral"
						size="icon"
						className="absolute top-2 right-2 h-6 w-6"
						onClick={() => onChange("")}
						aria-label="Clear text"
					>
						<X className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	);
}
