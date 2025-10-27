import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import type { AIPrediction } from '../../types/conversation';

interface ThoughtCompletionBarProps {
  predictions: AIPrediction[];
  onSelectPrediction: (prediction: AIPrediction) => void;
  isLoading?: boolean;
}

export const ThoughtCompletionBar = ({
  predictions,
  onSelectPrediction,
  isLoading = false,
}: ThoughtCompletionBarProps) => {
  const { dwellTime } = useSettingsStore();

  if (isLoading) {
    return (
      <div className="w-full bg-slate-800/50 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-base font-light">Predicting next words...</p>
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-4">
      <div className="mb-2 px-2">
        <p className="text-slate-400 text-sm">
          💬 Next word suggestions:
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {predictions.map((prediction) => (
          <PredictionButton
            key={prediction.id}
            prediction={prediction}
            onSelect={() => onSelectPrediction(prediction)}
            dwellTime={dwellTime}
          />
        ))}
      </div>
    </div>
  );
};

interface PredictionButtonProps {
  prediction: AIPrediction;
  onSelect: () => void;
  dwellTime: number;
}

const PredictionButton = ({ prediction, onSelect, dwellTime }: PredictionButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onSelect
  );

  // Color based on confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600';
    if (confidence >= 0.6) return 'bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600';
    return 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700';
  };

  const confidenceColor = getConfidenceColor(prediction.confidence);

  return (
    <button
      className={`
        relative min-h-[70px] px-6 py-4 rounded-2xl
        ${confidenceColor}
        text-white
        transition-all duration-200
        cursor-pointer
        flex items-center justify-center
        shadow-md hover:shadow-lg
      `}
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

      {/* Word/phrase content */}
      <div className="relative text-center">
        <p className="text-xl font-semibold">
          {prediction.content}
        </p>

        {/* Confidence indicator */}
        <span className="text-xs text-white/70 mt-1 block">
          {Math.round(prediction.confidence * 100)}%
        </span>
      </div>
    </button>
  );
};
