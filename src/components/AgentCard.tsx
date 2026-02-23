'use client';

import { Agent, AgentStatus } from '@/store/useAgentStore';
import { openClawApi } from '@/services/openclawApi';
import { useState, KeyboardEvent } from 'react';

const statusStyles: Record<AgentStatus, string> = {
  running: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
  thinking: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
  blocked: 'border-rose-500/30 bg-rose-500/5 text-rose-400',
  idle: 'border-slate-500/30 bg-slate-500/5 text-slate-400',
};

export function AgentCard({ agent }: { agent: Agent }) {
  const [isActing, setIsActing] = useState(false);
  const [command, setCommand] = useState('');

  const handleStop = async () => {
    setIsActing(true);
    try {
      await openClawApi.stopAgent(agent.id);
    } catch (err) {
      console.error('Error stopping agent:', err);
    } finally {
      setIsActing(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (!agent.activeApproval) return;
    setIsActing(true);
    try {
      await openClawApi.approveAction(agent.id, agent.activeApproval.actionId, approved);
    } catch (err) {
      console.error('Error in approval:', err);
    } finally {
      setIsActing(false);
    }
  };

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim() && !isActing) {
      const cmdToSend = command;
      setCommand(''); 
      try {
        await openClawApi.injectCommand(agent.id, cmdToSend);
      } catch (err) {
        console.error('Error injecting command:', err);
      }
    }
  };

  return (
    <div className={`rounded-xl border p-4 transition-all ${statusStyles[agent.status]} flex flex-col gap-4 h-[420px]`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background/20 rounded-lg">
            <span className="text-xl">🤖</span> 
          </div>
          <div>
            <h3 className="font-bold text-white leading-tight">{agent.name}</h3>
            <span className="text-xs uppercase tracking-wider font-semibold">
              ● {agent.status === 'thinking' ? 'Thinking...' : agent.status}
            </span>
          </div>
        </div>
        <button 
          onClick={handleStop}
          disabled={isActing}
          className="text-xs font-bold border border-current px-3 py-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          {agent.status === 'blocked' ? 'ABORT' : 'STOP'}
        </button>
      </div>

      <div className="flex-1 bg-black/40 rounded-lg p-3 font-mono text-[11px] overflow-hidden flex flex-col-reverse gap-1 border border-white/5">
        {agent.logs.map((log) => (
          <div key={log.id} className="leading-relaxed border-l border-white/10 pl-2">
            <span className="text-white/30 mr-2">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
            <span className="text-white/80">{log.log}</span>
          </div>
        ))}
        {agent.logs.length === 0 && <span className="text-white/20 italic">Waiting for logs...</span>}
      </div>

      {/* Input de Comando */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-mono text-[10px]">&gt;_</div>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Inject command..."
          className="w-full bg-black/60 border border-white/10 rounded-lg py-2 pl-8 pr-3 text-[11px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
      </div>

      {agent.status === 'blocked' && agent.activeApproval && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
            <span>⚠️ CRITICAL STOP</span>
          </div>
          <p className="text-[10px] text-rose-200/70 italic">Agent attempted a destructive action:</p>
          <code className="text-[11px] bg-black/40 p-1.5 rounded text-white border border-white/5 truncate">
            &gt; {agent.activeApproval.action}
          </code>
          <div className="flex gap-2 mt-1">
            <button 
              onClick={() => handleApproval(true)}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold py-1.5 rounded transition-colors"
            >
              Review
            </button>
            <button 
              onClick={() => handleApproval(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold py-1.5 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
