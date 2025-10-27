/**
 * Usage Tracker Service
 * Tracks phrase candidates and manages promotion to quick phrases
 */

import { supabase } from '../lib/supabase';
import { findPhraseByText } from './phraseService';
import type {
  PhraseCandidate,
  PendingCandidate,
  PhraseCategory,
  TimeOfDay,
  ConversationHistoryInsert,
} from '../types/database';

/**
 * Criteria for detecting phrase candidates
 */
export interface CandidateDetectionCriteria {
  minUsageCount: number;      // Default: 3
  minWordCount: number;        // Default: 5 words
  maxDaysSinceLastUse: number; // Default: 7 days
  checkSimilarity: boolean;    // Default: true
}

const DEFAULT_CRITERIA: CandidateDetectionCriteria = {
  minUsageCount: 3,
  minWordCount: 5,
  maxDaysSinceLastUse: 7,
  checkSimilarity: true,
};

/**
 * Track a typed message and potentially create/update candidate
 */
export async function trackTypedMessage(
  text: string,
  category?: PhraseCategory
): Promise<{ isCandidate: boolean; candidateId?: string }> {
  // Skip if too short
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < DEFAULT_CRITERIA.minWordCount) {
    return { isCandidate: false };
  }

  // Check if already exists as a phrase
  const existingPhrase = await findPhraseByText(text);
  if (existingPhrase) {
    return { isCandidate: false };
  }

  // Track or update candidate
  const { data, error } = await (supabase as any).rpc('track_candidate_phrase', {
    p_text: text,
    p_suggested_category: category,
  });

  if (error) {
    console.error('Error tracking candidate phrase:', error);
    return { isCandidate: false };
  }

  // Check if it now meets criteria
  const candidate = await getCandidateByText(text);
  if (!candidate) {
    return { isCandidate: false, candidateId: data };
  }

  const meetsCriteria =
    candidate.usage_count >= DEFAULT_CRITERIA.minUsageCount &&
    isWithinDays(candidate.last_used, DEFAULT_CRITERIA.maxDaysSinceLastUse);

  return {
    isCandidate: meetsCriteria,
    candidateId: candidate.id,
  };
}

/**
 * Get all pending candidates ready for review
 */
export async function getPendingCandidates(): Promise<PendingCandidate[]> {
  const { data, error } = await supabase
    .from('pending_candidates')
    .select('*')
    .order('usage_count', { ascending: false });

  if (error) {
    console.error('Error fetching pending candidates:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a specific candidate by text
 */
export async function getCandidateByText(text: string): Promise<PhraseCandidate | null> {
  const { data, error } = await supabase
    .from('phrase_candidates')
    .select('*')
    .eq('text', text)
    .maybeSingle();

  if (error) {
    console.error('Error fetching candidate by text:', error);
    return null;
  }

  return data;
}

/**
 * Get a specific candidate by ID
 */
export async function getCandidateById(id: string): Promise<PhraseCandidate | null> {
  const { data, error } = await supabase
    .from('phrase_candidates')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching candidate by ID:', error);
    return null;
  }

  return data;
}

/**
 * Promote a candidate to a phrase
 */
export async function promoteCandidate(
  candidateId: string,
  category: PhraseCategory,
  timeOfDay: TimeOfDay = 'anytime'
): Promise<{ success: boolean; phraseId?: string }> {
  const { data, error } = await (supabase as any).rpc('promote_candidate_to_phrase', {
    p_candidate_id: candidateId,
    p_category: category,
    p_time_of_day: timeOfDay,
  });

  if (error) {
    console.error('Error promoting candidate:', error);
    return { success: false };
  }

  return { success: true, phraseId: data };
}

/**
 * Reject a candidate (mark as rejected)
 */
export async function rejectCandidate(candidateId: string): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('phrase_candidates')
    .update({ status: 'rejected' })
    .eq('id', candidateId);

  if (error) {
    console.error('Error rejecting candidate:', error);
    return false;
  }

  return true;
}

/**
 * Add message to conversation history
 */
export async function addToConversationHistory(
  message: ConversationHistoryInsert
): Promise<void> {
  const { error } = await supabase
    .from('conversation_history')
    .insert(message as any);

  if (error) {
    console.error('Error adding to conversation history:', error);
    // Don't throw - history tracking should not block the UI
  }
}

/**
 * Get recent conversation history
 */
export async function getRecentHistory(limit: number = 50) {
  const { data, error } = await supabase
    .from('conversation_history')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }

  return data || [];
}

/**
 * Analyze conversation history for new phrase candidates
 * Finds frequently typed messages that could become quick phrases
 */
export async function analyzeHistoryForCandidates(): Promise<{
  newCandidates: string[];
  promotable: PendingCandidate[];
}> {
  // Get recent typed messages from history
  const { data: messages, error } = await supabase
    .from('conversation_history')
    .select('content')
    .eq('input_method', 'typed')
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order('timestamp', { ascending: false }) as any;

  if (error || !messages) {
    console.error('Error analyzing history:', error);
    return { newCandidates: [], promotable: [] };
  }

  // Count frequency of each message
  const messageCounts = new Map<string, number>();
  messages.forEach((msg: any) => {
    const text = msg.content.trim();
    const wordCount = text.split(/\s+/).length;

    // Only track messages with enough words
    if (wordCount >= DEFAULT_CRITERIA.minWordCount) {
      messageCounts.set(text, (messageCounts.get(text) || 0) + 1);
    }
  });

  // Find messages used 3+ times
  const newCandidates: string[] = [];
  for (const [text, count] of messageCounts.entries()) {
    if (count >= DEFAULT_CRITERIA.minUsageCount) {
      // Check if already a candidate or phrase
      const existingPhrase = await findPhraseByText(text);
      const existingCandidate = await getCandidateByText(text);

      if (!existingPhrase && !existingCandidate) {
        newCandidates.push(text);
      }
    }
  }

  // Get currently pending candidates
  const promotable = await getPendingCandidates();

  return { newCandidates, promotable };
}

/**
 * Check if a date is within N days of now
 */
function isWithinDays(dateString: string, days: number): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

/**
 * Suggest category for a phrase using simple keyword matching
 * In future, could use AI for better categorization
 */
export function suggestCategory(text: string): PhraseCategory | null {
  const lower = text.toLowerCase();

  // Family keywords
  if (/\b(tony|michael|claire|mom|dad|husband|wife|son|daughter|love you|family)\b/i.test(lower)) {
    return 'family';
  }

  // Medical keywords
  if (/\b(pain|medication|med|doctor|nurse|breathing|treatment|hurt|uncomfortable|sick|ill)\b/i.test(lower)) {
    return 'medical';
  }

  // Comfort keywords
  if (/\b(reposition|move|adjust|position|legs|arm|head|pillow|blanket|cold|warm|hot)\b/i.test(lower)) {
    return 'comfort';
  }

  // Responses
  if (/^(yes|no|okay|ok|maybe|sure|thanks|thank you|please|sorry)\b/i.test(lower)) {
    return 'responses';
  }

  // Questions
  if (/\?$/.test(text) || /^(what|where|when|who|why|how|can|could|would|will)\b/i.test(lower)) {
    return 'questions';
  }

  // Social
  if (/\b(thank|appreciate|grateful|wonderful|love|care|help|friend)\b/i.test(lower)) {
    return 'social';
  }

  return null;
}
