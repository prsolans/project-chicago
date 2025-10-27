import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import { useCategoryPhrases } from '../../hooks/useCategoryPhrases';
import type { AIPrediction } from '../../types/conversation';
import {
  Heart,
  Armchair,
  MessageCircle,
  CheckCircle,
  HelpCircle,
  Users,
  type LucideIcon
} from 'lucide-react';

interface CategoryPhrasesPanelProps {
  onSelectPhrase: (phrase: string) => void;
  className?: string;
  isFullScreen?: boolean;
  onClose?: () => void;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: LucideIcon; description: string }> = {
  family: { label: 'Family', icon: Users, description: 'Messages for Tony, Michael & Claire' },
  medical: { label: 'Medical', icon: Heart, description: 'Health & medication needs' },
  comfort: { label: 'Comfort', icon: Armchair, description: 'Position & comfort' },
  social: { label: 'Social', icon: MessageCircle, description: 'Conversation & greetings' },
  responses: { label: 'Responses', icon: CheckCircle, description: 'Yes/No/Maybe' },
  questions: { label: 'Questions', icon: HelpCircle, description: 'Ask questions' },
};

// Static priority levels for each category (never change)
const CATEGORY_PRIORITIES: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
  medical: 'critical',    // Health needs are most critical
  comfort: 'critical',    // Physical comfort is critical
  family: 'high',         // Family communication is high priority
  social: 'medium',       // Social interaction is medium priority
  responses: 'medium',    // Quick responses are medium priority
  questions: 'low',       // Questions are lower priority
};

