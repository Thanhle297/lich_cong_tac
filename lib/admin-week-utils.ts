import type { AdminCalendarEntry, AdminWeek } from './admin-week-types';

export function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function isMonday(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).getDay() === 1;
}

export function isDateInsideAcademicYear(
  startsOn: string,
  academicYear: { starts_on: string; ends_on: string },
) {
  const endsOn = addDays(startsOn, 4);
  return startsOn >= academicYear.starts_on && endsOn <= academicYear.ends_on;
}

export function entryCellKey(entry: AdminCalendarEntry) {
  return entry.scope === 'common'
    ? `${entry.event_date}:common:${entry.session}`
    : `${entry.event_date}:campus:${entry.campus_id ?? ''}`;
}

export function formatPublishedAt(week: AdminWeek) {
  if (!week.published_at) {
    return '—';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(week.published_at));
}
