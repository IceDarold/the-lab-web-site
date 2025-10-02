
import React from 'react';
import JoinUsConsole from './components/JoinUsConsole';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">Interested in Joining Us?</h1>
        <p className="text-lg text-gray-400">Here is the way to our community.</p>
      </header>
      <JoinUsConsole />
    </div>
  );
};

export default App;
