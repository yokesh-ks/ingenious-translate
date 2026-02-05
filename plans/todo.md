# Ingenious Translate - Implementation Todo List

## Prerequisites

```bash
# Install required dependencies
pnpm add @xenova/transformers idb
pnpm add -D @types/web-speech-api
```

---

## Step 1: Set Up Project Structure

### Create directories
```bash
mkdir -p src/components/translator
mkdir -p src/lib/translation
mkdir -p src/lib/storage
mkdir -p src/lib/tts
mkdir -p src/hooks
mkdir -p src/types
mkdir -p public
```

### Create type definitions
- [ ] Create `src/types/worker.ts` - Worker message types
- [ ] Create `src/types/translation.ts` - Translation state types

---

## Step 2: Implement Storage Layer

### IndexedDB Wrapper
- [ ] Create `src/lib/storage/indexeddb.ts`
  - Implement `getDB()`, `saveModel()`, `getModel()`
  - Add `hasModel()`, `deleteModel()`, `getAllModels()`
  - Implement `setMetadata()`, `getMetadata()`
  - Add `getStorageUsage()` for quota checking

### User Preferences
- [ ] Create `src/lib/storage/preferences.ts`
  - Store last used languages
  - Store selected voices
  - Store UI preferences

---

## Step 3: Implement Translation Core

### Model Configuration
- [ ] Create `src/lib/translation/models.ts`
  - Define `SUPPORTED_LANGUAGES` array
  - Define `MODEL_CONFIGS` with Hugging Face model IDs
  - Implement `getModelId()` helper

### Web Worker Protocol
- [ ] Create `src/lib/translation/protocol.ts`
  - Define message type constants
  - Create `WorkerRequests` factory functions
  - Create `WorkerResponses` factory functions

### Translation Worker
- [ ] Create `src/workers/translation.worker.ts`
  - Initialize transformers.js pipeline
  - Handle `loadModel`, `translate`, `unloadModel` messages
  - Implement progress callback
  - Send status updates to main thread

### Model Cache Manager
- [ ] Create `src/lib/translation/cache.ts`
  - Implement `isModelCached()` check
  - Implement `downloadAndCacheModel()` with progress
  - Implement `removeModel()` for cache management
  - Implement `getCachedModels()`, `clearAllCachedModels()`

---

## Step 4: Create Custom Hooks

### useWorker Hook
- [ ] Create `src/hooks/useWorker.ts`
  - Initialize and manage worker lifecycle
  - Implement `postMessage()` wrapper
  - Implement `loadModel()` and `unloadModel()`
  - Track worker status (ready, loading, progress)

### useTranslation Hook
- [ ] Create `src/hooks/useTranslation.ts`
  - Manage translation state (input, output, languages)
  - Implement language selection actions
  - Implement translate action
  - Handle worker messages
  - Implement clear and swap actions

### useTTS Hook
- [ ] Create `src/hooks/useTTS.ts`
  - Load available voices
  - Implement `speak()` and `stop()`
  - Track speaking state
  - Support voice selection

### useOnlineStatus Hook
- [ ] Create `src/hooks/useOnlineStatus.ts`
  - Track online/offline state
  - Handle network events

---

## Step 5: Implement TTS Integration

### Browser TTS Wrapper
- [ ] Create `src/lib/tts/browser.ts`
  - Implement `browserTTS()` function
  - Implement `getVoices()` helper
  - Implement `getVoicesForLang()` helper
  - Implement `isTTSAvailable()` check

---

## Step 6: Build UI Components

### TranslationPanel (Main Container)
- [ ] Create `src/components/translator/TranslationPanel.tsx`
  - Layout for language selectors
  - Text input/output areas
  - Action buttons
  - Status indicator

### LanguageSelector
- [ ] Create `src/components/translator/LanguageSelector.tsx`
  - Use existing Select component
  - Display languages in native names
  - Handle selection changes

### TextInput
- [ ] Create `src/components/translator/TextInput.tsx`
  - Use existing Textarea component
  - Handle input changes
  - Show character count

