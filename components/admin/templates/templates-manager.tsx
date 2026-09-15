'use client';

import { useState } from 'react';
import { Plus, Repeat2 } from 'lucide-react';

import { AdminContentHeader } from '@/components/admin/admin-content-header';
import { AdminFeedback } from '@/components/admin/admin-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminTemplates } from '@/hooks/use-admin-templates';
import type { RecurringTemplate } from '@/lib/admin-catalog-types';
import { useAdminAuth } from '../admin-auth-provider';
import { TemplateFormDialog } from './template-form-dialog';
import { TemplateList } from './template-list';

export function TemplatesManager() {
  const { profile } = useAdminAuth();
  const {
    templates,
    people,
    campuses,
    isLoading,
    isSaving,
    error,
    message,
    saveTemplate,
    setTemplateActive,
    deleteTemplate,
    moveTemplate,
  } = useAdminTemplates(profile?.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<RecurringTemplate | null>(null);

  function openCreate() {
    setSelectedTemplate(null);
    setDialogOpen(true);
  }

  function openEdit(template: RecurringTemplate) {
    setSelectedTemplate(template);
    setDialogOpen(true);
  }

  return (
    <main className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8">
      <AdminContentHeader
        action={
          <Button className="w-full sm:w-auto" onClick={openCreate}>
            <Plus aria-hidden="true" />
            Thêm mẫu lịch
          </Button>
        }
        description="Chuẩn bị các công việc lặp theo thứ, buổi và phân hiệu để tái sử dụng khi tạo tuần mới."
        eyebrow="Nội dung lặp"
        title="Mẫu lịch"
      />
      <AdminFeedback error={error} message={message} />

      {isLoading ? (
        <Card>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : templates.length ? (
        <TemplateList
          isSaving={isSaving}
          onDelete={deleteTemplate}
          onEdit={openEdit}
          onMove={moveTemplate}
          onSetActive={setTemplateActive}
          templates={templates}
        />
      ) : (
        <Card className="border-dashed border-slate-300 bg-white/70">
          <CardContent className="grid min-h-72 place-items-center text-center">
            <div>
              <Repeat2 className="mx-auto size-10 text-slate-400" />
              <p className="mt-4 font-semibold text-slate-800">Chưa có mẫu lịch</p>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                Tạo lịch chung hoặc mẫu trực, phân công cho TC, PH1 và PH2.
              </p>
              <Button className="mt-5" onClick={openCreate} variant="outline">
                <Plus aria-hidden="true" />
                Tạo mẫu đầu tiên
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <TemplateFormDialog
        campuses={campuses}
        isSaving={isSaving}
        onOpenChange={setDialogOpen}
        onSubmit={saveTemplate}
        open={dialogOpen}
        people={people}
        template={selectedTemplate}
      />
    </main>
  );
}
