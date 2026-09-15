export type AcademicYear = {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AcademicYearInput = Pick<
  AcademicYear,
  'name' | 'starts_on' | 'ends_on' | 'is_active'
>;

export type AppSettings = {
  id: boolean;
  school_name: string;
  timezone: string;
  updated_at: string;
};

export type AppSettingsInput = Pick<AppSettings, 'school_name' | 'timezone'>;

export const campusCodes = ['TC', 'PH1', 'PH2'] as const;

export type CampusCode = (typeof campusCodes)[number];

export type Campus = {
  id: string;
  code: CampusCode;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CampusInput = Pick<
  Campus,
  'code' | 'name' | 'sort_order' | 'is_active'
>;

export type Person = {
  id: string;
  code: string | null;
  full_name: string;
  job_title: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PersonInput = Pick<
  Person,
  'code' | 'full_name' | 'job_title' | 'is_active'
>;

export type EntryScope = 'common' | 'campus';
export type EntryKind = 'schedule' | 'duty' | 'assignment';
export type SessionType = 'morning' | 'afternoon' | 'all_day';

export type TemplateAssignee = {
  person_id: string;
  role_label: string | null;
  person: Person | null;
};

export type TemplateAssigneeInput = Pick<
  TemplateAssignee,
  'person_id' | 'role_label'
>;

export type RecurringTemplate = {
  id: string;
  scope: EntryScope;
  campus_id: string | null;
  weekday: number;
  session: SessionType;
  kind: EntryKind;
  time_text: string | null;
  content: string;
  location: string | null;
  note: string | null;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  campus: Campus | null;
  assignees: TemplateAssignee[];
};

export type RecurringTemplateInput = Pick<
  RecurringTemplate,
  | 'scope'
  | 'campus_id'
  | 'weekday'
  | 'session'
  | 'kind'
  | 'time_text'
  | 'content'
  | 'location'
  | 'note'
  | 'sort_order'
  | 'is_active'
> & {
  assignees: TemplateAssigneeInput[];
};

export const weekdayLabels: Record<number, string> = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
};

export const sessionLabels: Record<SessionType, string> = {
  morning: 'Buổi sáng',
  afternoon: 'Buổi chiều',
  all_day: 'Cả ngày',
};

export const entryKindLabels: Record<EntryKind, string> = {
  schedule: 'Lịch chung',
  duty: 'Trực',
  assignment: 'Phân công',
};
