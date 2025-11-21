/**
 * PhraseBuilder Component
 *
 * Visual interface for building custom phrases by selecting and combining fragments.
 * Users dwell on fragments to add them to their sentence, building it piece by piece.
 */

import { useState } from 'react';
import { usePhraseFragmentStore } from '../../store/phraseFragmentStore';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useConversationStore } from '../../store/conversationStore';
import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import type { PhraseFragment, FragmentType } from '../../types/phraseFragments';

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

interface CategorySectionProps {
  title: string;
  fragments: PhraseFragment[];
  onSelectFragment: (fragment: PhraseFragment) => void;
  dwellTime: number;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  fragments,
  onSelectFragment,
  dwellTime,
}) => {
  if (fragments.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {fragments.map((fragment) => (
          <FragmentButton
            key={fragment.id}
            fragment={fragment}
            onSelect={() => onSelectFragment(fragment)}
            dwellTime={dwellTime}
          />
        ))}
      </div>
    </div>
  );
};

export const PhraseBuilder: React.FC = () => {
  const { dwellTime } = useSettingsStore();
  const { speak, isSpeaking, isLoading } = useTextToSpeech();
  const { addMessage } = useConversationStore();

  const {
    currentSelection,
    addFragment,
    removeLastFragment,
    clearSelection,
    saveBuiltPhrase,
    getFragmentsByType,
  } = usePhraseFragmentStore();

  const [showSaved, setShowSaved] = useState(false);

  const handleSelectFragment = (fragment: PhraseFragment) => {
    addFragment(fragment);
  };

  const handleSpeak = () => {
    if (currentSelection.previewText && !isSpeaking && !isLoading) {
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

  // Get fragments for current step
  const currentType = currentSelection.currentType;
  const availableFragments = currentType ? getFragmentsByType(currentType) : [];

  // Organize fragments by category for better display
  const fragmentsByCategory: Record<string, PhraseFragment[]> = {};
  availableFragments.forEach((fragment) => {
    if (!fragmentsByCategory[fragment.category]) {
      fragmentsByCategory[fragment.category] = [];
    }
    fragmentsByCategory[fragment.category].push(fragment);
  });

  // Get type label for current step
  const getTypeLabel = (type: FragmentType | null): string => {
    if (!type) return 'Complete!';
    const labels: Record<FragmentType, string> = {
      subject: 'Who? (Subject)',
      verb: 'What? (Action/Feeling)',
      auxiliary: 'Helper verb (will/can/do)',
      negation: 'Negative (not/never/don\'t)',
      interrogative: 'Question word (what/why/how)',
      object: 'About what? (Topic)',
      topic: 'About what? (Topic)',
      modifier: 'How? (Modifier)',
      emotion: 'What feeling? (Emotion)',
      connector: 'Connect (and/but/because)',
    };
    return labels[type] || type;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 p-4 space-y-4">
      {/* Preview Area */}
      <div className="bg-slate-800 rounded-lg p-6 border-2 border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-400 uppercase">
            Building:
          </h2>
          {currentSelection.fragments.length > 0 && (
            <div className="flex gap-2">
              <span className="text-xs text-slate-500">
                {currentSelection.fragments.length} fragment{currentSelection.fragments.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Preview Text */}
        <div className="text-2xl md:text-3xl font-medium text-white min-h-[60px] flex items-center">
          {currentSelection.previewText || (
            <span className="text-slate-600 italic">Select fragments to build your phrase...</span>
          )}
        </div>

        {/* Selected Fragments as Chips */}
        {currentSelection.fragments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {currentSelection.fragments.map((fragment, index) => (
              <span
                key={`${fragment.id}-${index}`}
                className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30"
              >
                {fragment.text}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
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
                : isLoading
                ? '⏳ Loading...'
                : '🔊 Speak'
            }
            onClick={handleSpeak}
            disabled={!currentSelection.previewText || isSpeaking || isLoading}
            bgColor="bg-green-600"
            dwellTime={dwellTime}
          />
        </div>
      </div>

      {/* Current Step Indicator */}
      {currentType && (
        <div className="bg-blue-600/20 border-2 border-blue-500 rounded-lg p-3 text-center">
          <p className="text-lg font-semibold text-blue-300">
            {getTypeLabel(currentType)}
          </p>
        </div>
      )}

      {currentSelection.isComplete && !currentType && currentSelection.fragments.length > 0 && (
        <div className="bg-green-600/20 border-2 border-green-500 rounded-lg p-3 text-center">
          <p className="text-lg font-semibold text-green-300">
            ✓ Phrase complete! You can speak it, save it, or add more fragments.
          </p>
        </div>
      )}

      {/* Fragment Selection Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {currentType ? (
          <>
            {Object.entries(fragmentsByCategory).map(([category, fragments]) => (
              <CategorySection
                key={category}
                title={category.replace('_', ' ')}
                fragments={fragments}
                onSelectFragment={handleSelectFragment}
                dwellTime={dwellTime}
              />
            ))}
          </>
        ) : currentSelection.fragments.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <p className="text-xl mb-2">Build custom phrases by combining fragments</p>
            <p className="text-sm">Start by selecting who or what your sentence is about</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-400 text-center">
              Your phrase is complete! Add more fragments to expand it, or speak/save it.
            </p>

            {/* Show all fragment types as optional additions */}
            <div className="grid grid-cols-2 gap-2">
              {(['modifier', 'connector', 'emotion'] as FragmentType[]).map((type) => (
                <button
                  key={type}
                  className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-3 text-sm font-medium"
                  onClick={() => {
                    // This is a simplification - ideally we'd have a better UI for this
                    // Future enhancement: allow manual type selection
                  }}
                >
                  + Add {type}
                </button>
              ))}
            </div>
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

  return (
    <button
      className={`
        relative ${bgColor} text-white rounded-lg px-4 py-3
        font-medium text-base min-h-[60px] transition-all
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
