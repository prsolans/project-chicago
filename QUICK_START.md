# Quick Start Guide - Cloud Migration

## ✅ What's Been Completed

### 1. **StartersPanel - New Two-Level Navigation**
- **Level 1**: 6 category buttons (Family, Medical, Comfort, Social, Responses, Questions)
- **Level 2**: Full grid of phrases for selected category with "Back to Categories" button
- **Cloud-Synced**: Phrases now load from Supabase database
- **Smart Sorting**: Time-aware + usage-based (most used phrases appear first)
- **5-Column Grid**: All phrases displayed at once when category is selected

### 1b. **CategoryPhrasesPanel (Quick Phrases) - Cloud Integration**
- **Cloud-Synced**: Now loads phrases from Supabase database (previously static)
- **Usage Tracking**: Automatically tracks when phrases are selected
- **AI Supplemental**: AI-generated contextual phrases supplement database phrases
- **Smart Merge**: Shows AI phrases first (contextual), then database phrases

### 2. **Admin Panel** (Press **Ctrl+Shift+A** to open)
A convenient UI to set up your database without running SQL manually:
- **Step 1**: Check Supabase Connection
- **Step 2**: Run Migration (creates database tables)
- **Step 3**: Seed Database (populates with 250+ phrases)

### 3. **Cloud Infrastructure**
- ✅ Database schema designed (4 tables, 3 views, 3 functions)
- ✅ Phrase service layer (CRUD operations)
- ✅ Usage tracking service (auto-detects frequently typed messages)
- ✅ Cloud-synced stores (phrases + conversation history)
- ✅ Automatic candidate detection (learns from user's typing patterns)

---

## 🚀 Getting Started

### Step 1: Open Admin Panel
1. In your browser, press **Ctrl + Shift + A**
2. The Admin Panel will appear

### Step 2: Check Connection
1. Click "Check Connection" button
2. Should show green checkmark ✓ if Supabase is configured correctly
3. If error, verify `.env` file has correct credentials

### Step 3: Run Migration
Since automatic migration via SDK isn't available, you'll need to run it manually:

**Manual Migration (Recommended)**:
1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/jbxwyixeyxxydqxleaqg/sql)
2. Open file: `supabase/migrations/001_initial_schema.sql`
3. Copy all contents
4. Paste into SQL Editor
5. Click "Run"

### Step 4: Seed Database
1. Back in Admin Panel, click "Seed Database"
2. Wait for completion (will insert ~250 phrases)
3. Should show "✓ Successfully seeded X phrases"

### Step 5: Close Admin Panel & Test!
1. Click "Close" on Admin Panel
2. Navigate to **Starters** tab
3. You should see 6 category buttons
4. Click any category (e.g., "Family")
5. You'll see a grid of phrases specific to that category
6. Click "Back to Categories" to return

---

## 🎯 Key Features Now Available

### Smart Learning
- Automatically detects when you type the same message 3+ times
- Suggests adding it to Quick Phrases (hybrid learning - you approve first)
- Checks similarity to avoid duplicates
- Only promotes messages with 5+ words

### Time-Aware Phrases
- Morning: "I need my morning medication"
- Evening: "I need my evening medication"
- Anytime: "I'm in pain"

### Usage Analytics
- Most-used phrases appear first in each category
- Weighted by recency (recent uses count more)
- All usage tracked in `phrase_usage` table

### Cloud Persistence
- Everything syncs to Supabase automatically
- Offline caching for speed (5-minute refresh)
- Never lose conversation history
- Works across device restarts

---

## 📊 What Gets Tracked

### Conversation History
Every message you send is saved with:
- Content
- Timestamp
- Input method (typed, predicted, category, starter, etc.)
- Link to phrase (if applicable)

### Phrase Usage
Every time you select a phrase:
- Logs usage event
- Updates usage count
- Tracks last used time
- Calculates relevance score

### Phrase Candidates
When you type a message frequently:
- Detects after 3+ uses within 7 days
- Suggests category automatically (keyword matching)
- Stores in `phrase_candidates` table
- Awaits your approval before adding to library

---

## 🔧 Architecture Overview

```
User Types/Selects Message
        ↓
conversationStore.addMessage()
        ↓
    [Syncs to Cloud]
        ↓
  conversation_history table
        ↓
 (if typed && meets criteria)
        ↓
  phrase_candidates table
        ↓
   (user approves)
        ↓
     phrases table
```

---

## 🐛 Troubleshooting

### "No phrases available" in Starters
**Solution**: Make sure you've seeded the database. Open Admin Panel (Ctrl+Shift+A) and click "Seed Database".

### "Loading phrases..." never completes
**Solution**:
1. Check browser console for errors
2. Verify Supabase connection (Admin Panel → Check Connection)
3. Verify migration ran successfully (check Supabase dashboard → Table Editor → should see `phrases` table)

### Admin Panel won't open
**Solution**: Make sure you're pressing **Ctrl+Shift+A** (all three keys together)

### Phrases not being tracked
**Solution**: Check browser network tab for Supabase API calls. If failing, verify `.env` credentials.

---

## 📋 Next Steps (Optional)

### 2. Add Phrase Suggestion UI
Create a toast notification when candidate phrases are detected:
- "Use 'I need help turning' often? Add to Quick Phrases?"
- Approve / Dismiss buttons

### 3. Add Usage Dashboard
Create a view showing:
- Most used phrases this week
- Top categories
- Usage patterns by time of day

---

## 🎉 You're All Set!

Your app now has:
- ✅ Cloud-synced phrase library
- ✅ Smart two-level navigation
- ✅ Time-aware phrase filtering
- ✅ Usage-based sorting
- ✅ Automatic learning from typing patterns
- ✅ Persistent conversation history

**Press Ctrl+Shift+A anytime to access the Admin Panel!**
