export type AdminRole = 'admin' | 'scheduler';

export type AdminProfile = {
  id: string;
  full_name: string | null;
  role: AdminRole;
  is_active: boolean;
};

export type AcademicYear = {
  id: string;
  name?: string | null;
  label?: string | null;
  code?: string | null;
  starts_on?: string | null;
  ends_on?: string | null;
};

export type LatestWeek = {
  id: string;
  week_number: number;
  starts_on: string;
  ends_on: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
};

export type AdminDashboardData = {
  academicYear: AcademicYear | null;
  latestWeek: LatestWeek | null;
  totalWeeks: number;
  draftWeeks: number;
  publishedWeeks: number;
  activePeople: number;
  activeTemplates: number;
};

export const adminRoleLabels: Record<AdminRole, string> = {
  admin: 'Quản trị viên',
  scheduler: 'Người xếp lịch',
};
