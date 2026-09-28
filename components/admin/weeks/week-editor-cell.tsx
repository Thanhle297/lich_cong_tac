'use client';

import { ArrowDown, ArrowUp, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';

import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { entryKindLabels, sessionLabels } from '@/lib/admin-catalog-types';
import type {
  AdminCalendarEntry,
  WeekCellDefaults,
} from '@/lib/admin-week-types';
import { cn } from '@/lib/utils';

export function WeekEditorCell({
  entries,
  defaults,
  editable,
  isSaving,
  onAdd,
  onEdit,
  onDelete,
  onMove,
  compact = false,
}: {
  entries: AdminCalendarEntry[];
  defaults: WeekCellDefaults;
  editable: boolean;
  isSaving: boolean;
  onAdd: (defaults: WeekCellDefaults) => void;
  onEdit: (entry: AdminCalendarEntry) => void;
  onDelete: (entry: AdminCalendarEntry) => Promise<void>;
  onMove: (
    entry: AdminCalendarEntry,
    direction: 'up' | 'down',
  ) => Promise<void>;
  compact?: boolean;
}) {
  return (
    <div className={cn('space-y-2', compact ? 'min-h-0' : 'min-h-28')}>
      {entries.map((entry, index) => (
        <article
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          key={entry.id}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {entry.time_text ? (
                <p className="text-xs font-bold text-[#0c6e85]">
                  {entry.time_text}
                </p>
              ) : null}
              <p className="mt-0.5 whitespace-pre-wrap text-sm font-semibold leading-5 text-slate-900">
                {entry.content}
              </p>
            </div>
            {entry.scope === 'campus' ? (
              <Badge className="shrink-0" variant="outline">
                {entryKindLabels[entry.kind]}
              </Badge>
            ) : null}
          </div>

          {entry.scope === 'campus' ? (
            <p className="mt-2 text-xs font-medium text-slate-500">
              {sessionLabels[entry.session]}
            </p>
          ) : null}
          {entry.location ? (
            <p className="mt-2 flex items-start gap-1 text-xs text-slate-500">
              <MapPin aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
              <span>{entry.location}</span>
            </p>
          ) : null}
          {entry.assignees.length ? (
            <p className="mt-2 text-xs leading-5 text-slate-600">
              <span className="font-semibold">Phụ trách: </span>
              {entry.assignees
                .map((assignee) =>
                  assignee.person
                    ? `${assignee.person.full_name}${
                        assignee.role_label ? ` (${assignee.role_label})` : ''
                      }`
                    : 'Nhân sự không còn tồn tại',
                )
                .join(', ')}
            </p>
          ) : null}
          {entry.note ? (
            <p className="mt-2 border-t border-slate-100 pt-2 text-xs italic leading-5 text-slate-500">
              {entry.note}
            </p>
          ) : null}

          {editable ? (
            <div className="mt-3 flex justify-end gap-1 border-t border-slate-100 pt-2">
              <Button
                aria-label="Đưa nội dung lên"
                disabled={isSaving || index === 0}
                onClick={() => void onMove(entry, 'up')}
                size="icon-sm"
                variant="ghost"
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                aria-label="Đưa nội dung xuống"
                disabled={isSaving || index === entries.length - 1}
                onClick={() => void onMove(entry, 'down')}
                size="icon-sm"
                variant="ghost"
              >
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button
                aria-label="Chỉnh sửa nội dung"
                disabled={isSaving}
                onClick={() => onEdit(entry)}
                size="icon-sm"
                variant="ghost"
              >
                <Pencil aria-hidden="true" />
              </Button>
              <ConfirmDeleteDialog
                description="Nội dung và danh sách người phụ trách đi kèm sẽ bị xóa khỏi tuần này."
                disabled={isSaving}
                onConfirm={() => onDelete(entry)}
                title="Xóa nội dung lịch?"
                trigger={
                  <Button
                    aria-label="Xóa nội dung"
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                }
              />
            </div>
          ) : null}
        </article>
      ))}

      {editable ? (
        <Button
          className="h-9 w-full border-dashed text-xs"
          disabled={isSaving}
          onClick={() => onAdd(defaults)}
          size="sm"
          variant="outline"
        >
          <Plus aria-hidden="true" />
          Thêm nội dung
        </Button>
      ) : !entries.length ? (
        <span className="text-sm text-slate-400">—</span>
      ) : null}
    </div>
  );
}
