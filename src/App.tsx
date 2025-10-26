import React from 'react';
import { MessageDisplay } from './components/MessageDisplay/MessageDisplay';
import { Keyboard } from './components/Keyboard/Keyboard';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">HelloFriend</h1>
          <p className="text-xl text-slate-400">Look. Dwell. Communicate.</p>
        </header>

        <MessageDisplay />
        <Keyboard />
      </div>
    </div>
  );
}

export default App;
