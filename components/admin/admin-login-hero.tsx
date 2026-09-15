import { CalendarDays } from 'lucide-react';

export function AdminLoginHero() {
  return (
    <section className="relative hidden overflow-hidden bg-[#08233f] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-28 top-20 size-72 rounded-full border border-cyan-300/15" />
      <div className="absolute -right-12 top-36 size-40 rounded-full bg-cyan-400/10" />

      <div className="relative flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-amber-400 text-[#08233f]">
          <CalendarDays aria-hidden="true" size={23} strokeWidth={2.4} />
        </span>
        <div>
          <p className="text-base font-bold">Lịch công tác</p>
          <p className="text-sm text-cyan-100/70">THCS Xuân Phương</p>
        </div>
      </div>

      <div className="relative max-w-lg pb-12">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.17em] text-amber-300">
          Khu vực nội bộ
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          Soạn và phát hành lịch tuần tại một nơi.
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-cyan-50/75">
          Chỉ tài khoản đã được cấp vai trò Quản trị viên hoặc Người xếp lịch mới có
          thể truy cập.
        </p>
      </div>

      <p className="relative text-sm text-cyan-100/60">Năm học 2026–2027</p>
    </section>
  );
}
