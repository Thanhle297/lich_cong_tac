import type { ReactNode } from 'react';

export function AdminPageStatus({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f2f6fb] px-5 py-10">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
