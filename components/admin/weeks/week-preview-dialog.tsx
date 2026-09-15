'use client';

import { ScheduleTable } from '@/components/schedule/schedule-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Campus } from '@/lib/admin-catalog-types';
import type { AdminCalendarEntry, AdminWeek } from '@/lib/admin-week-types';
import { getWeekDays } from '@/lib/schedule-date';

export function WeekPreviewDialog({
  open,
  week,
  campuses,
  entries,
  onOpenChange,
}: {
  open: boolean;
  week: AdminWeek;
  campuses: Campus[];
  entries: AdminCalendarEntry[];
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[calc(100vw-3rem)]">
        <DialogHeader>
          <DialogTitle>Xem trước tuần công tác</DialogTitle>
          <DialogDescription>
            Đây là cách nội dung sẽ hiển thị trên trang lịch công khai sau khi phát hành.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-2xl bg-slate-50 p-2 sm:p-4">
          <ScheduleTable
            campuses={campuses}
            days={getWeekDays(week.starts_on)}
            entries={entries}
            entryCountLabel={`${entries.length} nội dung trong bản xem trước`}
            isLoadingEntries={false}
            selectedWeek={week}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
