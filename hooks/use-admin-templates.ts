'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  Campus,
  Person,
  RecurringTemplate,
  RecurringTemplateInput,
  TemplateAssignee,
} from '@/lib/admin-catalog-types';
import { adminDataError, nullableText } from '@/lib/admin-catalog-utils';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

type TemplateRow = Omit<RecurringTemplate, 'campus' | 'assignees'>;
type AssigneeRow = Pick<TemplateAssignee, 'person_id' | 'role_label'> & {
  template_id: string;
};

const sessionOrder = { morning: 1, afternoon: 2, all_day: 3 };

function sortTemplates(templates: RecurringTemplate[]) {
  return templates.sort(
    (left, right) =>
      left.weekday - right.weekday ||
      sessionOrder[left.session] - sessionOrder[right.session] ||
      left.sort_order - right.sort_order ||
      left.content.localeCompare(right.content, 'vi'),
  );
}

function sameTemplateGroup(left: RecurringTemplate, right: RecurringTemplate) {
  return (
    left.weekday === right.weekday &&
    left.session === right.session &&
    left.scope === right.scope &&
    left.campus_id === right.campus_id
  );
}

export function useAdminTemplates(createdBy?: string) {
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadTemplates = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = getSupabaseBrowserClient();
      const [templatesResult, assigneesResult, peopleResult, campusesResult] =
        await Promise.all([
          supabase
            .from('recurring_templates')
            .select(
              'id,scope,campus_id,weekday,session,kind,time_text,content,location,note,sort_order,is_active,created_by,created_at,updated_at',
            ),
          supabase
            .from('template_assignees')
            .select('template_id,person_id,role_label'),
          supabase
            .from('people')
            .select('id,code,full_name,job_title,is_active,created_at,updated_at')
            .order('is_active', { ascending: false })
            .order('full_name'),
          supabase
            .from('campuses')
            .select('id,code,name,sort_order,is_active,created_at,updated_at')
            .order('sort_order'),
        ]);
      const firstError = [
        templatesResult.error,
        assigneesResult.error,
        peopleResult.error,
        campusesResult.error,
      ].find(Boolean);

      if (firstError) {
        throw firstError;
      }

      const loadedPeople = (peopleResult.data ?? []) as Person[];
      const loadedCampuses = (campusesResult.data ?? []) as Campus[];
      const personById = new Map(loadedPeople.map((person) => [person.id, person]));
      const campusById = new Map(loadedCampuses.map((campus) => [campus.id, campus]));
      const assignees = (assigneesResult.data ?? []) as AssigneeRow[];
      const joinedTemplates = ((templatesResult.data ?? []) as TemplateRow[]).map(
        (template) => ({
          ...template,
          campus: template.campus_id
            ? campusById.get(template.campus_id) ?? null
            : null,
          assignees: assignees
            .filter((assignee) => assignee.template_id === template.id)
            .map((assignee) => ({
              person_id: assignee.person_id,
              role_label: assignee.role_label,
              person: personById.get(assignee.person_id) ?? null,
            })),
        }),
      );

      setPeople(loadedPeople);
      setCampuses(loadedCampuses);
      setTemplates(sortTemplates(joinedTemplates));
    } catch (loadError) {
      setError(adminDataError(loadError, 'Không thể tải các mẫu lịch.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const saveTemplate = useCallback(
    async (input: RecurringTemplateInput | RecurringTemplateInput[], id?: string) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const supabase = getSupabaseBrowserClient();
        const inputs = Array.isArray(input) ? input : [input];
        const payloads = inputs.map((item) => ({
          scope: item.scope,
          campus_id: item.scope === 'campus' ? item.campus_id : null,
          weekday: item.weekday,
          session: item.session,
          kind: item.scope === 'common' ? 'schedule' : item.kind,
          time_text: item.time_text ? nullableText(item.time_text) : null,
          content: item.content.trim(),
          location: item.location ? nullableText(item.location) : null,
          note: item.note ? nullableText(item.note) : null,
          sort_order: item.sort_order,
          is_active: item.is_active,
        }));
        const savedIds: string[] = [];

        if (id) {
          const { data, error: updateError } = await supabase
            .from('recurring_templates')
            .update(payloads[0])
            .eq('id', id)
            .select('id')
            .single();

          if (updateError) {
            throw updateError;
          }

          savedIds.push(data.id);
        } else {
          const { data, error: insertError } = await supabase
            .from('recurring_templates')
            .insert(
              payloads.map((payload) => ({
                ...payload,
                created_by: createdBy ?? null,
              })),
            )
            .select('id');

          if (insertError) {
            throw insertError;
          }

          savedIds.push(...(data ?? []).map((template) => template.id));
        }

        const rows = savedIds.flatMap((templateId, index) =>
          inputs[index].assignees.map((assignee) => ({
            template_id: templateId,
            person_id: assignee.person_id,
            role_label: assignee.role_label
              ? nullableText(assignee.role_label)
              : null,
          })),
        );

        if (rows.length) {
          const { error: assigneeError } = await supabase
            .from('template_assignees')
            .upsert(rows, { onConflict: 'template_id,person_id' });

          if (assigneeError) {
            throw assigneeError;
          }
        }

        const previousIds = id
          ? (templates.find((template) => template.id === id)?.assignees.map(
              (assignee) => assignee.person_id,
            ) ?? [])
          : [];
        const selectedIds = new Set(
          inputs[0].assignees.map((assignee) => assignee.person_id),
        );
        const removedIds = previousIds.filter((personId) => !selectedIds.has(personId));

        if (id && removedIds.length) {
          const { error: removeError } = await supabase
            .from('template_assignees')
            .delete()
            .eq('template_id', id)
            .in('person_id', removedIds);

          if (removeError) {
            throw removeError;
          }
        }

        setMessage(
          id
            ? 'Đã cập nhật mẫu lịch.'
            : inputs.length > 1
              ? 'Đã thêm ' +
                inputs.length +
                ' mẫu lịch cho các ngày đã chọn.'
              : 'Đã thêm mẫu lịch.',
        );
        await loadTemplates();
        return true;
      } catch (saveError) {
        setError(adminDataError(saveError, 'Không thể lưu mẫu lịch.'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [createdBy, loadTemplates, templates],
  );

  const setTemplateActive = useCallback(
    async (template: RecurringTemplate, isActive: boolean) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const { error: updateError } = await getSupabaseBrowserClient()
          .from('recurring_templates')
          .update({ is_active: isActive })
          .eq('id', template.id);

        if (updateError) {
          throw updateError;
        }

        setMessage(isActive ? 'Đã kích hoạt mẫu.' : 'Đã tạm ngưng mẫu.');
        await loadTemplates();
      } catch (updateError) {
        setError(adminDataError(updateError, 'Không thể đổi trạng thái mẫu.'));
      } finally {
        setIsSaving(false);
      }
    },
    [loadTemplates],
  );

  const deleteTemplate = useCallback(
    async (template: RecurringTemplate) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const { error: deleteError } = await getSupabaseBrowserClient()
          .from('recurring_templates')
          .delete()
          .eq('id', template.id);

        if (deleteError) {
          throw deleteError;
        }

        setMessage('Đã xóa mẫu lịch.');
        await loadTemplates();
      } catch (deleteError) {
        setError(adminDataError(deleteError, 'Không thể xóa mẫu lịch.'));
      } finally {
        setIsSaving(false);
      }
    },
    [loadTemplates],
  );

  const moveTemplate = useCallback(
    async (template: RecurringTemplate, direction: 'up' | 'down') => {
      const group = templates.filter((item) => sameTemplateGroup(item, template));
      const currentIndex = group.findIndex((item) => item.id === template.id);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= group.length) {
        return;
      }

      const reordered = [...group];
      [reordered[currentIndex], reordered[targetIndex]] = [
        reordered[targetIndex],
        reordered[currentIndex],
      ];
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const supabase = getSupabaseBrowserClient();
        for (const [index, item] of reordered.entries()) {
          const { error: updateError } = await supabase
            .from('recurring_templates')
            .update({ sort_order: (index + 1) * 10 })
            .eq('id', item.id);

          if (updateError) {
            throw updateError;
          }
        }

        setMessage('Đã cập nhật thứ tự mẫu.');
        await loadTemplates();
      } catch (moveError) {
        setError(adminDataError(moveError, 'Không thể sắp xếp mẫu lịch.'));
      } finally {
        setIsSaving(false);
      }
    },
    [loadTemplates, templates],
  );

  return {
    templates,
    people,
    campuses,
    isLoading,
    isSaving,
    error,
    message,
    reload: loadTemplates,
    saveTemplate,
    setTemplateActive,
    deleteTemplate,
    moveTemplate,
  };
}
