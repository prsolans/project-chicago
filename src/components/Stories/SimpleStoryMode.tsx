/**
 * Simple Story Mode
 * Create and play back stories without complex parsing
 */

import { useState, useEffect, useRef } from 'react';
import { useStoryStore } from '../../store/simpleStoryStore';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import { parseEmotionTags, getTagSuggestions, EMOTION_TAGS } from '../../utils/emotionTags';
import type { Story } from '../../types/database';
import type { EmotionTag } from '../../utils/emotionTags';
import {
  Plus,
  Play,
  Edit,
  Trash2,
  ArrowLeft,
  SkipBack,
  SkipForward,
  Volume2,
  Save,
} from 'lucide-react';

type ViewMode = 'list' | 'editor' | 'playback';

export const SimpleStoryMode = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const { loadStories } = useStoryStore();

  // Load stories on mount
  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const handlePlayStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    setViewMode('playback');
  };

  const handleEditStory = (storyId: string) => {
    setSelectedStoryId(storyId);
    setViewMode('editor');
  };

  const handleCreateNew = () => {
    setSelectedStoryId(null);
    setViewMode('editor');
  };

  const handleBackToList = () => {
    setSelectedStoryId(null);
    setViewMode('list');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-900">
      {viewMode === 'list' && (
        <StoryList
          onPlay={handlePlayStory}
          onEdit={handleEditStory}
          onCreate={handleCreateNew}
        />
      )}

      {viewMode === 'editor' && (
        <StoryEditor
          storyId={selectedStoryId}
          onBack={handleBackToList}
          onPlay={handlePlayStory}
        />
      )}

      {viewMode === 'playback' && selectedStoryId && (
        <StoryPlayback
          storyId={selectedStoryId}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

/**
 * Story List
 */
interface StoryListProps {
  onPlay: (id: string) => void;
  onEdit: (id: string) => void;
  onCreate: () => void;
}

const StoryList = ({ onPlay, onEdit, onCreate }: StoryListProps) => {
  const { stories, removeStory } = useStoryStore();
  const { dwellTime } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = stories.filter(story => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      story.title.toLowerCase().includes(q) ||
      story.description?.toLowerCase().includes(q) ||
      story.content.toLowerCase().includes(q)
    );
  });

  const sortedStories = [...filteredStories].sort((a, b) => {
    if (a.last_used_at && b.last_used_at) {
      return new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime();
    }
    if (a.last_used_at) return -1;
    if (b.last_used_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">My Stories</h2>
          <DwellButton
            icon={Plus}
            label="New Story"
            onClick={onCreate}
            dwellTime={dwellTime}
            color="bg-green-600 hover:bg-green-500"
          />
        </div>
        <input
          type="text"
          placeholder="Search stories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 border border-slate-600"
        />
      </div>

      {/* Stories */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {sortedStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Plus className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-xl">No stories yet</p>
            <p className="text-sm">Create your first story to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedStories.map(story => (
              <StoryCard
                key={story.id}
                story={story}
                onPlay={() => onPlay(story.id)}
                onEdit={() => onEdit(story.id)}
                onDelete={() => {
                  if (confirm(`Delete "${story.title}"?`)) {
                    removeStory(story.id);
                  }
                }}
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
 * Story Card
 */
interface StoryCardProps {
  story: Story;
  onPlay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  dwellTime: number;
}

const StoryCard = ({ story, onPlay, onEdit, onDelete, dwellTime }: StoryCardProps) => {
  const lineCount = story.content.split('\n').filter(l => l.trim()).length;

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{story.title}</h3>
      {story.description && (
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{story.description}</p>
      )}
      <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
        <span>{lineCount} lines</span>
        {story.usage_count > 0 && <span>Used {story.usage_count}x</span>}
      </div>
      <div className="flex gap-2">
        <DwellButton icon={Play} label="Play" onClick={onPlay} dwellTime={dwellTime} color="bg-blue-600 hover:bg-blue-500" className="flex-1" />
        <DwellButton icon={Edit} label="Edit" onClick={onEdit} dwellTime={dwellTime} color="bg-slate-600 hover:bg-slate-500" />
        <DwellButton icon={Trash2} label="Delete" onClick={onDelete} dwellTime={dwellTime} color="bg-red-600 hover:bg-red-500" />
      </div>
    </div>
  );
};

/**
 * Story Editor
 */
interface StoryEditorProps {
  storyId: string | null;
  onBack: () => void;
  onPlay: (id: string) => void;
}

const StoryEditor = ({ storyId, onBack, onPlay }: StoryEditorProps) => {
  const { getStoryById, createNewStory, updateExistingStory } = useStoryStore();
  const { dwellTime } = useSettingsStore();

  const story = storyId ? getStoryById(storyId) : null;

  const [title, setTitle] = useState(story?.title || '');
  const [content, setContent] = useState(story?.content || '');
  const [description, setDescription] = useState(story?.description || '');
  const [category, setCategory] = useState(story?.category || '');
  const [error, setError] = useState('');

  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [suggestions, setSuggestions] = useState<EmotionTag[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Check if we should show autocomplete
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newContent.slice(0, cursorPos);

    // Find the last '[' before cursor
    const lastBracketIndex = textBeforeCursor.lastIndexOf('[');

    if (lastBracketIndex !== -1) {
      // Check if there's a closing bracket after the opening one
      const textAfterBracket = textBeforeCursor.slice(lastBracketIndex + 1);
      const hasClosingBracket = textAfterBracket.includes(']');

      if (!hasClosingBracket) {
        // We're inside a tag, show autocomplete
        const partial = textAfterBracket;
        const filteredSuggestions = partial.length > 0
          ? getTagSuggestions(partial)
          : EMOTION_TAGS;

        if (filteredSuggestions.length > 0) {
          setSuggestions(filteredSuggestions);
          setSelectedSuggestionIndex(0);
          setShowAutocomplete(true);

          // Calculate position for autocomplete dropdown
          if (textareaRef.current) {
            const textarea = textareaRef.current;
            const rect = textarea.getBoundingClientRect();
            setAutocompletePosition({
              top: rect.top + 40,
              left: rect.left + 20,
            });
          }
        } else {
          setShowAutocomplete(false);
        }
      } else {
        setShowAutocomplete(false);
      }
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showAutocomplete) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertTag(suggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };

  const insertTag = (tag: EmotionTag) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.slice(0, cursorPos);
    const textAfterCursor = content.slice(cursorPos);

    // Find the last '[' before cursor
    const lastBracketIndex = textBeforeCursor.lastIndexOf('[');

    if (lastBracketIndex !== -1) {
      const beforeBracket = content.slice(0, lastBracketIndex);
      const newContent = beforeBracket + tag.label + '] ' + textAfterCursor;
      setContent(newContent);

      // Move cursor after the inserted tag
      setTimeout(() => {
        const newCursorPos = lastBracketIndex + tag.label.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }

    setShowAutocomplete(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Story content is required');
      return;
    }

    try {
      if (storyId) {
        await updateExistingStory(storyId, title, content, description, category);
        alert('Story saved!');
      } else {
        const newStory = await createNewStory(title, content, description, category);
        alert('Story created!');
        onPlay(newStory.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-6 py-5 border-b border-slate-700/50 flex items-center gap-4">
        <DwellButton icon={ArrowLeft} label="Back" onClick={onBack} dwellTime={dwellTime} color="bg-slate-700 hover:bg-slate-600" />
        <h2 className="text-2xl font-bold text-white">{story ? 'Edit Story' : 'New Story'}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Story"
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description"
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600"
            >
              <option value="">Select category</option>
              <option value="memory">Memory</option>
              <option value="joke">Joke</option>
              <option value="teaching">Teaching</option>
              <option value="observation">Observation</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-slate-300 font-medium mb-2">Story *</label>
            <p className="text-sm text-slate-400 mb-2">
              Type your story. Press Enter to create line breaks for pausing during playback.
              <br />
              <span className="text-blue-400">Tip: Type [ to add emotion tags like [excited], [laughs], [fast], etc.</span>
            </p>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your story here..."
              rows={15}
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white border border-slate-600 font-mono resize-none"
            />

            {/* Autocomplete Dropdown */}
            {showAutocomplete && (
              <div
                className="fixed z-50 bg-slate-800 border-2 border-blue-500 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                style={{
                  top: `${autocompletePosition.top}px`,
                  left: `${autocompletePosition.left}px`,
                  minWidth: '300px',
                }}
              >
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={suggestion.tag}
                    onClick={() => insertTag(suggestion)}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                      idx === selectedSuggestionIndex ? 'bg-blue-600 text-white' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold">{suggestion.label}</span>
                      <span className="text-xs opacity-75">- {suggestion.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <DwellButton
            icon={Save}
            label="Save Story"
            onClick={handleSave}
            dwellTime={dwellTime}
            color="bg-green-600 hover:bg-green-500"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Story Playback
 */
interface StoryPlaybackProps {
  storyId: string;
  onBack: () => void;
}

const StoryPlayback = ({ storyId, onBack }: StoryPlaybackProps) => {
  const {
    startPlayback,
    stopPlayback,
    nextLine,
    previousLine,
    jumpToLine,
    getCurrentStory,
    getCurrentLines,
    getCurrentLine,
    currentLineIndex,
    trackStoryUsage,
  } = useStoryStore();

  const { speak, stop: stopSpeaking, isSpeaking } = useTextToSpeech();
  const { dwellTime } = useSettingsStore();

  useEffect(() => {
    startPlayback(storyId);
    trackStoryUsage(storyId);

    return () => {
      stopPlayback();
      stopSpeaking();
    };
  }, [storyId]);

  const story = getCurrentStory();
  const lines = getCurrentLines();
  const currentLine = getCurrentLine();
  const isFirst = currentLineIndex === 0;
  const isLast = currentLineIndex === lines.length - 1;

  if (!story) return <div className="text-white p-8">Story not found</div>;

  const handleSpeak = () => {
    if (currentLine) {
      // Parse emotion tags from the line
      const { displayText, emotionSettings } = parseEmotionTags(currentLine);

      // Speak with emotion settings
      speak(displayText, { emotionSettings });
    }
  };

  // Parse the current line to show with tags
  const parsedLine = currentLine ? parseEmotionTags(currentLine) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-slate-700/50 flex items-center gap-4">
        <DwellButton icon={ArrowLeft} label="Back" onClick={onBack} dwellTime={dwellTime} color="bg-slate-700 hover:bg-slate-600" />
        <div>
          <h2 className="text-2xl font-bold text-white">{story.title}</h2>
          {story.description && <p className="text-sm text-slate-400">{story.description}</p>}
        </div>
      </div>

      {/* Current Line Display */}
      <div className="flex-1 flex items-center justify-center px-12 py-8">
        <div className="max-w-4xl w-full">
          {/* Progress */}
          <div className="text-center mb-6">
            <p className="text-slate-400 text-lg">
              Line {currentLineIndex + 1} of {lines.length}
            </p>
            <div className="w-full bg-slate-700 h-2 rounded-full mt-2">
              <div
                className="bg-blue-500 h-full rounded-full transition-all"
                style={{ width: `${((currentLineIndex + 1) / lines.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Line */}
          <div className="bg-slate-800 rounded-2xl p-12 border-2 border-slate-700">
            <p className="text-white text-lg leading-relaxed text-center">
              {parsedLine?.displayText || currentLine}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 px-6 py-6 border-t border-slate-700/50">
        <div className="flex items-center justify-center gap-4 mb-4">
          <DwellButton
            icon={SkipBack}
            label="Previous"
            onClick={previousLine}
            dwellTime={dwellTime}
            color="bg-slate-600 hover:bg-slate-500"
            disabled={isFirst}
          />
          <DwellButton
            icon={Volume2}
            label="Speak"
            onClick={handleSpeak}
            dwellTime={dwellTime}
            color="bg-blue-600 hover:bg-blue-500"
            disabled={isSpeaking}
            className="px-8"
          />
          <DwellButton
            icon={SkipForward}
            label="Next"
            onClick={nextLine}
            dwellTime={dwellTime}
            color="bg-slate-600 hover:bg-slate-500"
            disabled={isLast}
          />
        </div>

        {/* Line Navigator */}
        <div className="flex flex-wrap gap-2 justify-center">
          {lines.map((_, idx) => (
            <LineNumberButton
              key={idx}
              number={idx + 1}
              isActive={idx === currentLineIndex}
              onClick={() => jumpToLine(idx)}
              dwellTime={dwellTime}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Dwell Button Component
 */
interface DwellButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  dwellTime: number;
  color: string;
  disabled?: boolean;
  className?: string;
}

const DwellButton = ({ icon: Icon, label, onClick, dwellTime, color, disabled = false, className = '' }: DwellButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(dwellTime, onClick, !disabled);

  return (
    <button
      className={`relative flex items-center gap-3 px-8 py-6 rounded-lg text-white font-semibold text-lg transition-all cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : color
      } ${className}`}
      onMouseEnter={disabled ? undefined : handleMouseEnter}
      onMouseLeave={disabled ? undefined : handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {progress > 0 && !disabled && (
        <div
          className="absolute inset-0 rounded-lg border-4 border-yellow-400 pointer-events-none"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}
      <Icon className="w-7 h-7 relative z-10" />
      <span className="relative z-10">{label}</span>
    </button>
  );
};

/**
 * Line Number Button with Dwell Detection
 */
interface LineNumberButtonProps {
  number: number;
  isActive: boolean;
  onClick: () => void;
  dwellTime: number;
}

const LineNumberButton = ({ number, isActive, onClick, dwellTime }: LineNumberButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(dwellTime, onClick);

  return (
    <button
      className={`relative px-4 py-3 rounded text-base font-medium transition-all cursor-pointer ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {progress > 0 && !isActive && (
        <div
          className="absolute inset-0 rounded border-4 border-yellow-400 pointer-events-none"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}
      <span className="relative z-10">{number}</span>
    </button>
  );
};
