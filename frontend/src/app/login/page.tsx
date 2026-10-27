import { redirect } from 'next/navigation';

// Staff sign-in lives in the admin panel
export default function LoginPage() {
  redirect('/admin/login');
}
