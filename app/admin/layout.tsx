import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AdminRoot } from '@/components/admin/admin-root';

export const metadata: Metadata = {
  title: 'Quản trị lịch công tác | THCS Xuân Phương',
  description: 'Khu quản trị lịch công tác tuần của Trường THCS Xuân Phương.',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminRoot>{children}</AdminRoot>;
}
