
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export const SessionTracker: React.FC = () => {
  const [ip, setIp] = useState<string>('Detecting...');
  const [visits, setVisits] = useState<number>(0);

  useEffect(() => {
    // 1. Fetch IP (for display and logging)
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('Offline/Blocked'));

    // 2. Track Local Visits
    const count = parseInt(localStorage.getItem('cf_visit_count') || '0');
    const newCount = count + 1;
    localStorage.setItem('cf_visit_count', newCount.toString());
    setVisits(newCount);
  }, []);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-auto mb-2">
      <div className="flex items-center gap-2 mb-2">
        <Icons.Activity className="w-3.5 h-3.5 text-indigo-500" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Session Analytics</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400">Public IP</span>
          <span className="text-[10px] font-mono font-bold text-slate-600">{ip}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-400">Total Uses</span>
          <span className="text-[10px] font-mono font-bold text-slate-600">{visits}</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[9px] text-slate-400 italic">
        <Icons.Info className="w-2.5 h-2.5" />
        IP logged for internal quality check
      </div>
    </div>
  );
};
