import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getActivityLogs, getLoginHistory } from '@/app/actions/admin';
import SecurityAuditClient from '@/components/security-audit-client';

export default async function AdminSecurityPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const activityLogs = await getActivityLogs();
  const loginHistory = await getLoginHistory();

  return (
    <SecurityAuditClient
      activityLogs={activityLogs as any}
      loginHistory={loginHistory as any}
    />
  );
}
