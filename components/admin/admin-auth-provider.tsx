'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';

import type { AdminProfile } from '@/lib/admin-types';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

type AuthStatus =
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'forbidden'
  | 'error';

type AdminAuthContextValue = {
  status: AuthStatus;
  profile: AdminProfile | null;
  email: string | null;
  error: string;
  retry: () => void;
  signOut: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;
    let resolvedUserId: string | null = null;
    let resolveVersion = 0;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const resolveSession = async (session: Session | null) => {
      if (!isActive) {
        return;
      }

      const currentVersion = ++resolveVersion;

      if (!session) {
        resolvedUserId = null;
        setProfile(null);
        setEmail(null);
        setError('');
        setStatus('unauthenticated');
        return;
      }

      const shouldBlockInterface = resolvedUserId !== session.user.id;

      if (shouldBlockInterface) {
        setStatus('loading');
      }
      setEmail(session.user.email ?? null);

      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error: profileError } = await supabase
          .from('app_users')
          .select('id,full_name,role,is_active')
          .eq('id', session.user.id)
          .maybeSingle<AdminProfile>();

        if (!isActive || currentVersion !== resolveVersion) {
          return;
        }

        if (profileError) {
          throw profileError;
        }

        if (
          !data ||
          !data.is_active ||
          (data.role !== 'admin' && data.role !== 'scheduler')
        ) {
          resolvedUserId = null;
          setProfile(null);
          setError('');
          setStatus('forbidden');
          return;
        }

        resolvedUserId = session.user.id;
        setProfile(data);
        setError('');
        setStatus('authenticated');
      } catch (loadError) {
        if (!isActive || currentVersion !== resolveVersion) {
          return;
        }

        resolvedUserId = null;
        setProfile(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Không thể kiểm tra quyền quản trị.',
        );
        setStatus('error');
      }
    };

    try {
      const supabase = getSupabaseBrowserClient();

      void supabase.auth.getSession().then(({ data, error: sessionError }) => {
        if (sessionError) {
          if (isActive) {
            setError(sessionError.message);
            setStatus('error');
          }
          return;
        }

        void resolveSession(data.session);
      });

      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        window.setTimeout(() => {
          // Supabase can repeat these events when the browser tab regains focus.
          // Keep the authenticated shell mounted for the same user.
          if (
            session &&
            resolvedUserId === session.user.id &&
            (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')
          ) {
            setEmail(session.user.email ?? null);
            return;
          }

          void resolveSession(session);
        }, 0);
      });
      authSubscription = data.subscription;
    } catch (configError) {
      setError(
        configError instanceof Error
          ? configError.message
          : 'Thiếu cấu hình kết nối Supabase.',
      );
      setStatus('error');
    }

    return () => {
      isActive = false;
      authSubscription?.unsubscribe();
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setError('');
    setStatus('loading');
    setAttempt((current) => current + 1);
  }, []);

  const signOut = useCallback(async () => {
    setStatus('loading');
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // The local session is cleared below even if the network is unavailable.
    } finally {
      setProfile(null);
      setEmail(null);
      setError('');
      setStatus('unauthenticated');
    }
  }, []);

  const value = useMemo(
    () => ({ status, profile, email, error, retry, signOut }),
    [status, profile, email, error, retry, signOut],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth phải được dùng trong AdminAuthProvider.');
  }

  return context;
}
