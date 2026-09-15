'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Person, PersonInput } from '@/lib/admin-catalog-types';
import { adminDataError, nullableText } from '@/lib/admin-catalog-utils';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export function useAdminPeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadPeople = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data, error: loadError } = await getSupabaseBrowserClient()
        .from('people')
        .select('id,code,full_name,job_title,is_active,created_at,updated_at')
        .order('is_active', { ascending: false })
        .order('full_name');

      if (loadError) {
        throw loadError;
      }

      setPeople((data ?? []) as Person[]);
    } catch (loadError) {
      setError(adminDataError(loadError, 'Không thể tải danh mục nhân sự.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPeople();
  }, [loadPeople]);

  const savePerson = useCallback(
    async (input: PersonInput, id?: string) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const payload = {
          code: input.code ? nullableText(input.code) : null,
          full_name: input.full_name.trim(),
          job_title: input.job_title ? nullableText(input.job_title) : null,
          is_active: input.is_active,
        };
        const supabase = getSupabaseBrowserClient();
        const result = id
          ? await supabase.from('people').update(payload).eq('id', id)
          : await supabase.from('people').insert(payload);

        if (result.error) {
          throw result.error;
        }

        setMessage(id ? 'Đã cập nhật nhân sự.' : 'Đã thêm nhân sự.');
        await loadPeople();
        return true;
      } catch (saveError) {
        setError(adminDataError(saveError, 'Không thể lưu nhân sự.'));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [loadPeople],
  );

  const setPersonActive = useCallback(
    async (person: Person, isActive: boolean) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const { error: updateError } = await getSupabaseBrowserClient()
          .from('people')
          .update({ is_active: isActive })
          .eq('id', person.id);

        if (updateError) {
          throw updateError;
        }

        setMessage(isActive ? 'Đã kích hoạt nhân sự.' : 'Đã tạm ngưng nhân sự.');
        await loadPeople();
      } catch (updateError) {
        setError(adminDataError(updateError, 'Không thể đổi trạng thái nhân sự.'));
      } finally {
        setIsSaving(false);
      }
    },
    [loadPeople],
  );

  const deletePerson = useCallback(
    async (person: Person) => {
      setIsSaving(true);
      setError('');
      setMessage('');

      try {
        const { error: deleteError } = await getSupabaseBrowserClient()
          .from('people')
          .delete()
          .eq('id', person.id);

        if (deleteError) {
          throw deleteError;
        }

        setMessage('Đã xóa nhân sự.');
        await loadPeople();
      } catch (deleteError) {
        setError(adminDataError(deleteError, 'Không thể xóa nhân sự.'));
      } finally {
        setIsSaving(false);
      }
    },
    [loadPeople],
  );

  return {
    people,
    isLoading,
    isSaving,
    error,
    message,
    reload: loadPeople,
    savePerson,
    setPersonActive,
    deletePerson,
  };
}
