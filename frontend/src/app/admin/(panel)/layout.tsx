import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: {
    default: 'Admin Panel - Gornji Milanovac',
    template: '%s | Admin - GM Portal',
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar user={session.user} />
      <main className="flex-1 ml-60">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
