import type {
  AcademicYear,
  Campus,
  EntryKind,
  EntryScope,
  Person,
  SessionType,
  TemplateAssigneeInput,
} from './admin-catalog-types';

export type WeekStatus = 'draft' | 'published' | 'archived';

export type AdminWeek = {
  id: string;
  academic_year_id: string;
  week_number: number;
  starts_on: string;
  ends_on: string;
  status: WeekStatus;
  published_at: string | null;
  published_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  academic_year: AcademicYear | null;
};

export type CreateWeekInput = {
  academic_year_id: string;
  week_number: number;
  starts_on: string;
  use_templates: boolean;
};

export type EntryAssignee = {
  person_id: string;
  role_label: string | null;
  person: Person | null;
};

export type AdminCalendarEntry = {
  id: string;
  week_id: string;
  scope: EntryScope;
  campus_id: string | null;
  kind: EntryKind;
  event_date: string;
  session: SessionType;
  time_text: string | null;
  content: string;
  location: string | null;
  note: string | null;
  sort_order: number;
  template_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  campus: Campus | null;
  assignees: EntryAssignee[];
};

export type CalendarEntryInput = Pick<
  AdminCalendarEntry,
  | 'scope'
  | 'campus_id'
  | 'kind'
  | 'event_date'
  | 'session'
  | 'time_text'
  | 'content'
  | 'location'
  | 'note'
  | 'sort_order'
> & {
  assignees: TemplateAssigneeInput[];
};

export type WeekEditorData = {
  week: AdminWeek | null;
  entries: AdminCalendarEntry[];
  campuses: Campus[];
  people: Person[];
};

export type WeekCellDefaults = Pick<
  CalendarEntryInput,
  'event_date' | 'scope' | 'campus_id' | 'kind' | 'session'
>;

export const weekStatusLabels: Record<WeekStatus, string> = {
  draft: 'Bản nháp',
  published: 'Đã phát hành',
  archived: 'Lưu trữ',
};
