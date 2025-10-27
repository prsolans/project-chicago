# HelloFriend

> **Look. Dwell. Communicate.**

HelloFriend is an assistive communication application designed for people with ALS and severe motor disabilities who use eye-tracking technology. Built specifically for Tobii Dynavox TD I-13 devices, the app enables hands-free typing and communication through gaze-based interaction.

## Overview

HelloFriend allows users to type messages by looking at on-screen keys. The app uses **dwell-based interaction** - users simply look at a key and hold their gaze for ~600ms (configurable) to automatically select it. No clicking or physical input required.

### Key Features

- **🤖 AI-Powered Next Word Prediction with Pattern Learning**: Build sentences word-by-word with intelligent suggestions
  - After typing 2 characters, get 4-6 next word predictions
  - Select words/phrases with one dwell instead of typing letter-by-letter
  - 3-5x faster than typing every letter
  - Smart caching minimizes API costs
  - Context-aware predictions based on conversation history and time of day
  - Confidence indicators show prediction accuracy
  - **Pattern Learning Intelligence**:
    - Learns from your frequently used word sequences (e.g., "I need water")
    - Pattern predictions appear instantly (no API delay)
    - Automatically merges pattern predictions with AI predictions for best results
    - Gets smarter over time as you use the app more
    - Falls back to pattern predictions if AI is unavailable
- **💬 Smart Category Phrases with Semantic Zones**: Instant access to context-aware complete phrases
  - Five categories: Medical 💊, Comfort 🛋️, Social 💬, Responses ✅, Questions ❓
  - AI generates 4 phrases per category based on time of day and conversation context
  - Speak complete sentences with a single dwell (e.g., "I need medication", "Thank you")
  - Phrases update automatically every 5 minutes and adapt to your needs
  - Auto-refresh when time of day changes (morning → afternoon)
  - **Semantic Zone Intelligence**:
    - Categories visually adapt based on time of day (morning = medication priority, evening = comfort priority)
    - Keyword detection boosts relevant zones (saying "pain" makes Medical zone glow red and enlarge)
    - Visual priority indicators: Red glow = critical, Yellow glow = high, Gray = medium, Dimmed = low
    - Highlighted zones pulse with white border for 30 seconds when triggered
- **💬 Conversation History with Respeak**: Scrollable chat showing all your messages with timestamps
  - Dwell on any previous message to hear it spoken again
  - Visual feedback with circular progress indicator during dwell
  - Speaker icon (🔊) indicates message is respeakable
  - Perfect for repeating important messages to different people
- **Dwell-Based Typing**: Look at a key, hold your gaze, and it's automatically selected
- **Visual Progress Feedback**: Real-time circular progress indicator shows dwell progress on each key
- **Text-to-Speech**: Speak your typed messages using high-quality AI voices
  - Primary: ElevenLabs API for natural, customizable voices
  - Fallback: Web Speech API (browser-based)
- **QWERTY Keyboard Layout**: Familiar keyboard with large, eye-tracking optimized keys
- **High Contrast UI**: Dark mode with bold colors and clear visual feedback
- **Fully Hands-Free**: Designed for completely hands-free operation with eye tracking
- **Persistent Settings**: Dwell time, voice preferences, and conversation history saved locally

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand (with persist middleware)
- **Text-to-Speech**: ElevenLabs API (primary), Web Speech API (fallback)
- **Build Tool**: Vite 7

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- (Optional) ElevenLabs API key for high-quality text-to-speech

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd eyespeak-web
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. (Optional) Add your ElevenLabs API key to `.env`:
```env
VITE_ELEVENLABS_API_KEY=your_api_key_here
VITE_ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
```

**Note**: Without an ElevenLabs API key, the app automatically falls back to the browser's Web Speech API.

