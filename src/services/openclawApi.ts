const API_BASE_URL = process.env.NEXT_PUBLIC_OPENCLAW_API_URL || '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Aseguramos que la URL sea absoluta si estamos en el servidor, 
  // o relativa si estamos en el cliente.
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? 'http://127.0.0.1:3000' + API_BASE_URL : API_BASE_URL;
  
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) return {} as T;
  
  return response.json();
}

export const openClawApi = {
  stopAgent: (agentId: string) => 
    request(`/agents/${agentId}/stop`, { method: 'POST' }),

  stopAllAgents: () => 
    request('/agents/stop-all', { method: 'POST' }),

  injectCommand: (agentId: string, command: string) =>
    request(`/agents/${agentId}/inject`, {
      method: 'POST',
      body: JSON.stringify({ command }),
    }),

  approveAction: (agentId: string, actionId: string, approved: boolean) =>
    request(`/agents/${agentId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ actionId, approved }),
    }),
};
