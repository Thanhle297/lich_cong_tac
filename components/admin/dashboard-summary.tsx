import {
  BookOpenCheck,
  CalendarClock,
  CalendarDays,
  Repeat2,
  Users,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminDashboardData } from '@/lib/admin-types';

type DashboardSummaryProps = {
  data: AdminDashboardData;
  isLoading: boolean;
};

export function DashboardSummary({ data, isLoading }: DashboardSummaryProps) {
  const summaryCards = [
    {
      label: 'Tổng số tuần',
      value: data.totalWeeks,
      icon: CalendarDays,
      color: 'bg-cyan-50 text-[#0c6e85]',
    },
    {
      label: 'Tuần bản nháp',
      value: data.draftWeeks,
      icon: CalendarClock,
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Tuần đã phát hành',
      value: data.publishedWeeks,
      icon: BookOpenCheck,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Nhân sự hoạt động',
      value: data.activePeople,
      icon: Users,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Mẫu lịch hoạt động',
      value: data.activeTemplates,
      icon: Repeat2,
      color: 'bg-violet-50 text-violet-700',
    },
  ];

  return (
    <section
      aria-label="Số liệu tổng quan"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
    >
      {summaryCards.map((item) => (
        <Card
          className="gap-4 border-slate-200 py-5 shadow-[0_8px_22px_rgba(15,40,70,0.05)]"
          key={item.label}
        >
          <CardHeader className="flex grid-cols-none flex-row items-center justify-between gap-3 px-5">
            <CardDescription className="text-sm font-semibold text-slate-600">
              {item.label}
            </CardDescription>
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.color}`}
            >
              <item.icon aria-hidden="true" size={18} />
            </span>
          </CardHeader>
          <CardContent className="px-5">
            {isLoading ? (
              <Skeleton className="h-9 w-16 bg-slate-200" />
            ) : (
              <p className="text-3xl font-bold tabular-nums text-slate-950">
                {item.value}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
