'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { AcademicYear } from '@/lib/admin-catalog-types';
import type { CreateWeekInput } from '@/lib/admin-week-types';
import { isDateInsideAcademicYear, isMonday } from '@/lib/admin-week-utils';

const emptyForm: CreateWeekInput = {
  academic_year_id: '',
  week_number: 1,
  starts_on: '',
  use_templates: true,
};

export function WeekFormDialog({
  open,
  academicYears,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  academicYears: AcademicYear[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateWeekInput) => Promise<string | null>;
}) {
  const [form, setForm] = useState<CreateWeekInput>(emptyForm);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const preferredYear =
      academicYears.find((year) => year.is_active) ?? academicYears[0];
    setForm({
      ...emptyForm,
      academic_year_id: preferredYear?.id ?? '',
    });
    setValidationError('');
  }, [academicYears, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError('');

    const academicYear = academicYears.find(
      (year) => year.id === form.academic_year_id,
    );
    if (!academicYear) {
      setValidationError('Vui lòng chọn năm học.');
      return;
    }
    if (!Number.isInteger(form.week_number) || form.week_number < 1) {
      setValidationError('Số tuần phải là số nguyên lớn hơn 0.');
      return;
    }
    if (!form.starts_on || !isMonday(form.starts_on)) {
      setValidationError('Ngày bắt đầu tuần phải là Thứ Hai.');
      return;
    }
    if (!isDateInsideAcademicYear(form.starts_on, academicYear)) {
      setValidationError('Tuần phải nằm trọn trong khoảng thời gian của năm học.');
      return;
    }

    const weekId = await onSubmit(form);
    if (weekId) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tạo tuần công tác</DialogTitle>
            <DialogDescription>
              Tuần luôn bắt đầu vào Thứ Hai và kết thúc vào Chủ nhật.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label>Năm học</Label>
              <Select
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    academic_year_id: value,
                  }))
                }
                value={form.academic_year_id || undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn năm học" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}{year.is_active ? ' — đang sử dụng' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="week-number">Số tuần</Label>
              <Input
                id="week-number"
                min={1}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    week_number: Number(event.target.value),
                  }))
                }
                required
                type="number"
                value={form.week_number}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="week-start">Ngày bắt đầu (Thứ Hai)</Label>
              <Input
                id="week-start"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    starts_on: event.target.value,
                  }))
                }
                required
                type="date"
                value={form.starts_on}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <Label htmlFor="week-templates">Tạo từ mẫu lịch</Label>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Sao chép tất cả mẫu đang hoạt động và người phụ trách vào tuần mới.
              </p>
            </div>
            <Switch
              checked={form.use_templates}
              id="week-templates"
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, use_templates: checked }))
              }
            />
          </div>

          {validationError ? (
            <p className="text-sm font-medium text-rose-700">{validationError}</p>
          ) : null}

          <DialogFooter>
            <Button
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Hủy
            </Button>
            <Button
              disabled={
                isSaving ||
                !form.academic_year_id ||
                !form.starts_on ||
                form.week_number < 1
              }
              type="submit"
            >
              {isSaving ? 'Đang tạo...' : 'Tạo tuần'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
