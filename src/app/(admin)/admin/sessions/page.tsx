import { redirect } from 'next/navigation';

export default function SessionsRedirect() {
    redirect('/admin/dashboard?tab=sessions');
}
