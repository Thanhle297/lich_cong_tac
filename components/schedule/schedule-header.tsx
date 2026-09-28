import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Printer,
} from 'lucide-react';

import {
  defaultSchoolName,
  formatScheduleDate,
  getWeekEndDate,
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
    <header className="relative mb-3 overflow-hidden rounded-[1.25rem] bg-[#08233f] px-3.5 py-4 text-white shadow-[0_16px_45px_rgba(8,35,63,0.18)] sm:mb-5 sm:px-6 sm:py-6 lg:px-7">
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-cyan-400/10" />
      <div className="relative flex items-start justify-between gap-2.5 sm:gap-5">
        <div className="flex min-w-0 items-start gap-3 sm:gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400 text-[#08233f] shadow-sm sm:h-12 sm:w-12">
            <CalendarDays aria-hidden="true" size={22} strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-amber-300 sm:text-xs sm:tracking-[0.18em]">
              Năm học 2026–2027
            </p>
            <h1 className="text-[clamp(1rem,4.8vw,1.5rem)] font-bold leading-tight tracking-tight sm:text-2xl">
              {settings?.school_name ?? defaultSchoolName}
            </h1>
          </div>
        </div>
        <button
          aria-label="In lịch công tác"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white/10 sm:flex sm:w-auto sm:gap-2 sm:px-3 sm:text-sm sm:font-semibold"
          onClick={() => window.print()}
          type="button"
        >
          <Printer aria-hidden="true" size={16} />
          <span className="hidden sm:inline">In lịch</span>
        </button>
      </div>

      <div className="relative mt-4 flex flex-col gap-3 border-t border-white/15 pt-4 sm:mt-5 md:flex-row md:items-center">
        <div className="grid min-w-0 flex-1 grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 sm:grid-cols-[2.75rem_minmax(14rem,28rem)_2.75rem] sm:gap-2.5">
          <button
            aria-label="Xem tuần trước"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
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
            className="h-11 min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-300 sm:max-w-md sm:px-3 sm:text-sm"
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
                  {formatScheduleDate(getWeekEndDate(week.starts_on), {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </option>
              ))
            )}
          </select>
          <button
            aria-label="Xem tuần sau"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={selectedWeekIndex <= 0 || isLoading}
            onClick={() => onMoveWeek(1)}
            type="button"
          >
            <ChevronRight aria-hidden="true" size={20} />
          </button>
        </div>
        {selectedWeek ? (
          <div className="flex items-center justify-between gap-3 md:shrink-0 md:justify-end">
            <span className="text-xs text-slate-300 md:hidden">Lịch đang hiển thị</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-bold text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Đã phát hành
            </span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
