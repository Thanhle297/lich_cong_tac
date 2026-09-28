'use client';

import { useCallback, useEffect, useState } from 'react';

import type { AcademicYear } from '@/lib/admin-catalog-types';
import { adminDataError } from '@/lib/admin-catalog-utils';
import type {
  AdminWeek,
  CreateWeekInput,
  WeekStatus,
} from '@/lib/admin-week-types';
import { addDays } from '@/lib/admin-week-utils';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

type WeekRow = Omit<AdminWeek, 'academic_year'>;

export function useAdminWeeks(createdBy?: string) {
  const [weeks, setWeeks] = useState<AdminWeek[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadWeeks = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabaseBrowserClient();
      const [weeksResult, yearsResult] = await Promise.all([
        supabase
          .from('calendar_weeks')
          .select(
            'id,academic_year_id,week_number,starts_on,ends_on,status,published_at,published_by,created_by,created_at,updated_at',
          )
          .order('starts_on', { ascending: false }),
        supabase
          .from('academic_years')
          .select('id,name,starts_on,ends_on,is_active,created_at,updated_at')
          .order('starts_on', { ascending: false }),
      ]);
      const firstError = [weeksResult.error, yearsResult.error].find(Boolean);

      if (firstError) {
        throw firstError;
      }

      const years = (yearsResult.data ?? []) as AcademicYear[];
      const yearById = new Map(years.map((year) => [year.id, year]));
      setAcademicYears(years);
      setWeeks(
        ((weeksResult.data ?? []) as WeekRow[]).map((week) => ({
          ...week,
          academic_year: yearById.get(week.academic_year_id) ?? null,
        })),
      );
    } catch (loadError) {
      setError(adminDataError(loadError, 'Không thể tải danh sách tuần công tác.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWeeks();
  }, [loadWeeks]);

  const createWeek = useCallback(
    async (input: CreateWeekInput) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const supabase = getSupabaseBrowserClient();
        let weekId: string;

        if (input.use_templates) {
          const { data, error: createError } = await supabase.rpc(
            'create_week_from_templates',
            {
              p_academic_year_id: input.academic_year_id,
              p_week_number: input.week_number,
              p_starts_on: input.starts_on,
            },
          );

          if (createError) {
            throw createError;
          }
          weekId = data as string;

          const { error: updateEndsOnError } = await supabase
            .from('calendar_weeks')
            .update({ ends_on: addDays(input.starts_on, 6) })
            .eq('id', weekId);

          if (updateEndsOnError) {
            throw updateEndsOnError;
          }
        } else {
          const { data, error: createError } = await supabase
            .from('calendar_weeks')
            .insert({
              academic_year_id: input.academic_year_id,
              week_number: input.week_number,
              starts_on: input.starts_on,
              ends_on: addDays(input.starts_on, 6),
              status: 'draft',
              created_by: createdBy ?? null,
            })
            .select('id')
            .single();

          if (createError) {
            throw createError;
          }
          weekId = data.id;
        }

        setMessage(
          input.use_templates
            ? 'Đã tạo tuần và sao chép các mẫu đang hoạt động.'
            : 'Đã tạo tuần trống.',
        );
        await loadWeeks();
        return weekId;
      } catch (createError) {
        setError(adminDataError(createError, 'Không thể tạo tuần công tác.'));
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [createdBy, loadWeeks],
  );

  const setWeekStatus = useCallback(
    async (week: AdminWeek, status: Exclude<WeekStatus, 'published'>) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const payload =
          status === 'draft'
            ? { status, published_at: null, published_by: null }
            : { status };
        const { error: updateError } = await getSupabaseBrowserClient()
          .from('calendar_weeks')
          .update(payload)
          .eq('id', week.id);

        if (updateError) {
          throw updateError;
        }

        setMessage(
          status === 'draft'
            ? 'Đã đưa tuần về bản nháp.'
            : 'Đã chuyển tuần vào lưu trữ.',
        );
        await loadWeeks();
      } catch (updateError) {
        setError(adminDataError(updateError, 'Không thể đổi trạng thái tuần.'));
      } finally {
        setIsSaving(false);
      }
    },
    [loadWeeks],
  );

  const deleteWeek = useCallback(
    async (week: AdminWeek) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const { error: deleteError } = await getSupabaseBrowserClient()
          .from('calendar_weeks')
          .delete()
          .eq('id', week.id);

        if (deleteError) {
          throw deleteError;
        }

        setMessage('Đã xóa tuần công tác và toàn bộ nội dung của tuần.');
        await loadWeeks();
      } catch (deleteError) {
        setError(adminDataError(deleteError, 'Không thể xóa tuần công tác.'));
      } finally {
        setIsSaving(false);
      }
    },
    [loadWeeks],
  );

  return {
    weeks,
    academicYears,
    isLoading,
    isSaving,
    error,
    message,
    createWeek,
    setWeekStatus,
    deleteWeek,
  };
}
