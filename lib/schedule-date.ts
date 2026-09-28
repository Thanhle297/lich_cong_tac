import type { ScheduleDay } from './schedule-types';

export const defaultSchoolName = 'Lịch công tác Trường THCS Xuân Phương';

const toLocalDateValue = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

export const getWeekEndDate = (startsOn: string) => {
  const sunday = new Date(`${startsOn}T00:00:00`);
  sunday.setDate(sunday.getDate() + 6);
  return toLocalDateValue(sunday);
};

export const formatScheduleDate = (
  date: string,
  options: Intl.DateTimeFormatOptions,
) =>
  new Intl.DateTimeFormat('vi-VN', options).format(
    new Date(`${date}T00:00:00`),
  );

export const getWeekDays = (startsOn: string): ScheduleDay[] => {
  const monday = new Date(`${startsOn}T00:00:00`);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const date = toLocalDateValue(day);

    return {
      date,
      label: formatScheduleDate(date, { weekday: 'long' }),
      shortDate: formatScheduleDate(date, {
        day: '2-digit',
        month: '2-digit',
      }),
    };
  });
};
