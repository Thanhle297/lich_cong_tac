'use client';

import { useEffect, useState } from 'react';

import type {
  AcademicYear,
  AdminDashboardData,
  LatestWeek,
} from '@/lib/admin-types';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

const initialData: AdminDashboardData = {
  academicYear: null,
  latestWeek: null,
  totalWeeks: 0,
  draftWeeks: 0,
  publishedWeeks: 0,
  activePeople: 0,
  activeTemplates: 0,
};

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError('');

      try {
        const supabase = getSupabaseBrowserClient();
        const [
          yearResult,
          latestWeekResult,
          totalWeeksResult,
          draftWeeksResult,
          publishedWeeksResult,
          peopleResult,
          templatesResult,
        ] = await Promise.all([
          supabase
            .from('academic_years')
            .select('*')
            .eq('is_active', true)
            .order('starts_on', { ascending: false })
            .limit(1)
            .maybeSingle<AcademicYear>(),
          supabase
            .from('calendar_weeks')
            .select('id,week_number,starts_on,ends_on,status,published_at')
            .order('starts_on', { ascending: false })
            .limit(1)
            .maybeSingle<LatestWeek>(),
          supabase.from('calendar_weeks').select('id', {
            count: 'exact',
            head: true,
          }),
          supabase
            .from('calendar_weeks')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'draft'),
          supabase
            .from('calendar_weeks')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'published'),
          supabase
            .from('people')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true),
          supabase
            .from('recurring_templates')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true),
        ]);

        const firstError = [
          yearResult.error,
          latestWeekResult.error,
          totalWeeksResult.error,
          draftWeeksResult.error,
          publishedWeeksResult.error,
          peopleResult.error,
          templatesResult.error,
        ].find(Boolean);

        if (firstError) {
          throw firstError;
        }

        if (isActive) {
          setData({
            academicYear: yearResult.data,
            latestWeek: latestWeekResult.data,
            totalWeeks: totalWeeksResult.count ?? 0,
            draftWeeks: draftWeeksResult.count ?? 0,
            publishedWeeks: publishedWeeksResult.count ?? 0,
            activePeople: peopleResult.count ?? 0,
            activeTemplates: templatesResult.count ?? 0,
          });
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Không thể tải dữ liệu tổng quan.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  return { data, error, isLoading };
}
