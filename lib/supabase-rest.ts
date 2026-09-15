export async function supabaseRest<T>(path: string): Promise<T> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('Thiếu cấu hình kết nối Supabase.');
  }

  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải lịch công tác.');
  }

  return response.json() as Promise<T>;
}
