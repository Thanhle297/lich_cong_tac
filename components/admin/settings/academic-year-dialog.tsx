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
import { Switch } from '@/components/ui/switch';
import type {
  AcademicYear,
  AcademicYearInput,
} from '@/lib/admin-catalog-types';

const emptyForm: AcademicYearInput = {
  name: '',
  starts_on: '',
  ends_on: '',
  is_active: true,
};

export function AcademicYearDialog({
  open,
  year,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  year: AcademicYear | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: AcademicYearInput, id?: string) => Promise<boolean>;
}) {
  const [form, setForm] = useState<AcademicYearInput>(emptyForm);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setValidationError('');
    setForm(
      year
        ? {
            name: year.name,
            starts_on: year.starts_on,
            ends_on: year.ends_on,
            is_active: year.is_active,
          }
        : emptyForm,
    );
  }, [open, year]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError('');

    if (form.ends_on < form.starts_on) {
      setValidationError('Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.');
      return;
    }

    const saved = await onSubmit(form, year?.id);
    if (saved) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{year ? 'Chỉnh sửa năm học' : 'Thêm năm học'}</DialogTitle>
            <DialogDescription>
              Chỉ một năm học được đặt làm hiện hành tại một thời điểm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="year-name">Tên năm học</Label>
              <Input
                autoFocus
                id="year-name"
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Ví dụ: 2026–2027"
                required
                value={form.name}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="year-start">Ngày bắt đầu</Label>
                <Input
                  id="year-start"
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
              <div className="grid gap-2">
                <Label htmlFor="year-end">Ngày kết thúc</Label>
                <Input
                  id="year-end"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      ends_on: event.target.value,
                    }))
                  }
                  required
                  type="date"
                  value={form.ends_on}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <Label htmlFor="year-active">Năm học hiện hành</Label>
                <p className="mt-1 text-xs text-slate-500">
                  Bật tùy chọn này sẽ tắt trạng thái hiện hành của năm học khác.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                id="year-active"
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, is_active: checked }))
                }
              />
            </div>
            {validationError ? (
              <p className="text-sm font-medium text-rose-700">{validationError}</p>
            ) : null}
          </div>
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
                !form.name.trim() ||
                !form.starts_on ||
                !form.ends_on
              }
              type="submit"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu năm học'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
