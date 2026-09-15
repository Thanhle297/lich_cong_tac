'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import type {
  Campus,
  EntryKind,
  EntryScope,
  Person,
  RecurringTemplate,
  RecurringTemplateInput,
  SessionType,
} from '@/lib/admin-catalog-types';
import { weekdayLabels } from '@/lib/admin-catalog-types';

const emptyForm: RecurringTemplateInput = {
  scope: 'common',
  campus_id: null,
  weekday: 1,
  session: 'morning',
  kind: 'schedule',
  time_text: null,
  content: '',
  location: null,
  note: null,
  sort_order: 10,
  is_active: true,
  assignees: [],
};

export function TemplateFormDialog({
  open,
  template,
  campuses,
  people,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  template: RecurringTemplate | null;
  campuses: Campus[];
  people: Person[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: RecurringTemplateInput, id?: string) => Promise<boolean>;
}) {
  const [form, setForm] = useState<RecurringTemplateInput>(emptyForm);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setValidationError('');
    setForm(
      template
        ? {
            scope: template.scope,
            campus_id: template.campus_id,
            weekday: template.weekday,
            session: template.session,
            kind: template.kind,
            time_text: template.time_text,
            content: template.content,
            location: template.location,
            note: template.note,
            sort_order: template.sort_order,
            is_active: template.is_active,
            assignees: template.assignees.map((assignee) => ({
              person_id: assignee.person_id,
              role_label: assignee.role_label,
            })),
          }
        : {
            ...emptyForm,
            campus_id: campuses[0]?.id ?? null,
          },
    );
  }, [campuses, open, template]);

  function setScope(scope: EntryScope) {
    setForm((current) => ({
      ...current,
      scope,
      campus_id: scope === 'campus' ? current.campus_id ?? campuses[0]?.id ?? null : null,
      kind: scope === 'common' ? 'schedule' : 'duty',
    }));
  }

  function togglePerson(personId: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      assignees: checked
        ? [...current.assignees, { person_id: personId, role_label: null }]
        : current.assignees.filter((assignee) => assignee.person_id !== personId),
    }));
  }

  function setRoleLabel(personId: string, roleLabel: string) {
    setForm((current) => ({
      ...current,
      assignees: current.assignees.map((assignee) =>
        assignee.person_id === personId
          ? { ...assignee, role_label: roleLabel }
          : assignee,
      ),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError('');

    if (form.scope === 'campus' && !form.campus_id) {
      setValidationError('Vui lòng chọn phân hiệu cho mẫu trực hoặc phân công.');
      return;
    }

    const saved = await onSubmit(form, template?.id);
    if (saved) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{template ? 'Chỉnh sửa mẫu lịch' : 'Thêm mẫu lịch'}</DialogTitle>
            <DialogDescription>
              Mẫu đang hoạt động sẽ được dùng khi tạo tuần mới từ mẫu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Phạm vi</Label>
              <Select
                onValueChange={(value) => setScope(value as EntryScope)}
                value={form.scope}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common">Lịch chung toàn trường</SelectItem>
                  <SelectItem value="campus">Theo phân hiệu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.scope === 'campus' ? (
              <div className="grid gap-2">
                <Label>Phân hiệu</Label>
                <Select
                  onValueChange={(value) =>
                    setForm((current) => ({ ...current, campus_id: value }))
                  }
                  value={form.campus_id ?? undefined}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn phân hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((campus) => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.code} — {campus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Loại nội dung</Label>
                <Input disabled value="Lịch chung" />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Ngày trong tuần</Label>
              <Select
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, weekday: Number(value) }))
                }
                value={String(form.weekday)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(weekdayLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Buổi</Label>
              <Select
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    session: value as SessionType,
                  }))
                }
                value={form.session}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Buổi sáng</SelectItem>
                  <SelectItem value="afternoon">Buổi chiều</SelectItem>
                  <SelectItem value="all_day">Cả ngày</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.scope === 'campus' ? (
              <div className="grid gap-2">
                <Label>Loại phân công</Label>
                <Select
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      kind: value as EntryKind,
                    }))
                  }
                  value={form.kind}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="duty">Trực</SelectItem>
                    <SelectItem value="assignment">Phân công</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="template-time">Thời gian</Label>
              <Input
                id="template-time"
                onChange={(event) =>
                  setForm((current) => ({ ...current, time_text: event.target.value }))
                }
                placeholder="Ví dụ: 07:30 hoặc Sau tiết 2"
                value={form.time_text ?? ''}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="template-content">Nội dung</Label>
            <Textarea
              autoFocus
              id="template-content"
              onChange={(event) =>
                setForm((current) => ({ ...current, content: event.target.value }))
              }
              required
              rows={3}
              value={form.content}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="template-location">Địa điểm</Label>
              <Input
                id="template-location"
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
                value={form.location ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-order">Thứ tự trong ô</Label>
              <Input
                id="template-order"
                min={0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sort_order: Number(event.target.value),
                  }))
                }
                type="number"
                value={form.sort_order}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="template-note">Ghi chú</Label>
            <Textarea
              id="template-note"
              onChange={(event) =>
                setForm((current) => ({ ...current, note: event.target.value }))
              }
              rows={2}
              value={form.note ?? ''}
            />
          </div>

          <fieldset className="rounded-xl border border-slate-200 p-4">
            <legend className="px-2 text-sm font-semibold text-slate-900">
              Người phụ trách
            </legend>
            {people.length ? (
              <div className="mt-1 grid max-h-60 gap-2 overflow-y-auto pr-1">
                {people.map((person) => {
                  const selected = form.assignees.find(
                    (assignee) => assignee.person_id === person.id,
                  );
                  return (
                    <div
                      className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_220px] sm:items-center"
                      key={person.id}
                    >
                      <label className="flex min-w-0 items-center gap-3 text-sm">
                        <Checkbox
                          checked={Boolean(selected)}
                          onCheckedChange={(checked) =>
                            togglePerson(person.id, checked === true)
                          }
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-800">
                            {person.full_name}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {person.job_title || person.code || 'Nhân sự'}
                            {!person.is_active ? ' · Đã tạm ngưng' : ''}
                          </span>
                        </span>
                      </label>
                      <Input
                        aria-label={`Vai trò của ${person.full_name}`}
                        disabled={!selected}
                        onChange={(event) => setRoleLabel(person.id, event.target.value)}
                        placeholder="Vai trò (không bắt buộc)"
                        value={selected?.role_label ?? ''}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-sm text-slate-500">
                Chưa có nhân sự. Bạn vẫn có thể lưu mẫu và bổ sung người phụ trách sau.
              </p>
            )}
          </fieldset>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>
              <Label htmlFor="template-active">Đang sử dụng</Label>
              <p className="mt-1 text-xs text-slate-500">
                Chỉ mẫu đang sử dụng mới được sao chép vào tuần mới.
              </p>
            </div>
            <Switch
              checked={form.is_active}
              id="template-active"
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, is_active: checked }))
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
            <Button disabled={isSaving || !form.content.trim()} type="submit">
              {isSaving ? 'Đang lưu...' : 'Lưu mẫu lịch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
