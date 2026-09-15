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
import type { Person, PersonInput } from '@/lib/admin-catalog-types';

const emptyForm: PersonInput = {
  code: null,
  full_name: '',
  job_title: null,
  is_active: true,
};

export function PersonFormDialog({
  open,
  person,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  person: Person | null;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: PersonInput, id?: string) => Promise<boolean>;
}) {
  const [form, setForm] = useState<PersonInput>(emptyForm);

  useEffect(() => {
    setForm(
      person
        ? {
            code: person.code,
            full_name: person.full_name,
            job_title: person.job_title,
            is_active: person.is_active,
          }
        : emptyForm,
    );
  }, [open, person]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.full_name.trim()) {
      return;
    }

    const saved = await onSubmit(form, person?.id);
    if (saved) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{person ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự'}</DialogTitle>
            <DialogDescription>
              Thông tin này được dùng khi chọn người phụ trách cho mẫu và lịch tuần.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="person-code">Mã nhân sự</Label>
              <Input
                id="person-code"
                maxLength={50}
                onChange={(event) =>
                  setForm((current) => ({ ...current, code: event.target.value }))
                }
                placeholder="Ví dụ: GV001"
                value={form.code ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="person-name">Họ và tên</Label>
              <Input
                autoFocus
                id="person-name"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    full_name: event.target.value,
                  }))
                }
                required
                value={form.full_name}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="person-title">Chức vụ / nhiệm vụ</Label>
              <Input
                id="person-title"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    job_title: event.target.value,
                  }))
                }
                placeholder="Ví dụ: Hiệu trưởng, Giáo viên"
                value={form.job_title ?? ''}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <Label htmlFor="person-active">Đang sử dụng</Label>
                <p className="mt-1 text-xs text-slate-500">
                  Nhân sự đang hoạt động sẽ xuất hiện trong danh sách chọn.
                </p>
              </div>
              <Switch
                checked={form.is_active}
                id="person-active"
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, is_active: checked }))
                }
              />
            </div>
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
            <Button disabled={isSaving || !form.full_name.trim()} type="submit">
              {isSaving ? 'Đang lưu...' : 'Lưu nhân sự'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
