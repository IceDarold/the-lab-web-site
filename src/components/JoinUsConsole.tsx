import React from 'react';

const CodeLine: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}<br /></>
);

const JoinUsConsole: React.FC = () => {
  return (
    <div className="w-full mx-auto bg-[#1e1e1e] rounded-xl shadow-2xl border border-gray-700">
      <div className="bg-gray-800 p-3 flex items-center rounded-t-xl border-b border-gray-700">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-grow text-center text-gray-400 text-sm font-sans">
          <span>join_us.py</span>
        </div>
      </div>
      <pre className="p-6 text-sm font-mono overflow-x-auto">
        <CodeLine>
          <span style={{color: '#c084fc'}}>def</span>{' '}
          <span style={{color: '#22d3ee'}}>join_community</span>(
          <span style={{color: '#f97b3d'}}>you</span>
          <span style={{color: '#64748b'}}>:</span>
        </CodeLine>
        <CodeLine>
          {'    '}
          <span style={{color: '#c084fc'}}>if</span>{' '}
          <span style={{color: '#f97b3d'}}>you</span>
          <span style={{color: '#64748b'}}>.</span>
          <span style={{color: '#38bdf8'}}>passion_for_ai</span>
          <span style={{color: '#64748b'}}>:</span>
        </CodeLine>
        <CodeLine>
          {'        '}
          <span style={{color: '#22d3ee'}}>send_application</span>(
          <span style={{color: '#f97b3d'}}>you</span>
          <span style={{color: '#64748b'}}>.</span>
          <span style={{color: '#38bdf8'}}>story</span>)
        </CodeLine>
        <CodeLine>
          {'        '}
          <span style={{color: '#22d3ee'}}>get_invite</span>(
          <span style={{color: '#facc15'}}>"our_chats"</span>)
        </CodeLine>
        <CodeLine>
          {'        '}
          <span style={{color: '#22d3ee'}}>start_coding</span>()
        </CodeLine>
        <CodeLine>
          {'    '}
          <span style={{color: '#c084fc'}}>else</span>
          <span style={{color: '#64748b'}}>:</span>
        </CodeLine>
        <CodeLine>
          {'        '}
          <span style={{color: '#60a5fa'}}>print</span>(
          <span style={{color: '#facc15'}}>"Maybe next time!"</span>)
        </CodeLine>
        <CodeLine>{' '}</CodeLine>
        <CodeLine>
          <span style={{color: '#22d3ee'}}>join_community</span>(
          <span style={{color: '#f97b3d'}}>me</span>)
        </CodeLine>
      </pre>
    </div>
  );
};

export default JoinUsConsole;
