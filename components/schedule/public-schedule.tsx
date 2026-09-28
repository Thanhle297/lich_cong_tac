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
    <main className="min-h-svh bg-[linear-gradient(180deg,#eaf2f8_0px,#f5f8fb_320px)] text-slate-900">
      <div className="mx-auto max-w-[1500px] px-2.5 py-2.5 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
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

        <footer className="px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-5 text-center text-xs leading-5 text-slate-500 sm:pt-6">
          Lịch chỉ hiển thị nội dung đã được phát hành.
        </footer>
      </div>
    </main>
  );
}
