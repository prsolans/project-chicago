import { Key } from './Key';
import type { KeyConfig } from '../../types/index';
import { useMessageStore } from '../../store/messageStore';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';

// Only letter keys - 3 rows
const LETTER_KEYBOARD_LAYOUT: KeyConfig[] = [
  // Row 1
  { id: 'q', label: 'Q', value: 'q', type: 'letter', gridArea: '1 / 1 / 2 / 2' },
  { id: 'w', label: 'W', value: 'w', type: 'letter', gridArea: '1 / 2 / 2 / 3' },
  { id: 'e', label: 'E', value: 'e', type: 'letter', gridArea: '1 / 3 / 2 / 4' },
  { id: 'r', label: 'R', value: 'r', type: 'letter', gridArea: '1 / 4 / 2 / 5' },
  { id: 't', label: 'T', value: 't', type: 'letter', gridArea: '1 / 5 / 2 / 6' },
  { id: 'y', label: 'Y', value: 'y', type: 'letter', gridArea: '1 / 6 / 2 / 7' },
  { id: 'u', label: 'U', value: 'u', type: 'letter', gridArea: '1 / 7 / 2 / 8' },
  { id: 'i', label: 'I', value: 'i', type: 'letter', gridArea: '1 / 8 / 2 / 9' },
  { id: 'o', label: 'O', value: 'o', type: 'letter', gridArea: '1 / 9 / 2 / 10' },
  { id: 'p', label: 'P', value: 'p', type: 'letter', gridArea: '1 / 10 / 2 / 11' },

  // Row 2
  { id: 'a', label: 'A', value: 'a', type: 'letter', gridArea: '2 / 1 / 3 / 2' },
  { id: 's', label: 'S', value: 's', type: 'letter', gridArea: '2 / 2 / 3 / 3' },
  { id: 'd', label: 'D', value: 'd', type: 'letter', gridArea: '2 / 3 / 3 / 4' },
  { id: 'f', label: 'F', value: 'f', type: 'letter', gridArea: '2 / 4 / 3 / 5' },
  { id: 'g', label: 'G', value: 'g', type: 'letter', gridArea: '2 / 5 / 3 / 6' },
  { id: 'h', label: 'H', value: 'h', type: 'letter', gridArea: '2 / 6 / 3 / 7' },
  { id: 'j', label: 'J', value: 'j', type: 'letter', gridArea: '2 / 7 / 3 / 8' },
  { id: 'k', label: 'K', value: 'k', type: 'letter', gridArea: '2 / 8 / 3 / 9' },
  { id: 'l', label: 'L', value: 'l', type: 'letter', gridArea: '2 / 9 / 3 / 10' },

  // Row 3
  { id: 'z', label: 'Z', value: 'z', type: 'letter', gridArea: '3 / 1 / 4 / 2' },
  { id: 'x', label: 'X', value: 'x', type: 'letter', gridArea: '3 / 2 / 4 / 3' },
  { id: 'c', label: 'C', value: 'c', type: 'letter', gridArea: '3 / 3 / 4 / 4' },
  { id: 'v', label: 'V', value: 'v', type: 'letter', gridArea: '3 / 4 / 4 / 5' },
  { id: 'b', label: 'B', value: 'b', type: 'letter', gridArea: '3 / 5 / 4 / 6' },
  { id: 'n', label: 'N', value: 'n', type: 'letter', gridArea: '3 / 6 / 4 / 7' },
  { id: 'm', label: 'M', value: 'm', type: 'letter', gridArea: '3 / 7 / 4 / 8' },
];

