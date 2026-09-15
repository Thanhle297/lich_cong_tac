'use client';

import { useCallback, useEffect, useState } from 'react';

import type { AcademicYear, Campus, Person } from '@/lib/admin-catalog-types';
import { adminDataError, nullableText } from '@/lib/admin-catalog-utils';
import type {
  AdminCalendarEntry,
  AdminWeek,
  CalendarEntryInput,
  EntryAssignee,
  WeekEditorData,
} from '@/lib/admin-week-types';
import { entryCellKey } from '@/lib/admin-week-utils';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

type WeekRow = Omit<AdminWeek, 'academic_year'>;
type EntryRow = Omit<AdminCalendarEntry, 'campus' | 'assignees'>;
type AssigneeRow = Pick<EntryAssignee, 'person_id' | 'role_label'> & {
  entry_id: string;
};

const emptyData: WeekEditorData = {
  week: null,
  entries: [],
  campuses: [],
  people: [],
};

export function useWeekEditor(weekId: string, createdBy?: string) {
  const [data, setData] = useState<WeekEditorData>(emptyData);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadEditor = useCallback(async (isBackground = false) => {
    if (!weekId) {
      setData(emptyData);
      setIsLoading(false);
      return;
    }

    if (isBackground) {
      setIsReloading(true);
    } else {
      setIsLoading(true);
    }
    setError('');

    try {
      const supabase = getSupabaseBrowserClient();
      const [weekResult, entriesResult, campusesResult, peopleResult, yearsResult] =
        await Promise.all([
          supabase
            .from('calendar_weeks')
            .select(
              'id,academic_year_id,week_number,starts_on,ends_on,status,published_at,published_by,created_by,created_at,updated_at',
            )
            .eq('id', weekId)
            .maybeSingle(),
          supabase
            .from('calendar_entries')
            .select(
              'id,week_id,scope,campus_id,kind,event_date,session,time_text,content,location,note,sort_order,template_id,created_by,created_at,updated_at',
            )
            .eq('week_id', weekId)
            .order('event_date')
            .order('sort_order')
            .order('created_at'),
          supabase
            .from('campuses')
            .select('id,code,name,sort_order,is_active,created_at,updated_at')
            .order('sort_order'),
          supabase
            .from('people')
            .select('id,code,full_name,job_title,is_active,created_at,updated_at')
            .order('full_name'),
          supabase
            .from('academic_years')
            .select('id,name,starts_on,ends_on,is_active,created_at,updated_at'),
        ]);
      const firstError = [
        weekResult.error,
        entriesResult.error,
        campusesResult.error,
        peopleResult.error,
        yearsResult.error,
      ].find(Boolean);

      if (firstError) {
        throw firstError;
      }

      const weekRow = weekResult.data as WeekRow | null;
      const entries = (entriesResult.data ?? []) as EntryRow[];
      const campuses = (campusesResult.data ?? []) as Campus[];
      const people = (peopleResult.data ?? []) as Person[];
      const years = (yearsResult.data ?? []) as AcademicYear[];
      const entryIds = entries.map((entry) => entry.id);
      let assignees: AssigneeRow[] = [];

      if (entryIds.length) {
        const assigneeResult = await supabase
          .from('entry_assignees')
          .select('entry_id,person_id,role_label')
          .in('entry_id', entryIds);

        if (assigneeResult.error) {
          throw assigneeResult.error;
        }
        assignees = (assigneeResult.data ?? []) as AssigneeRow[];
      }

      const campusById = new Map(campuses.map((campus) => [campus.id, campus]));
      const personById = new Map(people.map((person) => [person.id, person]));

      setData({
        week: weekRow
          ? {
              ...weekRow,
              academic_year:
                years.find((year) => year.id === weekRow.academic_year_id) ?? null,
            }
          : null,
        campuses,
        people,
        entries: entries.map((entry) => ({
          ...entry,
          campus: entry.campus_id ? campusById.get(entry.campus_id) ?? null : null,
          assignees: assignees
            .filter((assignee) => assignee.entry_id === entry.id)
            .map((assignee) => ({
              person_id: assignee.person_id,
              role_label: assignee.role_label,
              person: personById.get(assignee.person_id) ?? null,
            })),
        })),
      });
    } catch (loadError) {
      setError(adminDataError(loadError, 'Không thể tải nội dung tuần công tác.'));
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
  }, [weekId]);

  useEffect(() => {
    void loadEditor();
  }, [loadEditor]);

  const saveEntry = useCallback(
    async (input: CalendarEntryInput, entryId?: string) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const supabase = getSupabaseBrowserClient();
        const payload = {
          week_id: weekId,
          scope: input.scope,
          campus_id: input.scope === 'common' ? null : input.campus_id,
          kind: input.scope === 'common' ? 'schedule' : input.kind,
          event_date: input.event_date,
          session: input.session,
          time_text: input.time_text ? nullableText(input.time_text) : null,
          content: input.content.trim(),
          location: input.location ? nullableText(input.location) : null,
          note: input.note ? nullableText(input.note) : null,
          sort_order: input.sort_order,
        };
        let savedEntryId = entryId;

        if (entryId) {
          const { error: updateError } = await supabase
            .from('calendar_entries')
            .update(payload)
            .eq('id', entryId);

          if (updateError) {
            throw updateError;
          }
        } else {
          const { data: createdEntry, error: insertError } = await supabase
            .from('calendar_entries')
            .insert({ ...payload, created_by: createdBy ?? null })
            .select('id')
            .single();

          if (insertError) {
            throw insertError;
          }
          savedEntryId = createdEntry.id;
        }

        if (!savedEntryId) {
          throw new Error('Không xác định được nội dung vừa lưu.');
        }

        const currentEntry = data.entries.find((entry) => entry.id === savedEntryId);
        const selectedIds = input.assignees.map((assignee) => assignee.person_id);
        const removedIds =
          currentEntry?.assignees
            .map((assignee) => assignee.person_id)
            .filter((personId) => !selectedIds.includes(personId)) ?? [];

        if (removedIds.length) {
          const { error: deleteAssigneeError } = await supabase
            .from('entry_assignees')
            .delete()
            .eq('entry_id', savedEntryId)
            .in('person_id', removedIds);

          if (deleteAssigneeError) {
            throw deleteAssigneeError;
          }
        }

        if (input.assignees.length) {
          const { error: assigneeError } = await supabase
            .from('entry_assignees')
            .upsert(
              input.assignees.map((assignee) => ({
                entry_id: savedEntryId,
                person_id: assignee.person_id,
                role_label: assignee.role_label
                  ? nullableText(assignee.role_label)
                  : null,
              })),
              { onConflict: 'entry_id,person_id' },
            );

          if (assigneeError) {
            throw assigneeError;
          }
        }

        setMessage(entryId ? 'Đã cập nhật nội dung lịch.' : 'Đã thêm nội dung lịch.');
        await loadEditor(true);
        return true;
      } catch (saveError) {
        setError(adminDataError(saveError, 'Không thể lưu nội dung lịch.'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [createdBy, data.entries, loadEditor, weekId],
  );

  const deleteEntry = useCallback(
    async (entry: AdminCalendarEntry) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const { error: deleteError } = await getSupabaseBrowserClient()
          .from('calendar_entries')
          .delete()
          .eq('id', entry.id);

        if (deleteError) {
          throw deleteError;
        }

        setMessage('Đã xóa nội dung khỏi tuần công tác.');
        await loadEditor(true);
      } catch (deleteError) {
        setError(adminDataError(deleteError, 'Không thể xóa nội dung lịch.'));
      } finally {
        setIsSaving(false);
      }
    },
    [loadEditor],
  );

  const moveEntry = useCallback(
    async (entry: AdminCalendarEntry, direction: 'up' | 'down') => {
      const group = data.entries.filter(
        (candidate) => entryCellKey(candidate) === entryCellKey(entry),
      );
      const index = group.findIndex((candidate) => candidate.id === entry.id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (index < 0 || targetIndex < 0 || targetIndex >= group.length) {
        return;
      }

      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const reordered = [...group];
        [reordered[index], reordered[targetIndex]] = [
          reordered[targetIndex],
          reordered[index],
        ];
        const supabase = getSupabaseBrowserClient();
        const results = await Promise.all(
          reordered.map((item, itemIndex) =>
            supabase
              .from('calendar_entries')
              .update({ sort_order: (itemIndex + 1) * 10 })
              .eq('id', item.id),
          ),
        );
        const firstError = results.map((result) => result.error).find(Boolean);

        if (firstError) {
          throw firstError;
        }

        setMessage('Đã cập nhật thứ tự nội dung.');
        await loadEditor(true);
      } catch (moveError) {
        setError(adminDataError(moveError, 'Không thể đổi thứ tự nội dung.'));
      } finally {
        setIsSaving(false);
      }
    },
    [data.entries, loadEditor],
  );

  const publishWeek = useCallback(async () => {
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const { error: publishError } = await getSupabaseBrowserClient().rpc(
        'publish_week',
        { p_week_id: weekId },
      );

      if (publishError) {
        throw publishError;
      }

      setMessage('Tuần công tác đã được phát hành công khai.');
      await loadEditor(true);
    } catch (publishError) {
      setError(adminDataError(publishError, 'Không thể phát hành tuần công tác.'));
    } finally {
      setIsSaving(false);
    }
  }, [loadEditor, weekId]);

  const setWeekStatus = useCallback(
    async (status: 'draft' | 'archived') => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const payload =
          status === 'draft'
            ? { status, published_at: null, published_by: null }
            : { status };
        const { error: updateError } = await getSupabaseBrowserClient()
          .from('calendar_weeks')
          .update(payload)
          .eq('id', weekId);

        if (updateError) {
          throw updateError;
        }

        setMessage(
          status === 'draft'
            ? 'Đã đưa tuần về bản nháp để chỉnh sửa.'
            : 'Đã chuyển tuần vào lưu trữ.',
        );
        await loadEditor(true);
      } catch (updateError) {
        setError(adminDataError(updateError, 'Không thể đổi trạng thái tuần.'));
      } finally {
        setIsSaving(false);
      }
    },
    [loadEditor, weekId],
  );

  return {
    ...data,
    isLoading,
    isReloading,
    isSaving,
    error,
    message,
    reload: loadEditor,
    saveEntry,
    deleteEntry,
    moveEntry,
    publishWeek,
    setWeekStatus,
  };
}
