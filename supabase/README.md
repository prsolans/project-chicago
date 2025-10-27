# Supabase Database Setup

This directory contains database migrations and seed data for the HelloFriend app.

## Running the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/jbxwyixeyxxydqxleaqg
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `migrations/001_initial_schema.sql`
5. Click **Run** to execute the migration

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref jbxwyixeyxxydqxleaqg

# Run migration
supabase db push
```

## Database Schema Overview

### Tables

1. **phrases** - Library of all quick phrases
   - `id`, `text`, `category`, `time_of_day`, `source`, `confidence`, `is_active`
   - Tracks: static phrases, AI-generated, user-typed, user-custom

2. **phrase_usage** - Usage tracking for analytics
   - `id`, `phrase_id`, `used_at`, `input_method`
   - Every phrase selection logs here

3. **phrase_candidates** - Auto-detected phrases awaiting promotion
   - `id`, `text`, `usage_count`, `first_seen`, `last_used`, `status`
   - Detects frequently typed messages (3+ times, within 7 days)

4. **conversation_history** - Complete message history
   - `id`, `content`, `input_method`, `phrase_id`, `timestamp`

### Views

- **phrase_stats** - Usage statistics for each phrase
- **top_phrases** - Top 50 phrases by relevance score
- **pending_candidates** - Candidates ready for review

### Functions

- `track_phrase_usage(phrase_id, input_method)` - Log phrase usage
- `track_candidate_phrase(text, category)` - Track/update candidate
- `promote_candidate_to_phrase(candidate_id, category)` - Promote to library

## Next Steps

After running the migration:

1. Run the seed script to populate with static phrases: `seed/001_static_phrases.sql`
2. Test the database connection in the app
3. Verify that phrase library loads correctly
