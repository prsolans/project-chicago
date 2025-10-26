# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HelloFriend Web is an assistive communication application designed for people with ALS and severe motor disabilities who use eye-tracking technology. The app runs on Tobii Dynavox TD I-13 devices, which provide OS-level mouse emulation where gaze controls the cursor and dwelling (hovering) triggers clicks.

**Core Interaction Model**: Users type by looking at on-screen keys. After dwelling for ~600ms (configurable), a key is automatically selected. The app uses AI to predict next words and text-to-speech to speak messages.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with persist middleware for settings)
- **TTS**: ElevenLabs API (primary), Web Speech API (fallback) ✅
- **Backend**: Supabase (auth, database) - Phase 2
- **AI**: Claude API (Anthropic) for word predictions - Phase 2
- **Deploy**: Vercel

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture Overview

### Key Design Principles

1. **Dwell-Based Interaction**: All interactive elements use hover + dwell time instead of clicks
2. **High Contrast UI**: Large touch targets (80px min height), bold colors, clear visual feedback
3. **Real-time Progress Indication**: Visual conic gradient shows dwell progress on each key
4. **Optimized for Eye Tracking**: No small buttons, no hover states that require precision

### Component Hierarchy

```
App.tsx
├── MessageDisplay/
│   └── MessageDisplay.tsx (displays typed message, connects to messageStore)
└── Keyboard/
    ├── Keyboard.tsx (QWERTY layout, handles key selection logic)
    └── Key.tsx (individual key with dwell detection)
```

### State Management (Zustand)

**messageStore** (`src/store/messageStore.ts`):
- Manages the current message text
- Actions: `addCharacter`, `addWord`, `addSpace`, `deleteCharacter`, `deleteWord`, `clear`
- Used by: Keyboard, MessageDisplay

**settingsStore** (`src/store/settingsStore.ts`):
- Persisted to localStorage
- Settings: `dwellTime` (600ms default), `voiceId`, `enableAI`, `enableSound`
- Used by: Key component for dwell timing

### Critical Hook: useDwellDetection

Located at `src/hooks/useDwellDetection.ts`

**How it works**:
1. Uses `requestAnimationFrame` for smooth 60fps progress updates
2. Tracks mouse enter/leave events on elements
3. Starts timer on mouse enter, cancels on mouse leave
4. Fires callback when timer completes (dwellTime reached)
5. Returns progress (0-100%) for visual feedback

**Parameters**:
- `dwellTime`: Duration in milliseconds (from settingsStore)
- `onDwell`: Callback function to execute when dwell completes
- `enabled`: Boolean to enable/disable detection

**Returns**:
- `progress`: Number 0-100 for visual indicator
- `isHovering`: Boolean hover state
- `handleMouseEnter`: Event handler for mouse enter
- `handleMouseLeave`: Event handler for mouse exit

**Usage pattern**:
```typescript
const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
  dwellTime,
  () => onSelect(keyValue)
);
```

### Keyboard Layout

Uses CSS Grid with 10 columns and 4 rows:
- Row 1: Q W E R T Y U I O P
- Row 2: A S D F G H J K L
- Row 3: Z X C V B N M
- Row 4: Space (5 cols), Delete (2 cols), Speak (3 cols)

**Grid positioning**: Each key uses `gridArea` prop (e.g., `'1 / 1 / 2 / 2'` for row 1, col 1)

**Key types and colors**:
- `letter`: Slate gray (bg-slate-700)
- `space`: Blue (bg-blue-600)
- `delete`: Red (bg-red-600)
- `speak`: Green (bg-green-600)
- `clear`: Orange (bg-orange-600)

### Visual Dwell Feedback

Implemented in `Key.tsx`:
```typescript
<div
  className="absolute inset-0 rounded-lg border-4 border-yellow-400"
  style={{
    background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
    opacity: 0.3,
  }}
/>
```

This creates a circular progress indicator that fills clockwise as the user dwells.

## Text-to-Speech Integration ✅

**Implemented in Phase 2**

Located at `src/hooks/useTextToSpeech.ts` and `src/services/elevenLabsApi.ts`

**How it works**:
1. Primary TTS: ElevenLabs API for high-quality natural voices
2. Automatic Fallback: Web Speech API if ElevenLabs is not configured or fails
3. Triggered by dwelling on the "Speak" button
4. Visual feedback: Button label changes to "⏳ Loading..." then "🔊 Speaking..."

**States**:
- `isSpeaking`: Boolean indicating if TTS is currently playing
- `isLoading`: Boolean indicating if TTS audio is being generated
- `error`: String with error message if TTS fails

**Functions**:
- `speak(text: string)`: Speaks the provided text using ElevenLabs (primary) or Web Speech API (fallback)
- `stop()`: Stops any currently playing speech

**Configuration**:
- ElevenLabs API key: Set `VITE_ELEVENLABS_API_KEY` in `.env` file
- Voice ID: Stored in `settingsStore.voiceId` (default: '21m00Tcm4TlvDq8ikWAM')
- Without API key: Automatically falls back to browser's Web Speech API

**Usage in Keyboard.tsx**:
```typescript
const { speak, isSpeaking, isLoading } = useTextToSpeech();

// When speak button is selected
if (message && message.trim()) {
  speak(message);
}
```

## Phase 2 Features (Not Yet Implemented)

The following features are planned but not yet implemented:

1. **AI Word Prediction** (`src/hooks/useTextPrediction.ts`)
   - Uses Claude API to predict next words based on current context
   - Displays predictions in a bar above keyboard
   - Users can select predictions by dwelling