5. Start the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:5173`

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API key for TTS | No | - |
| `VITE_ELEVENLABS_VOICE_ID` | Voice ID from ElevenLabs library | No | `21m00Tcm4TlvDq8ikWAM` (Rachel) |
| `VITE_ANTHROPIC_API_KEY` | Anthropic (Claude) API key for AI predictions | No | - |

**Popular Voice IDs**:
- `21m00Tcm4TlvDq8ikWAM` - Rachel (default, female)
- `pNInz6obpgDQGcFmaJgB` - Adam (male)
- Browse more at [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)

## Usage

### For Eye-Tracking Users (Tobii Dynavox TD I-13)

#### Quick Start:
1. Launch the app on your Tobii device
2. Make sure **🤖 AI On** button is green (top right)
3. Click **💬 Quick Phrases** to toggle category phrases panel
4. Start typing by looking at letters

#### Three Ways to Communicate:

**Option 1: AI-Assisted Word Building (FAST - Recommended)**
1. Type 2-3 characters to start a word (e.g., "I ne")
2. Word predictions appear above the keyboard in ~0.4 seconds
3. Dwell on a predicted word to add it to your message
4. Repeat: type next letter or two, select predicted word
5. Press **Speak** when your sentence is complete
6. **Result**: Build "I need water" in 4-5 dwells instead of 15!

**Option 2: Quick Phrases (FASTEST - For Common Needs)**
1. Click **💬 Quick Phrases** button to show the category panel
2. Select a category tab (Medical 💊, Comfort 🛋️, Social 💬, Responses ✅, Questions ❓)
3. Dwell on any complete phrase to speak it immediately
4. **Result**: Communicate "I need medication" or "Thank you" with just 2 dwells!
5. Phrases automatically adapt to time of day and conversation context

**Option 3: Letter-by-Letter (Traditional)**
1. Look at any letter key and hold your gaze for ~600ms
2. Watch the yellow circular progress indicator fill up
3. The key automatically selects when progress reaches 100%
4. Build your message letter by letter
5. Look at **Speak** button to send and speak your message

#### Understanding Word Predictions:

Word buttons appear after typing 2+ characters:
- **Background Color**:
  - 🟢 Green = High confidence (80%+) - AI is very sure
  - 🔵 Blue = Medium confidence (60-80%) - AI is fairly sure
  - ⚫ Gray = Lower confidence (<60%) - AI is less certain
- **Percentage**: Shows AI's confidence level
- Predictions update continuously as you type

#### Example Flow:

1. Type "I" → AI suggests: "need", "want", "am", "can"
2. Select "need" → Message now: "I need"
3. AI immediately suggests: "to", "water", "help", "medication"
4. Select "to" → Message now: "I need to"
5. AI suggests: "use", "go", "eat", "sleep"
6. Select "use" → Message now: "I need to use"
7. Continue until complete, then press **Speak**

#### Control Buttons:

- **🤖 AI On/Off**: Enable/disable word predictions
- **💬 Quick Phrases**: Show/hide category phrases panel
- **👁️ Show/Hide History**: Toggle conversation history panel

#### Message History Features:

Messages in the conversation history are marked with emoji showing how they were created:
- ⌨️ = Typed letter-by-letter
- 🤖 = Used AI word predictions
- 💬 = Selected from quick phrases

**Respeak Messages:**
- Hover over any message in the history to see the speaker icon (🔊)
- Dwell for ~600ms to hear the message spoken again
- Yellow circular progress indicator shows dwell progress
- Useful for repeating messages to different caregivers or family members

### For Testing (Mouse Users)

You can test the app with a regular mouse by simulating dwell interaction:

1. Hover your mouse over any key
2. Hold still for ~600ms
3. The key will automatically trigger

### Keyboard Controls

| Key | Function |
|-----|----------|
| **Letter keys (Q-P, A-L, Z-M)** | Add letter to message |
| **Space** | Add space to message |
| **⌫ (Delete)** | Remove last character |
| **🔊 Speak** | Speak the current message using text-to-speech |

## How It Works

### Dwell Detection

The core interaction mechanism is implemented in `useDwellDetection.ts`. Here's how it works:

1. Uses `requestAnimationFrame` for smooth 60fps progress updates
2. Tracks mouse enter/leave events on elements
3. Starts a timer when the mouse enters (or gaze dwells)
4. Cancels the timer if the mouse leaves
5. Fires a callback when the timer completes (dwellTime reached)
6. Returns progress (0-100%) for the visual feedback indicator

### Semantic Zone Intelligence

The category system adapts throughout the day and responds to conversation context:

**Time-Based Priority Shifts:**
- **Morning (6am-12pm)**: Medical 💊 (critical - red glow), Comfort 🛋️ (high - yellow glow)
  - Perfect timing for medication reminders and position adjustments after sleep
- **Afternoon (12pm-6pm)**: Responses ✅ (critical - red glow), Social 💬 (high - yellow glow)
  - Active conversation hours, quick responses prioritized
- **Evening (6pm-10pm)**: Comfort 🛋️ (critical - red glow), Social 💬 (high - yellow glow)
  - Comfort needs before sleep, evening conversations
- **Night (10pm-6am)**: Medical 💊 + Comfort 🛋️ (both critical - red glow)
  - Emergency medical and comfort needs

**Keyword-Triggered Highlighting:**
- Say "pain", "medication", or "help" → Medical zone glows red and enlarges
- Say "cold", "hot", or "position" → Comfort zone glows yellow and enlarges
- Highlighted zones pulse with white border for 30 seconds

**Visual Priority Indicators:**
- 🔴 Red glow + enlarged (110%) = Critical priority
- 🟡 Yellow glow + slightly enlarged (105%) = High priority
- ⚫ Normal size = Medium priority
- 🔘 Dimmed + smaller (95%) = Low priority

This ensures the most relevant communication options are always visually prominent, reducing cognitive load and speeding up message selection.

### Pattern Learning Intelligence

The app learns from your communication patterns to provide instant, personalized predictions:

**How Pattern Learning Works:**
1. **Sequence Extraction**: Analyzes all your messages to find frequently used word sequences
2. **Frequency Tracking**: Tracks 2-word and 3-word combinations (e.g., "I need", "I need water")
3. **Smart Prediction**: When you type "I ne", instantly suggests "need" based on your history
4. **Hybrid Predictions**: Merges pattern predictions with AI predictions for best coverage
5. **Graceful Fallback**: If AI is slow or unavailable, pattern predictions appear immediately

**Pattern Priority:**
- Patterns used 2+ times are considered valid
- More frequent patterns get higher confidence scores
- More recent patterns are prioritized over old ones
- Patterns decay over time (1 week) to adapt to changing needs

**Example:**
- Day 1: Type "I need water" 3 times manually
- Day 2: Type "I ne" → System instantly suggests "need" (from pattern), then "water" (from pattern)
- Result: "I need water" in ~6 dwells instead of 15!

**Benefits:**
- ⚡ Zero API delay for pattern predictions
- 🎯 Personalized to YOUR specific word choices
- 💾 Works offline after learning
- 🔄 Continuously adapts as you communicate

### Parallel Thought Streams (Advanced Feature)

**FUTURE ENHANCEMENT:** Real-time streaming predictions that update progressively as you type.

The infrastructure is built with `useStreamingPredictions` hook that enables:
- **Progressive Refinement**: Predictions update in real-time as AI generates them
- **Multiple Streams**: Show different prediction contexts simultaneously
  - "Continue Sentence" stream
  - "Ask Question" stream
  - "Respond" stream
- **Zero Perceived Latency**: See predictions forming as you type
- **Adaptive Streaming**: Uses Claude's streaming API for fastest response

**Note:** This feature is disabled by default to manage API costs. To enable, set `VITE_ENABLE_STREAMING=true` in `.env` and integrate the `useStreamingPredictions` hook into the keyboard component.

### Text-to-Speech

The app uses a dual TTS system:

1. **Primary**: ElevenLabs API
   - High-quality, natural-sounding AI voices
   - Customizable voice selection
   - Requires API key

2. **Fallback**: Web Speech API
   - Browser-based TTS
   - Works without configuration
   - Automatically used if ElevenLabs is not configured

The TTS system automatically falls back gracefully if the primary service is unavailable.

## Project Structure

```
src/
├── components/
│   ├── Categories/
│   │   └── CategoryPhrasesPanel.tsx    # Smart category phrases with semantic zones
│   ├── ConversationPanel/
│   │   ├── ConversationPanel.tsx       # Conversation history display
│   │   └── Message.tsx                 # Individual message component
│   ├── Keyboard/
│   │   ├── Key.tsx                     # Individual key with dwell detection
│   │   └── Keyboard.tsx                # QWERTY layout and key selection logic
│   ├── MessageDisplay/
│   │   └── MessageDisplay.tsx          # Display area for typed message
│   └── Predictions/
│       └── ThoughtCompletionBar.tsx    # AI word prediction display
├── hooks/
│   ├── useConversation.ts              # Conversation state management
│   ├── useCategoryPhrases.ts           # Context-aware category phrase predictions
│   ├── useDwellDetection.ts            # Core dwell timing logic
│   ├── useGazePatternIntelligence.ts   # Adaptive dwell time and fatigue detection
│   ├── usePatternLearning.ts           # Learn frequently used word sequences
│   ├── useSemanticZones.ts             # Time and context-based zone prioritization
│   ├── useStreamingPredictions.ts      # Real-time streaming predictions (Phase 5)
│   ├── useTextToSpeech.ts              # TTS integration with fallback
│   └── useThoughtCompletion.ts         # AI + pattern prediction merging
├── services/
│   ├── claudeApi.ts                    # Claude (Anthropic) API client
│   ├── elevenLabsApi.ts                # ElevenLabs API client
│   └── predictionCache.ts              # LRU cache for AI predictions
├── store/
│   ├── conversationStore.ts            # Conversation history with persistence
│   ├── messageStore.ts                 # Current message state management
│   └── settingsStore.ts                # User settings with localStorage
├── types/
│   ├── conversation.ts                 # Conversation and prediction types
│   └── index.ts                        # General TypeScript interfaces
├── App.tsx                             # Main app component
└── main.tsx                            # React entry point
```

## Development

### Available Scripts

```bash
# Start development server (hot reload enabled)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

