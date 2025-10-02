
import React from 'react';

const CodeLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="whitespace-pre">{children}</div>
);

const JoinUsConsole: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-700">
      <div className="bg-gray-800 p-3 flex items-center rounded-t-xl border-b border-gray-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-grow text-center text-gray-400 text-sm font-sans">
          <span>join_us.py</span>
        </div>
      </div>
      <div className="p-6 text-gray-300 text-sm font-mono overflow-x-auto">
        <CodeLine>
          <span className="text-purple-400">def</span>{' '}
          <span className="text-green-400">join_community</span>(
          <span className="text-orange-400">you</span>
          <span className="text-gray-500">):</span>
        </CodeLine>
        <CodeLine>
          {'    '}
          <span className="text-purple-400">if</span>{' '}
          <span className="text-orange-400">you</span>
          <span className="text-gray-500">.</span>
          <span className="text-blue-400">passion_for_ai</span>
          <span className="text-gray-500">:</span>
        </CodeLine>
        <CodeLine>
          {'        '}
          <span className="text-green-400">send_application</span>(
          <span className="text-orange-400">you</span>
          <span className="text-gray-500">.</span>
          <span className="text-blue-400">story</span>)
        </CodeLine>
        <CodeLine>
          {'        '}
          <span className="text-green-400">get_invite</span>(
          <span className="text-yellow-400">"our_chats"</span>)
        </CodeLine>
        <CodeLine>
          {'        '}
          <span className="text-green-400">start_coding</span>()
        </CodeLine>
        <CodeLine>
          {'    '}
          <span className="text-purple-400">else</span>
          <span className="text-gray-500">:</span>
        </CodeLine>
        <CodeLine>
          {'        '}
          <span className="text-cyan-400">print</span>(
          <span className="text-yellow-400">"Maybe next time!"</span>)
        </CodeLine>
        <CodeLine>{' '}</CodeLine>
        <CodeLine>
          <span className="text-green-400">join_community</span>(
          <span className="text-orange-400">me</span>)
        </CodeLine>
      </div>
    </div>
  );
};

export default JoinUsConsole;
