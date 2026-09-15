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
import { Textarea } from '@/components/ui/textarea';
import type { EntryKind, Person, SessionType } from '@/lib/admin-catalog-types';
import { entryKindLabels, sessionLabels } from '@/lib/admin-catalog-types';
import { formatDate } from '@/lib/admin-catalog-utils';
import type {
  AdminCalendarEntry,
  CalendarEntryInput,
  WeekCellDefaults,
} from '@/lib/admin-week-types';

function blankEntry(defaults: WeekCellDefaults): CalendarEntryInput {
  return {
    ...defaults,
    time_text: null,
    content: '',
    location: null,
    note: null,
    sort_order: 10,
    assignees: [],
  };
}

export function EntryFormDialog({
  open,
  entry,
  defaults,
  campusLabel,
  people,
  isSaving,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  entry: AdminCalendarEntry | null;
  defaults: WeekCellDefaults | null;
  campusLabel?: string;
  people: Person[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CalendarEntryInput, id?: string) => Promise<boolean>;
}) {
  const fallbackDefaults: WeekCellDefaults = defaults ?? {
    event_date: '',
    scope: 'common',
    campus_id: null,
    kind: 'schedule',
    session: 'morning',
  };
  const [form, setForm] = useState<CalendarEntryInput>(
    blankEntry(fallbackDefaults),
  );
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setValidationError('');
    if (entry) {
      setForm({
        scope: entry.scope,
        campus_id: entry.campus_id,
        kind: entry.kind,
        event_date: entry.event_date,
        session: entry.session,
        time_text: entry.time_text,
        content: entry.content,
        location: entry.location,
        note: entry.note,
        sort_order: entry.sort_order,
        assignees: entry.assignees.map((assignee) => ({
          person_id: assignee.person_id,
          role_label: assignee.role_label,
        })),
      });
    } else if (defaults) {
      setForm(blankEntry(defaults));
    }
  }, [defaults, entry, open]);

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

    if (!form.content.trim()) {
      setValidationError('Vui lòng nhập nội dung công việc.');
      return;
    }
    if (form.scope === 'campus' && !form.campus_id) {
      setValidationError('Nội dung phân hiệu phải thuộc một phân hiệu cụ thể.');
      return;
    }

    const saved = await onSubmit(form, entry?.id);
    if (saved) {
      onOpenChange(false);
    }
  }

  const contextLabel = form.event_date
    ? `${formatDate(form.event_date)} · ${
        form.scope === 'common'
          ? sessionLabels[form.session]
          : entry?.campus?.code ?? campusLabel ?? 'Phân hiệu'
      }`
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {entry ? 'Chỉnh sửa nội dung lịch' : 'Thêm nội dung lịch'}
            </DialogTitle>
            <DialogDescription>{contextLabel}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            {form.scope === 'campus' ? (
              <>
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
                      <SelectItem value="duty">{entryKindLabels.duty}</SelectItem>
                      <SelectItem value="assignment">
                        {entryKindLabels.assignment}
                      </SelectItem>
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
              </>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="entry-time">Thời gian</Label>
              <Input
                id="entry-time"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    time_text: event.target.value,
                  }))
                }
                placeholder="Ví dụ: 07:30 hoặc Sau tiết 2"
                value={form.time_text ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entry-order">Thứ tự trong ô</Label>
              <Input
                id="entry-order"
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
            <Label htmlFor="entry-content">Nội dung</Label>
            <Textarea
              autoFocus
              id="entry-content"
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
              <Label htmlFor="entry-location">Địa điểm</Label>
              <Input
                id="entry-location"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                value={form.location ?? ''}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="entry-note">Ghi chú</Label>
              <Input
                id="entry-note"
                onChange={(event) =>
                  setForm((current) => ({ ...current, note: event.target.value }))
                }
                value={form.note ?? ''}
              />
            </div>
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
                        onChange={(event) =>
                          setRoleLabel(person.id, event.target.value)
                        }
                        placeholder="Vai trò (không bắt buộc)"
                        value={selected?.role_label ?? ''}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-4 text-sm text-slate-500">
                Chưa có nhân sự. Bạn vẫn có thể lưu nội dung và bổ sung sau.
              </p>
            )}
          </fieldset>

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
              {isSaving ? 'Đang lưu...' : 'Lưu nội dung'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