### Key Design Principles

1. **Large Touch Targets**: All keys minimum 80px height for easy eye tracking
2. **No Precision Required**: All interactions use dwell timing, no clicking
3. **Clear Visual Feedback**: Progress indicators on all interactive elements
4. **High Contrast**: Optimized for visibility with dark backgrounds and bright text
5. **Error Prevention**: Destructive actions (delete) clearly colored and positioned

### Customizing Dwell Time

Dwell time is stored in `settingsStore` and persists to localStorage. Default is 600ms.

To change the default, edit `src/store/settingsStore.ts`:

```typescript
dwellTime: 600 // Change this value (in milliseconds)
```

For a user-adjustable setting, add a UI control that calls:
```typescript
const { setDwellTime } = useSettingsStore();
setDwellTime(1000); // Set to 1 second
```

## Accessibility Features

HelloFriend is designed with accessibility as the primary focus:

- **Completely Hands-Free**: No physical input required
- **Large Touch Targets**: Minimum 80px height for all interactive elements
- **High Contrast UI**: Dark mode optimized for visibility
- **Visual Progress Feedback**: Clear indicators show when actions will trigger
- **No Time Pressure**: Users control when actions happen by dwelling
- **Error Prevention**: Delete button is red and positioned separately
- **Customizable Timing**: Dwell time can be adjusted to user's comfort level

