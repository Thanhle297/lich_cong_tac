'use client';

import type { Campus } from '@/lib/admin-catalog-types';
import type {
  AdminCalendarEntry,
  AdminWeek,
  WeekCellDefaults,
} from '@/lib/admin-week-types';
import { getWeekDays } from '@/lib/schedule-date';
import { WeekEditorCell } from './week-editor-cell';

export function WeekEditorTable({
  week,
  campuses,
  entries,
  editable,
  isSaving,
  onAdd,
  onEdit,
  onDelete,
  onMove,
}: {
  week: AdminWeek;
  campuses: Campus[];
  entries: AdminCalendarEntry[];
  editable: boolean;
  isSaving: boolean;
  onAdd: (defaults: WeekCellDefaults) => void;
  onEdit: (entry: AdminCalendarEntry) => void;
  onDelete: (entry: AdminCalendarEntry) => Promise<void>;
  onMove: (
    entry: AdminCalendarEntry,
    direction: 'up' | 'down',
  ) => Promise<void>;
}) {
  const days = getWeekDays(week.starts_on);
  const entriesFor = (
    date: string,
    scope: AdminCalendarEntry['scope'],
    session?: AdminCalendarEntry['session'],
    campusId?: string,
  ) =>
    entries.filter(
      (entry) =>
        entry.event_date === date &&
        entry.scope === scope &&
        (!session || entry.session === session) &&
        (!campusId || entry.campus_id === campusId),
    );

  const cellProps = {
    editable,
    isSaving,
    onAdd,
    onEdit,
    onDelete,
    onMove,
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,40,70,0.08)]">
      <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-bold text-slate-900">Bảng soạn lịch</p>
          <p className="text-sm text-slate-500">
            {editable
              ? 'Chọn Thêm nội dung tại đúng ngày và cột cần soạn.'
              : 'Tuần chỉ đọc. Đưa về bản nháp trước khi chỉnh sửa.'}
          </p>
        </div>
        <span className="text-sm text-slate-500">{entries.length} nội dung</span>
      </div>

      <div className="divide-y divide-slate-200 lg:hidden">
        {days.map((day) => (
          <article className="px-3.5 py-5 sm:px-5" key={day.date}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-extrabold capitalize text-slate-900">
                {day.label}
              </h2>
              <span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-sm font-bold text-[#0c6e85]">
                {day.shortDate}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <section className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Buổi sáng
                </h3>
                <WeekEditorCell
                  compact
                  defaults={{
                    event_date: day.date,
                    scope: 'common',
                    campus_id: null,
                    kind: 'schedule',
                    session: 'morning',
                  }}
                  entries={entriesFor(day.date, 'common', 'morning')}
                  {...cellProps}
                />
              </section>
              <section className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Buổi chiều
                </h3>
                <WeekEditorCell
                  compact
                  defaults={{
                    event_date: day.date,
                    scope: 'common',
                    campus_id: null,
                    kind: 'schedule',
                    session: 'afternoon',
                  }}
                  entries={entriesFor(day.date, 'common', 'afternoon')}
                  {...cellProps}
                />
              </section>
            </div>

            {campuses.length ? (
              <section className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/45 p-3">
                <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                  Trực và phân công
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {campuses.map((campus) => (
                    <div className="min-w-0" key={campus.id}>
                      <p className="mb-2 text-xs font-extrabold text-[#0c6e85]">
                        {campus.code}
                      </p>
                      <WeekEditorCell
                        compact
                        defaults={{
                          event_date: day.date,
                          scope: 'campus',
                          campus_id: campus.id,
                          kind: 'duty',
                          session: 'morning',
                        }}
                        entries={entriesFor(
                          day.date,
                          'campus',
                          undefined,
                          campus.id,
                        )}
                        {...cellProps}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-3 rounded-xl border border-amber-200 bg-amber-50/55 p-3">
              <h3 className="mb-3 text-xs font-extrabold uppercase tracking-[0.08em] text-slate-500">
                Ghi chú
              </h3>
              <WeekEditorCell
                compact
                defaults={{
                  event_date: day.date,
                  scope: 'common',
                  campus_id: null,
                  kind: 'schedule',
                  session: 'all_day',
                }}
                entries={entriesFor(day.date, 'common', 'all_day')}
                {...cellProps}
              />
            </section>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1280px] border-collapse">
          <thead>
            <tr className="bg-[#0c6e85] text-left text-xs font-bold uppercase tracking-[0.07em] text-white">
              <th
                className="min-w-36 border-r border-white/20 px-4 py-3.5"
                rowSpan={2}
              >
                Thứ / ngày
              </th>
              <th
                className="min-w-64 border-r border-white/20 px-4 py-3.5"
                rowSpan={2}
              >
                Sáng
              </th>
              <th
                className="min-w-64 border-r border-white/20 px-4 py-3.5"
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
              <th className="min-w-52 px-4 py-3.5" rowSpan={2}>
                Ghi chú
              </th>
            </tr>
            <tr className="bg-[#0c6e85] text-center text-xs font-bold text-cyan-50">
              {campuses.map((campus) => (
                <th
                  className="min-w-60 border-r border-white/20 px-4 py-3"
                  key={campus.id}
                >
                  {campus.code}
                </th>
              ))}
              {Array.from({ length: Math.max(0, 3 - campuses.length) }).map(
                (_, index) => (
                  <th
                    className="min-w-60 border-r border-white/20 px-4 py-3"
                    key={`empty-campus-${index}`}
                  >
                    —
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {days.map((day, index) => (
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
                <td className="border-b border-r border-slate-200 px-3 py-4 align-top">
                  <WeekEditorCell
                    defaults={{
                      event_date: day.date,
                      scope: 'common',
                      campus_id: null,
                      kind: 'schedule',
                      session: 'morning',
                    }}
                    entries={entriesFor(day.date, 'common', 'morning')}
                    {...cellProps}
                  />
                </td>
                <td className="border-b border-r border-slate-200 px-3 py-4 align-top">
                  <WeekEditorCell
                    defaults={{
                      event_date: day.date,
                      scope: 'common',
                      campus_id: null,
                      kind: 'schedule',
                      session: 'afternoon',
                    }}
                    entries={entriesFor(day.date, 'common', 'afternoon')}
                    {...cellProps}
                  />
                </td>
                {campuses.map((campus) => (
                  <td
                    className="border-b border-r border-slate-200 px-3 py-4 align-top"
                    key={campus.id}
                  >
                    <WeekEditorCell
                      defaults={{
                        event_date: day.date,
                        scope: 'campus',
                        campus_id: campus.id,
                        kind: 'duty',
                        session: 'morning',
                      }}
                      entries={entriesFor(
                        day.date,
                        'campus',
                        undefined,
                        campus.id,
                      )}
                      {...cellProps}
                    />
                  </td>
                ))}
                {Array.from({ length: Math.max(0, 3 - campuses.length) }).map(
                  (_, campusIndex) => (
                    <td
                      className="border-b border-r border-slate-200 px-4 py-5 align-top text-sm text-slate-400"
                      key={`empty-campus-${campusIndex}`}
                    >
                      —
                    </td>
                  ),
                )}
                <td className="border-b border-slate-200 px-3 py-4 align-top">
                  <WeekEditorCell
                    defaults={{
                      event_date: day.date,
                      scope: 'common',
                      campus_id: null,
                      kind: 'schedule',
                      session: 'all_day',
                    }}
                    entries={entriesFor(day.date, 'common', 'all_day')}
                    {...cellProps}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
