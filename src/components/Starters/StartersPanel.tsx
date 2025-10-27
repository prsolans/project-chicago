import { useState, useEffect } from 'react';
import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import { useMessageStore } from '../../store/messageStore';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { usePhraseLibrary } from '../../store/phraseLibraryStore';
import type { Phrase, PhraseCategory } from '../../types/database';
import {
  Users,
  Heart,
  Armchair,
  MessageCircle,
  CheckCircle,
  HelpCircle,
  UtensilsCrossed,
  Smile,
  Tv,
  ArrowLeft
} from 'lucide-react';

const CATEGORIES = [
  { id: 'family' as PhraseCategory, label: 'Family', icon: Users, color: 'from-purple-600 to-purple-700' },
  { id: 'medical' as PhraseCategory, label: 'Medical', icon: Heart, color: 'from-red-600 to-red-700' },
  { id: 'comfort' as PhraseCategory, label: 'Comfort', icon: Armchair, color: 'from-orange-600 to-orange-700' },
  { id: 'social' as PhraseCategory, label: 'Social', icon: MessageCircle, color: 'from-blue-600 to-blue-700' },
  { id: 'responses' as PhraseCategory, label: 'Responses', icon: CheckCircle, color: 'from-green-600 to-green-700' },
  { id: 'questions' as PhraseCategory, label: 'Questions', icon: HelpCircle, color: 'from-yellow-600 to-yellow-700' },
  { id: 'food' as PhraseCategory, label: 'Food & Drink', icon: UtensilsCrossed, color: 'from-amber-600 to-amber-700' },
  { id: 'feelings' as PhraseCategory, label: 'Feelings', icon: Smile, color: 'from-pink-600 to-pink-700' },
  { id: 'entertainment' as PhraseCategory, label: 'Entertainment', icon: Tv, color: 'from-indigo-600 to-indigo-700' },
] as const;

interface StartersPanelProps {
  className?: string;
}

export const StartersPanel = ({ className = '' }: StartersPanelProps) => {
  const [selectedCategory, setSelectedCategory] = useState<PhraseCategory | null>(null);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { dwellTime } = useSettingsStore();
  const { setMessage, sendMessage } = useMessageStore();
  const { speak } = useTextToSpeech();
  const { getPhrasesByCategory, trackUsage } = usePhraseLibrary();

  // Load phrases when category is selected
  useEffect(() => {
    if (selectedCategory) {
      setIsLoading(true);
      getPhrasesByCategory(selectedCategory, true) // true = smart sort with time-awareness
        .then(setPhrases)
        .finally(() => setIsLoading(false));
    }
  }, [selectedCategory, getPhrasesByCategory]);

  const handleCategorySelect = (categoryId: PhraseCategory) => {
    setSelectedCategory(categoryId);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const handlePhraseSelect = (phrase: Phrase) => {
    setMessage(phrase.text, 'starter');
    sendMessage('starter');
    speak(phrase.text);
    trackUsage(phrase.id, 'starter');
  };

  // Level 1: Category Selection
  if (!selectedCategory) {
    return (
      <div className={`h-full overflow-y-auto p-6 ${className}`}>
        <div className="grid grid-cols-3 gap-4">
          {CATEGORIES.map(category => (
            <CategoryButton
              key={category.id}
              label={category.label}
              icon={category.icon}
              color={category.color}
              onSelect={() => handleCategorySelect(category.id)}
              dwellTime={dwellTime}
            />
          ))}
        </div>
      </div>
    );
  }

  // Level 2: Phrase Selection
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory)!;

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Category Navigation Icons */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex gap-2 justify-center">
          {CATEGORIES.map(category => (
            <CategoryIconButton
              key={category.id}
              icon={category.icon}
              color={category.color}
              label={category.label}
              isActive={category.id === selectedCategory}
              onSelect={() => handleCategorySelect(category.id)}
              dwellTime={dwellTime}
            />
          ))}
        </div>
      </div>

      {/* Phrases Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-lg">Loading phrases...</p>
          </div>
        ) : phrases.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 text-lg">No phrases available</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {phrases.map(phrase => (
              <PhraseButton
                key={phrase.id}
                text={phrase.text}
                color={currentCategory.color}
                onSelect={() => handlePhraseSelect(phrase)}
                dwellTime={dwellTime}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Category Button Component (Level 1)
 */
interface CategoryButtonProps {
  label: string;
  icon: React.ElementType;
  color: string;
  onSelect: () => void;
  dwellTime: number;
}

const CategoryButton = ({ label, icon: Icon, color, onSelect, dwellTime }: CategoryButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onSelect
  );

  return (
    <button
      className={`
        relative w-full h-32 rounded-xl flex flex-col items-center justify-center gap-3
        bg-gradient-to-br ${color}
        hover:brightness-110
        text-white font-bold text-xl
        transition-all duration-200
        cursor-pointer
        shadow-lg hover:shadow-xl
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {progress > 0 && (
        <div
          className="absolute inset-0 rounded-xl border-4 border-yellow-400 pointer-events-none"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}

      <Icon className="w-12 h-12 relative z-10" />
      <span className="relative z-10">{label}</span>
    </button>
  );
};

/**
 * Back Button Component (Level 2)
 */
interface BackButtonProps {
  onBack: () => void;
  dwellTime: number;
}

const BackButton = ({ onBack, dwellTime }: BackButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onBack
  );

  return (
    <button
      className="relative flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-700/90 hover:bg-slate-600 text-white font-semibold text-lg transition-all cursor-pointer shadow-md hover:shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {progress > 0 && (
        <div
          className="absolute inset-0 rounded-xl border-4 border-yellow-400 pointer-events-none"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}

      <ArrowLeft className="w-5 h-5 relative z-10" />
      <span className="relative z-10">Back to Categories</span>
    </button>
  );
};

/**
 * Category Icon Button Component (Level 2 - Quick Navigation)
 */
interface CategoryIconButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
  isActive: boolean;
  onSelect: () => void;
  dwellTime: number;
}

const CategoryIconButton = ({
  icon: Icon,
  color,
  label,
  isActive,
  onSelect,
  dwellTime
}: CategoryIconButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onSelect
  );

  return (
    <button
      className={`
        relative w-14 h-14 rounded-lg
        bg-gradient-to-br ${color}
        ${isActive ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-slate-900' : ''}
        hover:brightness-110
        text-white
        transition-all duration-200
        cursor-pointer
        shadow-md hover:shadow-lg
        flex items-center justify-center
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
      title={label}
    >
      {progress > 0 && !isActive && (
        <div
          className="absolute inset-0 rounded-lg border-4 border-yellow-400 pointer-events-none"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}

      <Icon className="w-6 h-6 relative z-10" />
    </button>
  );
};

/**
 * Phrase Button Component (Level 2)
 */
interface PhraseButtonProps {
  text: string;
  color: string;
  onSelect: () => void;
  dwellTime: number;
}

const PhraseButton = ({ text, color, onSelect, dwellTime }: PhraseButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onSelect
  );

  return (
    <button
      className={`
        relative w-full min-h-[80px] px-4 py-3 rounded-xl
        bg-gradient-to-br ${color}
        hover:brightness-110
        text-white text-left text-base font-semibold
        transition-all duration-200
        cursor-pointer
        shadow-md hover:shadow-lg
        flex items-center justify-center
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
    >
      {progress > 0 && (
        <div
          className="absolute inset-0 rounded-xl border-4 border-yellow-400 pointer-events-none"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}

      <span className="relative z-10 text-center leading-snug">{text}</span>
    </button>
  );
};