### TextOutput
- [ ] Create `src/components/translator/TextOutput.tsx`
  - Read-only textarea
  - Placeholder when empty
  - Auto-resize height

### TranslateButton
- [ ] Create `src/components/translator/TranslateButton.tsx`
  - Loading state
  - Disabled when no input
  - Progress indicator

### StatusIndicator
- [ ] Create `src/components/translator/StatusIndicator.tsx`
  - Progress bar for model loading
  - Status text updates
  - Error message display

### TTSSpeaker
- [ ] Create `src/components/translator/TTSSpeaker.tsx`
  - Play/Stop toggle
  - Loading state
  - Accessibility labels

### CopyButton
- [ ] Create `src/components/translator/CopyButton.tsx`
  - Copy to clipboard
  - Success feedback
  - Accessibility labels

---

## Step 7: Integrate into Main Application

### Update Root Layout
- [ ] Modify `src/routes/__root.tsx`
  - Add TranslationPanel to layout
  - Ensure proper routing

### Update Home Page
- [ ] Modify `src/routes/index.tsx`
  - Replace placeholder content
  - Render TranslationPanel

---

## Step 8: Add Offline Support

### Service Worker
- [ ] Create `public/sw.ts`
  - Cache static assets
  - Cache model downloads
  - Handle offline requests

### Register Service Worker
- [ ] Create `src/lib/service-worker.ts`
  - Register service worker
  - Handle updates

### Update index.html
- [ ] Add service worker registration script

---

## Step 9: Accessibility & Polish

### ARIA Labels
- [ ] Add labels to all interactive elements
- [ ] Add live regions for status updates
- [ ] Ensure keyboard navigation

### Error Handling
- [ ] Add error boundaries
- [ ] Implement retry mechanisms
- [ ] Show helpful error messages

### Loading States
- [ ] Add skeleton loaders
- [ ] Implement progressive loading
- [ ] Show estimated time

---

## Step 10: Testing & Optimization

### Performance Testing
- [ ] Measure model loading time
- [ ] Measure translation latency
- [ ] Optimize with memoization

### Cross-Browser Testing
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test TTS in different browsers
- [ ] Handle browser quirks

### Mobile Testing
- [ ] Test responsive layout
- [ ] Test touch interactions
- [ ] Test offline mode

---

## File Summary

### New Files to Create

```
src/types/
├── worker.ts
└── translation.ts

src/lib/
├── translation/
│   ├── models.ts
│   ├── protocol.ts
│   └── cache.ts
├── storage/
│   ├── indexeddb.ts
│   └── preferences.ts
├── tts/
│   └── browser.ts
└── service-worker.ts

src/hooks/
├── useWorker.ts
├── useTranslation.ts
├── useTTS.ts
└── useOnlineStatus.ts

src/components/translator/
├── TranslationPanel.tsx
├── LanguageSelector.tsx
├── TextInput.tsx
├── TextOutput.tsx
├── TranslateButton.tsx
├── StatusIndicator.tsx
├── TTSSpeaker.tsx
└── CopyButton.tsx

public/
└── sw.ts
```

### Files to Modify

```
src/routes/__root.tsx
src/routes/index.tsx
index.html
```

---

## Estimated Complexity

| Step | Complexity | Estimated Files |
|------|------------|----------------|
| 1 | Low | 3 |
| 2 | Medium | 2 |
| 3 | High | 4 |
| 4 | Medium | 4 |
| 5 | Low | 1 |
| 6 | Medium | 8 |
| 7 | Low | 2 |
| 8 | Medium | 3 |
| 9 | Low | 3 |
| 10 | Medium | - |
| **Total** | - | **~32 files** |

---

## Dependencies

| Package | Purpose |
|---------|---------|
| @xenova/transformers | ML inference (ONNX models) |
| idb | IndexedDB wrapper |
| @types/web-speech-api | TypeScript types for Web Speech API |

---

## References

- [Transformers.js Documentation](https://huggingface.co/docs/transformers.js)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)
- [Hugging Face Hub - OPUS-MT Models](https://huggingface.co/models?pipeline_tag=translation)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
