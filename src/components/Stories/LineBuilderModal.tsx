/**
 * Line Builder Modal
 * Full-screen modal for building story lines or titles using fragments
 */

import { useState, useEffect } from 'react';
import { usePhraseFragmentStore } from '../../store/phraseFragmentStore';
import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import { useThoughtCompletion } from '../../hooks/useThoughtCompletion';
import type { PhraseFragment, SemanticCategory } from '../../types/phraseFragments';
import type { AIPrediction } from '../../types/conversation';

// Category configuration with labels and colors
const CATEGORY_CONFIG: { category: SemanticCategory; label: string; color: string }[] = [
  { category: 'WHO', label: 'Who', color: 'bg-blue-600' },
  { category: 'DO', label: 'Do', color: 'bg-green-600' },
  { category: 'FEEL', label: 'Feel', color: 'bg-pink-600' },
  { category: 'WHAT', label: 'What', color: 'bg-orange-600' },
  { category: 'HOW', label: 'How', color: 'bg-purple-600' },
  { category: 'LINK', label: '+', color: 'bg-slate-600' },
  { category: 'VOICE', label: '🎭', color: 'bg-violet-600' },
];

interface LineBuilderModalProps {
  onAddLine: (line: string) => void;
  onClose: () => void;
  mode?: 'line' | 'title';
}

