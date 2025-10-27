import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettingsStore } from '../store/settingsStore';

interface GazeEvent {
  timestamp: number;
  type: 'hover_start' | 'hover_end' | 'selection' | 'accidental_trigger';
  targetId: string;
  dwellDuration: number;
}

interface PatternStats {
  totalSelections: number;
  accidentalTriggers: number;
  averageDwellTime: number;
  accuracyRate: number;
  sessionDuration: number; // milliseconds
  fatigueScore: number; // 0-1, higher = more tired
}

interface UseGazePatternIntelligenceResult {
  recordGazeEvent: (event: GazeEvent) => void;
  recommendedDwellTime: number;
  patternStats: PatternStats;
  fatigueLevel: 'fresh' | 'moderate' | 'tired';
  resetStats: () => void;
}

const DEFAULT_DWELL_TIME = 600;
const MIN_DWELL_TIME = 300;
const MAX_DWELL_TIME = 2000;
const FATIGUE_CHECK_INTERVAL = 60000; // Check fatigue every minute

/**
 * Hook to track gaze patterns and adapt to user behavior
 */
export function useGazePatternIntelligence(): UseGazePatternIntelligenceResult {
  const { dwellTime, setDwellTime } = useSettingsStore();
  const sessionStartRef = useRef<number>(Date.now());
  const gazeEventsRef = useRef<GazeEvent[]>([]);

  const [patternStats, setPatternStats] = useState<PatternStats>({
    totalSelections: 0,
    accidentalTriggers: 0,
    averageDwellTime: DEFAULT_DWELL_TIME,
    accuracyRate: 1.0,
    sessionDuration: 0,
    fatigueScore: 0,
  });

  const [recommendedDwellTime, setRecommendedDwellTime] = useState<number>(dwellTime);
  const [fatigueLevel, setFatigueLevel] = useState<'fresh' | 'moderate' | 'tired'>('fresh');

  /**
   * Record a gaze event for pattern analysis
   */
  const recordGazeEvent = useCallback((event: GazeEvent) => {
    gazeEventsRef.current.push(event);

    // Keep only last 100 events to prevent memory issues
    if (gazeEventsRef.current.length > 100) {
      gazeEventsRef.current.shift();
    }

    // Recalculate stats
    calculatePatternStats();
  }, []);

  /**
   * Calculate pattern statistics from recent gaze events
   */
  const calculatePatternStats = useCallback(() => {
    const events = gazeEventsRef.current;
    if (events.length === 0) return;

    const selections = events.filter(e => e.type === 'selection');
    const accidentalTriggers = events.filter(e => e.type === 'accidental_trigger');
    const totalAttempts = selections.length + accidentalTriggers.length;

    if (totalAttempts === 0) return;

    const accuracyRate = selections.length / totalAttempts;
    const averageDwellTime = selections.reduce((sum, e) => sum + e.dwellDuration, 0) / selections.length || DEFAULT_DWELL_TIME;
    const sessionDuration = Date.now() - sessionStartRef.current;

    // Calculate fatigue score based on session duration and accuracy
    const sessionMinutes = sessionDuration / 60000;
    const fatigueFromDuration = Math.min(sessionMinutes / 30, 1); // Max fatigue after 30 minutes
    const fatigueFromAccuracy = Math.max(0, 1 - accuracyRate); // Lower accuracy = higher fatigue
    const fatigueScore = (fatigueFromDuration * 0.6) + (fatigueFromAccuracy * 0.4);

    setPatternStats({
      totalSelections: selections.length,
      accidentalTriggers: accidentalTriggers.length,
      averageDwellTime,
      accuracyRate,
      sessionDuration,
      fatigueScore,
    });

    // Update fatigue level
    if (fatigueScore > 0.7) {
      setFatigueLevel('tired');
    } else if (fatigueScore > 0.4) {
      setFatigueLevel('moderate');
    } else {
      setFatigueLevel('fresh');
    }

    console.log(`🧠 Pattern Stats - Accuracy: ${(accuracyRate * 100).toFixed(1)}%, Fatigue: ${(fatigueScore * 100).toFixed(1)}%, Session: ${sessionMinutes.toFixed(1)}min`);
  }, []);

  /**
   * Calculate recommended dwell time based on user patterns
   */
  const calculateRecommendedDwellTime = useCallback(() => {
    const { accuracyRate, averageDwellTime: _averageDwellTime, fatigueScore } = patternStats;

    let newDwellTime = dwellTime;

    // Adjust based on accuracy
    if (accuracyRate < 0.8) {
      // User is making mistakes, increase dwell time
      newDwellTime = Math.min(dwellTime + 50, MAX_DWELL_TIME);
      console.log('📈 Increasing dwell time due to low accuracy');
    } else if (accuracyRate > 0.95 && patternStats.totalSelections > 10) {
      // User is very accurate, can decrease dwell time
      newDwellTime = Math.max(dwellTime - 50, MIN_DWELL_TIME);
      console.log('📉 Decreasing dwell time due to high accuracy');
    }

    // Adjust based on fatigue
    if (fatigueScore > 0.7) {
      // User is tired, increase dwell time for safety
      newDwellTime = Math.min(newDwellTime + 100, MAX_DWELL_TIME);
      console.log('😴 Increasing dwell time due to fatigue');
    }

    // Don't change too frequently
    if (Math.abs(newDwellTime - dwellTime) >= 50) {
      setRecommendedDwellTime(newDwellTime);
    }
  }, [patternStats, dwellTime]);

  /**
   * Auto-adjust dwell time periodically
   */
  useEffect(() => {
    const interval = setInterval(() => {
      calculateRecommendedDwellTime();
    }, FATIGUE_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [calculateRecommendedDwellTime]);

  /**
   * Apply recommended dwell time if significantly different
   */
  useEffect(() => {
    if (Math.abs(recommendedDwellTime - dwellTime) >= 100) {
      console.log(`⚙️ Auto-adjusting dwell time: ${dwellTime}ms → ${recommendedDwellTime}ms`);
      setDwellTime(recommendedDwellTime);
    }
  }, [recommendedDwellTime, dwellTime, setDwellTime]);

  /**
   * Reset statistics (useful for new sessions)
   */
  const resetStats = useCallback(() => {
    gazeEventsRef.current = [];
    sessionStartRef.current = Date.now();
    setPatternStats({
      totalSelections: 0,
      accidentalTriggers: 0,
      averageDwellTime: DEFAULT_DWELL_TIME,
      accuracyRate: 1.0,
      sessionDuration: 0,
      fatigueScore: 0,
    });
    setFatigueLevel('fresh');
    console.log('🔄 Pattern stats reset');
  }, []);

  return {
    recordGazeEvent,
    recommendedDwellTime,
    patternStats,
    fatigueLevel,
    resetStats,
  };
}
