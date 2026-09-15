'use client';

import type { ReactNode } from 'react';

import { AdminAuthProvider } from './admin-auth-provider';
import { AdminGate } from './admin-gate';

export function AdminRoot({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGate>{children}</AdminGate>
    </AdminAuthProvider>
  );
}
