/**
 * Seed Script: Populate database with static phrases
 * Run this once to populate the Supabase database with all static phrases
 */

import { bulkInsertPhrases } from '../services/phraseService';
import type { PhraseInsert, PhraseCategory, TimeOfDay } from '../types/database';
import { ALL_STATIC_PHRASES } from '../data/staticPhrases';

/**
 * Convert static phrases to database insert format
 * Deduplicates phrases by text (keeps first occurrence)
 */
function convertStaticPhrasesToInserts(): PhraseInsert[] {
  const inserts: PhraseInsert[] = [];
  const seenTexts = new Set<string>();

  // Iterate through all categories
  Object.entries(ALL_STATIC_PHRASES).forEach(([category, phrasesByTime]) => {
    // Iterate through time periods (prioritize specific times over 'anytime')
    const timeOrder: (TimeOfDay | 'anytime')[] = ['morning', 'afternoon', 'evening', 'anytime'];

    timeOrder.forEach((timeOfDay) => {
      const phrases = phrasesByTime[timeOfDay] || [];
      phrases.forEach((phrase) => {
        // Skip if we've already seen this exact text
        if (seenTexts.has(phrase.content)) {
          return;
        }

        seenTexts.add(phrase.content);
        inserts.push({
          text: phrase.content,
          category: category as PhraseCategory,
          time_of_day: timeOfDay as TimeOfDay,
          source: 'static',
          confidence: phrase.confidence,
          is_active: true,
        });
      });
    });
  });

  return inserts;
}

/**
 * Main seed function
 */
export async function seedStaticPhrases(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log('Starting phrase seeding...');

    const phrases = convertStaticPhrasesToInserts();
    console.log(`Preparing to insert ${phrases.length} phrases...`);

    const inserted = await bulkInsertPhrases(phrases);
    console.log(`Successfully inserted ${inserted.length} phrases`);

    return {
      success: true,
      count: inserted.length,
    };
  } catch (error) {
    console.error('Error seeding phrases:', error);
    return {
      success: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Note: This script can be called from the Admin Panel UI
// No CLI execution needed - use the Admin Panel (Ctrl+Shift+A)
