/**
 * Simple Story Mode
 * Create and play back stories without complex parsing
 */

import { useState, useEffect } from 'react';
import { useStoryStore } from '../../store/simpleStoryStore';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import { parseEmotionTags } from '../../utils/emotionTags';
import type { Story } from '../../types/database';
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
  X,
  Blocks,
} from 'lucide-react';
import { LineBuilderModal } from './LineBuilderModal';

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

const FILTER_CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'memory', label: 'Memory' },
  { value: 'joke', label: 'Joke' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'observation', label: 'Observation' },
  { value: 'personal', label: 'Personal' },
];

const StoryList = ({ onPlay, onEdit, onCreate }: StoryListProps) => {
  const { stories, removeStory } = useStoryStore();
  const { dwellTime } = useSettingsStore();
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredStories = stories.filter(story => {
    if (!categoryFilter) return true;
    return story.category === categoryFilter;
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
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {FILTER_CATEGORIES.map(cat => (
            <CategoryButton
              key={cat.value}
              label={cat.label}
              isSelected={categoryFilter === cat.value}
              onSelect={() => setCategoryFilter(cat.value)}
              dwellTime={dwellTime}
            />
          ))}
        </div>
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
          <div className="grid grid-cols-2 gap-4">
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
 * Story Editor - Line List Version
 * Build stories line by line using fragment builder
 */
interface StoryEditorProps {
  storyId: string | null;
  onBack: () => void;
  onPlay: (id: string) => void;
}

const STORY_CATEGORIES = [
  { value: '', label: 'None' },
  { value: 'memory', label: 'Memory' },
  { value: 'joke', label: 'Joke' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'observation', label: 'Observation' },
  { value: 'personal', label: 'Personal' },
];

const StoryEditor = ({ storyId, onBack, onPlay }: StoryEditorProps) => {
  const { getStoryById, createNewStory, updateExistingStory } = useStoryStore();
  const { dwellTime } = useSettingsStore();

  const story = storyId ? getStoryById(storyId) : null;

  const [title, setTitle] = useState(story?.title || '');
  const [lines, setLines] = useState<string[]>(() => {
    if (story?.content) {
      return story.content.split('\n').filter(l => l.trim());
    }
    return [];
  });
  const [description, setDescription] = useState(story?.description || '');
  const [category, setCategory] = useState(story?.category || '');
  const [error, setError] = useState('');
  const [showLineBuilder, setShowLineBuilder] = useState(false);
  const [showTitleBuilder, setShowTitleBuilder] = useState(false);

  const handleAddLine = (line: string) => {
    setLines(prev => [...prev, line]);
  };

  const handleSetTitle = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleDeleteLine = (index: number) => {
    setLines(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (lines.length === 0) {
      setError('Add at least one line to your story');
      return;
    }

    const content = lines.join('\n');

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

          {/* Title - Build with fragments */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Title *</label>
            <div className="flex items-center gap-4">
              <div className="flex-1 px-4 py-3 rounded-lg bg-slate-800 text-white border border-slate-600 min-h-[52px] flex items-center">
                {title || <span className="text-slate-500 italic">No title yet</span>}
              </div>
              <DwellButton
                icon={Blocks}
                label="Build Title"
                onClick={() => setShowTitleBuilder(true)}
                dwellTime={dwellTime}
                color="bg-purple-600 hover:bg-purple-500"
              />
            </div>
          </div>

          {/* Category - Dwell Buttons */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {STORY_CATEGORIES.map(cat => (
                <CategoryButton
                  key={cat.value}
                  label={cat.label}
                  isSelected={category === cat.value}
                  onSelect={() => setCategory(cat.value)}
                  dwellTime={dwellTime}
                />
              ))}
            </div>
          </div>

          {/* Story Lines */}
          <div>
            <label className="block text-slate-300 font-medium mb-2">Story Lines *</label>
            <p className="text-sm text-slate-400 mb-4">
              Build your story one line at a time. Each line will be spoken separately during playback.
            </p>

            {/* Line List */}
            <div className="space-y-2 mb-4">
              {lines.length === 0 ? (
                <div className="bg-slate-800 rounded-lg p-6 text-center text-slate-500">
                  No lines yet. Click "Build a Line" to start your story.
                </div>
              ) : (
                lines.map((line, index) => (
                  <div
                    key={index}
                    className="bg-slate-800 rounded-lg p-4 flex items-center gap-4 border border-slate-700"
                  >
                    <span className="text-slate-500 font-mono text-sm w-8">{index + 1}.</span>
                    <span className="flex-1 text-white">{line}</span>
                    <DeleteLineButton
                      onClick={() => handleDeleteLine(index)}
                      dwellTime={dwellTime}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Build a Line Button */}
            <DwellButton
              icon={Blocks}
              label="+ Build a Line"
              onClick={() => setShowLineBuilder(true)}
              dwellTime={dwellTime}
              color="bg-blue-600 hover:bg-blue-500"
            />
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

      {/* Line Builder Modal */}
      {showLineBuilder && (
        <LineBuilderModal
          onAddLine={handleAddLine}
          onClose={() => setShowLineBuilder(false)}
          mode="line"
        />
      )}

      {/* Title Builder Modal */}
      {showTitleBuilder && (
        <LineBuilderModal
          onAddLine={handleSetTitle}
          onClose={() => setShowTitleBuilder(false)}
          mode="title"
        />
      )}
    </div>
  );
};

/**
 * Delete Line Button with Dwell
 */
interface DeleteLineButtonProps {
  onClick: () => void;
  dwellTime: number;
}

const DeleteLineButton = ({ onClick, dwellTime }: DeleteLineButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(dwellTime, onClick);

  return (
    <button
      className="relative p-2 rounded bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {progress > 0 && (
        <div
          className="absolute inset-0 rounded border-2 border-yellow-400"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}
      <X className="w-5 h-5 relative z-10" />
    </button>
  );
};

/**
 * Category Button with Dwell Detection
 */
interface CategoryButtonProps {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  dwellTime: number;
}

const CategoryButton = ({ label, isSelected, onSelect, dwellTime }: CategoryButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(dwellTime, onSelect);

  return (
    <button
      className={`relative px-5 py-3 rounded-lg text-base font-medium transition-all cursor-pointer ${
        isSelected
          ? 'bg-blue-600 text-white ring-2 ring-blue-400'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
    >
      {progress > 0 && !isSelected && (
        <div
          className="absolute inset-0 rounded-lg border-4 border-yellow-400 pointer-events-none"
          style={{
            background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
            opacity: 0.3,
          }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
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
