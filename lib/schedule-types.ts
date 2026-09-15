export type Campus = {
  id: string;
  code: 'TC' | 'PH1' | 'PH2';
  name: string;
  sort_order: number;
};

export type CalendarWeek = {
  id: string;
  week_number: number;
  starts_on: string;
  ends_on: string;
  status: 'draft' | 'published' | 'archived';
};

export type CalendarEntry = {
  id: string;
  scope: 'common' | 'campus';
  campus_id: string | null;
  kind: 'schedule' | 'duty' | 'assignment';
  event_date: string;
  session: 'morning' | 'afternoon' | 'all_day';
  time_text: string | null;
  content: string;
  location: string | null;
  note: string | null;
  sort_order: number;
};

export type Settings = {
  school_name: string;
};

export type ScheduleDay = {
  date: string;
  label: string;
  shortDate: string;
};
