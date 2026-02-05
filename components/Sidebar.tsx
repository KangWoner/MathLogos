
import React from 'react';
import { TARGET_UNIVERSITIES } from '../constants';
import { StudentProfile } from '../types';

interface SidebarProps {
  profile: StudentProfile;
  setProfile: (p: StudentProfile) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ profile, setProfile }) => {
  const handleUniversityToggle = (uni: string) => {
    if (profile.targetUniversities.includes(uni)) {
      setProfile({
        ...profile,
        targetUniversities: profile.targetUniversities.filter(u => u !== uni)
      });
    } else {
      setProfile({
        ...profile,
        targetUniversities: [...profile.targetUniversities, uni]
      });
    }
  };

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 p-6 overflow-y-auto hidden md:flex flex-col">
      <div className="flex items-center gap-2 mb-8 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">∑</div>
        <h1 className="text-xl font-bold text-slate-800">MathLogos</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">학생 프로필</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">성함</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="홍길동"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1">학년</label>
                <select 
                  value={profile.grade}
                  onChange={(e) => setProfile({...profile, grade: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
                >
                  <option value="고3">고3</option>
                  <option value="N수">N수</option>
                  <option value="고2">고2</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">수학 등급</label>
                <select 
                  value={profile.mathLevel}
                  onChange={(e) => setProfile({...profile, mathLevel: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none"
                >
                  {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={`${n}등급`}>{n}등급</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">관심 대학 (수리논술)</h2>
          <div className="space-y-2">
            {TARGET_UNIVERSITIES.map(uni => (
              <label key={uni} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={profile.targetUniversities.includes(uni)}
                  onChange={() => handleUniversityToggle(uni)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                />
                <span className={`text-sm ${profile.targetUniversities.includes(uni) ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>{uni}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-auto pt-6 border-t border-slate-100 shrink-0">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">문의하기</h3>
          <a 
            href="mailto:woner@questio.co.kr" 
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            woner@questio.co.kr
          </a>
        </div>
      </section>
    </div>
  );
};

export default Sidebar;
