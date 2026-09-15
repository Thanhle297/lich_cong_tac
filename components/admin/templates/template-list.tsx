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
      <CardContent className="px-0">
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
      </CardContent>
    </Card>
  );
}
