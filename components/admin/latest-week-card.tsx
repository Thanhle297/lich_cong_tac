import { ClipboardList } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import type { LatestWeek } from '@/lib/admin-types';
import { addDays } from '@/lib/admin-week-utils';

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

const weekStatusLabels = {
  draft: 'Bản nháp',
  published: 'Đã phát hành',
  archived: 'Đã lưu trữ',
};

type LatestWeekCardProps = {
  isLoading: boolean;
  latestWeek: LatestWeek | null;
};

export function LatestWeekCard({
  isLoading,
  latestWeek,
}: LatestWeekCardProps) {
  return (
    <Card className="border-slate-200 shadow-[0_8px_22px_rgba(15,40,70,0.05)]">
      <CardHeader>
        <CardTitle>Tuần gần nhất</CardTitle>
        <CardDescription>
          Trạng thái soạn và phát hành lịch trong hệ thống.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32 bg-slate-200" />
            <Skeleton className="h-5 w-64 bg-slate-200" />
          </div>
        ) : latestWeek ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-lg font-bold text-slate-950">
              Tuần {latestWeek.week_number}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {formatDate(latestWeek.starts_on)} –{' '}
              {formatDate(addDays(latestWeek.starts_on, 6))}
            </p>
            <p className="mt-4 text-sm font-semibold text-[#0c6e85]">
              Trạng thái: {weekStatusLabels[latestWeek.status]}
            </p>
          </div>
        ) : (
          <Empty className="min-h-64 border border-slate-200 bg-slate-50/60">
            <EmptyHeader>
              <EmptyMedia
                className="bg-white text-[#0c6e85] shadow-sm"
                variant="icon"
              >
                <ClipboardList aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Chưa có tuần công tác</EmptyTitle>
              <EmptyDescription>
                Sau khi tạo năm học, bạn có thể tạo tuần đầu tiên và bắt đầu nhập
                lịch.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
