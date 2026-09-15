'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AppSettings, AppSettingsInput } from '@/lib/admin-catalog-types';

export function SchoolSettingsCard({
  settings,
  canEdit,
  isSaving,
  onSave,
}: {
  settings: AppSettings | null;
  canEdit: boolean;
  isSaving: boolean;
  onSave: (input: AppSettingsInput) => Promise<boolean>;
}) {
  const [schoolName, setSchoolName] = useState('Trường THCS Xuân Phương');
  const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');

  useEffect(() => {
    if (settings) {
      setSchoolName(settings.school_name);
      setTimezone(settings.timezone);
    }
  }, [settings]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void onSave({ school_name: schoolName, timezone });
  }

  return (
    <Card className="border-slate-200 shadow-[0_8px_22px_rgba(15,40,70,0.05)]">
      <CardHeader>
        <CardTitle>Thông tin trường</CardTitle>
        <CardDescription>
          Tên hiển thị trên lịch công khai và múi giờ dùng khi phát hành.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-[1fr_260px_auto] md:items-end" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="school-name">Tên trường</Label>
            <Input
              disabled={!canEdit || isSaving}
              id="school-name"
              onChange={(event) => setSchoolName(event.target.value)}
              required
              value={schoolName}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="school-timezone">Múi giờ</Label>
            <Select
              disabled={!canEdit || isSaving}
              onValueChange={setTimezone}
              value={timezone}
            >
              <SelectTrigger className="w-full" id="school-timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={!canEdit || isSaving || !schoolName.trim()}
            type="submit"
          >
            <Save aria-hidden="true" />
            Lưu
          </Button>
        </form>
        {!canEdit ? (
          <p className="mt-3 text-xs text-amber-700">
            Chỉ Quản trị viên được thay đổi thông tin trường.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
