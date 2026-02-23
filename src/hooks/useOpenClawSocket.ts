'use client';

import { useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useAgentStore, AgentStatus, TerminalLog, ApprovalRequest } from '../store/useAgentStore';

const getWsUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_OPENCLAW_WS_URL;
  
  if (typeof window === 'undefined') return '';
  
  // Si la URL es relativa (empieza con /), construir la URL completa usando el host actual
  if (envUrl && envUrl.startsWith('/')) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}${envUrl}`;
  }
  
  return envUrl || '';
};

export const useOpenClawSocket = () => {
  const { updateAgentStatus, addLog, setApprovalRequest } = useAgentStore();
  
  const { lastJsonMessage, readyState } = useWebSocket(getWsUrl(), {
    shouldReconnect: () => true,
    reconnectInterval: (attemptNumber) => Math.min(Math.pow(2, attemptNumber) * 1000, 30000), // Max 30s
    reconnectAttempts: 10,
    onOpen: () => console.log('OpenClaw WebSocket connected'),
    onClose: () => console.log('OpenClaw WebSocket disconnected'),
    onError: (e) => console.error('OpenClaw WebSocket error:', e),
  });

  // Effect to process incoming messages
  useEffect(() => {
    if (lastJsonMessage) {
      const event = lastJsonMessage as OpenClawEvent;
      
      switch (event.type) {
        case 'agent_status_change':
          updateAgentStatus(event.agentId, event.status);
          break;
        
        case 'terminal_log':
          addLog(event.agentId, {
            agentId: event.agentId,
            log: event.log,
            timestamp: event.timestamp || new Date().toISOString(),
          });
          break;
          
        case 'human_approval_required':
          setApprovalRequest(event.agentId, {
            agentId: event.agentId,
            action: event.action,
            actionId: event.actionId,
          });
          break;
          
        default:
          console.warn('Unknown event type:', (event as any).type);
          break;
      }
    }
  }, [lastJsonMessage, updateAgentStatus, addLog, setApprovalRequest]);

  // Connection health status
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'connecting',
    [ReadyState.OPEN]: 'online',
    [ReadyState.CLOSING]: 'closing',
    [ReadyState.CLOSED]: 'offline',
    [ReadyState.UNINSTANTIATED]: 'uninstantiated',
  }[readyState];

  const isOnline = readyState === ReadyState.OPEN;

  return {
    connectionStatus,
    isOnline,
    readyState,
  };
};
