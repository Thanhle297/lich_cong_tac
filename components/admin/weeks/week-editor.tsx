'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from '@/components/ui/plain-link';
import { useParams } from 'next/navigation';
import {
  Archive,
  ArrowLeft,
  Eye,
  FilePenLine,
  RotateCcw,
  Send,
} from 'lucide-react';

import { AdminFeedback } from '@/components/admin/admin-feedback';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeekEditor } from '@/hooks/use-week-editor';
import { formatDate } from '@/lib/admin-catalog-utils';
import type {
  AdminCalendarEntry,
  WeekCellDefaults,
} from '@/lib/admin-week-types';
import { weekStatusLabels } from '@/lib/admin-week-types';
import { addDays, formatPublishedAt } from '@/lib/admin-week-utils';
import { cn } from '@/lib/utils';
import { useAdminAuth } from '../admin-auth-provider';
import { EntryFormDialog } from './entry-form-dialog';
import { WeekEditorTable } from './week-editor-table';
import { WeekPreviewDialog } from './week-preview-dialog';

function ConfirmAction({
  title,
  description,
  actionLabel,
  disabled,
  variant = 'default',
  onConfirm,
  children,
}: {
  title: string;
  description: string;
  actionLabel: string;
  disabled: boolean;
  variant?: 'default' | 'outline' | 'destructive';
  onConfirm: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void onConfirm()}
            variant={variant}
          >
            {actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function WeekEditor() {
  const params = useParams<{ id: string }>();
  const weekId = params.id;
  const { profile } = useAdminAuth();
  const {
    week,
    entries,
    campuses,
    people,
    isLoading,
    isSaving,
    error,
    message,
    saveEntry,
    deleteEntry,
    moveEntry,
    publishWeek,
    setWeekStatus,
  } = useWeekEditor(weekId, profile?.id);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] =
    useState<AdminCalendarEntry | null>(null);
  const [selectedDefaults, setSelectedDefaults] =
    useState<WeekCellDefaults | null>(null);

  function openCreate(defaults: WeekCellDefaults) {
    setSelectedEntry(null);
    setSelectedDefaults(defaults);
    setEntryDialogOpen(true);
  }

  function openEdit(entry: AdminCalendarEntry) {
    setSelectedEntry(entry);
    setSelectedDefaults({
      event_date: entry.event_date,
      scope: entry.scope,
      campus_id: entry.campus_id,
      kind: entry.kind,
      session: entry.session,
    });
    setEntryDialogOpen(true);
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1600px] space-y-4 px-3.5 py-5 sm:px-6 sm:py-8">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-[560px] w-full" />
      </main>
    );
  }

  if (!week) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Card>
          <CardContent className="grid min-h-72 place-items-center text-center">
            <div>
              <FilePenLine className="mx-auto size-10 text-slate-400" />
              <h1 className="mt-4 text-xl font-bold text-slate-900">
                Không tìm thấy tuần công tác
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Tuần có thể đã bị xóa hoặc tài khoản hiện tại không có quyền xem.
              </p>
              <Button asChild className="mt-5" variant="outline">
                <Link href="/admin/weeks">
                  <ArrowLeft aria-hidden="true" />
                  Trở lại danh sách tuần
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const isAdmin = profile?.role === 'admin';
  const editable = week.status === 'draft';
  const selectedCampusLabel = selectedDefaults?.campus_id
    ? campuses.find((campus) => campus.id === selectedDefaults.campus_id)?.code
    : undefined;

  return (
    <main className="mx-auto w-full max-w-[1600px] px-3.5 py-5 sm:px-6 sm:py-8">
      <Button asChild className="mb-4" size="sm" variant="ghost">
        <Link href="/admin/weeks">
          <ArrowLeft aria-hidden="true" />
          Danh sách tuần
        </Link>
      </Button>

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_22px_rgba(15,40,70,0.05)] sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Tuần {week.week_number}
              </h1>
              <Badge
                className={cn(
                  week.status === 'draft' &&
                    'border-amber-200 bg-amber-50 text-amber-800',
                  week.status === 'published' &&
                    'border-emerald-200 bg-emerald-50 text-emerald-800',
                  week.status === 'archived' &&
                    'border-slate-200 bg-slate-100 text-slate-600',
                )}
                variant="outline"
              >
                {weekStatusLabels[week.status]}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {week.academic_year?.name ?? 'Năm học không còn tồn tại'} ·{' '}
              {formatDate(week.starts_on)} –{' '}
              {formatDate(addDays(week.starts_on, 6))}
            </p>
            {week.published_at ? (
              <p className="mt-1 text-xs text-slate-500">
                Phát hành lúc {formatPublishedAt(week)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setPreviewOpen(true)} variant="outline">
              <Eye aria-hidden="true" />
              Xem trước
            </Button>

            {isAdmin && week.status === 'draft' ? (
              <ConfirmAction
                actionLabel="Phát hành"
                description="Lịch sẽ hiển thị ngay trên trang công khai. Thời gian và tài khoản phát hành được lưu lại."
                disabled={isSaving || entries.length === 0}
                onConfirm={publishWeek}
                title={`Phát hành tuần ${week.week_number}?`}
              >
                <Button disabled={entries.length === 0}>
                  <Send aria-hidden="true" />
                  Phát hành
                </Button>
              </ConfirmAction>
            ) : null}

            {isAdmin && (week.status === 'published' || week.status === 'archived') ? (
              <ConfirmAction
                actionLabel="Đưa về nháp"
                description="Nếu tuần đang công khai, lịch sẽ được ẩn để bạn có thể chỉnh sửa và phát hành lại."
                disabled={isSaving}
                onConfirm={() => setWeekStatus('draft')}
                title="Đưa tuần về bản nháp?"
                variant="outline"
              >
                <Button variant="outline">
                  <RotateCcw aria-hidden="true" />
                  Đưa về nháp
                </Button>
              </ConfirmAction>
            ) : null}

            {isAdmin && week.status !== 'archived' ? (
              <ConfirmAction
                actionLabel="Lưu trữ"
                description="Tuần sẽ không còn xuất hiện trên trang công khai nhưng dữ liệu vẫn được giữ lại."
                disabled={isSaving}
                onConfirm={() => setWeekStatus('archived')}
                title="Lưu trữ tuần công tác?"
                variant="outline"
              >
                <Button variant="outline">
                  <Archive aria-hidden="true" />
                  Lưu trữ
                </Button>
              </ConfirmAction>
            ) : null}
          </div>
        </div>

        {!isAdmin && week.status === 'draft' ? (
          <p className="mt-4 rounded-lg bg-cyan-50 px-4 py-3 text-sm text-cyan-900">
            Bạn có thể soạn lịch. Chỉ Quản trị viên mới có quyền phát hành.
          </p>
        ) : null}
        {isAdmin && week.status === 'draft' && entries.length === 0 ? (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Hãy thêm ít nhất một nội dung trước khi phát hành.
          </p>
        ) : null}
      </section>

      <AdminFeedback error={error} message={message} />

      <WeekEditorTable
        campuses={campuses}
        editable={editable}
        entries={entries}
        isSaving={isSaving}
        onAdd={openCreate}
        onDelete={deleteEntry}
        onEdit={openEdit}
        onMove={moveEntry}
        week={week}
      />

      <EntryFormDialog
        campusLabel={selectedCampusLabel}
        defaults={selectedDefaults}
        entry={selectedEntry}
        isSaving={isSaving}
        onOpenChange={setEntryDialogOpen}
        onSubmit={saveEntry}
        open={entryDialogOpen}
        people={people}
      />
      <WeekPreviewDialog
        campuses={campuses}
        entries={entries}
        onOpenChange={setPreviewOpen}
        open={previewOpen}
        week={week}
      />
    </main>
  );
}
