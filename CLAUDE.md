# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HelloFriend Web is an assistive communication application designed for people with ALS and severe motor disabilities who use eye-tracking technology. The app runs on Tobii Dynavox TD I-13 devices, which provide OS-level mouse emulation where gaze controls the cursor and dwelling (hovering) triggers clicks.

**Core Interaction Model**: Users communicate through four modes:
1. **Type** - AI-assisted typing with Claude predictions
2. **Build** - Construct sentences from curated word fragments
3. **Quick** - Access categorized quick phrases
4. **Stories** - Create and playback stories with emotion tags

All interactions use dwell-based selection (~600ms hover) instead of clicks, optimized for eye-tracking.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with persist middleware)
- **TTS**: ElevenLabs API (primary), Web Speech API (fallback)
- **Backend**: Supabase (auth, database, cloud sync)
- **AI**: Claude API (Anthropic) for thought completion predictions
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
3. **Real-time Progress Indication**: Visual conic gradient shows dwell progress on each element
4. **Optimized for Eye Tracking**: No small buttons, no hover states that require precision
5. **Multi-Modal Communication**: Four complementary input methods for different use cases

### Application Structure (4-Tab Layout)

```
App.tsx
├── Tab Navigation (Type | Build | Quick | Stories)
└── Tab Content Areas:
    ├── Type Tab
    │   ├── ThoughtCompletionBar (AI predictions from Claude)
    │   └── MessageDisplay (typed message)
    ├── Build Tab
    │   └── PhraseBuilder (sentence construction from fragments)
    ├── Quick Tab
    │   └── StartersPanel (categorized quick phrases)
    └── Stories Tab
        └── SimpleStoryMode (story creation & playback)
```

### State Management (Zustand Stores)

**messageStore** (`src/store/messageStore.ts`):
- Current message text being composed
- Actions: `setMessage`, `sendMessage`, `clearMessage`
- Tracks input method (typed, predicted, category, etc.)

**settingsStore** (`src/store/settingsStore.ts`):
- Persisted to localStorage
- Settings: `dwellTime` (600ms default), `voiceId`, `enableAI`, `enableSound`
- Used by all components for dwell timing and preferences

**conversationStore** (`src/store/conversationStore.ts`):
- Conversation history with timestamps
- Multi-participant support (user, caregiver, family, medical, other)
- Context tracking (time of day, fatigue level)
- Cloud sync to Supabase for history preservation
- Actions: `addMessage`, `editMessage`, `deleteMessage`, `addParticipant`

**phraseFragmentStore** (`src/store/phraseFragmentStore.ts`):
- Manages phrase building fragments
- Current selection state during sentence construction
- Saved built phrases with usage tracking
- Custom user-created fragments
- Usage counts for personalization
- Actions: `addFragment`, `removeLastFragment`, `clearSelection`, `saveBuiltPhrase`

**phraseLibraryStore** (`src/store/phraseLibraryStore.ts`):
- Cloud-synced phrase library via Supabase
- 10 categories: family, medical, comfort, social, responses, questions, food, feelings, entertainment, ideas
- Smart sorting with time-awareness and usage statistics
- Local caching with 5-minute refresh
- Actions: `loadPhrases`, `getPhrasesByCategory`, `addNewPhrase`, `trackUsage`

**simpleStoryStore** (`src/store/simpleStoryStore.ts`):
- Story creation, editing, and playback
- Stories split into lines for navigation
- Emotion tags for expressive TTS
- Usage tracking per story
- Actions: `createNewStory`, `updateExistingStory`, `startPlayback`, `nextLine`, `previousLine`

### Core Hooks

**useDwellDetection** (`src/hooks/useDwellDetection.ts`):
- Core interaction mechanic for all buttons
- Uses `requestAnimationFrame` for smooth 60fps progress updates
- Parameters: `dwellTime`, `onDwell` callback, `enabled` boolean
- Returns: `progress` (0-100%), `handleMouseEnter`, `handleMouseLeave`