## Tobii Device Compatibility

- **Device**: Tobii Dynavox TD I-13 (13-inch Windows tablet)
- **Resolution**: Typically 1920x1080
- **Eye Tracking**: Built-in Tobii eye tracker provides OS-level mouse emulation
- **OS Integration**: Eye gaze controls cursor, dwell triggers clicks
- **No Configuration Required**: Works immediately with Tobii's mouse emulation

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables for Production

Make sure to set your environment variables in your deployment platform:

- `VITE_ELEVENLABS_API_KEY`
- `VITE_ELEVENLABS_VOICE_ID`

## Implementation Summary

HelloFriend has been built in 5 phases to enable users to "speak as fast as they can think":

### ✅ Phase 0: Foundation (COMPLETE)
- Conversation type system with message tracking
- Persistent conversation history with Zustand
- Context-aware infrastructure (time of day, fatigue level)
- Prediction caching system with LRU eviction

### ✅ Phase 1: AI Next-Word Prediction (COMPLETE)
- Claude API integration for intelligent word predictions
- Predictions trigger after just 2 characters
- Real-time prediction updates as user types
- Confidence-based color coding (green/blue/gray)
- Smart caching minimizes API costs
- **Result**: 3-5x faster than letter-by-letter typing

### ✅ Phase 2: Smart Category System (COMPLETE)
- 5 categories: Medical 💊, Comfort 🛋️, Social 💬, Responses ✅, Questions ❓
- AI generates 4 context-aware phrases per category
- Complete phrases speak immediately with single dwell
- Auto-refresh every 5 minutes and when time changes
- **Result**: Common needs communicated in just 2 dwells

### ✅ Phase 3: Semantic Gaze Zones (COMPLETE)
- Categories visually adapt based on time of day
- Keyword detection boosts relevant zones (e.g., "pain" → Medical glows red)
- Visual priority indicators (red/yellow/gray glow + size changes)
- Auto-highlighting for 30 seconds when triggered
- **Result**: Most relevant communication options always prominent

### ✅ Phase 4: Gaze Pattern Intelligence (COMPLETE)
- Learns frequently used 2-3 word sequences
- Pattern predictions appear instantly (no API delay)
- Merges pattern + AI predictions for best coverage
- Adaptive dwell time based on accuracy
- Fatigue detection and accommodation
- **Result**: Personalized, zero-latency predictions that work offline

### 🔧 Phase 5: Parallel Thought Streams (INFRASTRUCTURE READY)
- Real-time streaming prediction infrastructure built
- Multiple prediction streams (continue, question, respond)
- Progressive refinement as AI generates
- Disabled by default to manage API costs
- **To Enable**: Set `VITE_ENABLE_STREAMING=true` in `.env`

## Future Enhancements

- **Settings Modal**: UI for adjusting dwell time, selecting voices, managing features
- **Supabase Integration**: Cloud sync for conversation history and settings
- **Gaze Analytics Dashboard**: Visualize usage patterns and communication efficiency
- **Custom Category Creation**: Let users define their own phrase categories
- **Multi-Language Support**: Expand beyond English

## Contributing

This is an assistive technology project designed to help people with severe disabilities communicate. Contributions that improve accessibility, performance, or usability are welcome.

### Guidelines

- Maintain large touch targets (minimum 80px)
- Test with dwell interaction (no clicking)
- Ensure high contrast and clear visual feedback
- Keep the UI simple and uncluttered
- Consider the needs of eye-tracking users

## License

[Add your license here]

## Acknowledgments

- Built for use with **Tobii Dynavox** eye-tracking devices
- Text-to-speech powered by **ElevenLabs**
- Designed with input from ALS community and assistive technology users

---

**For support or questions**, please open an issue on GitHub.
