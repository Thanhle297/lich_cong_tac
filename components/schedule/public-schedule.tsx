'use client';

import { usePublicSchedule } from '@/hooks/use-public-schedule';
import { ScheduleHeader } from './schedule-header';
import {
  ScheduleEmpty,
  ScheduleError,
  ScheduleLoading,
} from './schedule-states';
import { ScheduleTable } from './schedule-table';

export function PublicSchedule() {
  const {
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
  } = usePublicSchedule();

  return (
    <main className="min-h-screen bg-[#f2f6fb] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-7 sm:py-8">
        <ScheduleHeader
          isLoading={isLoading}
          onMoveWeek={moveWeek}
          onSelectWeek={setSelectedWeekId}
          selectedWeek={selectedWeek}
          selectedWeekId={selectedWeekId}
          selectedWeekIndex={selectedWeekIndex}
          settings={settings}
          weeks={weeks}
        />

        <ScheduleError message={error} />

        {isLoading ? (
          <ScheduleLoading />
        ) : selectedWeek ? (
          <ScheduleTable
            campuses={campuses}
            days={days}
            entries={entries}
            isLoadingEntries={isLoadingEntries}
            selectedWeek={selectedWeek}
          />
        ) : (
          <ScheduleEmpty />
        )}

        <footer className="px-1 pt-5 text-center text-xs text-slate-500">
          Lịch chỉ hiển thị nội dung đã được phát hành.
        </footer>
      </div>
    </main>
  );
}