**useTextToSpeech** (`src/hooks/useTextToSpeech.ts`):
- Primary: ElevenLabs API for high-quality natural voices
- Automatic fallback: Web Speech API if ElevenLabs not configured
- Supports emotion settings (speed, tone, effects)
- Returns: `speak(text, options)`, `stop()`, `isSpeaking`, `isLoading`, `error`

**useThoughtCompletion** (`src/hooks/useThoughtCompletion.ts`):
- AI predictions using Claude API via `src/services/claudeApi.ts`
- Merges pattern-based predictions with AI predictions
- Caching via `src/services/predictionCache.ts`
- Debounced API calls (400ms default)
- Returns: `predictions[]`, `isLoading`, `triggerPredictions()`, `clearPredictions()`

**useConversation** (`src/hooks/useConversation.ts`):
- Wrapper around conversationStore for easy access
- Provides conversation context for AI predictions
- Tracks messages, participants, and context

**usePatternLearning** (`src/hooks/usePatternLearning.ts`):
- Local pattern-based predictions from usage history
- Learns frequently used phrases and word combinations
- Provides instant predictions while AI loads

## Feature Implementations

### 1. Type Tab - AI-Assisted Typing

**Location**: `src/App.tsx` (Type tab content)

**Components**:
- `ThoughtCompletionBar` (`src/components/Predictions/ThoughtCompletionBar.tsx`)
  - Displays 6-8 AI predictions from Claude
  - Smart word completion vs. word addition logic
  - Dwell-enabled prediction buttons

- `MessageDisplay` (`src/components/MessageDisplay/MessageDisplay.tsx`)
  - Shows current typed message
  - Integrates with system keyboard (Tobii or standard)

