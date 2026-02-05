# Phase 2 Features - Usage Guide

## Overview
This guide explains how to use the new Model Management and Offline Support features added in Phase 2.

---

## 1. Model Cache Manager

### Accessing the Model Manager
The `ModelManager` component provides a UI for managing cached translation models.

```tsx
import { ModelManager } from "@/components/translator";

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <ModelManager />
    </div>
  );
}
```

### Features

#### View Cached Models
- See all downloaded translation models
- View model size and version information
- Check storage usage with visual progress bar

#### Delete Individual Models
1. Click the trash icon next to a model
2. Confirm deletion in the dialog
3. Model is removed from cache

#### Clear All Models
1. Click "Clear All" button
2. Confirm in the dialog
3. All models are removed from cache

#### Refresh Cache Status
- Click the refresh icon to update the cache information
- Useful after downloading new models

---

## 2. Offline Status Indicator

### Basic Usage
```tsx
import { OfflineIndicator } from "@/components/common/OfflineIndicator";

function Header() {
  return (
    <header>
      <OfflineIndicator />
    </header>
  );
}
```

### Props
- `className?: string` - Additional CSS classes
- `showWhenOnline?: boolean` - Show indicator even when online (default: false)

### Example with Always Visible
```tsx
<OfflineIndicator showWhenOnline={true} />
```

---

## 3. Online Status Hook

### Basic Usage
```tsx
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function MyComponent() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      {isOnline ? (
        <p>You are online</p>
      ) : (
        <p>You are offline - using cached models</p>
      )}
    </div>
  );
}
```

### Use Cases

#### Conditional Feature Display
```tsx
function TranslationPanel() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      {!isOnline && (
        <Alert>
          You're offline. Only cached models are available.
        </Alert>
      )}
      {/* Rest of component */}
    </div>
  );
}
```

#### Disable Features When Offline
```tsx
function DownloadButton() {
  const isOnline = useOnlineStatus();
  
  return (
    <Button disabled={!isOnline}>
      {isOnline ? "Download Model" : "Offline - Cannot Download"}
    </Button>
  );
}
```

---

## 4. Service Worker Management

### Automatic Registration
The service worker is automatically registered when the app starts (in `main.tsx`).

### Manual Control
```tsx
import {
  registerServiceWorker,
  unregisterServiceWorker,
  updateServiceWorker,
  clearServiceWorkerCache,
  getServiceWorkerStatus,
} from "@/lib/service-worker";

// Check status
const status = await getServiceWorkerStatus();
console.log("Is registered:", status.isRegistered);
console.log("Update available:", status.isUpdateAvailable);

// Force update
await updateServiceWorker();

// Clear all caches
await clearServiceWorkerCache();

// Unregister
await unregisterServiceWorker();
```

### Service Worker Status Component
```tsx
import { useEffect, useState } from "react";
import { getServiceWorkerStatus } from "@/lib/service-worker";

function ServiceWorkerStatus() {
  const [status, setStatus] = useState(null);
  
  useEffect(() => {
    getServiceWorkerStatus().then(setStatus);
  }, []);
  
  if (!status?.isSupported) {
    return <p>Service Workers not supported</p>;
  }
  
  return (
    <div>
      <p>Status: {status.isRegistered ? "Active" : "Not registered"}</p>
      {status.isUpdateAvailable && (
        <Button onClick={() => window.location.reload()}>
          Update Available - Reload
        </Button>
      )}
    </div>
  );
}
```

---

## 5. Offline Translation Workflow

### How It Works

1. **First Time (Online)**
   - User selects language pair
   - Model is downloaded from Hugging Face
   - Model is cached in IndexedDB
   - Translation happens

2. **Subsequent Uses (Online or Offline)**
   - User selects same language pair
   - Model is loaded from cache
   - Translation happens instantly
   - No network required

