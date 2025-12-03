import { useState, useEffect } from 'react';
import { MessageDisplay } from './components/MessageDisplay/MessageDisplay';
import { CategoryPhrasesPanel } from './components/Categories/CategoryPhrasesPanel';
import { StartersPanel } from './components/Starters/StartersPanel';
import { PhraseBuilder } from './components/PhraseBuilder/PhraseBuilder';
import { ThoughtCompletionBar } from './components/Predictions/ThoughtCompletionBar';
import { AdminPanel } from './components/Admin/AdminPanel';
import { SimpleStoryMode } from './components/Stories/SimpleStoryMode';
import { useSettingsStore } from './store/settingsStore';
import { useMessageStore } from './store/messageStore';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useThoughtCompletion } from './hooks/useThoughtCompletion';
import { useDwellDetection } from './hooks/useDwellDetection';
import { initializePhraseLibrary } from './store/phraseLibraryStore';
import type { AIPrediction } from './types/conversation';
import { Star, Edit, Blocks, BookOpen } from 'lucide-react';

function App() {
  const [showCategories, setShowCategories] = useState(false);
  const [activeTab, setActiveTab] = useState<'type' | 'build' | 'quick' | 'ask'>('quick');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isViewingPhrases, setIsViewingPhrases] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(() => {
    // Check if already unlocked this session
    return sessionStorage.getItem('audioUnlocked') === 'true';
  });
  const { enableAI, dwellTime } = useSettingsStore();
  const { message, setMessage, sendMessage } = useMessageStore();
  const { speak } = useTextToSpeech();

  // AI Thought completion predictions (moved from Keyboard)
  const {
    predictions,
    isLoading: isPredictionsLoading,
    triggerPredictions,
  } = useThoughtCompletion({
    minCharacters: 0, // Allow predictions even for empty input (first word predictions)
    maxPredictions: 8,
    debounceMs: 400,
    enabled: enableAI,
  });

  // Always trigger predictions (including for empty messages to show starter words)
  useEffect(() => {
    triggerPredictions(message);
  }, [message, triggerPredictions]);

  // Auto-switch to type tab when user types on keyboard
  useEffect(() => {
    if (message.length > 0 && activeTab !== 'type') {
      setActiveTab('type');
    }
  }, [message, activeTab]);

  // Initialize phrase library on mount
  useEffect(() => {
    initializePhraseLibrary();
  }, []);

  // Keyboard shortcut to open admin panel (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminPanel(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle unlocking audio (required for browser autoplay policy)
  const handleUnlockAudio = () => {
    // Play silent audio to unlock audio context
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    silentAudio.play().catch(() => {});

    // Also unlock Web Speech API
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(utterance);
      window.speechSynthesis.cancel();
    }

    sessionStorage.setItem('audioUnlocked', 'true');
    setAudioUnlocked(true);
  };

  /**
   * Handle AI prediction selection
   * Smart replacement: only replace last word if prediction completes it
   */
  const handlePredictionSelect = (prediction: AIPrediction) => {
    const currentMessage = message.trimEnd();
    const words = currentMessage.split(' ');
    const lastWord = words[words.length - 1] || '';
    const predictionLower = prediction.content.toLowerCase();
    const lastWordLower = lastWord.toLowerCase();

    // Check if prediction starts with or contains the last word
    // This indicates it's a completion/replacement (e.g., "wh" → "what")
    const isCompletion = predictionLower.startsWith(lastWordLower) && lastWord.length > 0;

    let newMessage;
    if (isCompletion) {
      // Replace the last word with the prediction
      words.pop();
      words.push(prediction.content);
      newMessage = words.join(' ');
    } else {
      // Append the prediction after the current message
      const separator = currentMessage.length > 0 ? ' ' : '';
      newMessage = currentMessage + separator + prediction.content;
    }

    setMessage(newMessage, 'predicted');
  };

  /**
   * Handle category phrase selection
   * When user selects a phrase, immediately speak it
   */
  const handlePhraseSelect = (phrase: string) => {
    setMessage(phrase, 'category');
    sendMessage('category');
    speak(phrase);
  };

  // Dwell detection for tabs
  const typeTab = useDwellDetection(dwellTime, () => setActiveTab('type'));
  const buildTab = useDwellDetection(dwellTime, () => setActiveTab('build'));
  const quickTab = useDwellDetection(dwellTime, () => setActiveTab('quick'));
  const askTab = useDwellDetection(dwellTime, () => setActiveTab('ask'));

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Header - Smaller overall, hidden completely on phrase pages */}
      {!(activeTab === 'quick' && isViewingPhrases) && (
        <header className="flex items-center justify-center px-6 py-4 border-b border-slate-700/50 bg-slate-900/95">
          <h1 className="text-4xl font-bold text-white tracking-tight">HelloFriend</h1>
        </header>
      )}

      {/* Main Content Area - 10% margins on left/right */}
      <div className="flex-1 flex flex-col overflow-hidden px-[10%]">
        {/* Tabbed Section */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex flex-col max-h-full flex-1">
            {/* Tab Buttons - Same 80% width container */}
            <div className="flex border-b border-slate-700/50 flex-shrink-0 rounded-t-lg overflow-hidden">
              <button
                onMouseEnter={typeTab.handleMouseEnter}
                onMouseLeave={typeTab.handleMouseLeave}
                className={`
                  relative flex-1 flex items-center justify-center gap-2 px-6 py-4
                  transition-colors cursor-pointer
                  ${activeTab === 'type'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }
                `}
              >
                {typeTab.progress > 0 && activeTab !== 'type' && (
                  <div
                    className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
                    style={{
                      background: `conic-gradient(#facc15 ${typeTab.progress}%, transparent ${typeTab.progress}%)`,
                      opacity: 0.3,
                    }}
                  />
                )}
                <Edit className="w-5 h-5 relative z-10" />
                <span className="text-base font-semibold relative z-10">Type</span>
              </button>

              <button
                onMouseEnter={buildTab.handleMouseEnter}
                onMouseLeave={buildTab.handleMouseLeave}
                className={`
                  relative flex-1 flex items-center justify-center gap-2 px-6 py-4
                  transition-colors cursor-pointer
                  ${activeTab === 'build'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }
                `}
              >
                {buildTab.progress > 0 && activeTab !== 'build' && (
                  <div
                    className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
                    style={{
                      background: `conic-gradient(#facc15 ${buildTab.progress}%, transparent ${buildTab.progress}%)`,
                      opacity: 0.3,
                    }}
                  />
                )}
                <Blocks className="w-5 h-5 relative z-10" />
                <span className="text-base font-semibold relative z-10">Build</span>
              </button>

              <button
                onMouseEnter={quickTab.handleMouseEnter}
                onMouseLeave={quickTab.handleMouseLeave}
                className={`
                  relative flex-1 flex items-center justify-center gap-2 px-6 py-4
                  transition-colors cursor-pointer
                  ${activeTab === 'quick'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }
                `}
              >
                {quickTab.progress > 0 && activeTab !== 'quick' && (
                  <div
                    className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
                    style={{
                      background: `conic-gradient(#facc15 ${quickTab.progress}%, transparent ${quickTab.progress}%)`,
                      opacity: 0.3,
                    }}
                  />
                )}
                <Star className="w-5 h-5 relative z-10" />
                <span className="text-base font-semibold relative z-10">Quick</span>
              </button>

              <button
                onMouseEnter={askTab.handleMouseEnter}
                onMouseLeave={askTab.handleMouseLeave}
                className={`
                  relative flex-1 flex items-center justify-center gap-2 px-6 py-4
                  transition-colors cursor-pointer
                  ${activeTab === 'ask'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }
                `}
              >
                {askTab.progress > 0 && activeTab !== 'ask' && (
                  <div
                    className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
                    style={{
                      background: `conic-gradient(#facc15 ${askTab.progress}%, transparent ${askTab.progress}%)`,
                      opacity: 0.3,
                    }}
                  />
                )}
                <BookOpen className="w-5 h-5 relative z-10" />
                <span className="text-base font-semibold relative z-10">Stories</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full">
                {activeTab === 'type' && (
                  <div className="py-8 flex flex-col gap-8 h-full overflow-y-auto">
                    {/* AI Predictions */}
                    {(predictions.length > 0 || isPredictionsLoading) && (
                      <ThoughtCompletionBar
                        predictions={predictions}
                        onSelectPrediction={handlePredictionSelect}
                        isLoading={isPredictionsLoading}
                      />
                    )}

                    {/* Message Display */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                      <div className="w-full">
                        <MessageDisplay />
                      </div>
                      <p className="text-slate-500 text-sm">Use your Tobii system keyboard to type</p>
                    </div>
                  </div>
                )}

                {activeTab === 'build' && (
                  <div className="h-full py-4">
                    <PhraseBuilder />
                  </div>
                )}

                {activeTab === 'quick' && (
                  <div className="py-4 h-full overflow-y-auto">
                    <StartersPanel onCategoryChange={(hasCategory) => setIsViewingPhrases(hasCategory)} />
                  </div>
                )}

                {activeTab === 'ask' && (
                  <div className="h-full py-4">
                    <SimpleStoryMode />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Full Screen Category Phrases Overlay */}
      {showCategories && (
        <CategoryPhrasesPanel
          onSelectPhrase={handlePhraseSelect}
          isFullScreen={true}
          onClose={() => setShowCategories(false)}
        />
      )}

      {/* Admin Panel (Ctrl+Shift+A) */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* Audio Unlock Overlay - Required for browser autoplay policy */}
      {!audioUnlocked && (
        <div
          className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center cursor-pointer"
          onClick={handleUnlockAudio}
        >
          <div className="text-center p-12 max-w-lg">
            <div className="text-6xl mb-6">👋</div>
            <h2 className="text-4xl font-bold text-white mb-4">Welcome to HelloFriend</h2>
            <p className="text-xl text-slate-300 mb-8">
              Tap anywhere to enable voice
            </p>
            <div className="inline-block bg-blue-600 text-white text-2xl font-semibold px-8 py-4 rounded-xl">
              Tap to Begin
            </div>

            {/* What's New Section */}
            <div className="mt-10 pt-8 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-slate-400 mb-3">What's New</h3>
              <ul className="text-slate-400 text-base text-left space-y-2">
                <li>• Expressive voice with [laughs], [whispers], [excited] tags</li>
                <li>• Improved Build mode with categories and suggestions</li>
                <li>• Better accessibility layout and punctuation buttons</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
