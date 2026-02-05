// Status indicator component for model loading and translation progress
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface StatusIndicatorProps {
	status: string;
	progress: number;
	error: string | null;
}

export function StatusIndicator({
	status,
	progress,
	error,
}: StatusIndicatorProps) {
	if (error) {
		return (
			<div className="flex items-center gap-2 text-destructive text-sm">
				<AlertCircle className="h-4 w-4" />
				<span>{error}</span>
			</div>
		);
	}

	if (status === "idle" || status === "complete" || status === "ready") {
		return null;
	}

	const isLoading = status === "loading" || status === "translating";
	const statusText = getStatusText(status, progress);

	return (
		<div className="flex w-full max-w-md flex-col items-center gap-2">
			{isLoading && (
				<>
					<Progress value={progress} className="w-full" />
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<Loader2 className="h-4 w-4 animate-spin" />
						<span>{statusText}</span>
					</div>
				</>
			)}
		</div>
	);
}

function getStatusText(status: string, progress: number): string {
	switch (status) {
		case "loading":
			return `Loading model... ${Math.round(progress)}%`;
		case "translating":
			return "Translating...";
		case "ready":
			return "Ready to translate";
		case "complete":
			return "Translation complete";
		default:
			return status;
	}
}