### Example Integration
```tsx
import { useTranslation } from "@/hooks/useTranslation";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function TranslationComponent() {
  const [state, actions] = useTranslation();
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      {!isOnline && (
        <Badge variant="default" className="bg-yellow-500">
          Offline Mode - Using Cached Models
        </Badge>
      )}
      
      <LanguageSelector
        value={state.sourceLang}
        onChange={actions.setSourceLang}
      />
      
      <TextInput
        value={state.inputText}
        onChange={actions.setInputText}
      />
      
      <Button
        onClick={actions.translate}
        disabled={state.isTranslating}
      >
        Translate
      </Button>
      
      <TextOutput value={state.outputText} />
    </div>
  );
}
```

---

## 6. Storage Management Best Practices

### Monitor Storage Usage
```tsx
import { getStorageUsage } from "@/lib/storage/indexeddb";

async function checkStorage() {
  const { used, quota } = await getStorageUsage();
  const percentage = (used / quota) * 100;
  
  if (percentage > 80) {
    console.warn("Storage is running low!");
  }
}
```

### Proactive Cache Cleanup
```tsx
import { getCachedModels, removeModel } from "@/lib/translation/cache";

async function cleanupOldModels() {
  const models = await getCachedModels();
  
  // Remove models older than 30 days
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  for (const model of models) {
    // Implement your cleanup logic
  }
}
```

---

## 7. Error Handling

### Handle Offline Errors
```tsx
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function DownloadModelButton({ modelId }) {
  const isOnline = useOnlineStatus();
  
  const handleDownload = async () => {
    if (!isOnline) {
      alert("Cannot download models while offline");
      return;
    }
    
    try {
      await downloadModel(modelId);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download model. Please try again.");
    }
  };
  
  return (
    <Button onClick={handleDownload} disabled={!isOnline}>
      Download Model
    </Button>
  );
}
```

### Handle Storage Quota Exceeded
```tsx
import { getStorageUsage } from "@/lib/storage/indexeddb";

async function downloadWithQuotaCheck(modelId) {
  const { used, quota } = await getStorageUsage();
  const estimatedModelSize = 50 * 1024 * 1024; // 50MB
  
  if (used + estimatedModelSize > quota) {
    throw new Error("Not enough storage space. Please clear some cached models.");
  }
  
  // Proceed with download
}
```

---

## 8. Testing Offline Functionality

### In Chrome DevTools
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Service Workers" in sidebar
4. Check "Offline" checkbox
5. Test your app's offline functionality

### In Network Tab
1. Open DevTools (F12)
2. Go to "Network" tab
3. Select "Offline" from throttling dropdown
4. Test your app

### Programmatically
```tsx
// Simulate offline mode for testing
if (import.meta.env.DEV) {
  window.addEventListener('offline', () => {
    console.log('App is now offline');
  });
  
  window.addEventListener('online', () => {
    console.log('App is now online');
  });
}
```

---

## 9. Performance Tips

### Preload Common Models
```tsx
import { downloadAndCacheModel } from "@/lib/translation/cache";

async function preloadCommonModels() {
  const commonPairs = [
    { source: "en", target: "es" },
    { source: "en", target: "fr" },
  ];
  
  for (const pair of commonPairs) {
    try {
      await downloadAndCacheModel(
        pair.source,
        pair.target,
        (progress) => console.log(`Preloading: ${progress}%`)
      );
    } catch (error) {
      console.error("Preload failed:", error);
    }
  }
}
```

### Lazy Load Models
Only download models when the user actually needs them, not on app startup.

### Clear Unused Models
Periodically prompt users to clear models they haven't used in a while.

---

## 10. Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure HTTPS is used (or localhost for development)
- Check browser compatibility

### Models Not Caching
- Check IndexedDB in DevTools
- Verify storage quota isn't exceeded
- Check network requests in DevTools

### Offline Mode Not Working
- Verify service worker is active
- Check cache contents in DevTools
- Ensure models were downloaded while online

---

## Summary

Phase 2 adds powerful offline capabilities to Ingenious Translate:

✅ **Model Management** - Full control over cached models
✅ **Offline Detection** - Real-time network status
✅ **Service Worker** - Automatic caching and offline support
✅ **Storage Monitoring** - Track and manage storage usage
✅ **Seamless UX** - Works online and offline

For more details, see the [Phase 2 Summary](./phase-2-summary.md).
