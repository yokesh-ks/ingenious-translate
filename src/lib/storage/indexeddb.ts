// IndexedDB wrapper for model storage
import { type DBSchema, type IDBPDatabase, openDB } from "idb";

export interface TranslationModel {
	name: string;
	modelId: string;
	blob: Blob;
	size: number;
	version: string;
	createdAt: Date;
}

export interface TranslationMetadata {
	key: string;
	value: unknown;
}

export interface TranslationDBSchema extends DBSchema {
	models: {
		key: string;
		value: TranslationModel;
		indexes: { "by-model-id": string };
	};
	metadata: {
		key: string;
		value: TranslationMetadata;
	};
}

const DB_NAME = "ingenious-translate";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TranslationDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<TranslationDBSchema>> {
	if (!dbPromise) {
		dbPromise = openDB<TranslationDBSchema>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				// Create models store
				if (!db.objectStoreNames.contains("models")) {
					const modelStore = db.createObjectStore("models", {
						keyPath: "name",
					});
					modelStore.createIndex("by-model-id", "modelId");
				}

				// Create metadata store
				if (!db.objectStoreNames.contains("metadata")) {
					db.createObjectStore("metadata", { keyPath: "key" });
				}
			},
		});
	}
	return dbPromise;
}

export async function saveModel(
	name: string,
	modelId: string,
	blob: Blob,
	version: string,
): Promise<void> {
	const db = await getDB();
	await db.put("models", {
		name,
		modelId,
		blob,
		size: blob.size,
		version,
		createdAt: new Date(),
	});
}

export async function getModel(
	name: string,
): Promise<TranslationModel | undefined> {
	const db = await getDB();
	return db.get("models", name);
}

export async function hasModel(name: string): Promise<boolean> {
	const db = await getDB();
	return (await db.get("models", name)) !== undefined;
}

export async function deleteModel(name: string): Promise<void> {
	const db = await getDB();
	await db.delete("models", name);
}

export async function getAllModels(): Promise<TranslationModel[]> {
	const db = await getDB();
	return db.getAll("models");
}

export async function setMetadata(key: string, value: unknown): Promise<void> {
	const db = await getDB();
	await db.put("metadata", { key, value });
}

export async function getMetadata<T>(key: string): Promise<T | undefined> {
	const db = await getDB();
	const result = await db.get("metadata", key);
	return result?.value as T | undefined;
}

export async function getStorageUsage(): Promise<{
	used: number;
	quota: number;
}> {
	if (navigator.storage?.estimate) {
		const estimate = await navigator.storage.estimate();
		return {
			used: estimate.usage || 0,
			quota: estimate.quota || 0,
		};
	}
	return { used: 0, quota: 0 };
}

export async function clearAllModels(): Promise<void> {
	const db = await getDB();
	await db.clear("models");
	await db.clear("metadata");
}
