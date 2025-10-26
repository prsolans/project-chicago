import { useState, useEffect, useCallback, useRef } from 'react';

export const useDwellDetection = (
  dwellTime: number,
  onDwell: () => void,
  enabled: boolean = true
) => {
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startDwell = useCallback(() => {
    if (!enabled) return;

    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min((elapsed / dwellTime) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        onDwell();
        setIsHovering(false);
        setProgress(0);
      } else {
        timerRef.current = requestAnimationFrame(updateProgress);
      }
    };

    timerRef.current = requestAnimationFrame(updateProgress);
  }, [dwellTime, onDwell, enabled]);

  const cancelDwell = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    setProgress(0);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    startDwell();
  }, [startDwell]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    cancelDwell();
  }, [cancelDwell]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, []);

  return {
    progress,
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
  };
};
