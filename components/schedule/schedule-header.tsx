import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Printer,
} from 'lucide-react';

import {
  defaultSchoolName,
  formatScheduleDate,
} from '@/lib/schedule-date';
import type {
  CalendarWeek,
  Settings,
} from '@/lib/schedule-types';

type ScheduleHeaderProps = {
  settings: Settings | null;
  weeks: CalendarWeek[];
  selectedWeek: CalendarWeek | null;
  selectedWeekId: string;
  selectedWeekIndex: number;
  isLoading: boolean;
  onSelectWeek: (weekId: string) => void;
  onMoveWeek: (direction: -1 | 1) => void;
};

export function ScheduleHeader({
  settings,
  weeks,
  selectedWeek,
  selectedWeekId,
  selectedWeekIndex,
  isLoading,
  onSelectWeek,
  onMoveWeek,
}: ScheduleHeaderProps) {
  return (
    <header className="mb-5 flex flex-col gap-5 rounded-2xl bg-[#08233f] px-5 py-5 text-white shadow-[0_16px_45px_rgba(8,35,63,0.18)] sm:px-8">
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400 text-[#08233f]">
            <CalendarDays aria-hidden="true" size={23} strokeWidth={2.4} />
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
              Năm học 2026–2027
            </p>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {settings?.school_name ?? defaultSchoolName}
            </h1>
          </div>
        </div>
        <button
          className="hidden items-center gap-2 rounded-lg border border-white/25 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 sm:flex"
          onClick={() => window.print()}
          type="button"
        >
          <Printer aria-hidden="true" size={16} />
          In lịch
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-t border-white/15 pt-4">
        <button
          aria-label="Xem tuần trước"
          className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
          disabled={selectedWeekIndex >= weeks.length - 1 || isLoading}
          onClick={() => onMoveWeek(-1)}
          type="button"
        >
          <ChevronLeft aria-hidden="true" size={20} />
        </button>
        <label className="sr-only" htmlFor="week-picker">
          Chọn tuần
        </label>
        <select
          className="h-10 min-w-60 rounded-lg border border-white/20 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-300"
          disabled={weeks.length === 0}
          id="week-picker"
          onChange={(event) => onSelectWeek(event.target.value)}
          value={selectedWeekId}
        >
          {weeks.length === 0 ? (
            <option>Chưa có lịch được phát hành</option>
          ) : (
            weeks.map((week) => (
              <option key={week.id} value={week.id}>
                Tuần {week.week_number} ·{' '}
                {formatScheduleDate(week.starts_on, {
                  day: '2-digit',
                  month: '2-digit',
                })}{' '}
                –{' '}
                {formatScheduleDate(week.ends_on, {
                  day: '2-digit',
                  month: '2-digit',
                })}
              </option>
            ))
          )}
        </select>
        <button
          aria-label="Xem tuần sau"
          className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
          disabled={selectedWeekIndex <= 0 || isLoading}
          onClick={() => onMoveWeek(1)}
          type="button"
        >
          <ChevronRight aria-hidden="true" size={20} />
        </button>
        {selectedWeek ? (
          <span className="ml-auto rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-200">
            Đã phát hành
          </span>
        ) : null}
      </div>
    </header>
  );
}
