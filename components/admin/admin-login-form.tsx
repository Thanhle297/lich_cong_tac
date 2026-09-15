'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  Eye,
  EyeOff,
  LockKeyhole,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useAdminAuth } from './admin-auth-provider';

const getReturnTo = () => {
  const requestedPath = new URLSearchParams(window.location.search).get('returnTo');

  if (
    requestedPath &&
    requestedPath.startsWith('/admin') &&
    !requestedPath.startsWith('//')
  ) {
    return requestedPath;
  }

  return '/admin';
};

export function AdminLoginForm() {
  const router = useRouter();
  const { status, signOut } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(getReturnTo());
    }
  }, [router, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !data.user) {
        throw new Error('Email hoặc mật khẩu không đúng.');
      }

      const { data: profile, error: profileError } = await supabase
        .from('app_users')
        .select('role,is_active')
        .eq('id', data.user.id)
        .maybeSingle<{ role: string; is_active: boolean }>();

      if (profileError) {
        throw profileError;
      }

      if (
        !profile ||
        !profile.is_active ||
        (profile.role !== 'admin' && profile.role !== 'scheduler')
      ) {
        await supabase.auth.signOut();
        throw new Error('Tài khoản chưa được cấp quyền quản trị.');
      }

      router.replace(getReturnTo());
      router.refresh();
    } catch (signInFailure) {
      setError(
        signInFailure instanceof Error
          ? signInFailure.message
          : 'Không thể đăng nhập. Vui lòng thử lại.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
      <div className="w-full max-w-[430px]">
        <Link
          className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0c6e85]"
          href="/"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Xem lịch công khai
        </Link>

        <div className="mb-8 lg:hidden">
          <span className="mb-5 grid size-11 place-items-center rounded-xl bg-[#08233f] text-amber-300">
            <CalendarDays aria-hidden="true" size={22} />
          </span>
          <p className="text-sm font-bold text-[#0c6e85]">THCS Xuân Phương</p>
        </div>

        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Đăng nhập quản trị
          </h2>
          <p className="mt-2 text-base leading-6 text-slate-500">
            Dùng tài khoản đã được cấp trên Supabase.
          </p>
        </div>

        {status === 'forbidden' ? (
          <Alert className="mt-6 border-amber-200 bg-amber-50 text-amber-900">
            <CircleAlert aria-hidden="true" />
            <AlertDescription>
              Phiên hiện tại chưa được cấp quyền quản trị.
              <Button
                className="mt-2 px-0 text-amber-900"
                onClick={() => void signOut()}
                type="button"
                variant="link"
              >
                Đăng xuất phiên này
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert className="mt-6 border-rose-200 bg-rose-50" variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              autoComplete="email"
              className="h-11 bg-white px-3.5 text-base md:text-base"
              disabled={isSubmitting}
              id="admin-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ten@truong.edu.vn"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Mật khẩu</Label>
            <div className="relative">
              <Input
                autoComplete="current-password"
                className="h-11 bg-white px-3.5 pr-11 text-base md:text-base"
                disabled={isSubmitting}
                id="admin-password"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-500 transition hover:text-slate-900"
                onClick={() => setShowPassword((current) => !current)}
                type="button"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" size={18} />
                ) : (
                  <Eye aria-hidden="true" size={18} />
                )}
              </button>
            </div>
          </div>

          <Button
            className="h-11 w-full bg-[#08233f] text-base font-bold hover:bg-[#0c3558]"
            disabled={isSubmitting || status === 'authenticated'}
            type="submit"
          >
            {isSubmitting || status === 'authenticated' ? (
              <Spinner className="text-white" />
            ) : (
              <LockKeyhole aria-hidden="true" />
            )}
            {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </Button>
        </form>

        <p className="mt-7 text-sm leading-6 text-slate-500">
          Nếu chưa có tài khoản, liên hệ người quản trị Supabase của nhà trường để
          được tạo và cấp quyền.
        </p>
      </div>
    </section>
  );
}
