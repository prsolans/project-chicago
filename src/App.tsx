import { useState, useEffect } from 'react';
import { MessageDisplay } from './components/MessageDisplay/MessageDisplay';
import { Keyboard } from './components/Keyboard/Keyboard';
import { ConversationPanel } from './components/ConversationPanel/ConversationPanel';
import { CategoryPhrasesPanel } from './components/Categories/CategoryPhrasesPanel';
import { StartersPanel } from './components/Starters/StartersPanel';
import { ThoughtCompletionBar } from './components/Predictions/ThoughtCompletionBar';
import { AdminPanel } from './components/Admin/AdminPanel';
import { useSettingsStore } from './store/settingsStore';
import { useMessageStore } from './store/messageStore';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useThoughtCompletion } from './hooks/useThoughtCompletion';
import { useDwellDetection } from './hooks/useDwellDetection';
import { initializePhraseLibrary } from './store/phraseLibraryStore';
import type { AIPrediction } from './types/conversation';
import { Bot, MessageSquare, Star, ChevronUp, ChevronDown, Edit } from 'lucide-react';

function App() {
  const [showCategories, setShowCategories] = useState(false);
  const [activeTab, setActiveTab] = useState<'starters' | 'history' | 'message'>('starters');
  const [keyboardVisible, setKeyboardVisible] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { enableAI, setEnableAI, dwellTime } = useSettingsStore();
  const { message, setMessage, sendMessage } = useMessageStore();
  const { speak } = useTextToSpeech();

  // AI Thought completion predictions (moved from Keyboard)
  const {
    predictions,
    isLoading: isPredictionsLoading,
    triggerPredictions,
    clearPredictions,
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

  // Auto-switch to message tab when user types on keyboard
  useEffect(() => {
    if (message.length > 0 && activeTab !== 'message') {
      setActiveTab('message');
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
  const startersTab = useDwellDetection(dwellTime, () => setActiveTab('starters'));
  const historyTab = useDwellDetection(dwellTime, () => setActiveTab('history'));
  const messageTab = useDwellDetection(dwellTime, () => setActiveTab('message'));

  // Dwell detection for keyboard drawer toggle
  const keyboardToggle = useDwellDetection(dwellTime, () => setKeyboardVisible(!keyboardVisible));

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-center px-8 py-6 border-b border-slate-700/50 bg-slate-900/95">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">HelloFriend</h1>
          <p className="text-base text-slate-400 mt-1 font-light">Look. Dwell. Communicate.</p>
        </div>
      </header>

      {/* Main Content Area - Full Width Tabbed */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Section: Tabbed Content - Full Width */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Tabbed Section - Full Width */}
          <div className="flex flex-col max-h-full flex-1">
            {/* Tab Buttons */}
            <div className="flex border-b border-slate-700/50 flex-shrink-0">
              <button
                onMouseEnter={startersTab.handleMouseEnter}
                onMouseLeave={startersTab.handleMouseLeave}
                className={`
                  relative flex-1 flex items-center justify-center gap-2 px-6 py-4
                  transition-colors cursor-pointer
                  ${activeTab === 'starters'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }
                `}
              >
                {startersTab.progress > 0 && activeTab !== 'starters' && (
                  <div
                    className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
                    style={{
                      background: `conic-gradient(#facc15 ${startersTab.progress}%, transparent ${startersTab.progress}%)`,
                      opacity: 0.3,
                    }}
                  />
                )}
                <Star className="w-5 h-5 relative z-10" />
                <span className="text-base font-semibold relative z-10">Starters</span>
              </button>

              <button
                onMouseEnter={historyTab.handleMouseEnter}
                onMouseLeave={historyTab.handleMouseLeave}
                className={`
                  relative flex-1 flex items-center justify-center gap-2 px-6 py-4
                  transition-colors cursor-pointer
                  ${activeTab === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }
                `}
              >
                {historyTab.progress > 0 && activeTab !== 'history' && (
                  <div
                    className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
                    style={{
                      background: `conic-gradient(#facc15 ${historyTab.progress}%, transparent ${historyTab.progress}%)`,
                      opacity: 0.3,
                    }}
                  />
                )}
                <MessageSquare className="w-5 h-5 relative z-10" />
                <span className="text-base font-semibold relative z-10">History</span>
              </button>

              <button
                onMouseEnter={messageTab.handleMouseEnter}
                onMouseLeave={messageTab.handleMouseLeave}
                className={`
                  relative flex-1 flex items-center justify-center gap-2 px-6 py-4
                  transition-colors cursor-pointer
                  ${activeTab === 'message'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                  }
                `}
              >
                {messageTab.progress > 0 && activeTab !== 'message' && (
                  <div
                    className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
                    style={{
                      background: `conic-gradient(#facc15 ${messageTab.progress}%, transparent ${messageTab.progress}%)`,
                      opacity: 0.3,
                    }}
                  />
                )}
                <Edit className="w-5 h-5 relative z-10" />
                <span className="text-base font-semibold relative z-10">Message</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'starters' && (
                <div className="p-6 h-full overflow-y-auto">
                  <StartersPanel />
                </div>
              )}

              {activeTab === 'history' && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 px-8 pt-6 pb-4 flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                    <h2 className="text-white text-xl font-semibold">Your Messages</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <ConversationPanel maxHeight="none" />
                  </div>
                </div>
              )}

              {activeTab === 'message' && (
                <div className="p-8 flex flex-col gap-8 h-full overflow-y-auto">
                  {/* AI Predictions */}
                  {(predictions.length > 0 || isPredictionsLoading) && (
                    <ThoughtCompletionBar
                      predictions={predictions}
                      onSelectPrediction={handlePredictionSelect}
                      isLoading={isPredictionsLoading}
                    />
                  )}

                  {/* Message Display */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-full max-w-4xl">
                      <MessageDisplay />
                    </div>
                  </div>

                  {/* Action Buttons - Space/Delete/Clear/Speak */}
                  <div className="flex justify-center gap-4 pb-4">
                    <Keyboard.ActionButtons />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Keyboard Drawer (Full Width) */}
        {keyboardVisible ? (
          <div className="border-t border-slate-700/50 flex-shrink-0 h-[270px] flex flex-col mb-6">
            {/* Keyboard Toggle Bar */}
            <button
              onMouseEnter={keyboardToggle.handleMouseEnter}
              onMouseLeave={keyboardToggle.handleMouseLeave}
              className="relative w-full bg-slate-800 hover:bg-slate-700 py-2 flex items-center justify-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer border-b border-slate-700/50"
            >
              {keyboardToggle.progress > 0 && (
                <div
                  className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
                  style={{
                    background: `conic-gradient(#facc15 ${keyboardToggle.progress}%, transparent ${keyboardToggle.progress}%)`,
                    opacity: 0.3,
                  }}
                />
              )}
              <ChevronDown className="w-5 h-5 relative z-10" />
              <span className="text-sm font-medium relative z-10">Hide Keyboard</span>
            </button>
            <Keyboard />
          </div>
        ) : (
          <div className="border-t border-slate-700/50 flex-shrink-0 mb-6">
            {/* Collapsed Keyboard Drawer */}
            <button
              onMouseEnter={keyboardToggle.handleMouseEnter}
              onMouseLeave={keyboardToggle.handleMouseLeave}
              className="relative w-full bg-slate-800 hover:bg-slate-700 py-4 flex items-center justify-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {keyboardToggle.progress > 0 && (
                <div
                  className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
                  style={{
                    background: `conic-gradient(#facc15 ${keyboardToggle.progress}%, transparent ${keyboardToggle.progress}%)`,
                    opacity: 0.3,
                  }}
                />
              )}
              <ChevronUp className="w-5 h-5 relative z-10" />
              <span className="text-base font-medium relative z-10">Show Keyboard</span>
            </button>
          </div>
        )}
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
    </div>
  );
}

export default App;
