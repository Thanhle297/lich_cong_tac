'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  AcademicYear,
  AcademicYearInput,
  AppSettings,
  AppSettingsInput,
  Campus,
  CampusInput,
} from '@/lib/admin-catalog-types';
import { adminDataError } from '@/lib/admin-catalog-utils';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export function useAdminSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabaseBrowserClient();
      const [settingsResult, yearsResult, campusesResult] = await Promise.all([
        supabase
          .from('app_settings')
          .select('id,school_name,timezone,updated_at')
          .eq('id', true)
          .maybeSingle(),
        supabase
          .from('academic_years')
          .select('id,name,starts_on,ends_on,is_active,created_at,updated_at')
          .order('starts_on', { ascending: false }),
        supabase
          .from('campuses')
          .select('id,code,name,sort_order,is_active,created_at,updated_at')
          .order('sort_order'),
      ]);
      const firstError = [
        settingsResult.error,
        yearsResult.error,
        campusesResult.error,
      ].find(Boolean);

      if (firstError) {
        throw firstError;
      }

      setSettings((settingsResult.data as AppSettings | null) ?? null);
      setAcademicYears((yearsResult.data ?? []) as AcademicYear[]);
      setCampuses((campusesResult.data ?? []) as Campus[]);
    } catch (loadError) {
      setError(adminDataError(loadError, 'Không thể tải cấu hình hệ thống.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const runMutation = useCallback(
    async (action: () => Promise<{ error: unknown }>, successMessage: string) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const result = await action();
        if (result.error) {
          throw result.error;
        }
        setMessage(successMessage);
        await loadSettings();
        return true;
      } catch (mutationError) {
        setError(adminDataError(mutationError, 'Không thể lưu thay đổi.'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadSettings],
  );

  const saveAppSettings = useCallback(
    (input: AppSettingsInput) =>
      runMutation(
        async () =>
          getSupabaseBrowserClient()
            .from('app_settings')
            .upsert({
              id: true,
              school_name: input.school_name.trim(),
              timezone: input.timezone,
            }),
        'Đã cập nhật thông tin trường.',
      ),
    [runMutation],
  );

  const saveAcademicYear = useCallback(
    async (input: AcademicYearInput, id?: string) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const supabase = getSupabaseBrowserClient();
        const payload = {
          name: input.name.trim(),
          starts_on: input.starts_on,
          ends_on: input.ends_on,
          is_active: input.is_active,
        };
        const saveResult = id
          ? await supabase
              .from('academic_years')
              .update(payload)
              .eq('id', id)
              .select('id')
              .single()
          : await supabase
              .from('academic_years')
              .insert(payload)
              .select('id')
              .single();

        if (saveResult.error) {
          throw saveResult.error;
        }

        if (input.is_active) {
          const { error: deactivateError } = await supabase
            .from('academic_years')
            .update({ is_active: false })
            .eq('is_active', true)
            .neq('id', saveResult.data.id);

          if (deactivateError) {
            throw deactivateError;
          }
        }

        setMessage(id ? 'Đã cập nhật năm học.' : 'Đã thêm năm học.');
        await loadSettings();
        return true;
      } catch (saveError) {
        setError(adminDataError(saveError, 'Không thể lưu năm học.'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadSettings],
  );

  const setAcademicYearActive = useCallback(
    async (year: AcademicYear) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const supabase = getSupabaseBrowserClient();
        const { error: activateError } = await supabase
          .from('academic_years')
          .update({ is_active: true })
          .eq('id', year.id);

        if (activateError) {
          throw activateError;
        }

        const { error: deactivateError } = await supabase
          .from('academic_years')
          .update({ is_active: false })
          .eq('is_active', true)
          .neq('id', year.id);

        if (deactivateError) {
          throw deactivateError;
        }

        setMessage(`Đã đặt ${year.name} làm năm học hiện hành.`);
        await loadSettings();
      } catch (activateError) {
        setError(adminDataError(activateError, 'Không thể đổi năm học hiện hành.'));
      } finally {
        setIsSaving(false);
      }
    },
    [loadSettings],
  );

  const deleteAcademicYear = useCallback(
    (year: AcademicYear) =>
      runMutation(
        async () =>
          getSupabaseBrowserClient()
            .from('academic_years')
            .delete()
            .eq('id', year.id),
        'Đã xóa năm học.',
      ),
    [runMutation],
  );

  const saveCampus = useCallback(
    (input: CampusInput, id?: string) =>
      runMutation(
        async () => {
          const supabase = getSupabaseBrowserClient();
          const payload = {
            code: input.code,
            name: input.name.trim(),
            sort_order: input.sort_order,
            is_active: input.is_active,
          };
          return id
            ? supabase.from('campuses').update(payload).eq('id', id)
            : supabase.from('campuses').insert(payload);
        },
        id ? 'Đã cập nhật phân hiệu.' : 'Đã thêm phân hiệu.',
      ),
    [runMutation],
  );

  const setCampusActive = useCallback(
    (campus: Campus, isActive: boolean) =>
      runMutation(
        async () =>
          getSupabaseBrowserClient()
            .from('campuses')
            .update({ is_active: isActive })
            .eq('id', campus.id),
        isActive ? 'Đã kích hoạt phân hiệu.' : 'Đã tạm ngưng phân hiệu.',
      ),
    [runMutation],
  );

  const deleteCampus = useCallback(
    (campus: Campus) =>
      runMutation(
        async () =>
          getSupabaseBrowserClient()
            .from('campuses')
            .delete()
            .eq('id', campus.id),
        'Đã xóa phân hiệu.',
      ),
    [runMutation],
  );

  return {
    settings,
    academicYears,
    campuses,
    isLoading,
    isSaving,
    error,
    message,
    reload: loadSettings,
    saveAppSettings,
    saveAcademicYear,
    setAcademicYearActive,
    deleteAcademicYear,
    saveCampus,
    setCampusActive,
    deleteCampus,
  };
}
