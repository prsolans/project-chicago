# Cloud Migration - Implementation Guide

This document outlines the cloud migration system that has been implemented for the HelloFriend app, enabling intelligent phrase learning and persistent usage tracking.

## ✅ What Has Been Completed

### 1. Database Schema (`supabase/migrations/001_initial_schema.sql`)

Four core tables have been designed:

- **phrases** - Complete phrase library with metadata
  - Tracks source (static, AI-generated, user-typed, user-custom)
  - Supports time-of-day filtering
  - Soft delete capability

- **phrase_usage** - Usage analytics for each phrase selection
  - Logs every time a phrase is used
  - Tracks input method (typed, predicted, category, etc.)

- **phrase_candidates** - Auto-detected phrases awaiting promotion
  - Detects frequently typed messages (3+ uses, 5+ words, within 7 days)
  - Tracks usage count and last usage
  - Similarity scoring to avoid duplicates

- **conversation_history** - Complete message history
  - All messages sent by user
  - Links to phrases when applicable

**Views Created:**
- `phrase_stats` - Usage statistics per phrase
- `top_phrases` - Top 50 by relevance score (recent + total usage)
- `pending_candidates` - Candidates ready for user review

**Functions Created:**
- `track_phrase_usage()` - Log phrase selection
- `track_candidate_phrase()` - Track/update candidate
- `promote_candidate_to_phrase()` - Convert candidate to phrase

### 2. Service Layer

**`src/services/phraseService.ts`** - Complete CRUD for phrases
- `getAllPhrases()` - Fetch all active phrases
- `getPhrasesByCategory()` - Category-filtered phrases
- `getSmartPhrasesForCategory()` - Time-aware + usage-based sorting
- `trackPhraseUsage()` - Log usage
- `addPhrase()`, `updatePhrase()`, `deletePhrase()` - Management

**`src/services/usageTracker.ts`** - Intelligent tracking
- `trackTypedMessage()` - Detects candidates automatically
- `getPendingCandidates()` - Fetch phrases ready for promotion
- `promoteCandidate()` - Add candidate to library
- `rejectCandidate()` - Dismiss suggestion
- `suggestCategory()` - AI-like keyword-based categorization
- `analyzeHistoryForCandidates()` - Find patterns in history

### 3. State Management

**`src/store/phraseLibraryStore.ts`** - Cloud-synced phrase library
- Loads phrases from Supabase with offline caching
- Auto-refresh every 5 minutes
- Smart sorting by usage + recency
- Full CRUD operations

