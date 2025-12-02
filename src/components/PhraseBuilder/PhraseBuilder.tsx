/**
 * PhraseBuilder Component
 *
 * Visual interface for building custom phrases by selecting and combining fragments.
 * Users dwell on fragments to add them to their sentence, building it piece by piece.
 *
 * Uses semantic category tabs (WHO, DO, FEEL, WHAT, HOW, LINK, VOICE) for intuitive navigation.
 */

import { useState, useEffect } from 'react';
import { usePhraseFragmentStore } from '../../store/phraseFragmentStore';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useConversationStore } from '../../store/conversationStore';
import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import { useThoughtCompletion } from '../../hooks/useThoughtCompletion';
import type { PhraseFragment, SemanticCategory } from '../../types/phraseFragments';

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

interface CategoryTabProps {
  category: SemanticCategory;
  label: string;
  color: string;
  isActive: boolean;
  isSuggested: boolean;
  onSelect: () => void;
  dwellTime: number;
}

const CategoryTab: React.FC<CategoryTabProps> = ({
  label,
  color,
  isActive,
  isSuggested,
  onSelect,
  dwellTime,
}) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onSelect
  );

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
    </button>
  );
};

// Suggestion button for quick picks and AI completions
interface SuggestionButtonProps {
  text: string;
  onSelect: () => void;
  dwellTime: number;
  variant?: 'fragment' | 'completion';
}

const SuggestionButton: React.FC<SuggestionButtonProps> = ({
  text,
  onSelect,
  dwellTime,
  variant = 'fragment',
}) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onSelect
  );

  const bgColor = variant === 'completion' ? 'bg-emerald-600' : 'bg-cyan-600';
  const hoverColor = variant === 'completion' ? 'hover:bg-emerald-500' : 'hover:bg-cyan-500';

  return (
    <button
      className={`
        relative ${bgColor} text-white rounded-lg px-4 py-3
        font-medium text-lg min-h-[56px] transition-all
        ${hoverColor} whitespace-nowrap
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative z-10">{text}</span>

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
    </button>
  );
};

interface FragmentButtonProps {
  fragment: PhraseFragment;
  onSelect: () => void;
  dwellTime: number;
}

const FragmentButton: React.FC<FragmentButtonProps> = ({ fragment, onSelect, dwellTime }) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onSelect
  );

  // Color coding by commonality
  const getOpacity = () => {
    switch (fragment.commonality) {
      case 'very_common':
        return 'opacity-100';
      case 'common':
        return 'opacity-90';
      case 'uncommon':
        return 'opacity-75';
      case 'specialized':
        return 'opacity-60';
      default:
        return 'opacity-100';
    }
  };

  return (
    <button
      className={`
        relative bg-blue-600 text-white rounded-lg px-4 py-3
        font-medium text-lg min-h-[60px] transition-all
        hover:bg-blue-500 ${getOpacity()}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="relative z-10">{fragment.text}</span>

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
    </button>
  );
};


