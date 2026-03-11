import AdminLayout from '@/components/admin/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRouteGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminRouteGuard>
  );
}

