import { useState, useEffect, useCallback } from 'react';
import { useConversation } from './useConversation';
import type { TimeOfDay } from '../types/conversation';

/**
 * Zone priority determines visual prominence
 * Higher priority = larger, brighter, more prominent
 */
export type ZonePriority = 'critical' | 'high' | 'medium' | 'low';

export interface SemanticZone {
  id: string;
  label: string;
  emoji: string;
  priority: ZonePriority;
  categories: string[]; // Which categories belong to this zone
  description: string;
}

interface UseSemanticZonesOptions {
  enabled?: boolean;
}

interface UseSemanticZonesResult {
  zones: SemanticZone[];
  getZonePriority: (categoryId: string) => ZonePriority;
  highlightedZoneId: string | null;
}

/**
 * Time-based zone priority mapping
 * Determines which zones should be prominent at different times of day
 */
const TIME_BASED_PRIORITIES: Record<TimeOfDay, Record<string, ZonePriority>> = {
  morning: {
    medical: 'critical',    // Medication needs in morning
    comfort: 'high',        // Position adjustments after sleep
    social: 'medium',       // Greetings
    responses: 'medium',    // General responses
    questions: 'low',       // Questions less urgent
  },
  afternoon: {
    social: 'high',         // Conversation during active hours
    questions: 'high',      // Questions about activities
    responses: 'critical',  // Active back-and-forth
    comfort: 'medium',      // Position adjustments
    medical: 'medium',      // Medication checks
  },
  evening: {
    comfort: 'critical',    // Comfort needs before sleep
    social: 'high',         // Evening conversations
    medical: 'medium',      // Evening medication
    responses: 'medium',    // General responses
    questions: 'low',       // Questions less urgent
  },
  night: {
    medical: 'critical',    // Emergency medical needs
    comfort: 'critical',    // Urgent comfort needs
    responses: 'high',      // Quick yes/no
    social: 'low',          // Less social interaction
    questions: 'low',       // Questions less urgent
  },
};

/**
 * Base zone configuration
 */
const BASE_ZONES: Omit<SemanticZone, 'priority'>[] = [
  {
    id: 'medical',
    label: 'Medical',
    emoji: '💊',
    categories: ['medical'],
    description: 'Health, medication, and medical needs',
  },
  {
    id: 'comfort',
    label: 'Comfort',
    emoji: '🛋️',
    categories: ['comfort'],
    description: 'Physical comfort and positioning',
  },
  {
    id: 'social',
    label: 'Social',
    emoji: '💬',
    categories: ['social'],
    description: 'Conversation and social interaction',
  },
  {
    id: 'responses',
    label: 'Responses',
    emoji: '✅',
    categories: ['responses'],
    description: 'Quick yes/no and acknowledgments',
  },
  {
    id: 'questions',
    label: 'Questions',
    emoji: '❓',
    categories: ['questions'],
    description: 'Ask questions',
  },
];

export function useSemanticZones({
  enabled = true,
}: UseSemanticZonesOptions = {}): UseSemanticZonesResult {
  const { getCurrentTimeOfDay, messages } = useConversation();
  const [zones, setZones] = useState<SemanticZone[]>([]);
  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(null);

  /**
   * Calculate zone priorities based on time of day and conversation context
   */
  const calculateZonePriorities = useCallback(() => {
    if (!enabled) {
      // If disabled, use medium priority for all
      return BASE_ZONES.map(zone => ({
        ...zone,
        priority: 'medium' as ZonePriority,
      }));
    }

    const timeOfDay = getCurrentTimeOfDay();
    const timePriorities = TIME_BASED_PRIORITIES[timeOfDay];

    // Start with time-based priorities
    const zonesWithPriority = BASE_ZONES.map(zone => ({
      ...zone,
      priority: timePriorities[zone.id] || 'medium' as ZonePriority,
    }));

    // Analyze recent conversation for context
    const recentMessages = messages.slice(-5);
    const recentMethods = recentMessages.map(m => m.method);

    // If user has been using categories frequently, boost those zones
    const categoryUsage = recentMethods.filter(m => m === 'category').length;
    if (categoryUsage >= 3) {
      // User is relying heavily on categories, keep current priorities
      console.log('📊 High category usage detected, maintaining time-based priorities');
    }

    // Identify conversation patterns to highlight specific zones
    const recentContent = recentMessages.map(m => m.content.toLowerCase()).join(' ');

    // Check for medical keywords in recent messages
    if (recentContent.includes('pain') || recentContent.includes('medication') || recentContent.includes('help')) {
      const medicalZone = zonesWithPriority.find(z => z.id === 'medical');
      if (medicalZone && medicalZone.priority !== 'critical') {
        medicalZone.priority = 'critical';
        setHighlightedZoneId('medical');
        console.log('🚨 Medical keywords detected, boosting medical zone priority');
      }
    }

    // Check for comfort keywords
    if (recentContent.includes('cold') || recentContent.includes('hot') || recentContent.includes('position')) {
      const comfortZone = zonesWithPriority.find(z => z.id === 'comfort');
      if (comfortZone && comfortZone.priority !== 'critical') {
        comfortZone.priority = 'high';
        setHighlightedZoneId('comfort');
        console.log('🛋️ Comfort keywords detected, boosting comfort zone priority');
      }
    }

    return zonesWithPriority;
  }, [enabled, getCurrentTimeOfDay, messages]);

  /**
   * Update zones when time of day or conversation context changes
   */
  useEffect(() => {
    const updatedZones = calculateZonePriorities();
    setZones(updatedZones);

    // Log zone priorities for debugging
    console.log('🎯 Semantic zones updated:', updatedZones.map(z => `${z.emoji} ${z.label}: ${z.priority}`).join(', '));
  }, [calculateZonePriorities]);

  /**
   * Get priority for a specific category
   */
  const getZonePriority = useCallback((categoryId: string): ZonePriority => {
    const zone = zones.find(z => z.categories.includes(categoryId));
    return zone?.priority || 'medium';
  }, [zones]);

  /**
   * Auto-clear highlighted zone after 30 seconds
   */
  useEffect(() => {
    if (highlightedZoneId) {
      const timer = setTimeout(() => {
        setHighlightedZoneId(null);
      }, 30000); // Clear after 30 seconds

      return () => clearTimeout(timer);
    }
  }, [highlightedZoneId]);

  return {
    zones,
    getZonePriority,
    highlightedZoneId,
  };
}

/**
 * Get visual styling based on zone priority
 */
export function getZoneStyling(priority: ZonePriority): {
  size: string;
  borderColor: string;
  glowEffect: string;
} {
  switch (priority) {
    case 'critical':
      return {
        size: 'scale-110',
        borderColor: 'border-red-500',
        glowEffect: 'shadow-lg shadow-red-500/50',
      };
    case 'high':
      return {
        size: 'scale-105',
        borderColor: 'border-yellow-500',
        glowEffect: 'shadow-md shadow-yellow-500/30',
      };
    case 'medium':
      return {
        size: 'scale-100',
        borderColor: 'border-slate-600',
        glowEffect: '',
      };
    case 'low':
      return {
        size: 'scale-95',
        borderColor: 'border-slate-700',
        glowEffect: 'opacity-70',
      };
  }
}
