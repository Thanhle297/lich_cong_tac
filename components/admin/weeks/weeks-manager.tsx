'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarRange, Plus, Settings2 } from 'lucide-react';

import { AdminContentHeader } from '@/components/admin/admin-content-header';
import { AdminFeedback } from '@/components/admin/admin-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminWeeks } from '@/hooks/use-admin-weeks';
import type { WeekStatus } from '@/lib/admin-week-types';
import { useAdminAuth } from '../admin-auth-provider';
import { WeekFormDialog } from './week-form-dialog';
import { WeekList } from './week-list';

type StatusFilter = 'all' | WeekStatus;

export function WeeksManager() {
  const router = useRouter();
  const { profile } = useAdminAuth();
  const {
    weeks,
    academicYears,
    isLoading,
    isSaving,
    error,
    message,
    createWeek,
    setWeekStatus,
    deleteWeek,
  } = useAdminWeeks(profile?.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const filteredWeeks = useMemo(
    () =>
      statusFilter === 'all'
        ? weeks
        : weeks.filter((week) => week.status === statusFilter),
    [statusFilter, weeks],
  );

  async function handleCreate(input: Parameters<typeof createWeek>[0]) {
    const weekId = await createWeek(input);
    if (weekId) {
      router.push(`/admin/weeks/${weekId}`);
    }
    return weekId;
  }

  return (
    <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8">
      <AdminContentHeader
        action={
          <Button
            className="w-full sm:w-auto"
            disabled={!academicYears.length}
            onClick={() => setDialogOpen(true)}
          >
            <Plus aria-hidden="true" />
            Tạo tuần công tác
          </Button>
        }
        description="Tạo tuần từ mẫu, soạn nội dung theo từng ngày và quản lý trạng thái phát hành."
        eyebrow="Lập lịch và phát hành"
        title="Tuần công tác"
      />
      <AdminFeedback error={error} message={message} />

      {!isLoading && !academicYears.length ? (
        <Card className="mb-5 border-amber-200 bg-amber-50/70">
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-amber-950">Chưa có năm học</p>
              <p className="mt-1 text-sm text-amber-800">
                Hãy tạo năm học trước khi bắt đầu một tuần công tác.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/settings">
                <Settings2 aria-hidden="true" />
                Mở cấu hình
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {filteredWeeks.length} tuần trong danh sách
        </p>
        <Select
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          value={statusFilter}
        >
          <SelectTrigger className="w-48 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
            <SelectItem value="published">Đã phát hành</SelectItem>
            <SelectItem value="archived">Lưu trữ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : filteredWeeks.length ? (
        <WeekList
          isAdmin={profile?.role === 'admin'}
          isSaving={isSaving}
          onDelete={deleteWeek}
          onSetStatus={setWeekStatus}
          weeks={filteredWeeks}
        />
      ) : (
        <Card className="border-dashed border-slate-300 bg-white/70">
          <CardContent className="grid min-h-72 place-items-center text-center">
            <div>
              <CalendarRange className="mx-auto size-10 text-slate-400" />
              <p className="mt-4 font-semibold text-slate-800">
                {weeks.length ? 'Không có tuần ở trạng thái này' : 'Chưa có tuần công tác'}
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                {weeks.length
                  ? 'Chọn trạng thái khác để xem các tuần đã tạo.'
                  : 'Tạo tuần trống hoặc sao chép nhanh từ các mẫu lịch đang hoạt động.'}
              </p>
              {!weeks.length && academicYears.length ? (
                <Button className="mt-5" onClick={() => setDialogOpen(true)}>
                  <Plus aria-hidden="true" />
                  Tạo tuần đầu tiên
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}

      <WeekFormDialog
        academicYears={academicYears}
        isSaving={isSaving}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        open={dialogOpen}
      />
    </main>
  );
}
