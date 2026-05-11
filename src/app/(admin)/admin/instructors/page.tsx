import { redirect } from 'next/navigation';

export default function InstructorsRedirect() {
    redirect('/admin/dashboard?tab=instructors');
}
