import { CalendarDays, CircleAlert, LoaderCircle } from 'lucide-react';

export function ScheduleError({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
      <CircleAlert aria-hidden="true" className="mt-0.5 shrink-0" size={19} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function ScheduleLoading() {
  return (
    <section className="grid min-h-80 place-items-center rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
        <LoaderCircle
          aria-hidden="true"
          className="animate-spin text-[#0c6e85]"
          size={20}
        />
        Đang tải lịch công tác…
      </div>
    </section>
  );
}

export function ScheduleEmpty() {
  return (
    <section className="grid min-h-80 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
      <div className="max-w-sm">
        <CalendarDays
          aria-hidden="true"
          className="mx-auto mb-4 text-[#0c6e85]"
          size={36}
        />
        <h2 className="text-lg font-bold text-slate-900">
          Chưa có lịch được phát hành
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Ban quản trị sẽ tạo, hoàn thiện và phát hành lịch tuần trước khi giáo viên
          có thể xem tại đây.
        </p>
      </div>
    </section>
  );
}
