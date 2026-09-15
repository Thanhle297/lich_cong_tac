import { CheckCircle2, CircleAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AdminFeedback({
  error,
  message,
}: {
  error: string;
  message: string;
}) {
  if (error) {
    return (
      <Alert className="mb-5 border-rose-200 bg-rose-50" variant="destructive">
        <CircleAlert aria-hidden="true" />
        <AlertTitle>Không thể hoàn tất thao tác</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (message) {
    return (
      <Alert className="mb-5 border-emerald-200 bg-emerald-50 text-emerald-800">
        <CheckCircle2 aria-hidden="true" />
        <AlertTitle>Đã lưu</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
