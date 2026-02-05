import { Label } from "@/components/ui/label";
// Language selector component
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES } from "@/lib/translation/models";

interface LanguageSelectorProps {
	label: string;
	value: string;
	onValueChange: (value: string) => void;
	className?: string;
}

export function LanguageSelector({
	label,
	value,
	onValueChange,
	className,
}: LanguageSelectorProps) {
	const selectedLanguage = SUPPORTED_LANGUAGES.find(
		(lang) => lang.code === value,
	);

	return (
		<div className={className}>
			<Label
				htmlFor={`language-${label.toLowerCase()}`}
				className="mb-2 block font-medium text-sm"
			>
				{label} Language
			</Label>
			<Select value={value} onValueChange={onValueChange}>
				<SelectTrigger id={`language-${label.toLowerCase()}`}>
					<SelectValue>
						{selectedLanguage ? (
							<span>
								{selectedLanguage.nativeName} ({selectedLanguage.name})
							</span>
						) : (
							<span>Select language</span>
						)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{SUPPORTED_LANGUAGES.map((lang) => (
						<SelectItem key={lang.code} value={lang.code}>
							{lang.nativeName} ({lang.name})
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
