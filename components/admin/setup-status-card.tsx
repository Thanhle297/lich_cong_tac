import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AdminDashboardData } from '@/lib/admin-types';

export function SetupStatusCard({ data }: { data: AdminDashboardData }) {
  const steps = [
    {
      label: 'Tài khoản quản trị',
      complete: true,
      href: '/admin',
    },
    {
      label: 'Năm học đang hoạt động',
      complete: Boolean(data.academicYear),
      href: '/admin/settings',
    },
    {
      label: 'Danh mục nhân sự',
      complete: data.activePeople > 0,
      href: '/admin/people',
    },
    {
      label: 'Mẫu công việc lặp',
      complete: data.activeTemplates > 0,
      href: '/admin/templates',
    },
  ];

  return (
    <Card className="border-slate-200 shadow-[0_8px_22px_rgba(15,40,70,0.05)]">
      <CardHeader>
        <CardTitle>Thiết lập ban đầu</CardTitle>
        <CardDescription>
          Các dữ liệu cần có trước khi bắt đầu xếp lịch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li className="flex items-center gap-3" key={step.label}>
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                  step.complete
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {index + 1}
              </span>
              <Link
                className="text-sm font-semibold text-slate-700 underline-offset-4 hover:text-[#0c6e85] hover:underline"
                href={step.href}
              >
                {step.label}
              </Link>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
