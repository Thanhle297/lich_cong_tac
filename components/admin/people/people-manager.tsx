'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2, UserRoundX } from 'lucide-react';

import { AdminContentHeader } from '@/components/admin/admin-content-header';
import { AdminFeedback } from '@/components/admin/admin-feedback';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminPeople } from '@/hooks/use-admin-people';
import type { Person } from '@/lib/admin-catalog-types';
import { PersonFormDialog } from './person-form-dialog';

export function PeopleManager() {
  const {
    people,
    isLoading,
    isSaving,
    error,
    message,
    savePerson,
    setPersonActive,
    deletePerson,
  } = useAdminPeople();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  function openCreate() {
    setSelectedPerson(null);
    setDialogOpen(true);
  }

  function openEdit(person: Person) {
    setSelectedPerson(person);
    setDialogOpen(true);
  }

  return (
    <main className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8">
      <AdminContentHeader
        action={
          <Button className="w-full sm:w-auto" onClick={openCreate}>
            <Plus aria-hidden="true" />
            Thêm nhân sự
          </Button>
        }
        description="Quản lý cán bộ, giáo viên dùng trong mẫu công việc và nội dung lịch tuần."
        eyebrow="Danh mục"
        title="Nhân sự"
      />
      <AdminFeedback error={error} message={message} />

      <Card className="border-slate-200 shadow-[0_8px_22px_rgba(15,40,70,0.05)]">
        <CardContent className="px-0">
          {isLoading ? (
            <div className="space-y-3 px-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : people.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Mã</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Chức vụ / nhiệm vụ</TableHead>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead className="pr-6 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="pl-6 font-mono text-xs text-slate-500">
                      {person.code || '—'}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {person.full_name}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {person.job_title || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          aria-label={`Đổi trạng thái ${person.full_name}`}
                          checked={person.is_active}
                          disabled={isSaving}
                          onCheckedChange={(checked) =>
                            void setPersonActive(person, checked)
                          }
                        />
                        <span className="text-xs text-slate-500">
                          {person.is_active ? 'Đang dùng' : 'Tạm ngưng'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-1">
                        <Button
                          aria-label={`Sửa ${person.full_name}`}
                          disabled={isSaving}
                          onClick={() => openEdit(person)}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                        <ConfirmDeleteDialog
                          description={`Xóa ${person.full_name} khỏi danh mục. Nếu người này đang được phân công, Supabase sẽ ngăn việc xóa để bảo toàn dữ liệu.`}
                          disabled={isSaving}
                          onConfirm={() => deletePerson(person)}
                          title="Xóa nhân sự?"
                          trigger={
                            <Button
                              aria-label={`Xóa ${person.full_name}`}
                              size="icon-sm"
                              variant="ghost"
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid min-h-64 place-items-center px-6 text-center">
              <div>
                <UserRoundX className="mx-auto size-9 text-slate-400" />
                <p className="mt-3 font-semibold text-slate-800">Chưa có nhân sự</p>
                <p className="mt-1 text-sm text-slate-500">
                  Thêm cán bộ, giáo viên trước khi cấu hình người phụ trách.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PersonFormDialog
        isSaving={isSaving}
        onOpenChange={setDialogOpen}
        onSubmit={savePerson}
        open={dialogOpen}
        person={selectedPerson}
      />
    </main>
  );
}