**How it works**:
1. User types using system keyboard (Tobii's built-in keyboard)
2. As they type, Claude API generates context-aware predictions
3. Predictions shown in horizontal bar above message
4. User can dwell on prediction to insert it
5. Smart logic: replaces last word if prediction completes it, otherwise appends

**AI Integration**:
- Uses `useThoughtCompletion` hook
- Calls `generateThoughtCompletions()` from `src/services/claudeApi.ts`
- Context includes: recent conversation, time of day, fatigue level, recent selections
- Results cached for performance

### 2. Build Tab - Sentence Construction

**Location**: `src/components/PhraseBuilder/PhraseBuilder.tsx`

**How it works**:
1. User selects fragments in sequence to build a sentence
2. System guides: Subject → Verb → Object/Emotion → Modifiers
3. Live preview shows sentence as it's built
4. Fragments organized by category and sorted by usage frequency
5. Can save built phrases for later reuse

**Fragment Types** (from `src/data/phraseFragments.ts`):
- **subject**: Personal pronouns, family names (I, you, Tony, Michael, Claire)
- **verb**: Actions, states, emotions (want, need, feel, love, think)
- **auxiliary**: Helper verbs (will, can, do, should)
- **negation**: Not, never, don't
- **interrogative**: Question words (what, why, how)
- **object**: Things, concepts, activities
- **modifier**: Adverbs, adjectives (really, very, always)
- **emotion**: Feelings and states
- **connector**: And, but, because

**Visual Design**:
- Fragments colored by opacity based on commonality (very_common = 100%, specialized = 60%)
- Grid layout (6 columns on desktop)
- Current step shown with blue highlight
- Action buttons: Undo, Clear, Save, Speak

**Personalization**:
- Tracks usage count per fragment
- Sorts frequently used fragments first
- Saves custom user-created fragments

### 3. Quick Tab - Category Phrases

**Location**: `src/components/Starters/StartersPanel.tsx`

**Categories** (10 total):
1. Family - Family member interactions
2. Medical - Health, medications, symptoms
3. Comfort - Physical comfort needs
4. Social - Greetings, conversations
5. Responses - Yes, no, maybe, common replies
6. Questions - Common questions
7. Food & Drink - Meal preferences, requests
8. Feelings - Emotional expressions
9. Entertainment - TV, music, activities
10. Ideas - Thoughts, observations

**How it works**:
1. User dwells on category card
2. Category expands to show all phrases in that category
3. Phrases displayed in 6-column grid
4. Smart sorting: time-aware + usage-based (via `getSmartPhrasesForCategory()`)
5. Pagination for categories with >30 phrases
6. Selecting phrase immediately speaks it and adds to conversation history

**Cloud Integration**:
- Phrases stored in Supabase `phrases` table
- Locally cached with 5-minute refresh
- Usage tracked to Supabase `phrase_usage` table
- Phrases have properties: text, category, time_of_day, confidence, is_active

### 4. Stories Tab - Story Mode

**Location**: `src/components/Stories/SimpleStoryMode.tsx`

**Three Views**:
1. **Story List** - Browse all saved stories
2. **Story Editor** - Create/edit stories with emotion tags
3. **Story Playback** - Navigate and speak story line by line

**Emotion Tags** (from `src/utils/emotionTags.ts`):
- Syntax: `[excited]`, `[sad]`, `[laughs]`, `[fast]`, `[slow]`
- Autocomplete dropdown appears when typing `[`
- Tags modify TTS voice settings (speed, stability, style)
- Tags include: emotions (happy, sad, excited), effects (laughs, sighs, whispers), speeds (fast, slow)

**Playback Features**:
- Line-by-line navigation with Previous/Next buttons
- Jump to any line via numbered buttons
- Progress bar showing position in story
- TTS respects emotion tags for expressive reading
- Usage tracking per story

**Story Properties**:
- Title, description, category (memory, joke, teaching, observation, personal)
- Content split by newlines into speakable segments
- Created/modified timestamps
- Usage count and last used timestamp

### 5. Admin Panel

**Location**: `src/components/Admin/AdminPanel.tsx`

**Access**: Press Ctrl+Shift+A

**Features**:
- View/manage custom phrases
- View conversation history
- Export data
- Debug tools and statistics

## Visual Dwell Feedback Pattern

Used consistently across all interactive elements:

```typescript
// Dwell progress indicator (yellow border with conic gradient fill)
{progress > 0 && (
  <div
    className="absolute inset-0 rounded-lg border-4 border-yellow-400"
    style={{
      background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
      opacity: 0.3,
    }}
  />
)}
```

This creates a circular progress indicator that fills clockwise as the user dwells.

## Text-to-Speech Integration

**Implementation**: `src/hooks/useTextToSpeech.ts` + `src/services/elevenLabsApi.ts`

**How it works**:
1. Primary: ElevenLabs API for high-quality natural voices with emotion support
2. Automatic Fallback: Web Speech API if ElevenLabs not configured or fails
3. Emotion tags modify voice settings (stability, similarity_boost, style, speed)

**Configuration**:
- `VITE_ELEVENLABS_API_KEY`: API key for ElevenLabs
- `VITE_ELEVENLABS_VOICE_ID`: Voice ID (default: Rachel)
- Browse voices: https://elevenlabs.io/voice-library
- Voice ID stored in settingsStore for runtime changes

**Emotion Support**:
- `[excited]` → Higher speed (1.2x), lower stability
- `[sad]` → Slower speed (0.8x), higher stability
- `[fast]` → Speed 1.3x
- `[slow]` → Speed 0.7x
- `[laughs]`, `[sighs]` → Passed to ElevenLabs as-is for natural rendering

## Supabase Cloud Integration

**Database Tables**:
1. **phrases** - Quick phrase library
2. **phrase_usage** - Usage tracking with timestamps
3. **conversation_history** - All messages with context
4. **phrase_candidates** - Typed phrases that may become quick phrases
5. **stories** - User-created stories

**Services**:
- `src/services/supabase.ts` - Supabase client setup
- `src/services/phraseService.ts` - Phrase CRUD operations
- `src/services/usageTracker.ts` - Usage tracking and analytics

**Features**:
- Offline-first with local caching
- 5-minute cache refresh for phrases
- Background sync for conversation history
- Automatic candidate phrase detection

## AI Integration (Claude API)

**Implementation**: `src/services/claudeApi.ts`

**Prediction Types**:
1. **Thought Completions** - Context-aware next word/phrase predictions
2. **Pattern Predictions** - Local ML from usage patterns

**Context Provided to Claude**:
- Recent conversation history (last 5 messages)
- Current partial input
- Time of day context
- User fatigue level
- Recent selections for pattern learning

**Performance Optimizations**:
- Prediction caching (`src/services/predictionCache.ts`)
- Debounced API calls (400ms)
- Pattern predictions shown instantly while AI loads
- Merged results (pattern + AI) for diversity

## Environment Variables

Required in `.env`:
```bash
# ElevenLabs TTS (primary)
VITE_ELEVENLABS_API_KEY=your_api_key
VITE_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM  # Rachel (default)

# Claude AI (predictions)
VITE_ANTHROPIC_API_KEY=your_anthropic_key

# Supabase (backend)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## File Structure Reference

```
src/
├── components/
│   ├── Admin/
│   │   └── AdminPanel.tsx           # Settings & debug panel
│   ├── Categories/
│   │   └── CategoryPhrasesPanel.tsx # (Legacy - replaced by StartersPanel)
│   ├── Keyboard/
│   │   ├── Key.tsx                  # Individual key with dwell
│   │   └── Keyboard.tsx             # QWERTY layout (legacy - system keyboard now used)
│   ├── MessageDisplay/
│   │   └── MessageDisplay.tsx       # Current message display
│   ├── PhraseBuilder/
│   │   └── PhraseBuilder.tsx        # Fragment-based sentence builder
│   ├── Predictions/
│   │   └── ThoughtCompletionBar.tsx # AI prediction display
│   ├── Starters/
│   │   └── StartersPanel.tsx        # Quick categorized phrases
│   ├── Stories/
│   │   └── SimpleStoryMode.tsx      # Story creation & playback
│   └── ConversationPanel/
│       ├── ConversationPanel.tsx    # Conversation history (unused in main UI)
│       ├── ParticipantSelector.tsx  # Multi-party selection
│       └── Message.tsx              # Message bubble component
├── data/
│   ├── phraseFragments.ts           # 400+ buildable fragments
│   └── staticPhrases.ts             # Default phrase library
├── hooks/
│   ├── useDwellDetection.ts         # Core dwell timing logic
│   ├── useTextToSpeech.ts           # TTS with ElevenLabs/WebSpeech
│   ├── useThoughtCompletion.ts      # AI predictions
│   ├── useConversation.ts           # Conversation context
│   ├── usePatternLearning.ts        # Local pattern predictions
│   └── useCategoryPhrases.ts        # Quick phrase helpers
├── services/
│   ├── supabase.ts                  # Supabase client
│   ├── claudeApi.ts                 # Claude API integration
│   ├── elevenLabsApi.ts             # ElevenLabs TTS
│   ├── phraseService.ts             # Phrase CRUD
│   ├── usageTracker.ts              # Analytics & tracking
│   └── predictionCache.ts           # AI prediction cache
├── store/
│   ├── messageStore.ts              # Current message state
│   ├── settingsStore.ts             # User preferences
│   ├── conversationStore.ts         # Conversation history
│   ├── phraseFragmentStore.ts       # Fragment builder state
│   ├── phraseLibraryStore.ts        # Quick phrase library
│   └── simpleStoryStore.ts          # Story state
├── types/
│   ├── index.ts                     # Legacy types
│   ├── conversation.ts              # Conversation & AI types
│   ├── database.ts                  # Supabase schema types
│   └── phraseFragments.ts           # Fragment types
├── utils/
│   └── emotionTags.ts               # Emotion tag parsing & TTS settings
├── App.tsx                          # Main app with 4-tab layout
└── main.tsx                         # React entry point
```

## Common Development Tasks

### Adding New Phrase Fragments

1. Edit `src/data/phraseFragments.ts`
2. Add to appropriate array (subjectFragments, verbFragments, etc.)
3. Specify: id, text, type, category, commonality
4. Fragment will automatically appear in PhraseBuilder

### Adding Quick Phrases to Library

Option 1: Via Admin Panel (UI)
- Press Ctrl+Shift+A
- Use "Add Phrase" interface

Option 2: Via Supabase directly
- Insert into `phrases` table with: text, category, time_of_day, confidence, is_active

### Modifying AI Prediction Behavior

Edit `src/services/claudeApi.ts`:
- Modify system prompt in `generateThoughtCompletions()`
- Adjust `maxPredictions` count
- Change context window (currently last 5 messages)

### Adding New Emotion Tags

Edit `src/utils/emotionTags.ts`:
1. Add to `EMOTION_TAGS` array with: tag, label, description, voice settings
2. Tag will appear in autocomplete automatically
3. Specify: emotion/effect/speed, stability, similarity_boost, style, speed multiplier

### Changing Dwell Time

- User-adjustable: Via settings (when implemented in UI)
- Developer default: Edit `settingsStore.ts` → `dwellTime: 600`
- Per-component override: Pass different `dwellTime` to `useDwellDetection()`

## Testing Approach

### Manual Testing with Mouse
1. Hover over buttons and hold for ~600ms
2. Verify yellow border progress indicator appears
3. Verify button triggers automatically after dwell completes
4. Test all four tabs thoroughly

### Testing on Tobii Device
1. Calibrate eye tracker
2. Test dwell timing matches user comfort
3. Verify all UI elements are large enough (>80px height)
4. Check text readability from typical viewing distance
5. Test for extended sessions (fatigue testing)

### Tab-Specific Testing

**Type Tab**:
- Type short message, verify AI predictions appear
- Select prediction, verify smart word replacement
- Test with empty input (first word predictions)

**Build Tab**:
- Build complete sentence (subject → verb → object)
- Test Undo, Clear, Save, Speak buttons
- Verify preview text updates correctly
- Test custom fragment addition

**Quick Tab**:
- Select each category, verify phrases load
- Test pagination on large categories
- Verify immediate speak on selection
- Check smart sorting (time-aware)

**Stories Tab**:
- Create new story with emotion tags
- Test autocomplete for `[` tags
- Playback: test Previous/Next/Jump navigation
- Verify TTS respects emotion tags

## Tobii Device Specifics

- **Device**: Tobii Dynavox TD I-13 (13-inch Windows tablet)
- **Resolution**: 1920x1080
- **Eye Tracking**: Built-in Tobii eye tracker with system-wide mouse emulation
- **Dwell Settings**: Configurable in Tobii Control Center (app uses ~600ms default)
- **No Touch Required**: Entirely hands-free operation via eye gaze
- **System Keyboard**: App uses Tobii's built-in on-screen keyboard for typing

## Accessibility Considerations

- **Large Touch Targets**: All buttons minimum 80px height
- **High Contrast**: Dark mode (bg-slate-900) with bright text and colored buttons
- **No Precision Required**: All interactions use dwell, no clicking or dragging
- **Visual Feedback**: Yellow border progress on all dwell-enabled elements
- **Error Prevention**: Destructive actions (Delete, Clear) colored red and positioned carefully
- **No Time Pressure**: User controls all timing via dwell duration
- **Flexible Communication**: 4 modes accommodate different cognitive/physical states

## Performance Considerations

- **Prediction Caching**: 5-minute TTL for AI predictions
- **Phrase Library Caching**: 5-minute TTL for Supabase phrases
- **Debounced API Calls**: 400ms debounce on prediction triggers
- **Pattern Predictions First**: Show instant local predictions while AI loads
- **Offline-First**: Local storage for all critical data
- **Background Sync**: Non-blocking conversation history sync
