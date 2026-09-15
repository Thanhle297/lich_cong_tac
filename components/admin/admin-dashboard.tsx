'use client';

import { CircleAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAdminDashboard } from '@/hooks/use-admin-dashboard';
import { useAdminAuth } from './admin-auth-provider';
import { DashboardSummary } from './dashboard-summary';
import { LatestWeekCard } from './latest-week-card';
import { SetupStatusCard } from './setup-status-card';

export function AdminDashboard() {
  const { profile } = useAdminAuth();
  const { data, error, isLoading } = useAdminDashboard();
  const yearName =
    data.academicYear?.name ||
    data.academicYear?.label ||
    data.academicYear?.code ||
    'Năm học đang hoạt động';

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#0c6e85]">
            Xin chào, {profile?.full_name || 'Quản trị viên'}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Tổng quan lịch công tác
          </h1>
        </div>
        {data.academicYear ? (
          <p className="text-sm font-semibold text-slate-600">{yearName}</p>
        ) : null}
      </div>

      {error ? (
        <Alert className="mb-6 border-rose-200 bg-rose-50" variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Không thể tải dữ liệu quản trị</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <DashboardSummary data={data} isLoading={isLoading} />

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <LatestWeekCard
          isLoading={isLoading}
          latestWeek={data.latestWeek}
        />
        <SetupStatusCard data={data} />
      </section>
    </div>
  );
}
