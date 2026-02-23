'use client';

import { AgentsList } from "@/components/AgentsList";
import { GlobalControls } from "@/components/GlobalControls";
import { useConnectionStatus } from "@/components/DashboardProvider";
import { 
  LayoutDashboard, 
  Users, 
  Terminal, 
  Settings, 
  Bell, 
  Plus, 
  Layers, 
  Search
} from "lucide-react";

export default function Home() {
  const { status, isOnline } = useConnectionStatus();

  return (
    <div className="flex min-h-screen bg-[#0a0c10] text-slate-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0d1117] flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Layers className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">OpenClaw</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarLink icon={<Users size={20} />} label="Agents" />
          <SidebarLink icon={<Terminal size={20} />} label="Live Terminals" active />
          <SidebarLink icon={<Bell size={20} />} label="Logs" />
          <SidebarLink icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-white/5">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-bold transition-all">
            <Plus size={18} />
            New Agent
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0d1117]/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest border transition-all ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                CONEXIÓN: {status}
             </div>
             <h1 className="text-lg font-bold text-white ml-2">Virtual Office</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search sessions..." 
                className="bg-black/40 border border-white/10 rounded-lg py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500/50 w-64 transition-all"
              />
            </div>
            <GlobalControls />
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <div className="text-right">
                <div className="text-xs font-bold text-white">Admin User</div>
                <div className="text-[10px] text-slate-500">admin@openclaw.ai</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto max-w-[1400px]">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
              <p className="text-slate-500 text-sm mt-1">Real-time monitoring of active agent instances.</p>
            </div>
            <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
              <button className="px-3 py-1.5 bg-slate-800 rounded-md text-xs font-bold text-white">Grid</button>
              <button className="px-3 py-1.5 hover:bg-slate-800/50 rounded-md text-xs font-bold transition-all">List</button>
            </div>
          </div>

          <AgentsList />
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-white/5 text-slate-400'}`}>
      {icon}
      {label}
    </a>
  );
}
