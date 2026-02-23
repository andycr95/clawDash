'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useOpenClawSocket } from '../hooks/useOpenClawSocket';

interface ConnectionContextType {
  status: string;
  isOnline: boolean;
  readyState: number;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const connection = useOpenClawSocket();

  return (
    <ConnectionContext.Provider value={{
      status: connection.connectionStatus || 'OFFLINE',
      isOnline: connection.isOnline,
      readyState: connection.readyState
    }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnectionStatus() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnectionStatus debe usarse dentro de un DashboardProvider');
  }
  return context;
}
