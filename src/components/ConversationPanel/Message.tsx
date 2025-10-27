import { useMemo } from 'react';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { useDwellDetection } from '../../hooks/useDwellDetection';
import { useSettingsStore } from '../../store/settingsStore';
import type { Message as MessageType } from '../../types/conversation';
import { Keyboard, Bot, Zap, MessageCircle, Folder, Volume2 } from 'lucide-react';

interface MessageProps {
  message: MessageType;
}

export const Message = ({ message }: MessageProps) => {
  const { speak } = useTextToSpeech();
  const { dwellTime } = useSettingsStore();

  const formattedTime = useMemo(() => {
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [message.timestamp]);

  const MethodIcon = useMemo(() => {
    const iconMap = {
      typed: Keyboard,
      predicted: Bot,
      quick_phrase: Zap,
      thought_stream: MessageCircle,
      category: Folder,
    };
    return iconMap[message.method] || null;
  }, [message.method]);

  // Dwell to respeak message
  const { progress, handleMouseEnter, handleMouseLeave } = useDwellDetection(
    dwellTime,
    () => speak(message.content)
  );

  return (
    <div className="flex justify-end mb-6">
      <div className="max-w-[85%] items-end flex flex-col gap-2">
        {/* Time and method badge */}
        <div className="flex items-center gap-2 px-3">
          <span className="text-sm text-slate-400 font-light">{formattedTime}</span>
          {MethodIcon && (
            <MethodIcon className="w-4 h-4 text-slate-400" />
          )}
        </div>

        {/* Message bubble */}
        <div
          className="relative px-6 py-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm cursor-pointer hover:from-blue-500 hover:to-blue-600 transition-all shadow-md"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title="Dwell to respeak this message"
        >
          {/* Dwell progress indicator */}
          {progress > 0 && (
            <div
              className="absolute inset-0 rounded-2xl border-4 border-yellow-400 pointer-events-none"
              style={{
                background: `conic-gradient(#facc15 ${progress}%, transparent ${progress}%)`,
                opacity: 0.3,
              }}
            />
          )}

          {/* Content */}
          <div className="relative flex items-start gap-3">
            <p className="text-lg leading-relaxed flex-1 font-light">{message.content}</p>
            <Volume2 className="w-5 h-5 text-white/50" />
          </div>
        </div>
      </div>
    </div>
  );
};
