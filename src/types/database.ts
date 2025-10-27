/**
 * Database types for Supabase schema
 * Auto-generated from supabase/migrations/001_initial_schema.sql
 */

export type PhraseCategory = 'family' | 'medical' | 'comfort' | 'social' | 'responses' | 'questions' | 'food' | 'feelings' | 'entertainment';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type PhraseSource = 'static' | 'ai_generated' | 'user_typed' | 'user_custom';
export type InputMethod = 'typed' | 'predicted' | 'category' | 'quick_phrase' | 'starter' | 'thought_stream';
export type CandidateStatus = 'pending' | 'approved' | 'rejected';

// Database row types
export interface Phrase {
  id: string;
  text: string;
  category: PhraseCategory;
  time_of_day: TimeOfDay;
  source: PhraseSource;
  confidence: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhraseUsage {
  id: string;
  phrase_id: string;
  used_at: string;
  input_method: InputMethod;
}

export interface PhraseCandidate {
  id: string;
  text: string;
  first_seen: string;
  last_used: string;
  usage_count: number;
  suggested_category: PhraseCategory | null;
  status: CandidateStatus;
  similarity_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationHistory {
  id: string;
  content: string;
  input_method: InputMethod;
  phrase_id: string | null;
  timestamp: string;
}

// View types
export interface PhraseStats {
  id: string;
  text: string;
  category: PhraseCategory;
  source: PhraseSource;
  total_usage: number;
  last_used: string | null;
  first_used: string | null;
  days_used: number;
  usage_last_7_days: number;
  usage_last_30_days: number;
}

export interface TopPhrase extends PhraseStats {
  relevance_score: number;
}

export interface PendingCandidate extends PhraseCandidate {
  days_pending: number;
  hours_since_use: number;
}

// Insert types (without auto-generated fields)
export type PhraseInsert = Omit<Phrase, 'id' | 'created_at' | 'updated_at'>;
export type PhraseUsageInsert = Omit<PhraseUsage, 'id' | 'used_at'>;
export type PhraseCandidateInsert = Omit<PhraseCandidate, 'id' | 'created_at' | 'updated_at' | 'first_seen' | 'last_used'>;
export type ConversationHistoryInsert = Omit<ConversationHistory, 'id' | 'timestamp'>;

// Update types (all fields optional except id)
export type PhraseUpdate = Partial<Omit<Phrase, 'id' | 'created_at' | 'updated_at'>>;
export type PhraseCandidateUpdate = Partial<Omit<PhraseCandidate, 'id' | 'created_at' | 'updated_at'>>;

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      phrases: {
        Row: Phrase;
        Insert: PhraseInsert;
        Update: PhraseUpdate;
      };
      phrase_usage: {
        Row: PhraseUsage;
        Insert: PhraseUsageInsert;
        Update: never;
      };
      phrase_candidates: {
        Row: PhraseCandidate;
        Insert: PhraseCandidateInsert;
        Update: PhraseCandidateUpdate;
      };
      conversation_history: {
        Row: ConversationHistory;
        Insert: ConversationHistoryInsert;
        Update: never;
      };
    };
    Views: {
      phrase_stats: {
        Row: PhraseStats;
      };
      top_phrases: {
        Row: TopPhrase;
      };
      pending_candidates: {
        Row: PendingCandidate;
      };
    };
    Functions: {
      track_phrase_usage: {
        Args: { p_phrase_id: string; p_input_method: InputMethod };
        Returns: void;
      };
      track_candidate_phrase: {
        Args: { p_text: string; p_suggested_category?: PhraseCategory };
        Returns: string;
      };
      promote_candidate_to_phrase: {
        Args: { p_candidate_id: string; p_category: PhraseCategory; p_time_of_day?: TimeOfDay };
        Returns: string;
      };
    };
  };
}
