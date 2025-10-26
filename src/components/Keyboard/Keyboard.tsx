import { Key } from './Key';
import type { KeyConfig } from '../../types/index';
import { useMessageStore } from '../../store/messageStore';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useMemo } from 'react';

const BASE_KEYBOARD_LAYOUT: KeyConfig[] = [
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

  // Function keys
  { id: 'space', label: 'Space', value: ' ', type: 'space', gridArea: '4 / 1 / 5 / 6' },
  { id: 'delete', label: '⌫', value: 'delete', type: 'delete', gridArea: '4 / 6 / 5 / 8' },
  { id: 'speak', label: '🔊 Speak', value: 'speak', type: 'speak', gridArea: '4 / 8 / 5 / 11' },
];

export const Keyboard = () => {
  const { message, addCharacter, deleteCharacter, addSpace } = useMessageStore();
  const { speak, isSpeaking, isLoading } = useTextToSpeech();

  // Dynamic keyboard layout with updated speak button label
  const keyboardLayout = useMemo(() => {
    return BASE_KEYBOARD_LAYOUT.map((key) => {
      if (key.id === 'speak') {
        let label = '🔊 Speak';
        if (isLoading) {
          label = '⏳ Loading...';
        } else if (isSpeaking) {
          label = '🔊 Speaking...';
        }
        return { ...key, label };
      }
      return key;
    });
  }, [isSpeaking, isLoading]);

  const handleKeySelect = (value: string) => {
    if (value === 'delete') {
      deleteCharacter();
    } else if (value === ' ') {
      addSpace();
    } else if (value === 'speak') {
      // Speak the current message
      if (message && message.trim()) {
        speak(message);
      }
    } else {
      addCharacter(value);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(10, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
        }}
      >
        {keyboardLayout.map((key) => (
          <Key key={key.id} config={key} onSelect={handleKeySelect} />
        ))}
      </div>
    </div>
  );
};