// Action Buttons Component (Space, Delete, Clear, Speak)
const ActionButtons = () => {
  const { message, deleteCharacter, addSpace, sendMessage, clear } = useMessageStore();
  const { speak, isSpeaking, isLoading: isSpeaking_loading } = useTextToSpeech();
  const { dwellTime } = useSettingsStore();

  const getSpeakLabel = () => {
    if (isSpeaking_loading) return 'Loading...';
    if (isSpeaking) return 'Speaking...';
    return 'Speak';
  };

  // Space button dwell
  const spaceButton = useDwellDetection(dwellTime, () => addSpace());

  // Delete button dwell
  const deleteButton = useDwellDetection(dwellTime, () => deleteCharacter());

  // Clear button dwell
  const clearButton = useDwellDetection(dwellTime, () => clear());

  // Speak button dwell
  const speakButton = useDwellDetection(dwellTime, () => {
    if (message && message.trim()) {
      sendMessage();
      speak(message);
    }
  });

  return (
    <>
      {/* Space */}
      <button
        className="relative flex items-center justify-center text-center text-lg font-semibold rounded-2xl transition-all cursor-pointer select-none shadow-md hover:shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white h-[70px] w-[240px]"
        onMouseEnter={spaceButton.handleMouseEnter}
        onMouseLeave={spaceButton.handleMouseLeave}
      >
        {spaceButton.progress > 0 && (
          <div
            className="absolute inset-0 rounded-2xl border-4 border-yellow-400 pointer-events-none"
            style={{
              background: `conic-gradient(#facc15 ${spaceButton.progress}%, transparent ${spaceButton.progress}%)`,
              opacity: 0.3,
            }}
          />
        )}
        <span className="relative z-10">Space</span>
      </button>

      {/* Delete */}
      <button
        className="relative flex items-center justify-center text-center text-lg font-semibold rounded-2xl transition-all cursor-pointer select-none shadow-md hover:shadow-lg bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white h-[70px] w-[180px]"
        onMouseEnter={deleteButton.handleMouseEnter}
        onMouseLeave={deleteButton.handleMouseLeave}
      >
        {deleteButton.progress > 0 && (
          <div
            className="absolute inset-0 rounded-2xl border-4 border-yellow-400 pointer-events-none"
            style={{
              background: `conic-gradient(#facc15 ${deleteButton.progress}%, transparent ${deleteButton.progress}%)`,
              opacity: 0.3,
            }}
          />
        )}
        <span className="relative z-10">Delete</span>
      </button>

      {/* Clear */}
      <button
        className="relative flex items-center justify-center text-center text-lg font-semibold rounded-2xl transition-all cursor-pointer select-none shadow-md hover:shadow-lg bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white h-[70px] w-[180px]"
        onMouseEnter={clearButton.handleMouseEnter}
        onMouseLeave={clearButton.handleMouseLeave}
      >
        {clearButton.progress > 0 && (
          <div
            className="absolute inset-0 rounded-2xl border-4 border-yellow-400 pointer-events-none"
            style={{
              background: `conic-gradient(#facc15 ${clearButton.progress}%, transparent ${clearButton.progress}%)`,
              opacity: 0.3,
            }}
          />
        )}
        <span className="relative z-10">Clear</span>
      </button>

      {/* Speak */}
      <button
        className="relative flex items-center justify-center text-center text-lg font-semibold rounded-2xl transition-all cursor-pointer select-none shadow-md hover:shadow-lg bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white h-[70px] w-[240px]"
        onMouseEnter={speakButton.handleMouseEnter}
        onMouseLeave={speakButton.handleMouseLeave}
      >
        {speakButton.progress > 0 && (
          <div
            className="absolute inset-0 rounded-2xl border-4 border-yellow-400 pointer-events-none"
            style={{
              background: `conic-gradient(#facc15 ${speakButton.progress}%, transparent ${speakButton.progress}%)`,
              opacity: 0.3,
            }}
          />
        )}
        <span className="relative z-10">{getSpeakLabel()}</span>
      </button>
    </>
  );
};

// Main Keyboard Component (letters only)
export const Keyboard = Object.assign(
  () => {
    const { addCharacter } = useMessageStore();

    const handleKeySelect = (value: string) => {
      addCharacter(value);
    };

    return (
      <div className="w-full h-full bg-slate-850 flex items-center justify-center">
        {/* Letter Keyboard - 3 rows */}
        <div className="w-full max-w-7xl px-4">
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: 'repeat(10, 1fr)',
              gridTemplateRows: 'repeat(3, 75px)',
            }}
          >
            {LETTER_KEYBOARD_LAYOUT.map((key) => (
              <Key key={key.id} config={key} onSelect={handleKeySelect} />
            ))}
          </div>
        </div>
      </div>
    );
  },
  { ActionButtons }
);