export const CategoryPhrasesPanel = ({
  onSelectPhrase,
  className = '',
  isFullScreen = false,
  onClose,
}: CategoryPhrasesPanelProps) => {
  const { dwellTime } = useSettingsStore();
  const {
    categoryPredictions,
    isLoading,
    error,
    activeCategory,
    setActiveCategory,
    refreshPredictions,
  } = useCategoryPhrases({
    enabled: true,
  });

  // Dwell detection for Refresh button
  const refreshButton = useDwellDetection(dwellTime, refreshPredictions);

  // Dwell detection for Close button
  const closeButton = useDwellDetection(dwellTime, () => onClose?.());

  const categories = Object.keys(CATEGORY_LABELS);
  const selectedCategory = activeCategory || categories[0];
  const predictions = categoryPredictions[selectedCategory] || [];

  // Full screen overlay styling - using inline styles for reliability
  const overlayStyle = isFullScreen ? {
    position: 'fixed' as const,
    top: '90px',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f172a', // slate-900
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '2rem',
    overflowY: 'auto' as const,
  } : undefined;

  const containerClassName = !isFullScreen
    ? `bg-slate-900 rounded-lg p-6 ${className}`
    : ''; // Inline styles handle fullscreen

  // Debug logging
  if (isFullScreen) {
    console.log('🔍 Overlay rendering with id="quick-phrases-overlay"');
    console.log('🔍 Container classes:', containerClassName);
    console.log('🔍 Inline styles:', overlayStyle);
  }

  return (
    <div
      id={isFullScreen ? 'quick-phrases-overlay' : undefined}
      data-overlay={isFullScreen ? 'true' : 'false'}
      className={containerClassName}
      style={overlayStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-3xl font-semibold tracking-tight">
            Quick Phrases
          </h2>
          <p className="text-slate-400 text-sm mt-1">Select a category to view phrases</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onMouseEnter={refreshButton.handleMouseEnter}
            onMouseLeave={refreshButton.handleMouseLeave}
            className="relative text-slate-300 hover:text-white text-sm px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors font-medium"
            disabled={isLoading}
          >
            {refreshButton.progress > 0 && (
              <div
                className="absolute inset-0 rounded-lg border-4 border-yellow-400 pointer-events-none"
                style={{
                  background: `conic-gradient(#facc15 ${refreshButton.progress}%, transparent ${refreshButton.progress}%)`,
                  opacity: 0.3,
                }}
              />
            )}
            <span className="relative z-10">{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
          {isFullScreen && onClose && (
            <button
              onMouseEnter={closeButton.handleMouseEnter}
              onMouseLeave={closeButton.handleMouseLeave}
              className="relative text-slate-300 hover:text-white text-sm px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors font-medium"
              title="Close phrases panel"
            >
              {closeButton.progress > 0 && (
                <div
                  className="absolute inset-0 rounded-lg border-4 border-yellow-400 pointer-events-none"
                  style={{
                    background: `conic-gradient(#facc15 ${closeButton.progress}%, transparent ${closeButton.progress}%)`,
                    opacity: 0.3,
                  }}
                />
              )}
              <span className="relative z-10">Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((category) => {
          const { label, icon, description } = CATEGORY_LABELS[category];
          const isActive = category === selectedCategory;
          const priority = CATEGORY_PRIORITIES[category] || 'medium';

          return (
            <CategoryTab
              key={category}
              label={label}
              icon={icon}
              description={description}
              isActive={isActive}
              priority={priority}
              onClick={() => setActiveCategory(category)}
            />
          );
        })}
      </div>

      {/* Phrases */}
      <div className={`${isFullScreen ? 'flex-1 overflow-y-auto' : ''}`}>
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 text-sm p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-300 text-base ml-4 font-medium">Loading phrases...</p>
          </div>
        ) : predictions.length > 0 ? (
          <div className={`grid gap-4 ${isFullScreen ? 'grid-cols-4 max-w-7xl mx-auto' : 'grid-cols-1'}`}>
            {predictions.map((prediction) => (
              <PhraseButton
                key={prediction.id}
                prediction={prediction}
                onSelect={() => onSelectPhrase(prediction.content)}
                isLarge={isFullScreen}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg mb-4">No phrases available for this category.</p>
            <button
              onClick={refreshPredictions}
              className="text-blue-400 hover:text-blue-300 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors font-medium"
            >
              Try refreshing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Category Tab Component
 */
interface CategoryTabProps {
  label: string;
  icon: LucideIcon;
  description: string;
  isActive: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  onClick: () => void;
}

const CategoryTab = ({
  label,
  icon: Icon,
  description,
  isActive,
  priority,
  onClick,
}: CategoryTabProps) => {
  const { dwellTime } = useSettingsStore();
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onClick
  );

  // Priority-based background colors (static, never change)
  const getPriorityBgColor = () => {
    if (isActive) return 'bg-blue-600 shadow-lg';

    switch (priority) {
      case 'critical':
        return 'bg-red-600/80 hover:bg-red-600';
      case 'high':
        return 'bg-orange-600/80 hover:bg-orange-600';
      case 'medium':
        return 'bg-slate-700 hover:bg-slate-600';
      case 'low':
        return 'bg-slate-800 hover:bg-slate-700';
    }
  };

  return (
    <button
      className={`
        relative min-h-[70px] px-6 py-3 rounded-xl
        transition-all duration-200 cursor-pointer
        ${getPriorityBgColor()}
        text-white
        flex-1 min-w-[140px]
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`${description} (Priority: ${priority})`}
    >
      {/* Dwell progress indicator */}
      {progress > 0 && !isActive && (
        <div
          className="absolute inset-0 rounded-xl border-4 border-yellow-400 pointer-events-none"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}

      {/* Content */}
      <div className="relative flex flex-col items-center gap-2">
        <Icon className="w-6 h-6" strokeWidth={2} />
        <span className="font-semibold text-base">{label}</span>
      </div>
    </button>
  );
};

/**
 * Phrase Button Component
 */
interface PhraseButtonProps {
  prediction: AIPrediction;
  onSelect: () => void;
  isLarge?: boolean;
}

const PhraseButton = ({ prediction, onSelect, isLarge = false }: PhraseButtonProps) => {
  const { dwellTime } = useSettingsStore();
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onSelect
  );

  // Color based on confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-emerald-700 hover:bg-emerald-600 border-emerald-600';
    if (confidence >= 0.6) return 'bg-blue-700 hover:bg-blue-600 border-blue-600';
    return 'bg-slate-700 hover:bg-slate-600 border-slate-600';
  };

  const confidenceColor = getConfidenceColor(prediction.confidence);

  return (
    <button
      className={`
        relative ${isLarge ? 'min-h-[100px] px-6 py-4' : 'min-h-[90px] px-6 py-5'}
        rounded-xl border-l-4
        ${confidenceColor}
        text-white text-left
        transition-all duration-200
        cursor-pointer
        w-full
        shadow-sm hover:shadow-md
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
    >
      {/* Dwell progress indicator */}
      {progress > 0 && (
        <div
          className="absolute inset-0 rounded-xl border-4 border-yellow-400 pointer-events-none"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}

      {/* Phrase content */}
      <div className="relative flex flex-col justify-between h-full">
        <p className={`${isLarge ? 'text-lg' : 'text-xl'} font-semibold leading-snug mb-2`}>
          {prediction.content}
        </p>

        {/* Confidence indicator */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/40 rounded-full"
              style={{ width: `${prediction.confidence * 100}%` }}
            />
          </div>
          <span className={`${isLarge ? 'text-xs' : 'text-xs'} text-white/50 font-medium tabular-nums`}>
            {Math.round(prediction.confidence * 100)}%
          </span>
        </div>
      </div>
    </button>
  );
};
