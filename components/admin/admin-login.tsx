import { AdminLoginForm } from './admin-login-form';
import { AdminLoginHero } from './admin-login-hero';

export function AdminLogin() {
  return (
    <main className="grid min-h-screen bg-[#f2f6fb] lg:grid-cols-[minmax(360px,0.78fr)_1.22fr]">
      <AdminLoginHero />
      <AdminLoginForm />
    </main>
  );
}
