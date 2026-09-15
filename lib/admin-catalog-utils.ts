export function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

export function adminDataError(error: unknown, fallback: string) {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const candidate = error as { code?: string; message?: string };

  if (candidate.code === '23505') {
    return 'Giá trị này đã tồn tại. Vui lòng kiểm tra mã, tên hoặc thứ tự.';
  }

  if (candidate.code === '23503') {
    return 'Không thể xóa vì dữ liệu này đang được sử dụng ở nơi khác.';
  }

  if (candidate.code === '42501') {
    return 'Tài khoản hiện tại không có quyền thực hiện thao tác này.';
  }

  return candidate.message || fallback;
}

export function formatDate(value: string) {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}