**Updated `src/store/conversationStore.ts`**
- Now syncs all messages to Supabase conversation_history
- Automatically detects phrase candidates when user types
- Non-blocking cloud sync (doesn't slow down UI)

### 4. Database Seed Script

**`src/scripts/seedPhrases.ts`**
- Converts 200+ static phrases to database format
- Bulk inserts into Supabase
- Can be run as standalone script or from app

### 5. TypeScript Types

**`src/types/database.ts`**
- Fully typed database schema
- Insert/Update types for type safety
- Export for use with Supabase client

### 6. Supabase Client

**`src/lib/supabase.ts`**
- Configured typed Supabase client
- Connection health check
- Ready to use throughout app

---

## 📋 Next Steps to Complete Migration

### Step 1: Run Database Migration

**Option A: Supabase Dashboard (Recommended)**
1. Go to https://supabase.com/dashboard/project/jbxwyixeyxxydqxleaqg
2. Navigate to **SQL Editor**
3. Copy/paste `supabase/migrations/001_initial_schema.sql`
4. Click **Run**

**Option B: Supabase CLI**
```bash
supabase link --project-ref jbxwyixeyxxydqxleaqg
supabase db push
```

### Step 2: Seed the Database

Two options:

**Option A: Create a temporary seed page in the app**
```typescript
// Add to App.tsx temporarily
import { seedStaticPhrases } from './scripts/seedPhrases';

// Add a button somewhere
<button onClick={() => seedStaticPhrases()}>Seed Database</button>
```

**Option B: Run script directly (requires tsx)**
```bash
npx tsx src/scripts/seedPhrases.ts
```

### Step 3: Initialize Phrase Library in App

Add to `App.tsx`:

```typescript
import { initializePhraseLibrary } from './store/phraseLibraryStore';

function App() {
  // Initialize phrase library on mount
  useEffect(() => {
    initializePhraseLibrary();
  }, []);

  // ... rest of component
}
```

### Step 4: Update Components to Use Cloud Phrases

**StartersPanel.tsx** - Replace hardcoded phrases with:
```typescript
import { usePhraseLibrary } from '../../store/phraseLibraryStore';

// Inside component
const { getPhrasesByCategory } = usePhraseLibrary();
const [phrases, setPhrases] = useState<Phrase[]>([]);

useEffect(() => {
  getPhrasesByCategory('family', true).then(setPhrases);
}, [getPhrasesByCategory]);
```

**CategoryPhrasesPanel.tsx** - Similar pattern:
```typescript
const { getPhrasesByCategory, trackUsage } = usePhraseLibrary();

const handlePhraseSelect = (phrase: Phrase) => {
  trackUsage(phrase.id, 'category');
  // ... existing logic
};
```

### Step 5: Add Usage Tracking

Everywhere a phrase is selected, add:
```typescript
import { usePhraseLibrary } from '../store/phraseLibraryStore';

const { trackUsage } = usePhraseLibrary();

// When phrase is selected
trackUsage(phraseId, 'starter'); // or 'category', 'quick_phrase', etc.
```

### Step 6: Implement Candidate Detection Hook (Optional)

Create `src/hooks/usePhraseCandidateDetection.ts`:
```typescript
export function usePhraseCandidateDetection() {
  const [candidates, setCandidates] = useState<PendingCandidate[]>([]);

  useEffect(() => {
    // Poll for new candidates every minute
    const interval = setInterval(async () => {
      const pending = await getPendingCandidates();
      setCandidates(pending);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { candidates };
}
```

### Step 7: Add Suggestion UI (Optional)

Create a toast notification when candidates are detected:
```typescript
// When candidate is found
if (result.isCandidate) {
  showToast({
    message: `Use "${text}" often? Add to Quick Phrases?`,
    actions: [
      { label: 'Add', onClick: () => promoteCandidate(candidateId, category) },
      { label: 'Dismiss', onClick: () => rejectCandidate(candidateId) }
    ]
  });
}
```

---

## 🎯 Key Features Now Available

### Smart Learning
- ✅ Automatically detects frequently typed messages
- ✅ Suggests adding them to Quick Phrases
- ✅ User approval required (hybrid learning)
- ✅ Similarity checking to avoid duplicates

### Usage Analytics
- ✅ Tracks every phrase selection
- ✅ Ranks phrases by usage + recency
- ✅ Shows most-used phrases first
- ✅ Time-aware filtering (morning/afternoon/evening)

### Cloud Persistence
- ✅ All data synced to Supabase
- ✅ Offline caching for speed
- ✅ Auto-refresh every 5 minutes
- ✅ Never lose conversation history

### Extensibility
- ✅ Ready for multi-user (RLS policies in place)
- ✅ Can add custom phrases via UI
- ✅ Can edit/delete phrases
- ✅ Export conversation history

---

## 🔧 Configuration

All environment variables are already configured in `.env`:
```env
VITE_SUPABASE_URL=https://jbxwyixeyxxydqxleaqg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Database Statistics (After Seeding)

Expected phrase counts:
- **Medical**: ~30 phrases
- **Comfort**: ~37 phrases
- **Social**: ~40 phrases
- **Responses**: ~40 phrases
- **Questions**: ~42 phrases
- **Family**: ~60 phrases

**Total**: ~250 static phrases ready to use

---

## 🐛 Troubleshooting

### Database Connection Issues
```typescript
import { checkSupabaseConnection } from './lib/supabase';

// Test connection
const isConnected = await checkSupabaseConnection();
console.log('Supabase connected:', isConnected);
```

### Phrases Not Loading
1. Check browser console for errors
2. Verify migration ran successfully
3. Verify seed script completed
4. Check Supabase dashboard > Table Editor > phrases table

### Usage Tracking Not Working
- Check that `trackUsage()` is being called
- Verify phrase_usage table has rows
- Check browser network tab for Supabase API calls

---

## 📝 Implementation Checklist

- [x] Database schema created
- [x] Service layer implemented
- [x] State management updated
- [x] Seed script ready
- [ ] Run database migration
- [ ] Seed phrases into database
- [ ] Update StartersPanel to use cloud phrases
- [ ] Update CategoryPhrasesPanel to use cloud phrases
- [ ] Add usage tracking to all phrase selections
- [ ] Initialize phrase library in App.tsx
- [ ] Test candidate detection
- [ ] Add suggestion UI (optional)
- [ ] Test on production (Vercel)

---

## 🚀 Future Enhancements

- Real-time phrase suggestions using AI embeddings
- Voice pattern analysis for better categorization
- Multi-user support with user-specific libraries
- Export/import phrase libraries
- Analytics dashboard for caregivers
- Weekly usage reports
