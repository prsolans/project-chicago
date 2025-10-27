import { useState, useEffect } from 'react';
import { MessageDisplay } from './components/MessageDisplay/MessageDisplay';
import { Keyboard } from './components/Keyboard/Keyboard';
import { ConversationPanel } from './components/ConversationPanel/ConversationPanel';
import { CategoryPhrasesPanel } from './components/Categories/CategoryPhrasesPanel';
import { ThoughtCompletionBar } from './components/Predictions/ThoughtCompletionBar';
import { useSettingsStore } from './store/settingsStore';
import { useMessageStore } from './store/messageStore';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useThoughtCompletion } from './hooks/useThoughtCompletion';
import { useDwellDetection } from './hooks/useDwellDetection';
import type { AIPrediction } from './types/conversation';
import { Bot, Folder, MessageSquare } from 'lucide-react';

function App() {
  const [showCategories, setShowCategories] = useState(false);
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
    minCharacters: 2,
    maxPredictions: 8,
    debounceMs: 400,
    enabled: enableAI,
  });

  // Trigger predictions as user types
  useEffect(() => {
    const shouldPredict = message.length >= 2 || message.endsWith(' ');

    if (shouldPredict && message.trim().length > 0) {
      triggerPredictions(message);
    } else {
      clearPredictions();
    }
  }, [message, triggerPredictions, clearPredictions]);

  /**
   * Handle AI prediction selection
   * Append predicted word to current message
   */
  const handlePredictionSelect = (prediction: AIPrediction) => {
    const currentMessage = message.trimEnd();
    const separator = currentMessage.length > 0 ? ' ' : '';
    const newMessage = currentMessage + separator + prediction.content;
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

  // Dwell detection for AI toggle button
  const aiButton = useDwellDetection(dwellTime, () => setEnableAI(!enableAI));

  // Dwell detection for Phrases button
  const phrasesButton = useDwellDetection(dwellTime, () => setShowCategories(!showCategories));

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-slate-700/50 bg-slate-900/95">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">HelloFriend</h1>
          <p className="text-base text-slate-400 mt-1 font-light">Look. Dwell. Communicate.</p>
        </div>

        {/* Control buttons */}
        <div className="flex gap-4">
          <button
            onMouseEnter={aiButton.handleMouseEnter}
            onMouseLeave={aiButton.handleMouseLeave}
            className={`relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all text-base font-medium shadow-md hover:shadow-lg ${
              enableAI
                ? 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white'
                : 'bg-slate-700/90 hover:bg-slate-600 text-white'
            }`}
          >
            {aiButton.progress > 0 && (
              <div
                className="absolute inset-0 rounded-xl border-4 border-yellow-400 pointer-events-none"
                style={{
                  background: `conic-gradient(#facc15 ${aiButton.progress}%, transparent ${aiButton.progress}%)`,
                  opacity: 0.3,
                }}
              />
            )}
            <Bot className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{enableAI ? 'AI On' : 'AI Off'}</span>
          </button>
          <button
            onMouseEnter={phrasesButton.handleMouseEnter}
            onMouseLeave={phrasesButton.handleMouseLeave}
            className={`relative flex items-center gap-3 px-6 py-3 rounded-xl transition-all text-base font-medium shadow-md hover:shadow-lg ${
              showCategories
                ? 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white'
                : 'bg-slate-700/90 hover:bg-slate-600 text-white'
            }`}
          >
            {phrasesButton.progress > 0 && (
              <div
                className="absolute inset-0 rounded-xl border-4 border-yellow-400 pointer-events-none"
                style={{
                  background: `conic-gradient(#facc15 ${phrasesButton.progress}%, transparent ${phrasesButton.progress}%)`,
                  opacity: 0.3,
                }}
              />
            )}
            <Folder className="w-5 h-5 relative z-10" />
            <span className="relative z-10">{showCategories ? 'Hide' : 'Phrases'}</span>
          </button>
        </div>
      </header>

      {/* Action Bar - Space/Delete/Speak */}
      <div className="border-b border-slate-700/50 bg-slate-900/95 py-4">
        <div className="flex justify-center gap-4 px-8">
          <Keyboard.ActionButtons />
        </div>
      </div>

      {/* Main Content Area - 50/50 split + keyboard at bottom */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Section: 50/50 Split - constrained height to ensure keyboard visible */}
        <div className="flex-1 grid grid-cols-2 overflow-hidden min-h-0">
          {/* Left: Conversation History (50%) - Always visible */}
          <div className="border-r border-slate-700/50 flex flex-col max-h-full">
            <div className="flex items-center gap-3 p-8 pb-4 flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              <h2 className="text-white text-2xl font-semibold">Conversation History</h2>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <ConversationPanel maxHeight="none" />
            </div>
          </div>

          {/* Right: Message Display + AI Predictions (50%) */}
          <div className="p-8 flex flex-col gap-8">
            {/* AI Predictions at top of right column */}
            {(predictions.length > 0 || isPredictionsLoading) && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="w-5 h-5 text-green-400" />
                  <h3 className="text-white text-lg font-semibold">AI Word Predictions</h3>
                </div>
                <ThoughtCompletionBar
                  predictions={predictions}
                  onSelectPrediction={handlePredictionSelect}
                  isLoading={isPredictionsLoading}
                />
              </div>
            )}

            {/* Message Display */}
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full">
                <MessageDisplay />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Keyboard (Full Width) - locked at bottom, 3 rows only */}
        <div className="border-t border-slate-700/50 flex-shrink-0 h-[270px]">
          <Keyboard />
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
    </div>
  );
}

export default App;
