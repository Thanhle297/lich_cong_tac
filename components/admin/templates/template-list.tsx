'use client';

import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';

import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { RecurringTemplate } from '@/lib/admin-catalog-types';
import {
  entryKindLabels,
  sessionLabels,
  weekdayLabels,
} from '@/lib/admin-catalog-types';

function sameGroup(left: RecurringTemplate, right: RecurringTemplate) {
  return (
    left.weekday === right.weekday &&
    left.session === right.session &&
    left.scope === right.scope &&
    left.campus_id === right.campus_id
  );
}

export function TemplateList({
  templates,
  isSaving,
  onEdit,
  onDelete,
  onSetActive,
  onMove,
}: {
  templates: RecurringTemplate[];
  isSaving: boolean;
  onEdit: (template: RecurringTemplate) => void;
  onDelete: (template: RecurringTemplate) => Promise<void>;
  onSetActive: (template: RecurringTemplate, isActive: boolean) => Promise<void>;
  onMove: (template: RecurringTemplate, direction: 'up' | 'down') => Promise<void>;
}) {
  return (
    <Card className="border-slate-200 shadow-[0_8px_22px_rgba(15,40,70,0.05)]">
      <CardContent className="px-3.5 sm:px-5 lg:px-0">
        <div className="grid gap-3 md:grid-cols-2 lg:hidden">
          {templates.map((template) => {
            const group = templates.filter((item) => sameGroup(item, template));
            const groupIndex = group.findIndex((item) => item.id === template.id);

            return (
              <article
                className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                key={template.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0c6e85]">
                      {weekdayLabels[template.weekday]} · {sessionLabels[template.session]}
                    </p>
                    <p className="mt-1 break-words font-semibold leading-6 text-slate-900">
                      {template.content}
                    </p>
                    {template.time_text || template.location ? (
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {[template.time_text, template.location].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                  </div>
                  <Badge className="shrink-0" variant="outline">
                    {entryKindLabels[template.kind]}
                  </Badge>
                </div>

                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Phạm vi
                    </dt>
                    <dd className="mt-1 text-slate-700">
                      {template.scope === 'common'
                        ? 'Toàn trường'
                        : template.campus
                          ? `${template.campus.code} — ${template.campus.name}`
                          : 'Phân hiệu không còn tồn tại'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Người phụ trách
                    </dt>
                    <dd className="mt-1 break-words leading-5 text-slate-700">
                      {template.assignees.length
                        ? template.assignees
                            .map((assignee) =>
                              assignee.person
                                ? `${assignee.person.full_name}${
                                    assignee.role_label ? ` (${assignee.role_label})` : ''
                                  }`
                                : 'Nhân sự không còn tồn tại',
                            )
                            .join(', ')
                        : '—'}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      aria-label={`Đổi trạng thái mẫu ${template.content}`}
                      checked={template.is_active}
                      disabled={isSaving}
                      onCheckedChange={(checked) =>
                        void onSetActive(template, checked)
                      }
                    />
                    <span className="text-xs text-slate-500">
                      {template.is_active ? 'Đang dùng' : 'Tạm ngưng'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 self-end">
                    <Button
                      aria-label="Đưa mẫu lên"
                      disabled={isSaving || groupIndex === 0}
                      onClick={() => void onMove(template, 'up')}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label="Đưa mẫu xuống"
                      disabled={isSaving || groupIndex === group.length - 1}
                      onClick={() => void onMove(template, 'down')}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <ArrowDown aria-hidden="true" />
                    </Button>
                    <Button
                      aria-label="Chỉnh sửa mẫu"
                      disabled={isSaving}
                      onClick={() => onEdit(template)}
                      size="icon-sm"
                      variant="ghost"
                    >
                      <Pencil aria-hidden="true" />
                    </Button>
                    <ConfirmDeleteDialog
                      description="Mẫu sẽ bị xóa cùng danh sách người phụ trách đã chọn. Các tuần đã tạo trước đó không bị ảnh hưởng."
                      disabled={isSaving}
                      onConfirm={() => onDelete(template)}
                      title="Xóa mẫu lịch?"
                      trigger={
                        <Button aria-label="Xóa mẫu" size="icon-sm" variant="ghost">
                          <Trash2 aria-hidden="true" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="hidden lg:block">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Thời điểm</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead>Phạm vi</TableHead>
              <TableHead>Người phụ trách</TableHead>
              <TableHead>Hoạt động</TableHead>
              <TableHead className="pr-6 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => {
              const group = templates.filter((item) => sameGroup(item, template));
              const groupIndex = group.findIndex((item) => item.id === template.id);
              return (
                <TableRow key={template.id}>
                  <TableCell className="pl-6 align-top">
                    <p className="font-semibold text-slate-900">
                      {weekdayLabels[template.weekday]}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {sessionLabels[template.session]}
                      {template.time_text ? ` · ${template.time_text}` : ''}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-sm whitespace-normal align-top">
                    <p className="font-semibold text-slate-900">{template.content}</p>
                    {template.location || template.note ? (
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {[template.location, template.note].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant="outline">{entryKindLabels[template.kind]}</Badge>
                    <p className="mt-2 text-xs text-slate-500">
                      {template.scope === 'common'
                        ? 'Toàn trường'
                        : template.campus
                          ? `${template.campus.code} — ${template.campus.name}`
                          : 'Phân hiệu không còn tồn tại'}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-64 whitespace-normal align-top text-sm text-slate-600">
                    {template.assignees.length
                      ? template.assignees
                          .map((assignee) =>
                            assignee.person
                              ? `${assignee.person.full_name}${
                                  assignee.role_label ? ` (${assignee.role_label})` : ''
                                }`
                              : 'Nhân sự không còn tồn tại',
                          )
                          .join(', ')
                      : '—'}
                  </TableCell>
                  <TableCell className="align-top">
                    <Switch
                      aria-label={`Đổi trạng thái mẫu ${template.content}`}
                      checked={template.is_active}
                      disabled={isSaving}
                      onCheckedChange={(checked) =>
                        void onSetActive(template, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="pr-6 align-top">
                    <div className="flex justify-end gap-1">
                      <Button
                        aria-label="Đưa mẫu lên"
                        disabled={isSaving || groupIndex === 0}
                        onClick={() => void onMove(template, 'up')}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <ArrowUp aria-hidden="true" />
                      </Button>
                      <Button
                        aria-label="Đưa mẫu xuống"
                        disabled={isSaving || groupIndex === group.length - 1}
                        onClick={() => void onMove(template, 'down')}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <ArrowDown aria-hidden="true" />
                      </Button>
                      <Button
                        aria-label="Chỉnh sửa mẫu"
                        disabled={isSaving}
                        onClick={() => onEdit(template)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <ConfirmDeleteDialog
                        description="Mẫu sẽ bị xóa cùng danh sách người phụ trách đã chọn. Các tuần đã tạo trước đó không bị ảnh hưởng."
                        disabled={isSaving}
                        onConfirm={() => onDelete(template)}
                        title="Xóa mẫu lịch?"
                        trigger={
                          <Button aria-label="Xóa mẫu" size="icon-sm" variant="ghost">
                            <Trash2 aria-hidden="true" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
