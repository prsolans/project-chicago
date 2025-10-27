import { useState } from 'react';
import { useConversation } from '../../hooks/useConversation';
import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import type { SpeakerRole } from '../../types/conversation';

export const ParticipantSelector = () => {
  const { dwellTime } = useSettingsStore();
  const {
    allParticipants,
    activeParticipants,
    currentSpeaker,
    setCurrentSpeaker,
    addAndActivateParticipant,
  } = useConversation();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<SpeakerRole>('caregiver');

  const handleAddParticipant = () => {
    if (newName.trim()) {
      addAndActivateParticipant(newName.trim(), newRole);
      setNewName('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="w-full bg-slate-800 rounded-lg p-4">
      <div className="mb-3">
        <h3 className="text-white font-medium mb-2">Who's Here</h3>
        <p className="text-slate-400 text-sm">Active participants in this conversation</p>
      </div>

      {/* Participant List */}
      <div className="space-y-2 mb-4">
        {allParticipants.map((participant) => {
          const isActive = activeParticipants.some(p => p.id === participant.id);
          const isCurrentSpeaker = currentSpeaker?.id === participant.id;

          return (
            <ParticipantButton
              key={participant.id}
              participant={participant}
              isActive={isActive}
              isCurrentSpeaker={isCurrentSpeaker}
              onSetSpeaker={() => setCurrentSpeaker(participant.id)}
              dwellTime={dwellTime}
            />
          );
        })}
      </div>

      {/* Add Participant Button */}
      {!showAddForm ? (
        <AddButton
          onClick={() => setShowAddForm(true)}
          dwellTime={dwellTime}
        />
      ) : (
        <div className="bg-slate-700 p-4 rounded-lg space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name"
            className="w-full px-3 py-2 bg-slate-600 text-white rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />

          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as SpeakerRole)}
            className="w-full px-3 py-2 bg-slate-600 text-white rounded border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="caregiver">Caregiver</option>
            <option value="family">Family</option>
            <option value="medical">Medical</option>
            <option value="other">Other</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleAddParticipant}
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewName('');
              }}
              className="flex-1 bg-slate-600 text-white py-2 rounded hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual participant button with dwell detection
interface ParticipantButtonProps {
  participant: any;
  isActive: boolean;
  isCurrentSpeaker: boolean;
  onSetSpeaker: () => void;
  dwellTime: number;
}

const ParticipantButton = ({
  participant,
  isActive,
  isCurrentSpeaker,
  onSetSpeaker,
  dwellTime,
}: ParticipantButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onSetSpeaker
  );

  return (
    <div
      className={`
        relative p-3 rounded-lg cursor-pointer transition-all
        ${isActive ? 'bg-slate-700' : 'bg-slate-800 opacity-50'}
        ${isCurrentSpeaker ? 'ring-2 ring-blue-500' : ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: participant.colorCode }}
          />
          <div>
            <p className="text-white font-medium">{participant.name}</p>
            <p className="text-slate-400 text-sm capitalize">{participant.role}</p>
          </div>
        </div>

        {isCurrentSpeaker && (
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
            Speaking
          </span>
        )}
      </div>
    </div>
  );
};

// Add participant button with dwell
interface AddButtonProps {
  onClick: () => void;
  dwellTime: number;
}

const AddButton = ({ onClick, dwellTime }: AddButtonProps) => {
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    onClick
  );

  return (
    <button
      className="relative w-full p-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

      <span className="relative">+ Add Person</span>
    </button>
  );
};
