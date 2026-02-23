'use client';

import { useAgentStore } from '@/store/useAgentStore';
import { AgentCard } from './AgentCard';

export function AgentsList() {
  const agents = useAgentStore((state) => state.agents);
  const agentIds = Object.keys(agents);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {agentIds.length > 0 ? (
        agentIds.map((id) => (
          <AgentCard key={id} agent={agents[id]} />
        ))
      ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-2xl">
          <p className="text-white/40 font-medium">No hay agentes activos en el clúster.</p>
          <p className="text-white/20 text-sm">Los agentes aparecerán aquí cuando se conecten al stream.</p>
        </div>
      )}
    </div>
  );
}