export const LineBuilderModal = ({ onAddLine, onClose, mode = 'line' }: LineBuilderModalProps) => {
  const { dwellTime, enableAI } = useSettingsStore();
  const {
    currentSelection,
    activeCategory,
    addFragment,
    removeLastFragment,
    clearSelection,
    setActiveCategory,
    getSuggestedCategory,
    getFragmentsBySemanticCategory,
    setCurrentSelection,
    getSuggestedFragments,
  } = usePhraseFragmentStore();

  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 12;

  // AI Thought completion predictions
  const {
    predictions,
    isLoading: isPredictionsLoading,
    triggerPredictions,
  } = useThoughtCompletion({
    minCharacters: 0,
    maxPredictions: 6,
    debounceMs: 400,
    enabled: enableAI,
  });

  // Get smart fragment suggestions based on current type
  const smartSuggestions = getSuggestedFragments(currentSelection.currentType).slice(0, 4);

  // Reset on mount
  useEffect(() => {
    clearSelection();
    setActiveCategory('WHO');
  }, []);

  // Trigger predictions when preview text changes
  useEffect(() => {
    if (currentSelection.previewText) {
      triggerPredictions(currentSelection.previewText);
    }
  }, [currentSelection.previewText, triggerPredictions]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory]);

  const suggestedCategory = getSuggestedCategory();
  const availableFragments = getFragmentsBySemanticCategory(activeCategory);
  const totalPages = Math.ceil(availableFragments.length / ITEMS_PER_PAGE);
  const paginatedFragments = availableFragments.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleSelectFragment = (fragment: PhraseFragment) => {
    addFragment(fragment);
    const nextSuggested = getSuggestedCategory();
    setActiveCategory(nextSuggested);
  };

  const handleAddToStory = () => {
    if (currentSelection.previewText) {
      onAddLine(currentSelection.previewText);
      clearSelection();
      onClose();
    }
  };

  const handleClear = () => {
    clearSelection();
  };

  const handleUndo = () => {
    removeLastFragment();
  };

  const handlePunctuation = (punctuation: string) => {
    if (!currentSelection.previewText) return;

    const currentText = currentSelection.previewText;
    let newText: string;
    if (punctuation === ',') {
      newText = currentText.replace(/,$/, '') + punctuation;
    } else {
      newText = currentText.replace(/[.!?,]$/, '') + punctuation;
    }

    setCurrentSelection({
      ...currentSelection,
      previewText: newText,
    });
  };

  // Handle AI prediction selection
  const handlePredictionSelect = (prediction: AIPrediction) => {
    const currentText = currentSelection.previewText || '';
    const words = currentText.split(' ');
    const lastWord = words[words.length - 1] || '';
    const predictionLower = prediction.content.toLowerCase();
    const lastWordLower = lastWord.toLowerCase();

    // Check if prediction completes the last word
    const isCompletion = predictionLower.startsWith(lastWordLower) && lastWord.length > 0;

    let newText: string;
    if (isCompletion) {
      words.pop();
      words.push(prediction.content);
      newText = words.join(' ');
    } else {
      const separator = currentText.length > 0 ? ' ' : '';
      newText = currentText + separator + prediction.content;
    }

    setCurrentSelection({
      ...currentSelection,
      previewText: newText,
    });
  };

  // Handle smart suggestion selection
  const handleSmartSuggestion = (fragment: PhraseFragment) => {
    const currentText = currentSelection.previewText || '';
    const separator = currentText.length > 0 ? ' ' : '';
    const newText = currentText + separator + fragment.text;

    // Add to fragments list too
    addFragment(fragment);

    // Update preview with full text
    const updatedSelection = usePhraseFragmentStore.getState().currentSelection;
    setCurrentSelection({
      ...updatedSelection,
      previewText: newText.charAt(0).toUpperCase() + newText.slice(1),
    });

    const nextSuggested = getSuggestedCategory();
    setActiveCategory(nextSuggested);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <ModalButton
          label="✕ Cancel"
          onClick={onClose}
          color="bg-slate-700"
          dwellTime={dwellTime}
        />
        <h2 className="text-2xl font-bold text-white">
          {mode === 'title' ? 'Build Title' : 'Build a Line'}
        </h2>
        <ModalButton
          label="Add to Story"
          onClick={handleAddToStory}
          color="bg-green-600"
          dwellTime={dwellTime}
          disabled={!currentSelection.previewText}
        />
      </div>

      {/* Preview Area */}
      <div className="px-6 py-4 border-b border-slate-700/50">
        <div className="bg-slate-800 rounded-lg p-4 border-2 border-slate-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-xl font-medium text-white min-h-[40px] flex items-center">
              {currentSelection.previewText || (
                <span className="text-slate-600 italic text-base">Select fragments to build...</span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <ModalButton
                label="↩ Undo"
                onClick={handleUndo}
                color="bg-yellow-600"
                dwellTime={dwellTime}
                disabled={currentSelection.fragments.length === 0}
              />
              <ModalButton
                label="✕ Clear"
                onClick={handleClear}
                color="bg-red-600"
                dwellTime={dwellTime}
                disabled={currentSelection.fragments.length === 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Predictions Row */}
      {(smartSuggestions.length > 0 || predictions.length > 0 || isPredictionsLoading) && (
        <div className="px-6 py-3 border-b border-slate-700/50">
          <div className="flex gap-2 overflow-x-auto">
            {/* Smart Fragment Suggestions */}
            {smartSuggestions.map(({ fragment }) => (
              <SuggestionButton
                key={fragment.id}
                label={fragment.text}
                onSelect={() => handleSmartSuggestion(fragment)}
                dwellTime={dwellTime}
                color="bg-emerald-600"
              />
            ))}

            {/* AI Predictions */}
            {predictions.map((prediction, index) => (
              <SuggestionButton
                key={`ai-${index}`}
                label={prediction.content}
                onSelect={() => handlePredictionSelect(prediction)}
                dwellTime={dwellTime}
                color="bg-purple-600"
              />
            ))}

            {/* Loading indicator */}
            {isPredictionsLoading && predictions.length === 0 && (
              <div className="px-4 py-3 text-slate-400 text-lg italic">
                Thinking...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Tabs + Punctuation */}
      <div className="px-6 py-3 flex gap-2 overflow-x-auto border-b border-slate-700/50">
        {CATEGORY_CONFIG.map(({ category, label, color }) => (
          <CategoryTab
            key={category}
            label={label}
            color={color}
            isActive={activeCategory === category}
            isSuggested={suggestedCategory === category}
            onSelect={() => setActiveCategory(category)}
            dwellTime={dwellTime}
          />
        ))}

        {/* Punctuation buttons */}
        <PunctuationButton
          punctuation=","
          color="bg-slate-500"
          onSelect={() => handlePunctuation(',')}
          dwellTime={dwellTime}
        />
        <PunctuationButton
          punctuation="!"
          color="bg-amber-600"
          onSelect={() => handlePunctuation('!')}
          dwellTime={dwellTime}
        />
        <PunctuationButton
          punctuation="?"
          color="bg-sky-600"
          onSelect={() => handlePunctuation('?')}
          dwellTime={dwellTime}
        />
      </div>

      {/* Fragment Grid */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {availableFragments.length > 0 ? (
          <>
            <div className="grid grid-cols-4 gap-3">
              {paginatedFragments.map((fragment) => (
                <FragmentButton
                  key={fragment.id}
                  fragment={fragment}
                  onSelect={() => handleSelectFragment(fragment)}
                  dwellTime={dwellTime}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-700">
                <PaginationButton
                  label="◀ Prev"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  dwellTime={dwellTime}
                />
                <span className="text-slate-400 text-lg font-medium min-w-[120px] text-center">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <PaginationButton
                  label="Next ▶"
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  dwellTime={dwellTime}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-slate-500 py-12">
            <p className="text-xl mb-2">No fragments in this category</p>
            <p className="text-sm">Select a different category tab above</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components

interface ModalButtonProps {
  label: string;
  onClick: () => void;
  color: string;
  dwellTime: number;
  disabled?: boolean;
}

const ModalButton = ({ label, onClick, color, dwellTime, disabled = false }: ModalButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onClick,
    !disabled
  );

  return (
    <button
      className={`
        relative ${color} text-white rounded-lg px-6 py-3
        font-semibold text-lg min-h-[56px] transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}
      `}
      onMouseEnter={disabled ? undefined : handleMouseEnter}
      onMouseLeave={disabled ? undefined : handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{label}</span>
      {progress > 0 && !disabled && (
        <div
          className="absolute inset-0 rounded-lg border-4 border-yellow-400"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}
    </button>
  );
};

interface CategoryTabProps {
  label: string;
  color: string;
  isActive: boolean;
  isSuggested: boolean;
  onSelect: () => void;
  dwellTime: number;
}

const CategoryTab = ({ label, color, isActive, isSuggested, onSelect, dwellTime }: CategoryTabProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(dwellTime, onSelect);

  return (
    <button
      className={`
        relative ${color} text-white rounded-lg px-4 py-3
        font-semibold text-lg min-h-[56px] min-w-[64px] transition-all
        ${isActive ? 'ring-4 ring-white/50 scale-105' : 'opacity-70 hover:opacity-90'}
        ${isSuggested && !isActive ? 'ring-2 ring-yellow-400' : ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative z-10">{label}</span>
      {progress > 0 && (
        <div
          className="absolute inset-0 rounded-lg border-4 border-yellow-400"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}
    </button>
  );
};

interface PunctuationButtonProps {
  punctuation: string;
  color: string;
  onSelect: () => void;
  dwellTime: number;
}

const PunctuationButton = ({ punctuation, color, onSelect, dwellTime }: PunctuationButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(dwellTime, onSelect);

  return (
    <button
      className={`
        relative ${color} text-white rounded-lg px-4 py-3
        font-bold text-2xl min-h-[56px] min-w-[56px] transition-all hover:opacity-90
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative z-10">{punctuation}</span>
      {progress > 0 && (
        <div
          className="absolute inset-0 rounded-lg border-4 border-yellow-400"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}
    </button>
  );
};

interface SuggestionButtonProps {
  label: string;
  onSelect: () => void;
  dwellTime: number;
  color: string;
}

const SuggestionButton = ({ label, onSelect, dwellTime, color }: SuggestionButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(dwellTime, onSelect);

  return (
    <button
      className={`
        relative ${color} text-white rounded-lg px-4 py-3
        font-medium text-lg min-h-[56px] whitespace-nowrap transition-all hover:opacity-90
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative z-10">{label}</span>
      {progress > 0 && (
        <div
          className="absolute inset-0 rounded-lg border-4 border-yellow-400"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}
    </button>
  );
};

interface FragmentButtonProps {
  fragment: PhraseFragment;
  onSelect: () => void;
  dwellTime: number;
}

const FragmentButton = ({ fragment, onSelect, dwellTime }: FragmentButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(dwellTime, onSelect);

  const getOpacity = () => {
    switch (fragment.commonality) {
      case 'very_common': return 'opacity-100';
      case 'common': return 'opacity-90';
      case 'uncommon': return 'opacity-75';
      case 'specialized': return 'opacity-60';
      default: return 'opacity-100';
    }
  };

  return (
    <button
      className={`
        relative bg-blue-600 text-white rounded-lg px-4 py-4
        font-medium text-lg min-h-[72px] transition-all
        hover:bg-blue-500 ${getOpacity()}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative z-10">{fragment.text}</span>
      {progress > 0 && (
        <div
          className="absolute inset-0 rounded-lg border-4 border-yellow-400"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}
    </button>
  );
};

interface PaginationButtonProps {
  label: string;
  onClick: () => void;
  disabled: boolean;
  dwellTime: number;
}

const PaginationButton = ({ label, onClick, disabled, dwellTime }: PaginationButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onClick,
    !disabled
  );

  return (
    <button
      className={`
        relative bg-slate-700 text-white rounded-lg px-6 py-3
        font-medium text-lg min-h-[56px] min-w-[120px] transition-all
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-600'}
      `}
      onMouseEnter={disabled ? undefined : handleMouseEnter}
      onMouseLeave={disabled ? undefined : handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{label}</span>
      {progress > 0 && !disabled && (
        <div
          className="absolute inset-0 rounded-lg border-4 border-yellow-400"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}
    </button>
  );
};
