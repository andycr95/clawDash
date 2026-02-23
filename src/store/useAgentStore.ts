import { create } from 'zustand';

export type AgentStatus = 'running' | 'thinking' | 'blocked' | 'idle';

export interface TerminalLog {
  id: string;
  agentId: string;
  log: string;
  timestamp: string;
}

export interface ApprovalRequest {
  agentId: string;
  action: string;
  actionId: string;
}

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  logs: TerminalLog[];
  activeApproval?: ApprovalRequest;
}

interface AgentStore {
  agents: Record<string, Agent>;
  
  // Actions
  updateAgentStatus: (agentId: string, status: AgentStatus) => void;
  addLog: (agentId: string, log: Omit<TerminalLog, 'id'>) => void;
  setApprovalRequest: (agentId: string, approval: ApprovalRequest | undefined) => void;
  upsertAgent: (agent: Partial<Agent> & { id: string }) => void;
}

const MAX_LOGS = 100;

export const useAgentStore = create<AgentStore>((set) => ({
  agents: {},

  updateAgentStatus: (agentId, status) => 
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          status,
          // If we're updating a non-existent agent, we initialize it with default values
          id: agentId,
          name: state.agents[agentId]?.name || `Agent-${agentId}`,
          logs: state.agents[agentId]?.logs || [],
        } as Agent,
      },
    })),

  addLog: (agentId, logData) =>
    set((state) => {
      const agent = state.agents[agentId] || {
        id: agentId,
        name: `Agent-${agentId}`,
        status: 'idle',
        logs: [],
      };
      
      const newLog: TerminalLog = {
        ...logData,
        id: crypto.randomUUID(),
      };

      const updatedLogs = [newLog, ...agent.logs].slice(0, MAX_LOGS);

      return {
        agents: {
          ...state.agents,
          [agentId]: {
            ...agent,
            logs: updatedLogs,
          },
        },
      };
    }),

  setApprovalRequest: (agentId, approval) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentId]: {
          ...state.agents[agentId],
          activeApproval: approval,
        } as Agent,
      },
    })),

  upsertAgent: (agentData) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agentData.id]: {
          ...(state.agents[agentData.id] || {
            status: 'idle',
            logs: [],
          }),
          ...agentData,
        } as Agent,
      },
    })),
}));
