import { LoaderCircle } from 'lucide-react';

import { formatScheduleDate, getWeekEndDate } from '@/lib/schedule-date';
import type {
  CalendarEntry,
  CalendarWeek,
  Campus,
  ScheduleDay,
} from '@/lib/schedule-types';
import { EntryList } from './entry-list';

type ScheduleTableProps = {
  campuses: Campus[];
  days: ScheduleDay[];
  entries: CalendarEntry[];
  entryCountLabel?: string;
  isLoadingEntries: boolean;
  selectedWeek: CalendarWeek;
};

export function ScheduleTable({
  campuses,
  days,
  entries,
  entryCountLabel,
  isLoadingEntries,
  selectedWeek,
}: ScheduleTableProps) {
  const entriesFor = (
    date: string,
    scope: CalendarEntry['scope'],
    session?: CalendarEntry['session'],
    campusId?: string,
  ) =>
    entries.filter(
      (entry) =>
        entry.event_date === date &&
        entry.scope === scope &&
        (!session || entry.session === session) &&
        (!campusId || entry.campus_id === campusId),
    );

  const sectionLabelClass =
    'mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-slate-500';

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,40,70,0.08)]">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-3.5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-base font-extrabold text-slate-900">
            Tuần {selectedWeek.week_number}
          </p>
          <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:text-sm">
            Từ{' '}
            {formatScheduleDate(selectedWeek.starts_on, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}{' '}
            đến{' '}
            {formatScheduleDate(getWeekEndDate(selectedWeek.starts_on), {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        </div>
        {isLoadingEntries ? (
          <span className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm" aria-live="polite">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
            Đang cập nhật
          </span>
        ) : (
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:text-sm">
            {entryCountLabel ?? `${entries.length} nội dung đã phát hành`}
          </span>
        )}
      </div>

      <div className="divide-y divide-slate-200 lg:hidden print:hidden">
        {days.map((day) => {
          const morning = entriesFor(day.date, 'common', 'morning');
          const afternoon = entriesFor(day.date, 'common', 'afternoon');
          const notes = entriesFor(day.date, 'common', 'all_day');

          return (
            <article className="px-3.5 py-4 sm:px-5 sm:py-5 md:px-6" key={day.date}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-extrabold capitalize text-slate-900">
                  {day.label}
                </h2>
                <span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-sm font-bold text-[#0c6e85]">
                  {day.shortDate}
                </span>
              </div>

              <div className="grid gap-3 min-[480px]:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <p className={sectionLabelClass}>Buổi sáng</p>
                  <EntryList entries={morning} />
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                  <p className={sectionLabelClass}>Buổi chiều</p>
                  <EntryList entries={afternoon} />
                </div>
              </div>

              {campuses.length > 0 ? (
                <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/45 p-3.5">
                  <p className={sectionLabelClass}>Trực và phân công</p>
                  <div className="grid gap-3 min-[480px]:grid-cols-2">
                    {campuses.map((campus) => (
                      <div key={campus.id}>
                        <p className="mb-1.5 text-xs font-extrabold text-[#0c6e85]">
                          {campus.code}
                        </p>
                        <EntryList
                          entries={entriesFor(
                            day.date,
                            'campus',
                            undefined,
                            campus.id,
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {notes.length > 0 ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                  <p className={sectionLabelClass}>Ghi chú</p>
                  <EntryList entries={notes} />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto lg:block print:block">
        <table className="w-full min-w-[1120px] border-collapse">
          <thead>
            <tr className="bg-[#0c6e85] text-left text-xs font-bold uppercase tracking-[0.07em] text-white">
              <th
                className="min-w-36 border-r border-white/20 px-4 py-3.5"
                rowSpan={2}
              >
                Thứ / ngày
              </th>
              <th
                className="min-w-60 border-r border-white/20 px-4 py-3.5"
                rowSpan={2}
              >
                Sáng
              </th>
              <th
                className="min-w-60 border-r border-white/20 px-4 py-3.5"
                rowSpan={2}
              >
                Chiều
              </th>
              <th
                className="border-r border-white/20 px-4 py-3 text-center"
                colSpan={Math.max(3, campuses.length)}
              >
                Trực và phân công
              </th>
              <th className="min-w-40 px-4 py-3.5" rowSpan={2}>
                Ghi chú
              </th>
            </tr>
            <tr className="bg-[#0c6e85] text-center text-xs font-bold text-cyan-50">
              {campuses.map((campus) => (
                <th
                  className="min-w-48 border-r border-white/20 px-4 py-3"
                  key={campus.id}
                >
                  {campus.code}
                </th>
              ))}
              {Array.from({ length: Math.max(0, 3 - campuses.length) }).map(
                (_, index) => (
                  <th
                    className="min-w-48 border-r border-white/20 px-4 py-3"
                    key={index}
                  >
                    —
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => {
              const morning = entriesFor(day.date, 'common', 'morning');
              const afternoon = entriesFor(day.date, 'common', 'afternoon');
              const notes = entriesFor(day.date, 'common', 'all_day');

              return (
                <tr
                  className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                  key={day.date}
                >
                  <th className="border-b border-r border-slate-200 px-4 py-5 text-left align-top">
                    <p className="text-base font-bold capitalize text-slate-900">
                      {day.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#0c6e85]">
                      {day.shortDate}
                    </p>
                  </th>
                  <td className="border-b border-r border-slate-200 px-4 py-5 align-top">
                    <EntryList entries={morning} />
                  </td>
                  <td className="border-b border-r border-slate-200 px-4 py-5 align-top">
                    <EntryList entries={afternoon} />
                  </td>
                  {campuses.map((campus) => (
                    <td
                      className="border-b border-r border-slate-200 px-4 py-5 align-top"
                      key={campus.id}
                    >
                      <EntryList
                        entries={entriesFor(
                          day.date,
                          'campus',
                          undefined,
                          campus.id,
                        )}
                      />
                    </td>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - campuses.length) }).map(
                    (_, campusIndex) => (
                      <td
                        className="border-b border-r border-slate-200 px-4 py-5 align-top"
                        key={campusIndex}
                      >
                        <span className="text-sm text-slate-400">—</span>
                      </td>
                    ),
                  )}
                  <td className="border-b border-slate-200 px-4 py-5 align-top">
                    <EntryList entries={notes} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
