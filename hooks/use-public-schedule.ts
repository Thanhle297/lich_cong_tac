'use client';

import { useEffect, useMemo, useState } from 'react';

import { getWeekDays } from '@/lib/schedule-date';
import type {
  CalendarEntry,
  CalendarWeek,
  Campus,
  Settings,
} from '@/lib/schedule-types';
import { supabaseRest } from '@/lib/supabase-rest';

export function usePublicSchedule() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [weeks, setWeeks] = useState<CalendarWeek[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedWeekId, setSelectedWeekId] = useState('');
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [settingsData, weeksData, campusesData] = await Promise.all([
          supabaseRest<Settings[]>('app_settings?select=school_name&limit=1'),
          supabaseRest<CalendarWeek[]>(
            'calendar_weeks?select=id,week_number,starts_on,ends_on,status&status=eq.published&order=starts_on.desc',
          ),
          supabaseRest<Campus[]>(
            'campuses?select=id,code,name,sort_order&is_active=eq.true&order=sort_order.asc',
          ),
        ]);

        setSettings(settingsData[0] ?? null);
        setWeeks(weeksData);
        setCampuses(campusesData);
        setSelectedWeekId(weeksData[0]?.id ?? '');
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Không thể tải lịch công tác.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialData();
  }, []);

  useEffect(() => {
    async function loadEntries() {
      if (!selectedWeekId) {
        setEntries([]);
        return;
      }

      setIsLoadingEntries(true);
      try {
        const data = await supabaseRest<CalendarEntry[]>(
          `calendar_entries?select=id,scope,campus_id,kind,event_date,session,time_text,content,location,note,sort_order&week_id=eq.${selectedWeekId}&order=event_date.asc,scope.asc,sort_order.asc,created_at.asc`,
        );
        setEntries(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Không thể tải nội dung lịch.',
        );
      } finally {
        setIsLoadingEntries(false);
      }
    }

    void loadEntries();
  }, [selectedWeekId]);

  const selectedWeek = useMemo(
    () => weeks.find((week) => week.id === selectedWeekId) ?? null,
    [selectedWeekId, weeks],
  );
  const days = useMemo(
    () => (selectedWeek ? getWeekDays(selectedWeek.starts_on) : []),
    [selectedWeek],
  );
  const selectedWeekIndex = weeks.findIndex(
    (week) => week.id === selectedWeekId,
  );

  const moveWeek = (direction: -1 | 1) => {
    const nextIndex = selectedWeekIndex - direction;
    const nextWeek = weeks[nextIndex];

    if (nextWeek) {
      setSelectedWeekId(nextWeek.id);
    }
  };

  return {
    campuses,
    days,
    entries,
    error,
    isLoading,
    isLoadingEntries,
    moveWeek,
    selectedWeek,
    selectedWeekId,
    selectedWeekIndex,
    setSelectedWeekId,
    settings,
    weeks,
  };
}
