import { useEffect, useRef } from 'react';
import { useConversation } from '../../hooks/useConversation';
import { Message } from './Message';
import { MessageSquare } from 'lucide-react';

interface ConversationPanelProps {
  maxHeight?: string;
  className?: string;
}

export const ConversationPanel = ({ maxHeight = '400px', className = '' }: ConversationPanelProps) => {
  const { messages } = useConversation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div
        className={`w-full bg-slate-800/40 rounded-2xl p-12 text-center ${className}`}
        style={{ maxHeight }}
      >
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <MessageSquare className="w-16 h-16 text-slate-600/50" />
          <p className="text-xl font-semibold">No messages yet</p>
          <p className="text-base font-light">Your conversation history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full bg-slate-800/40 rounded-2xl ${className}`}
      style={{ maxHeight }}
    >
      {/* Scrollable message area */}
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
        style={{ maxHeight }}
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
};
