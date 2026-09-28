'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { CircleAlert, RefreshCw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAdminAuth } from './admin-auth-provider';
import { AdminPageStatus } from './admin-page-status';
import { AdminShell } from './admin-shell';

export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { status, email, error, retry, signOut } = useAdminAuth();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && status === 'unauthenticated') {
      const returnTo = encodeURIComponent(pathname || '/admin');
      window.location.replace(`/admin/login?returnTo=${returnTo}`);
    }
  }, [isLoginPage, pathname, status]);

  if (isLoginPage) {
    return children;
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <AdminPageStatus>
        <div className="flex items-center justify-center gap-3 text-sm font-semibold text-slate-600">
          <Spinner className="text-[#0c6e85]" />
          Đang kiểm tra phiên đăng nhập…
        </div>
      </AdminPageStatus>
    );
  }

  if (status === 'forbidden') {
    return (
      <AdminPageStatus>
        <Alert className="border-amber-200 bg-white p-5">
          <CircleAlert aria-hidden="true" className="text-amber-600" />
          <AlertTitle>Tài khoản chưa được cấp quyền</AlertTitle>
          <AlertDescription>
            <p>
              {email
                ? `Tài khoản ${email} chưa có vai trò quản trị đang hoạt động.`
                : 'Tài khoản này chưa có vai trò quản trị đang hoạt động.'}
            </p>
            <Button className="mt-3" onClick={() => void signOut()} size="sm">
              Đăng xuất
            </Button>
          </AlertDescription>
        </Alert>
      </AdminPageStatus>
    );
  }

  if (status === 'error') {
    return (
      <AdminPageStatus>
        <Alert className="border-rose-200 bg-white p-5" variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Không thể kiểm tra quyền truy cập</AlertTitle>
          <AlertDescription>
            <p>{error || 'Vui lòng thử lại sau.'}</p>
            <Button className="mt-3" onClick={retry} size="sm" variant="outline">
              <RefreshCw aria-hidden="true" />
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      </AdminPageStatus>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
