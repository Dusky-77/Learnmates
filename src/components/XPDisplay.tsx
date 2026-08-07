import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { calculateLevel, calculateNextLevelXP, calculateProgress } from '../lib/xp-rules';

interface TodayXP {
  [action: string]: { total: number; count: number };
}

interface XPData {
  total_xp: number;
  level: number;
  nextLevelXP: number;
  today: TodayXP;
}

export function XPDisplay() {
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchXP() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch('/api/xp/user', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setXpData(data);
        }
      } catch (error) {
        console.error('Failed to fetch XP data', error);
      } finally {
        setLoading(false);
      }
    }

    fetchXP();
    
    // Poll every 30 seconds to keep updated
    const interval = setInterval(fetchXP, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-4 border rounded shadow animate-pulse bg-gray-100 h-32 w-full max-w-sm"></div>;
  }

  if (!xpData) return null;

  const progress = calculateProgress(xpData.total_xp);

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-sm font-sans">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase">Level {xpData.level}</span>
          <div className="text-2xl font-bold text-gray-900">{xpData.total_xp} <span className="text-sm font-normal text-gray-500">XP</span></div>
        </div>
        <div className="text-xs text-gray-500">
          {xpData.nextLevelXP - xpData.total_xp} XP to Lvl {xpData.level + 1}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        ></div>
      </div>

      <div className="mt-4 border-t pt-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Today's Activity</h4>
        <div className="space-y-1">
          {Object.entries(xpData.today || {}).length === 0 ? (
            <div className="text-sm text-gray-400">No activity today yet</div>
          ) : (
            Object.entries(xpData.today).map(([action, stats]) => (
              <div key={action} className="flex justify-between text-sm">
                <span className="text-gray-600 capitalize">{action.replace('_', ' ')}</span>
                <span className="font-medium text-gray-900">+{stats.total} XP</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
