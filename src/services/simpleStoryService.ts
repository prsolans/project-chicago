/**
 * Simple Story Service
 * Stores stories as plain text in Supabase
 */

import { supabase } from '../lib/supabase';
import type { Story, StoryInsert, StoryUpdate } from '../types/database';

/**
 * Get all stories
 */
export async function getAllStories(): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get a single story by ID
 */
export async function getStory(storyId: string): Promise<Story | null> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

/**
 * Create a new story
 */
export async function createStory(story: StoryInsert): Promise<Story> {
  const { data, error } = await supabase
    .from('stories')
    .insert(story as any)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create story');

  return data as Story;
}

/**
 * Update a story
 */
export async function updateStory(storyId: string, updates: StoryUpdate): Promise<Story> {
  const { data, error } = await (supabase
    .from('stories')
    .update as any)(updates)
    .eq('id', storyId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Story not found');

  return data as Story;
}

/**
 * Delete a story
 */
export async function deleteStory(storyId: string): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId);

  if (error) throw error;
}

/**
 * Track story usage
 */
export async function trackStoryUsage(storyId: string): Promise<void> {
  const { error } = await (supabase.rpc as any)('track_story_usage', {
    p_story_id: storyId,
  });

  if (error) {
    console.error('Error tracking story usage:', error);
    // Don't throw - usage tracking should not block the UI
  }
}

/**
 * Search stories
 */
export async function searchStories(query: string): Promise<Story[]> {
  const lowerQuery = query.toLowerCase();

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .or(`title.ilike.%${lowerQuery}%,description.ilike.%${lowerQuery}%,content.ilike.%${lowerQuery}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get stories by category
 */
export async function getStoriesByCategory(category: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
