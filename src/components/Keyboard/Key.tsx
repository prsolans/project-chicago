import React from 'react';
import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import type { KeyConfig } from '../../types/index';

interface KeyProps {
  config: KeyConfig;
  onSelect: (value: string) => void;
}

export const Key: React.FC<KeyProps> = ({ config, onSelect }) => {
  const dwellTime = useSettingsStore((state) => state.dwellTime);
  const enableSound = useSettingsStore((state) => state.enableSound);

  const handleDwell = () => {
    if (enableSound) {
      // Play click sound (skip if audio file not available)
      const audio = new Audio('/click.mp3');
      audio.play().catch(() => {});
    }
    onSelect(config.value);
  };

  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    handleDwell
  );

  const getKeyStyle = () => {
    const baseStyle = 'relative flex items-center justify-center text-2xl font-bold rounded-lg transition-all cursor-pointer select-none';

    switch (config.type) {
      case 'letter':
        return `${baseStyle} bg-slate-700 hover:bg-slate-600 text-white min-h-[80px]`;
      case 'space':
        return `${baseStyle} bg-blue-600 hover:bg-blue-500 text-white min-h-[80px]`;
      case 'delete':
        return `${baseStyle} bg-red-600 hover:bg-red-500 text-white min-h-[80px]`;
      case 'speak':
        return `${baseStyle} bg-green-600 hover:bg-green-500 text-white min-h-[80px]`;
      case 'clear':
        return `${baseStyle} bg-orange-600 hover:bg-orange-500 text-white min-h-[80px]`;
      default:
        return `${baseStyle} bg-slate-700 hover:bg-slate-600 text-white min-h-[80px]`;
    }
  };

  return (
    <div
      className={`${getKeyStyle()} ${config.className || ''}`}
      style={{ gridArea: config.gridArea }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dwell progress indicator */}
      {progress > 0 && (
        <div
          className="absolute inset-0 rounded-lg border-4 border-yellow-400"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}

      {/* Key label */}
      <span className="relative z-10">{config.label}</span>
    </div>
  );
};
