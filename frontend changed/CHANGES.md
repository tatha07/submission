# PashuDrishti Frontend — Backend Integration Changes

Apply these to your existing Google AI Studio project. All paths below match
your existing file structure.

## 1. Install the Firebase SDK, remove Gemini SDK
Replace `package.json` with the one in this package. Then run:
    npm install

## 2. New files to ADD (copy these in as-is)
- `.env.example` -> copy to `.env` and fill in real values
- `src/services/firebase.ts` -> Firebase client init
- `src/services/apiService.ts` -> talks to your FastAPI backend
- `src/services/imgbbService.ts` -> uploads photos to imgbb
- `src/context/AuthContext.tsx` -> tracks real logged-in user
- `src/screens/LoginScreen.tsx` -> real login/signup screen

## 3. Files to REPLACE entirely (overwrite your existing versions)
- `src/services/detectionService.ts` — now calls your backend + imgbb
  instead of returning one of 4 hardcoded fake scenarios
- `src/services/communityService.ts` — now calls your backend instead of
  browser localStorage. NOTE: reading posts back needs a new GET endpoint
  on your backend (the TODO comment in the file has the exact code — give
  it to Person 2 to add)
- `src/App.tsx` — now wraps the app in AuthProvider and shows LoginScreen
  until someone actually signs in
- `metadata.json` — removed the Gemini capability flag
- `package.json` — removed `@google/genai`, `express`, `dotenv`; added `firebase`

## 4. Files that still need manual edits (I didn't rewrite these — here's what to change)

### `src/screens/IdentifyScreen.tsx`
`runAnalysis()` currently calls:
    detectionService.detectBreed({...}, activeScenario)
Change it to:
    // You need an animalId first - call apiService.registerAnimal() during
    // animal registration (a screen you'll need to add/wire before Identify),
    // then pass that id here:
    detectionService.detectBreed({ face, side, hornHump }, animalId)
Remove the `activeScenario` parameter entirely - it was only for picking
between fake demo scenarios.

### `src/screens/HomeScreen.tsx`
Delete the entire "Evaluator Demo Mode Switcher" card (the block with
`setActiveScenario` buttons for Gir/Crossbreed/Murrah/Low Confidence).
It only existed to switch between fake results.

### `src/screens/ProfileScreen.tsx`
Replace the hardcoded "Sunil Verma" block with the real user:
    const { user, logout } = useAuth();
    // use user?.email or a fetched fullName instead of "Sunil Verma"
Add a logout button calling `logout()`.

### `src/context/AppContext.tsx`
`recentIdentifications` currently loads from `storageService` (localStorage).
This is fine to KEEP as local device history for now — it's not part of
your core schema and isn't worth the engineering time to sync today.

### `src/services/storageService.ts`
KEEP AS-IS for saved breeds (bookmarking) - this is a personal convenience
feature, not part of your team's schema contract, safe to stay local.

## 5. Still missing entirely (needs to be built, not just wired)
- An "Add Animal" registration screen calling `apiService.registerAnimal()`
  before the guided photo capture starts (currently IdentifyScreen jumps
  straight to photos with no animalId to attach them to)
- The backend GET /community/posts/{breed_id} endpoint (see TODO comment
  in communityService.ts for the exact code)

## 6. Backend-side reminder
Your backend's `/predict` endpoint is still the PLACEHOLDER (random fake
guesses) until Person 3/4 swap in the real model - the frontend changes
here don't require you to wait for that. Everything will work end-to-end
with placeholder predictions today, and start returning real ones the
moment that one function is swapped server-side.
