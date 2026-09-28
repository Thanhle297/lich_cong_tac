'use client';

import type { ReactNode } from 'react';
import Link from '@/components/ui/plain-link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CalendarRange,
  Home,
  LogOut,
  Repeat2,
  Settings2,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { adminRoleLabels } from '@/lib/admin-types';
import { useAdminAuth } from './admin-auth-provider';

const adminNavigation = [
  { label: 'Tuần công tác', icon: CalendarRange, href: '/admin/weeks' },
  { label: 'Mẫu lịch', icon: Repeat2, href: '/admin/templates' },
  { label: 'Nhân sự', icon: Users, href: '/admin/people' },
  { label: 'Cấu hình', icon: Settings2, href: '/admin/settings' },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { profile, email, signOut } = useAdminAuth();
  const displayName = profile?.full_name || email || 'Tài khoản quản trị';
  const roleLabel = profile ? adminRoleLabels[profile.role] : '';
  const currentSection =
    adminNavigation.find(
      (item) => item.href && pathname.startsWith(item.href),
    )?.label || 'Tổng quan';

  return (
    <SidebarProvider>
      <Sidebar
        className="border-r border-[#173c5c] bg-[#08233f]"
        collapsible="icon"
      >
        <SidebarHeader className="px-3 py-4">
          <Link
            className="flex items-center gap-3 overflow-hidden rounded-xl px-1 py-1 text-white"
            href="/admin"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-400 text-[#08233f]">
              <CalendarDays aria-hidden="true" size={19} strokeWidth={2.4} />
            </span>
            <span className="min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="block truncate text-sm font-bold">Lịch công tác</span>
              <span className="block truncate text-xs text-cyan-100/75">
                THCS Xuân Phương
              </span>
            </span>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="h-10 text-cyan-50 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/14 data-[active=true]:text-white"
                    isActive={pathname === '/admin'}
                    tooltip="Tổng quan"
                  >
                    <Link href="/admin">
                      <Home aria-hidden="true" />
                      <span>Tổng quan</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {adminNavigation.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      className="h-10 text-cyan-50 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/14 data-[active=true]:text-white"
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="gap-3 px-3 py-4">
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            <p className="truncate text-xs text-cyan-100/65">{roleLabel}</p>
          </div>
          <Button
            aria-label="Đăng xuất"
            className="w-full border-white/15 bg-white/5 text-cyan-50 hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:px-0"
            onClick={() => void signOut()}
            size="sm"
            type="button"
            variant="outline"
          >
            <LogOut aria-hidden="true" />
            <span className="group-data-[collapsible=icon]:hidden">Đăng xuất</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="min-h-svh min-w-0 bg-[#f2f6fb]">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-3.5 backdrop-blur sm:h-16 sm:px-6">
          <SidebarTrigger className="size-9" aria-label="Mở hoặc thu gọn thanh điều hướng" />
          <div className="h-5 w-px bg-slate-200" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {currentSection}
            </p>
            <p className="truncate text-xs text-slate-500">{roleLabel}</p>
          </div>
          <Badge
            className="ml-auto hidden border-emerald-200 bg-emerald-50 text-emerald-700 sm:inline-flex"
            variant="outline"
          >
            <ShieldCheck aria-hidden="true" />
            Đã xác thực
          </Badge>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
