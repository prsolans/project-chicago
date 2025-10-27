import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import type { KeyConfig } from '../../types/index';

interface KeyProps {
  config: KeyConfig;
  onSelect: (value: string) => void;
}

export const Key = ({ config, onSelect }: KeyProps) => {
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
    const baseStyle = 'relative flex items-center justify-center text-center text-2xl font-semibold rounded-2xl transition-all cursor-pointer select-none shadow-md hover:shadow-lg';

    switch (config.type) {
      case 'letter':
        return `${baseStyle} bg-slate-700/90 hover:bg-slate-600 text-white h-[75px]`;
      case 'space':
        return `${baseStyle} bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white h-[75px]`;
      case 'delete':
        return `${baseStyle} bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white h-[75px]`;
      case 'speak':
        return `${baseStyle} bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white h-[75px]`;
      case 'clear':
        return `${baseStyle} bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white h-[75px]`;
      default:
        return `${baseStyle} bg-slate-700/90 hover:bg-slate-600 text-white h-[75px]`;
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
          className="absolute inset-0 rounded-2xl border-4 border-yellow-400 pointer-events-none"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}

      {/* Key label */}
      <span className={`relative z-10 ${config.type === 'letter' ? 'text-2xl' : 'text-lg'}`}>
        {config.label}
      </span>
    </div>
  );
};
