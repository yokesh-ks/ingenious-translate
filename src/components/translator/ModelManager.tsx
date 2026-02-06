// Model cache management UI component
import { useCallback, useEffect, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getStorageUsage } from "@/lib/storage/indexeddb";
import {
	clearAllCachedModels,
	getCachedModels,
	removeModel,
} from "@/lib/translation/cache";
import { cn } from "@/lib/utils";
import { Database, HardDrive, RefreshCw, Trash2 } from "lucide-react";

interface CachedModel {
	modelKey: string;
	size: number;
	version: string;
}

interface StorageInfo {
	used: number;
	quota: number;
	percentage: number;
}

export function ModelManager() {
	const [models, setModels] = useState<CachedModel[]>([]);
	const [storage, setStorage] = useState<StorageInfo>({
		used: 0,
		quota: 0,
		percentage: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const loadModelsAndStorage = useCallback(async () => {
		try {
			const [cachedModels, storageData] = await Promise.all([
				getCachedModels(),
				getStorageUsage(),
			]);

			setModels(cachedModels);
			setStorage({
				used: storageData.used,
				quota: storageData.quota,
				percentage:
					storageData.quota > 0
						? (storageData.used / storageData.quota) * 100
						: 0,
			});
		} catch (error) {
			console.error("Failed to load models and storage:", error);
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	}, []);

	useEffect(() => {
		loadModelsAndStorage();
	}, [loadModelsAndStorage]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await loadModelsAndStorage();
	};

	const handleDeleteModel = async (modelKey: string) => {
		try {
			const [sourceLang, targetLang] = modelKey.split("-");
			await removeModel(sourceLang, targetLang);
			await loadModelsAndStorage();
		} catch (error) {
			console.error("Failed to delete model:", error);
		}
	};

	const handleClearAll = async () => {
		try {
			await clearAllCachedModels();
			await loadModelsAndStorage();
		} catch (error) {
			console.error("Failed to clear all models:", error);
		}
	};

	const formatBytes = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Database className="h-5 w-5" />
						Model Cache Manager
					</CardTitle>
					<CardDescription>Loading cached models...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Database className="h-5 w-5" />
							Model Cache Manager
						</CardTitle>
						<CardDescription>
							Manage downloaded translation models
						</CardDescription>
					</div>
					<Button
						variant="neutral"
						size="icon"
						onClick={handleRefresh}
						disabled={isRefreshing}
					>
						<RefreshCw
							className={cn("h-4 w-4", isRefreshing && "animate-spin")}
						/>
					</Button>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Storage Usage */}
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2">
							<HardDrive className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium">Storage Usage</span>
						</div>
						<span className="text-muted-foreground">
							{formatBytes(storage.used)} / {formatBytes(storage.quota)}
						</span>
					</div>
					<Progress value={storage.percentage} className="h-2" />
					<p className="text-muted-foreground text-xs">
						{storage.percentage.toFixed(1)}% of available storage used
					</p>
				</div>

				{/* Cached Models List */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="font-medium text-sm">
							Cached Models ({models.length})
						</h3>
						{models.length > 0 && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="default"
										size="sm"
										className="bg-red-500 text-white hover:bg-red-600"
									>
										<Trash2 className="mr-1 h-3 w-3" />
										Clear All
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Clear all cached models?
										</AlertDialogTitle>
										<AlertDialogDescription>
											This will delete all {models.length} cached translation
											models. You'll need to download them again when needed.
											This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction onClick={handleClearAll}>
											Clear All
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}
					</div>

					{models.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							<Database className="mx-auto mb-2 h-12 w-12 opacity-50" />
							<p className="text-sm">No models cached yet</p>
							<p className="mt-1 text-xs">
								Models will be downloaded automatically when you translate
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{models.map((model) => (
								<div
									key={model.modelKey}
									className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
								>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<span className="font-medium text-sm">
												{model.modelKey}
											</span>
											<Badge variant="neutral" className="text-xs">
												{formatBytes(model.size)}
											</Badge>
										</div>
										<p className="mt-1 text-muted-foreground text-xs">
											Version: {model.version}
										</p>
									</div>
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant="neutral"
												size="icon"
												className="hover:bg-transparent"
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>Delete this model?</AlertDialogTitle>
												<AlertDialogDescription>
													This will delete the cached model for{" "}
													<strong>{model.modelKey}</strong> (
													{formatBytes(model.size)}). You'll need to download it
													again when needed.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancel</AlertDialogCancel>
												<AlertDialogAction
													onClick={() => handleDeleteModel(model.modelKey)}
												>
													Delete
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Info Section */}
				<div className="rounded-lg bg-muted p-4 text-sm">
					<p className="mb-2 font-medium">About Model Caching</p>
					<ul className="space-y-1 text-muted-foreground text-xs">
						<li>• Models are downloaded once and cached for offline use</li>
						<li>• Each language pair requires a separate model</li>
						<li>• Cached models enable offline translation</li>
						<li>• Clear cache to free up storage space</li>
					</ul>
				</div>
			</CardContent>
		</Card>
	);
}