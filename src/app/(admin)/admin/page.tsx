import { redirect } from 'next/navigation';

export default function AdminRootRedirect() {
    // Force bounce the root /admin cleanly to our new structural layout
    redirect('/admin/dashboard');
}
