import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const role = session.user.role;

  if (role === 'ADMIN') {
    redirect('/dashboard/admin');
  } else if (role === 'TEACHER') {
    redirect('/dashboard/teacher');
  } else {
    redirect('/dashboard/student');
  }
}
