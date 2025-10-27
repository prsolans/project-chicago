/**
 * Phrase Service
 * Handles all database operations for phrases, usage tracking, and candidates
 */

import { supabase } from '../lib/supabase';
import type {
  Phrase,
  PhraseInsert,
  PhraseUpdate,
  PhraseStats,
  TopPhrase,
  PhraseCategory,
  TimeOfDay,
  InputMethod,
} from '../types/database';

/**
 * Fetch all active phrases
 */
export async function getAllPhrases(): Promise<Phrase[]> {
  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching phrases:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch phrases by category
 */
export async function getPhrasesByCategory(category: PhraseCategory): Promise<Phrase[]> {
  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('text', { ascending: true });

  if (error) {
    console.error('Error fetching phrases by category:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch phrases by category AND time of day
 */
export async function getPhrasesByCategoryAndTime(
  category: PhraseCategory,
  timeOfDay: TimeOfDay = 'anytime'
): Promise<Phrase[]> {
  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .or(`time_of_day.eq.${timeOfDay},time_of_day.eq.anytime`)
    .order('text', { ascending: true });

  if (error) {
    console.error('Error fetching phrases by category and time:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get phrase statistics with usage data
 */
export async function getPhraseStats(): Promise<PhraseStats[]> {
  const { data, error } = await supabase
    .from('phrase_stats')
    .select('*')
    .order('total_usage', { ascending: false });

  if (error) {
    console.error('Error fetching phrase stats:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get top phrases by relevance (recent + total usage)
 */
export async function getTopPhrases(limit: number = 50): Promise<TopPhrase[]> {
  const { data, error } = await supabase
    .from('top_phrases')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('Error fetching top phrases:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get phrases sorted by usage for a specific category
 */
export async function getTopPhrasesByCategory(
  category: PhraseCategory,
  limit: number = 20
): Promise<TopPhrase[]> {
  const { data, error } = await supabase
    .from('top_phrases')
    .select('*')
    .eq('category', category)
    .limit(limit);

  if (error) {
    console.error('Error fetching top phrases by category:', error);
    throw error;
  }

  return data || [];
}

/**
 * Add a new phrase
 */
export async function addPhrase(phrase: PhraseInsert): Promise<Phrase> {
  const { data, error } = await supabase
    .from('phrases')
    .insert(phrase)
    .select()
    .single();

  if (error) {
    console.error('Error adding phrase:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing phrase
 */
export async function updatePhrase(id: string, updates: PhraseUpdate): Promise<Phrase> {
  const { data, error } = await supabase
    .from('phrases')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating phrase:', error);
    throw error;
  }

  return data;
}

/**
 * Soft delete a phrase (set is_active = false)
 */
export async function deletePhrase(id: string): Promise<void> {
  const { error } = await supabase
    .from('phrases')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Error deleting phrase:', error);
    throw error;
  }
}

/**
 * Track phrase usage (logs to phrase_usage table)
 */
export async function trackPhraseUsage(
  phraseId: string,
  inputMethod: InputMethod
): Promise<void> {
  const { error } = await supabase.rpc('track_phrase_usage', {
    p_phrase_id: phraseId,
    p_input_method: inputMethod,
  });

  if (error) {
    console.error('Error tracking phrase usage:', error);
    // Don't throw - usage tracking should not block the UI
  }
}

/**
 * Find phrase by exact text match
 */
export async function findPhraseByText(text: string): Promise<Phrase | null> {
  const { data, error } = await supabase
    .from('phrases')
    .select('*')
    .eq('text', text)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error finding phrase by text:', error);
    return null;
  }

  return data;
}

/**
 * Bulk insert phrases (for seeding)
 * Uses upsert to handle duplicates gracefully
 */
export async function bulkInsertPhrases(phrases: PhraseInsert[]): Promise<Phrase[]> {
  const { data, error } = await supabase
    .from('phrases')
    .upsert(phrases, {
      onConflict: 'text', // Match on unique text constraint
      ignoreDuplicates: false, // Update existing rows
    })
    .select();

  if (error) {
    console.error('Error bulk inserting phrases:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get current time of day for filtering phrases
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'anytime';
}

/**
 * Get smart phrase recommendations for category
 * Combines time-aware phrases with top used phrases
 */
export async function getSmartPhrasesForCategory(
  category: PhraseCategory,
  limit: number = 20
): Promise<Phrase[]> {
  const timeOfDay = getCurrentTimeOfDay();

  // Get phrases filtered by time of day and category
  const phrases = await getPhrasesByCategoryAndTime(category, timeOfDay);

  // Get top phrases for this category
  const topPhrases = await getTopPhrasesByCategory(category, limit);
  const topPhraseIds = new Set(topPhrases.map(p => p.id));

  // Sort: top phrases first, then alphabetically
  phrases.sort((a, b) => {
    const aIsTop = topPhraseIds.has(a.id);
    const bIsTop = topPhraseIds.has(b.id);

    if (aIsTop && !bIsTop) return -1;
    if (!aIsTop && bIsTop) return 1;
    return a.text.localeCompare(b.text);
  });

  return phrases.slice(0, limit);
}