3. **First Words Panel** (`src/components/FirstWords/FirstWordsPanel.tsx`)
   - Quick access to common phrases ("I need help", "Yes", "No")
   - Categories: family, responses, common phrases

4. **Supabase Integration** (`src/services/supabase.ts`)
   - User authentication
   - Message history storage
   - Settings sync across devices

5. **Settings Modal**
   - Adjust dwell time (200ms - 2000ms)
   - Select voice for TTS
   - Toggle AI predictions
   - Toggle sound effects

## Adding New Features

### Adding a New Key to Keyboard

1. Add entry to `KEYBOARD_LAYOUT` array in `src/components/Keyboard/Keyboard.tsx`
2. Define `gridArea` for positioning (format: `'row_start / col_start / row_end / col_end'`)
3. Choose appropriate `type` for styling
4. Add handling logic in `handleKeySelect` if needed

### Modifying Dwell Time

Dwell time is stored in `settingsStore` and defaults to 600ms. To change:
- User-adjustable: Add settings UI that calls `setDwellTime(newTime)`
- Developer default: Change `dwellTime: 600` in `src/store/settingsStore.ts`

### Modifying TTS Configuration

TTS is already implemented. To modify:

**Change Voice**:
1. Get voice ID from ElevenLabs dashboard
2. Update `settingsStore.voiceId` (default: '21m00Tcm4TlvDq8ikWAM')
3. Or add settings UI to let users select voices

**Troubleshooting TTS**:
- If ElevenLabs doesn't work: Check API key in `.env` file
- Error "ElevenLabs API key not configured": Add valid key to `.env`
- Falls back to Web Speech API: This is normal if no API key is set
- Web Speech API voice: Browser-dependent, cannot be customized without ElevenLabs

**Testing Fallback**:
1. Remove or invalidate `VITE_ELEVENLABS_API_KEY` in `.env`
2. Restart dev server
3. Speak button will use Web Speech API automatically

### Implementing AI Predictions

1. Create `src/services/claudeApi.ts` with Anthropic SDK
2. Create `src/hooks/useTextPrediction.ts` that:
   - Takes current message as input
   - Calls Claude API with prompt for word prediction
   - Returns array of predicted words
3. Create `src/components/Predictions/PredictionsBar.tsx`
4. Display predictions as dwell-enabled buttons
5. Add prediction to message using `addWord` from messageStore

## Testing Approach

Since the target device uses eye tracking, testing can be done with a regular mouse by simulating the dwell interaction:

1. **Manual Testing**:
   - Hover mouse over keys and hold for 600ms
   - Verify visual progress indicator appears
   - Verify key triggers automatically after dwell time
   - Test on actual Tobii device if available

2. **Dwell Time Adjustment Testing**:
   - Test with different dwell times (300ms, 600ms, 1000ms)
   - Verify faster/slower users can adjust to comfortable speed

3. **Keyboard Layout Testing**:
   - Verify all keys are reachable
   - Check grid alignment
   - Test on different screen sizes (device is 13" tablet)

4. **Message Flow Testing**:
   - Type full sentences
   - Test space, delete, clear functions
   - Verify message persists correctly

## Tobii Device Specifics

- **Device**: Tobii Dynavox TD I-13 (13-inch Windows tablet)
- **Resolution**: Typically 1920x1080 or similar
- **Eye Tracking**: Built-in Tobii eye tracker
- **OS Integration**: Eye gaze controls mouse cursor, dwell acts as click
- **No Touch Required**: Entirely hands-free operation
- **Dwell Click**: User can adjust system-wide dwell time in Tobii settings, app should respect this

## File Structure Reference

```
src/
├── components/
│   ├── Keyboard/
│   │   ├── Key.tsx          # Individual key with dwell detection
│   │   └── Keyboard.tsx     # QWERTY layout and key selection logic
│   ├── MessageDisplay/
│   │   └── MessageDisplay.tsx  # Display area for typed message
│   ├── FirstWords/          # (Phase 2)
│   └── Predictions/         # (Phase 2)
├── hooks/
│   ├── useDwellDetection.ts    # Core dwell timing logic
│   ├── useTextToSpeech.ts      # (Phase 2)
│   └── useTextPrediction.ts    # (Phase 2)
├── services/
│   ├── supabase.ts          # (Phase 2)
│   ├── claudeApi.ts         # (Phase 2)
│   └── elevenLabsApi.ts     # (Phase 2)
├── store/
│   ├── messageStore.ts      # Message state management
│   └── settingsStore.ts     # User settings with localStorage
├── types/
│   └── index.ts             # TypeScript interfaces
├── App.tsx                  # Main app component
└── main.tsx                 # React entry point
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:
- `VITE_SUPABASE_URL`: Supabase project URL (Phase 2)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (Phase 2)
- `VITE_ANTHROPIC_API_KEY`: Anthropic API key for Claude (Phase 2)
- `VITE_ELEVENLABS_API_KEY`: ElevenLabs API key for TTS (Phase 2)

## Accessibility Considerations

- **Large Touch Targets**: Minimum 80px height for all interactive elements
- **High Contrast**: Dark mode optimized with bright text on dark backgrounds
- **No Precision Required**: All interactions use dwell, no clicking
- **Visual Feedback**: Clear progress indicators for all actions
- **Error Prevention**: Delete button is red and positioned away from common keys
- **No Time Pressure**: Users control when actions trigger by dwelling
