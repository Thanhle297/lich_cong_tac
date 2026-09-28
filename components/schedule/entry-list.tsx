import type { CalendarEntry } from '@/lib/schedule-types';

export function EntryList({ entries }: { entries: CalendarEntry[] }) {
  if (entries.length === 0) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  return (
    <ul className="space-y-2.5">
      {entries.map((entry) => (
        <li
          className="border-l-2 border-amber-400 pl-2.5 text-[0.8125rem] leading-5 text-slate-700 [overflow-wrap:anywhere] sm:text-sm"
          key={entry.id}
        >
          {entry.time_text ? (
            <span className="mr-1 font-bold text-slate-900">
              {entry.time_text}
            </span>
          ) : null}
          <span className="whitespace-pre-line">{entry.content}</span>
          {entry.location ? (
            <span className="mt-0.5 block text-xs text-slate-500">
              {entry.location}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
