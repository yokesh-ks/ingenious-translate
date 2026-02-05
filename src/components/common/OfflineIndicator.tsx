// Offline status indicator component
import { Badge } from "@/components/ui/badge";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { cn } from "@/lib/utils";
import { Cloud, CloudOff } from "lucide-react";

interface OfflineIndicatorProps {
	className?: string;
	showWhenOnline?: boolean;
}

export function OfflineIndicator({
	className,
	showWhenOnline = false,
}: OfflineIndicatorProps) {
	const isOnline = useOnlineStatus();

	if (isOnline && !showWhenOnline) {
		return null;
	}

	return (
		<Badge
			variant={isOnline ? "neutral" : "default"}
			className={cn("gap-1.5", !isOnline && "bg-red-500 text-white", className)}
		>
			{isOnline ? (
				<>
					<Cloud className="h-3 w-3" />
					<span>Online</span>
				</>
			) : (
				<>
					<CloudOff className="h-3 w-3" />
					<span>Offline</span>
				</>
			)}
		</Badge>
	);
}
