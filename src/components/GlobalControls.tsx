'use client';

import { openClawApi } from '@/services/openclawApi';
import { useState } from 'react';
import { useConnectionStatus } from './DashboardProvider';

export function GlobalControls() {
  const [isStopping, setIsStopping] = useState(false);
  const { isOnline } = useConnectionStatus();

  const handleStopAll = async () => {
    if (!confirm('¿Estás seguro de que deseas detener TODOS los agentes activos?')) return;
    
    setIsStopping(true);
    try {
      await openClawApi.stopAllAgents();
    } catch (err) {
      console.error('Error stopping all agents:', err);
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleStopAll}
        disabled={isStopping || !isOnline}
        className="bg-rose-600 hover:bg-rose-500 disabled:bg-rose-900/50 disabled:text-rose-200/30 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all uppercase tracking-wider border border-rose-400/20"
      >
        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        {isStopping ? 'Stopping...' : 'Stop All Agents'}
      </button>
    </div>
  );
}
