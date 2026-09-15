'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { Campus, CampusInput } from '@/lib/admin-catalog-types';
import { campusCodes } from '@/lib/admin-catalog-types';
import { CampusDialog } from './campus-dialog';

export function CampusesCard({
  campuses,
  isSaving,
  onSave,
  onSetActive,
  onDelete,
}: {
  campuses: Campus[];
  isSaving: boolean;
  onSave: (input: CampusInput, id?: string) => Promise<boolean>;
  onSetActive: (campus: Campus, isActive: boolean) => Promise<boolean>;
  onDelete: (campus: Campus) => Promise<boolean>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const availableCodes = useMemo(
    () => campusCodes.filter((code) => !campuses.some((campus) => campus.code === code)),
    [campuses],
  );

  function openCreate() {
    setSelectedCampus(null);
    setDialogOpen(true);
  }

  function openEdit(campus: Campus) {
    setSelectedCampus(campus);
    setDialogOpen(true);
  }

  return (
    <>
      <Card className="border-slate-200 shadow-[0_8px_22px_rgba(15,40,70,0.05)]">
        <CardHeader>
          <CardTitle>Phân hiệu</CardTitle>
          <CardDescription>
            Ba cột TC, PH1 và PH2 hiển thị trong nhóm Trực và phân công.
          </CardDescription>
          <CardAction>
            <Button
              disabled={!availableCodes.length}
              onClick={openCreate}
              size="sm"
              variant="outline"
            >
              <Plus aria-hidden="true" />
              Thêm phân hiệu
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {campuses.map((campus) => (
              <article
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                key={campus.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-[#08233f] px-2 py-1 text-xs font-bold text-white">
                      {campus.code}
                    </span>
                    <h3 className="mt-3 font-semibold text-slate-900">{campus.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Thứ tự hiển thị: {campus.sort_order}
                    </p>
                  </div>
                  <Switch
                    aria-label={`Đổi trạng thái ${campus.name}`}
                    checked={campus.is_active}
                    disabled={isSaving}
                    onCheckedChange={(checked) =>
                      void onSetActive(campus, checked)
                    }
                  />
                </div>
                <div className="mt-4 flex justify-end gap-1 border-t border-slate-200 pt-3">
                  <Button
                    disabled={isSaving}
                    onClick={() => openEdit(campus)}
                    size="sm"
                    variant="ghost"
                  >
                    <Pencil aria-hidden="true" />
                    Sửa
                  </Button>
                  <ConfirmDeleteDialog
                    description={`Xóa ${campus.code} có thể xóa theo các mẫu gắn với phân hiệu này. Chỉ thực hiện khi phân hiệu không còn được sử dụng.`}
                    disabled={isSaving}
                    onConfirm={() => onDelete(campus)}
                    title="Xóa phân hiệu?"
                    trigger={
                      <Button size="sm" variant="ghost">
                        <Trash2 aria-hidden="true" />
                        Xóa
                      </Button>
                    }
                  />
                </div>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
      <CampusDialog
        availableCodes={availableCodes}
        campus={selectedCampus}
        isSaving={isSaving}
        onOpenChange={setDialogOpen}
        onSubmit={onSave}
        open={dialogOpen}
      />
    </>
  );
}
