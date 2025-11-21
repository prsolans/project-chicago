/**
 * Simple Story Store
 * Manages stories stored in Supabase (not localStorage)
 */

import { create } from 'zustand';
import type { Story } from '../types/database';
import {
  getAllStories,
  createStory,
  updateStory,
  deleteStory,
  trackStoryUsage as trackUsage,
  searchStories,
} from '../services/simpleStoryService';

interface StoryState {
  // Story library
  stories: Story[];
  isLoading: boolean;
  error: string | null;

  // Current story for playback
  currentStoryId: string | null;
  currentLineIndex: number;
  isPlaying: boolean;

  // Actions
  loadStories: () => Promise<void>;
  getStoryById: (id: string) => Story | null;
  createNewStory: (title: string, content: string, description?: string, category?: string) => Promise<Story>;
  updateExistingStory: (id: string, title?: string, content?: string, description?: string, category?: string) => Promise<void>;
  removeStory: (id: string) => Promise<void>;
  search: (query: string) => Promise<Story[]>;

  // Playback
  startPlayback: (storyId: string) => void;
  stopPlayback: () => void;
  nextLine: () => boolean;
  previousLine: () => boolean;
  jumpToLine: (index: number) => void;
  trackStoryUsage: (storyId: string) => Promise<void>;

  // Current story helper
  getCurrentStory: () => Story | null;
  getCurrentLines: () => string[];
  getCurrentLine: () => string | null;
}

export const useStoryStore = create<StoryState>()((set, get) => ({
  stories: [],
  isLoading: false,
  error: null,
  currentStoryId: null,
  currentLineIndex: 0,
  isPlaying: false,

  /**
   * Load all stories from Supabase
   */
  loadStories: async () => {
    set({ isLoading: true, error: null });
    try {
      const stories = await getAllStories();
      set({ stories, isLoading: false });
    } catch (err) {
      console.error('Error loading stories:', err);
      set({
        error: err instanceof Error ? err.message : 'Failed to load stories',
        isLoading: false,
      });
    }
  },

  /**
   * Get story by ID from local cache
   */
  getStoryById: (id: string) => {
    return get().stories.find(s => s.id === id) || null;
  },

  /**
   * Create a new story
   */
  createNewStory: async (title: string, content: string, description?: string, category?: string) => {
    try {
      const newStory = await createStory({
        title,
        content,
        description: description || null,
        category: category || null,
      });

      set(state => ({
        stories: [newStory, ...state.stories],
      }));

      return newStory;
    } catch (err) {
      console.error('Error creating story:', err);
      throw err;
    }
  },

  /**
   * Update an existing story
   */
  updateExistingStory: async (id: string, title?: string, content?: string, description?: string, category?: string) => {
    try {
      const updates: Record<string, any> = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (description !== undefined) updates.description = description;
      if (category !== undefined) updates.category = category;

      const updated = await updateStory(id, updates);

      set(state => ({
        stories: state.stories.map(s => s.id === id ? updated : s),
      }));
    } catch (err) {
      console.error('Error updating story:', err);
      throw err;
    }
  },

  /**
   * Delete a story
   */
  removeStory: async (id: string) => {
    try {
      await deleteStory(id);

      // Stop playback if this story is playing
      if (get().currentStoryId === id) {
        get().stopPlayback();
      }

      set(state => ({
        stories: state.stories.filter(s => s.id !== id),
      }));
    } catch (err) {
      console.error('Error deleting story:', err);
      throw err;
    }
  },

  /**
   * Search stories
   */
  search: async (query: string) => {
    try {
      return await searchStories(query);
    } catch (err) {
      console.error('Error searching stories:', err);
      return [];
    }
  },

  /**
   * Start playing a story
   */
  startPlayback: (storyId: string) => {
    set({
      currentStoryId: storyId,
      currentLineIndex: 0,
      isPlaying: true,
    });
  },

  /**
   * Stop playback
   */
  stopPlayback: () => {
    set({
      currentStoryId: null,
      currentLineIndex: 0,
      isPlaying: false,
    });
  },

  /**
   * Go to next line
   */
  nextLine: () => {
    const lines = get().getCurrentLines();
    const currentIndex = get().currentLineIndex;

    if (currentIndex < lines.length - 1) {
      set({ currentLineIndex: currentIndex + 1 });
      return true;
    }
    return false;
  },

  /**
   * Go to previous line
   */
  previousLine: () => {
    const currentIndex = get().currentLineIndex;

    if (currentIndex > 0) {
      set({ currentLineIndex: currentIndex - 1 });
      return true;
    }
    return false;
  },

  /**
   * Jump to specific line
   */
  jumpToLine: (index: number) => {
    const lines = get().getCurrentLines();
    if (index >= 0 && index < lines.length) {
      set({ currentLineIndex: index });
    }
  },

  /**
   * Track story usage
   */
  trackStoryUsage: async (storyId: string) => {
    try {
      await trackUsage(storyId);
      // Reload to get updated usage count
      await get().loadStories();
    } catch (err) {
      console.error('Error tracking usage:', err);
    }
  },

  /**
   * Get current story
   */
  getCurrentStory: () => {
    const { currentStoryId } = get();
    if (!currentStoryId) return null;
    return get().getStoryById(currentStoryId);
  },

  /**
   * Get current story split into lines (by newline)
   */
  getCurrentLines: () => {
    const story = get().getCurrentStory();
    if (!story) return [];
    return story.content.split('\n').filter(line => line.trim().length > 0);
  },

  /**
   * Get current line text
   */
  getCurrentLine: () => {
    const lines = get().getCurrentLines();
    const index = get().currentLineIndex;
    return lines[index] || null;
  },
}));
