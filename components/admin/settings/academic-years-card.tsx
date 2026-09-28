'use client';

import { useState } from 'react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';

import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  AcademicYear,
  AcademicYearInput,
} from '@/lib/admin-catalog-types';
import { formatDate } from '@/lib/admin-catalog-utils';
import { AcademicYearDialog } from './academic-year-dialog';

export function AcademicYearsCard({
  years,
  isSaving,
  onSave,
  onSetActive,
  onDelete,
}: {
  years: AcademicYear[];
  isSaving: boolean;
  onSave: (input: AcademicYearInput, id?: string) => Promise<boolean>;
  onSetActive: (year: AcademicYear) => Promise<void>;
  onDelete: (year: AcademicYear) => Promise<boolean>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);

  function openCreate() {
    setSelectedYear(null);
    setDialogOpen(true);
  }

  function openEdit(year: AcademicYear) {
    setSelectedYear(year);
    setDialogOpen(true);
  }

  return (
    <>
      <Card className="border-slate-200 shadow-[0_8px_22px_rgba(15,40,70,0.05)]">
        <CardHeader>
          <CardTitle>Năm học</CardTitle>
          <CardDescription>
            Khoảng thời gian dùng để tạo và nhóm các tuần công tác.
          </CardDescription>
          <CardAction>
            <Button aria-label="Thêm năm học" onClick={openCreate} size="sm">
              <Plus aria-hidden="true" />
              <span className="hidden min-[480px]:inline">Thêm năm học</span>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="px-3.5 sm:px-5 lg:px-0">
          {years.length ? (
            <>
              <div className="grid gap-3 md:grid-cols-2 lg:hidden">
                {years.map((year) => (
                  <article
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                    key={year.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{year.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatDate(year.starts_on)} – {formatDate(year.ends_on)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          year.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {year.is_active ? 'Hiện hành' : 'Tạm ngưng'}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end gap-1 border-t border-slate-200 pt-3">
                      {!year.is_active ? (
                        <Button
                          aria-label={`Đặt ${year.name} làm hiện hành`}
                          disabled={isSaving}
                          onClick={() => void onSetActive(year)}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Check aria-hidden="true" />
                        </Button>
                      ) : null}
                      <Button
                        aria-label={`Sửa ${year.name}`}
                        disabled={isSaving}
                        onClick={() => openEdit(year)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <ConfirmDeleteDialog
                        description={`Xóa năm học ${year.name}. Năm học đã có tuần công tác có thể không xóa được để bảo toàn dữ liệu.`}
                        disabled={isSaving}
                        onConfirm={() => onDelete(year)}
                        title="Xóa năm học?"
                        trigger={
                          <Button
                            aria-label={`Xóa ${year.name}`}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        }
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden lg:block">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Tên</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="pr-6 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {years.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="pl-6 font-semibold">{year.name}</TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(year.starts_on)} – {formatDate(year.ends_on)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          year.is_active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {year.is_active ? 'Hiện hành' : 'Không hoạt động'}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-1">
                        {!year.is_active ? (
                          <Button
                            aria-label={`Đặt ${year.name} làm hiện hành`}
                            disabled={isSaving}
                            onClick={() => void onSetActive(year)}
                            size="icon-sm"
                            variant="ghost"
                          >
                            <Check aria-hidden="true" />
                          </Button>
                        ) : null}
                        <Button
                          aria-label={`Sửa ${year.name}`}
                          disabled={isSaving}
                          onClick={() => openEdit(year)}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                        <ConfirmDeleteDialog
                          description={`Xóa năm học ${year.name}. Năm học đã có tuần công tác có thể không xóa được để bảo toàn dữ liệu.`}
                          disabled={isSaving}
                          onConfirm={() => onDelete(year)}
                          title="Xóa năm học?"
                          trigger={
                            <Button
                              aria-label={`Xóa ${year.name}`}
                              size="icon-sm"
                              variant="ghost"
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <p className="px-2 py-10 text-center text-sm text-slate-500 sm:px-6">
              Chưa có năm học. Hãy tạo năm học đầu tiên trước khi tạo tuần công tác.
            </p>
          )}
        </CardContent>
      </Card>
      <AcademicYearDialog
        isSaving={isSaving}
        onOpenChange={setDialogOpen}
        onSubmit={onSave}
        open={dialogOpen}
        year={selectedYear}
      />
    </>
  );
}
