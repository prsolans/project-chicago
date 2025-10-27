import { useMessageStore } from '../../store/messageStore';

export const MessageDisplay = () => {
  const message = useMessageStore((state) => state.message);

  return (
    <div className="w-full max-w-7xl mx-auto px-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-800/90 rounded-2xl p-6 min-h-[100px] border-2 border-slate-600/50 shadow-lg">
        <p className="text-4xl text-white leading-relaxed break-words font-light">
          {message || <span className="text-slate-400">Start typing...</span>}
        </p>
      </div>
    </div>
  );
};
