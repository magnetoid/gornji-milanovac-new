import { redirect } from 'next/navigation';

// Redirect /login to Directus admin panel
export default function LoginPage() {
  redirect('https://api.new.gornji-milanovac.com/admin');
}
