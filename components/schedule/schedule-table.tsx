import { LoaderCircle } from 'lucide-react';

import { formatScheduleDate } from '@/lib/schedule-date';
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

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,40,70,0.08)]">
      <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-bold text-slate-900">
            Tuần {selectedWeek.week_number}
          </p>
          <p className="text-sm text-slate-500">
            Từ{' '}
            {formatScheduleDate(selectedWeek.starts_on, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}{' '}
            đến{' '}
            {formatScheduleDate(selectedWeek.ends_on, {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        </div>
        {isLoadingEntries ? (
          <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
            Đang cập nhật
          </span>
        ) : (
          <span className="text-sm text-slate-500">
            {entryCountLabel ?? `${entries.length} nội dung đã phát hành`}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
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
                colSpan={3}
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