export const PhraseBuilder: React.FC = () => {
  const { dwellTime, enableAI } = useSettingsStore();
  const { speak, isSpeaking, isLoading: ttsLoading } = useTextToSpeech();
  const { addMessage } = useConversationStore();

  const {
    currentSelection,
    activeCategory,
    addFragment,
    removeLastFragment,
    clearSelection,
    setCurrentSelection,
    saveBuiltPhrase,
    setActiveCategory,
    getSuggestedCategory,
    getFragmentsBySemanticCategory,
    getSuggestedFragments,
  } = usePhraseFragmentStore();

  // AI predictions for sentence completion
  const {
    predictions: aiPredictions,
    isLoading: aiLoading,
    triggerPredictions,
    clearPredictions,
  } = useThoughtCompletion({
    minCharacters: 1,
    maxPredictions: 6,
    debounceMs: 600,
    enabled: enableAI,
  });

  const [showSaved, setShowSaved] = useState(false);

  const suggestedCategory = getSuggestedCategory();

  // Get smart fragment suggestions based on current type
  const smartSuggestions = getSuggestedFragments(currentSelection.currentType).slice(0, 6);

  // Trigger AI predictions when preview text changes
  useEffect(() => {
    if (currentSelection.previewText && enableAI) {
      triggerPredictions(currentSelection.previewText);
    } else {
      clearPredictions();
    }
  }, [currentSelection.previewText, enableAI, triggerPredictions, clearPredictions]);

  const handleSelectFragment = (fragment: PhraseFragment) => {
    // Check if there's AI-appended text that would be lost
    const currentPreview = currentSelection.previewText;
    const fragmentsText = currentSelection.fragments.map(f => f.text).join(' ');
    const hasExtraText = currentPreview.length > fragmentsText.length + 1; // +1 for capitalization

    // Add the fragment to the store
    addFragment(fragment);

    // If there was extra text (from AI), preserve it by appending to the new fragment
    if (hasExtraText) {
      // Get the extra text that was appended (AI suggestions)
      const extraText = currentPreview.slice(fragmentsText.length).trim();
      // Get the updated state after addFragment
      const updatedSelection = usePhraseFragmentStore.getState().currentSelection;
      // Combine: new fragments text + extra text + new fragment
      const combinedText = updatedSelection.previewText + ' ' + extraText;
      setCurrentSelection({
        ...updatedSelection,
        previewText: combinedText.charAt(0).toUpperCase() + combinedText.slice(1).trim(),
      });
    }

    // Auto-advance to suggested category after selection
    const nextSuggested = getSuggestedCategory();
    setActiveCategory(nextSuggested);
  };

  const handleSelectAIPrediction = (text: string) => {
    // Append AI completion to existing sentence (no punctuation, keep building)
    const currentText = currentSelection.previewText;
    const newText = currentText
      ? `${currentText} ${text}`.trim()
      : text;

    // Keep building - don't mark as complete, keep suggestions flowing
    setCurrentSelection({
      fragments: currentSelection.fragments,
      currentType: currentSelection.currentType,
      previewText: newText.charAt(0).toUpperCase() + newText.slice(1),
      isComplete: false,
    });
  };

  const handleCategorySelect = (category: SemanticCategory) => {
    setActiveCategory(category);
  };

  // Get fragments for the active semantic category
  const availableFragments = getFragmentsBySemanticCategory(activeCategory);

  const handleSpeak = () => {
    console.log('handleSpeak called', {
      previewText: currentSelection.previewText,
      isSpeaking,
      ttsLoading
    });
    if (currentSelection.previewText && !isSpeaking && !ttsLoading) {
      console.log('Speaking:', currentSelection.previewText);
      speak(currentSelection.previewText);

      // Add to conversation history
      addMessage(currentSelection.previewText, 'starter');
    }
  };

  const handleSave = () => {
    if (currentSelection.fragments.length > 0) {
      saveBuiltPhrase();
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  const handleClear = () => {
    clearSelection();
  };

  const handleUndo = () => {
    removeLastFragment();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 p-4 space-y-4">
      {/* Preview Area - Compact */}
      <div className="bg-slate-800 rounded-lg p-4 border-2 border-slate-700">
        <div className="flex items-center justify-between gap-4">
          {/* Preview Text */}
          <div className="flex-1 text-xl font-medium text-white min-h-[40px] flex items-center">
            {currentSelection.previewText || (
              <span className="text-slate-600 italic text-base">Select fragments to build...</span>
            )}
          </div>

          {/* Action Buttons - Inline */}
          <div className="flex gap-2 shrink-0">
          <ActionButton
            label="↩ Undo"
            onClick={handleUndo}
            disabled={currentSelection.fragments.length === 0}
            bgColor="bg-yellow-600"
            dwellTime={dwellTime}
          />
          <ActionButton
            label="✕ Clear"
            onClick={handleClear}
            disabled={currentSelection.fragments.length === 0}
            bgColor="bg-red-600"
            dwellTime={dwellTime}
          />
          <ActionButton
            label={showSaved ? '✓ Saved!' : '💾 Save'}
            onClick={handleSave}
            disabled={currentSelection.fragments.length === 0 || showSaved}
            bgColor={showSaved ? 'bg-green-700' : 'bg-purple-600'}
            dwellTime={dwellTime}
          />
          <ActionButton
            label={
              isSpeaking
                ? '🔊 Speaking...'
                : ttsLoading
                ? '⏳ Loading...'
                : '🔊 Speak'
            }
            onClick={handleSpeak}
            disabled={!currentSelection.previewText || isSpeaking || ttsLoading}
            bgColor="bg-green-600"
            dwellTime={dwellTime}
          />
          </div>
        </div>
      </div>

      {/* Predictions Row - Quick Picks + AI Suggestions combined */}
      {(smartSuggestions.length > 0 || aiPredictions.length > 0) && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {/* Smart Fragment Suggestions */}
          {smartSuggestions.map(({ fragment }) => (
            <SuggestionButton
              key={fragment.id}
              text={fragment.text}
              onSelect={() => handleSelectFragment(fragment)}
              dwellTime={dwellTime}
              variant="fragment"
            />
          ))}

          {/* Divider if both types present */}
          {smartSuggestions.length > 0 && aiPredictions.length > 0 && (
            <div className="w-px bg-slate-600 mx-1 self-stretch" />
          )}

          {/* AI Completions */}
          {aiPredictions.map((prediction, index) => (
            <SuggestionButton
              key={`ai-${index}`}
              text={prediction.content}
              onSelect={() => handleSelectAIPrediction(prediction.content)}
              dwellTime={dwellTime}
              variant="completion"
            />
          ))}

          {/* Loading indicator */}
          {aiLoading && (
            <span className="text-xs text-slate-500 animate-pulse self-center px-2">
              thinking...
            </span>
          )}
        </div>
      )}


      {/* Semantic Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORY_CONFIG.map(({ category, label, color }) => (
          <CategoryTab
            key={category}
            category={category}
            label={label}
            color={color}
            isActive={activeCategory === category}
            isSuggested={suggestedCategory === category}
            onSelect={() => handleCategorySelect(category)}
            dwellTime={dwellTime}
          />
        ))}
      </div>

      {/* Fragment Selection Grid */}
      <div className="flex-1 overflow-y-auto pb-4">
        {availableFragments.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {availableFragments.map((fragment) => (
              <FragmentButton
                key={fragment.id}
                fragment={fragment}
                onSelect={() => handleSelectFragment(fragment)}
                dwellTime={dwellTime}
              />
            ))}
          </div>
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

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  bgColor: string;
  dwellTime: number;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  disabled = false,
  bgColor,
  dwellTime,
}) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onClick,
    !disabled
  );

  // Handle click for browser autoplay policy (dwell doesn't count as user interaction)
  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <button
      className={`
        relative ${bgColor} text-white rounded-lg px-4 py-3
        font-medium text-base min-h-[60px] transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className="relative z-10">{label}</span>

      {/* Dwell progress indicator */}
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
