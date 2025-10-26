import { useMessageStore } from '../../store/messageStore';

export const MessageDisplay = () => {
  const message = useMessageStore((state) => state.message);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 mb-4">
      <div className="bg-slate-800 rounded-xl p-8 min-h-[120px] border-2 border-slate-600">
        <p className="text-3xl text-white break-words">
          {message || <span className="text-slate-500">Start typing...</span>}
        </p>
      </div>
    </div>
  );
};
