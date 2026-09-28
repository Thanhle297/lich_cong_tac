'use client';

import { AdminContentHeader } from '@/components/admin/admin-content-header';
import { AdminFeedback } from '@/components/admin/admin-feedback';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminSettings } from '@/hooks/use-admin-settings';
import { useAdminAuth } from '../admin-auth-provider';
import { AcademicYearsCard } from './academic-years-card';
import { CampusesCard } from './campuses-card';
import { SchoolSettingsCard } from './school-settings-card';

export function SettingsManager() {
  const { profile } = useAdminAuth();
  const {
    settings,
    academicYears,
    campuses,
    isLoading,
    isSaving,
    error,
    message,
    saveAppSettings,
    saveAcademicYear,
    setAcademicYearActive,
    deleteAcademicYear,
    saveCampus,
    setCampusActive,
    deleteCampus,
  } = useAdminSettings();

  return (
    <main className="mx-auto w-full max-w-[1380px] px-3.5 py-5 sm:px-6 sm:py-8">
      <AdminContentHeader
        description="Thiết lập thông tin trường, năm học hiện hành và ba phân hiệu sử dụng trong lịch công tác."
        eyebrow="Hệ thống"
        title="Cấu hình"
      />
      <AdminFeedback error={error} message={message} />

      {isLoading ? (
        <div className="grid gap-5">
          <Skeleton className="h-52 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-5">
          <SchoolSettingsCard
            canEdit={profile?.role === 'admin'}
            isSaving={isSaving}
            onSave={saveAppSettings}
            settings={settings}
          />
          <AcademicYearsCard
            isSaving={isSaving}
            onDelete={deleteAcademicYear}
            onSave={saveAcademicYear}
            onSetActive={setAcademicYearActive}
            years={academicYears}
          />
          <CampusesCard
            campuses={campuses}
            isSaving={isSaving}
            onDelete={deleteCampus}
            onSave={saveCampus}
            onSetActive={setCampusActive}
          />
        </div>
      )}
    </main>
  );
}
