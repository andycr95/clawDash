const API_BASE_URL = process.env.NEXT_PUBLIC_OPENCLAW_API_URL || '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer ? 'http://127.0.0.1:3000' + API_BASE_URL : API_BASE_URL;
  const token = process.env.NEXT_PUBLIC_OPENCLAW_TOKEN;
  
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(token ? { 'x-openclaw-token': token } : {}), // Header redundante por seguridad
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 202 || response.status === 204) return {} as T;
  
  return response.json();
}

export const openClawApi = {
  /**
   * Despierta al sistema (Wake)
   */
  wake: (text: string) => 
    request('/hooks/wake', {
      method: 'POST',
      body: JSON.stringify({ text, mode: 'now' }),
    }),

  /**
   * Envía un mensaje a un agente específico (Usa el endpoint de Webhook)
   */
  injectCommand: (agentId: string, message: string) =>
    request('/hooks/agent', {
      method: 'POST',
      body: JSON.stringify({ 
        agentId, 
        message, 
        wakeMode: 'now',
        deliver: true 
      }),
    }),

  /**
   * Detiene un agente (Kill switch)
   */
  stopAgent: (agentId: string) => 
    request('/hooks/agent', {
      method: 'POST',
      body: JSON.stringify({ 
        agentId, 
        message: '/stop', // Enviamos el comando de stop vía webhook
        wakeMode: 'now'
      }),
    }),

  /**
   * Detiene todos los agentes (Kill switch global)
   */
  stopAllAgents: () => 
    request('/hooks/agent', {
      method: 'POST',
      body: JSON.stringify({ 
        message: '/stopall',
        wakeMode: 'now'
      }),
    }),

  /**
   * Aprueba o rechaza una acción bloqueada
   */
  approveAction: (agentId: string, actionId: string, approved: boolean) =>
    request('/hooks/agent', {
      method: 'POST',
      body: JSON.stringify({ 
        agentId,
        message: approved ? `/approve ${actionId}` : `/dismiss ${actionId}`,
        wakeMode: 'now'
      }),
    }),
};
