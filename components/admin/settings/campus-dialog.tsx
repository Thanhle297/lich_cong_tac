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
import type { Campus, CampusCode, CampusInput } from '@/lib/admin-catalog-types';

export function CampusDialog({
  open,
  campus,
  availableCodes,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  campus: Campus | null;
  availableCodes: CampusCode[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CampusInput, id?: string) => Promise<boolean>;
}) {
  const [form, setForm] = useState<CampusInput>({
    code: 'TC',
    name: '',
    sort_order: 1,
    is_active: true,
  });

  useEffect(() => {
    const firstCode = availableCodes[0] ?? 'TC';
    setForm(
      campus
        ? {
            code: campus.code,
            name: campus.name,
            sort_order: campus.sort_order,
            is_active: campus.is_active,
          }
        : {
            code: firstCode,
            name: '',
            sort_order: firstCode === 'TC' ? 1 : firstCode === 'PH1' ? 2 : 3,
            is_active: true,
          },
    );
  }, [availableCodes, campus, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit(form, campus?.id);
    if (saved) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{campus ? 'Chỉnh sửa phân hiệu' : 'Thêm phân hiệu'}</DialogTitle>
            <DialogDescription>
              Hệ thống chỉ sử dụng ba mã cố định TC, PH1 và PH2.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div className="grid gap-2">
                <Label htmlFor="campus-code">Mã phân hiệu</Label>
                <Select
                  disabled={Boolean(campus)}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      code: value as CampusCode,
                    }))
                  }
                  value={form.code}
                >
                  <SelectTrigger className="w-full" id="campus-code">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(campus ? [campus.code] : availableCodes).map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="campus-order">Thứ tự</Label>
                <Input
                  id="campus-order"
                  min={1}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sort_order: Number(event.target.value),
                    }))
                  }
                  required
                  type="number"
                  value={form.sort_order}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="campus-name">Tên hiển thị</Label>
              <Input
                autoFocus
                id="campus-name"
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Ví dụ: Trường chính"
                required
                value={form.name}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <Label htmlFor="campus-active">Đang sử dụng</Label>
              <Switch
                checked={form.is_active}
                id="campus-active"
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
            <Button disabled={isSaving || !form.name.trim()} type="submit">
              {isSaving ? 'Đang lưu...' : 'Lưu phân hiệu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
