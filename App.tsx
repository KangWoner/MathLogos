
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { StudentProfile } from './types';

const App: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile>({
    name: '김학생',
    grade: '고3',
    mathLevel: '2등급',
    targetUniversities: ['연세대학교', '한양대학교']
  });

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">∑</div>
          <span className="font-bold text-slate-800">MathLogos</span>
        </div>
      </div>

      <Sidebar profile={profile} setProfile={setProfile} />
      
      <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        <ChatWindow profile={profile} />
      </main>
    </div>
  );
};

export default App;
