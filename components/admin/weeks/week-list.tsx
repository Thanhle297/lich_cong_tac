'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Archive, FilePenLine, RotateCcw, Trash2 } from 'lucide-react';

import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/admin-catalog-utils';
import type { AdminWeek, WeekStatus } from '@/lib/admin-week-types';
import { weekStatusLabels } from '@/lib/admin-week-types';
import { formatPublishedAt } from '@/lib/admin-week-utils';
import { cn } from '@/lib/utils';

function statusClass(status: WeekStatus) {
  return cn(
    'whitespace-nowrap',
    status === 'draft' && 'border-amber-200 bg-amber-50 text-amber-800',
    status === 'published' &&
      'border-emerald-200 bg-emerald-50 text-emerald-800',
    status === 'archived' && 'border-slate-200 bg-slate-100 text-slate-600',
  );
}

function ConfirmStatusAction({
  title,
  description,
  actionLabel,
  disabled,
  variant = 'outline',
  onConfirm,
  children,
}: {
  title: string;
  description: string;
  actionLabel: string;
  disabled: boolean;
  variant?: 'outline' | 'destructive';
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

export function WeekList({
  weeks,
  isAdmin,
  isSaving,
  onDelete,
  onSetStatus,
}: {
  weeks: AdminWeek[];
  isAdmin: boolean;
  isSaving: boolean;
  onDelete: (week: AdminWeek) => Promise<void>;
  onSetStatus: (
    week: AdminWeek,
    status: Exclude<WeekStatus, 'published'>,
  ) => Promise<void>;
}) {
  return (
    <Card className="border-slate-200 shadow-[0_8px_22px_rgba(15,40,70,0.05)]">
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Tuần</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Phát hành lúc</TableHead>
              <TableHead className="pr-6 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeks.map((week) => (
              <TableRow key={week.id}>
                <TableCell className="pl-6 align-top">
                  <p className="font-semibold text-slate-900">
                    Tuần {week.week_number}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {week.academic_year?.name ?? 'Năm học không còn tồn tại'}
                  </p>
                </TableCell>
                <TableCell className="align-top text-sm text-slate-600">
                  {formatDate(week.starts_on)} – {formatDate(week.ends_on)}
                </TableCell>
                <TableCell className="align-top">
                  <Badge className={statusClass(week.status)} variant="outline">
                    {weekStatusLabels[week.status]}
                  </Badge>
                </TableCell>
                <TableCell className="align-top text-sm text-slate-600">
                  {formatPublishedAt(week)}
                </TableCell>
                <TableCell className="pr-6 align-top">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/weeks/${week.id}`}>
                        <FilePenLine aria-hidden="true" />
                        {week.status === 'draft' ? 'Soạn lịch' : 'Xem tuần'}
                      </Link>
                    </Button>

                    {isAdmin && week.status === 'published' ? (
                      <ConfirmStatusAction
                        actionLabel="Đưa về nháp"
                        description="Lịch sẽ tạm ẩn khỏi trang công khai. Sau đó bạn có thể chỉnh sửa và phát hành lại."
                        disabled={isSaving}
                        onConfirm={() => onSetStatus(week, 'draft')}
                        title="Đưa tuần về bản nháp?"
                      >
                        <Button size="sm" variant="outline">
                          <RotateCcw aria-hidden="true" />
                          Về nháp
                        </Button>
                      </ConfirmStatusAction>
                    ) : null}

                    {isAdmin && week.status === 'archived' ? (
                      <ConfirmStatusAction
                        actionLabel="Khôi phục"
                        description="Tuần sẽ trở lại trạng thái bản nháp để tiếp tục chỉnh sửa."
                        disabled={isSaving}
                        onConfirm={() => onSetStatus(week, 'draft')}
                        title="Khôi phục tuần đã lưu trữ?"
                      >
                        <Button size="sm" variant="outline">
                          <RotateCcw aria-hidden="true" />
                          Khôi phục
                        </Button>
                      </ConfirmStatusAction>
                    ) : null}

                    {isAdmin && week.status !== 'archived' ? (
                      <ConfirmStatusAction
                        actionLabel="Lưu trữ"
                        description="Tuần sẽ không còn xuất hiện trên trang công khai và được giữ lại trong danh sách lưu trữ."
                        disabled={isSaving}
                        onConfirm={() => onSetStatus(week, 'archived')}
                        title="Lưu trữ tuần công tác?"
                      >
                        <Button size="sm" variant="outline">
                          <Archive aria-hidden="true" />
                          Lưu trữ
                        </Button>
                      </ConfirmStatusAction>
                    ) : null}

                    {isAdmin ? (
                      <ConfirmDeleteDialog
                        description="Tuần và toàn bộ nội dung, người phụ trách trong tuần sẽ bị xóa vĩnh viễn."
                        disabled={isSaving}
                        onConfirm={() => onDelete(week)}
                        title={`Xóa tuần ${week.week_number}?`}
                        trigger={
                          <Button
                            aria-label={`Xóa tuần ${week.week_number}`}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        }
                      />
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
