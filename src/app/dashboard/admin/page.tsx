import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  School,
  TrendingUp,
  Mail,
  UserCheck
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Fetch administration stats
  const totalStudents = await db.studentProfile.count();
  const totalTeachers = await db.teacherProfile.count();
  const totalSubjects = await db.subject.count();
  const totalUsers = await db.user.count();

  // Fetch all marks to calculate school average
  const allMarks = await db.mark.findMany({
    select: {
      marksObtained: true,
      maxMarks: true,
    },
  });

  const schoolAverage = allMarks.length > 0
    ? Math.round(
        (allMarks.reduce((sum, m) => sum + (m.marksObtained / m.maxMarks), 0) / allMarks.length) * 100
      )
    : 0;

  // Fetch all users with profiles to display in administrative table
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      studentProfile: {
        select: {
          rollNumber: true,
          classGrade: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'TEACHER': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Overview Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <School className="text-indigo-400 h-6 w-6" />
          School Management Center
        </h2>
        <p className="text-slate-400 mt-1">
          Systems administration, school metrics, and academic quality assurance dashboard.
        </p>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Users */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Total Accounts</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{totalUsers}</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Teachers</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{totalTeachers}</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Students */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Students</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{totalStudents}</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Subjects</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{totalSubjects}</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* School Performance */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">School Avg</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{schoolAverage}%</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white">System User Directory</h3>
          <p className="text-xs text-slate-400 mt-1">Audit active accounts, system roles, and associated academic profiles.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-305">
            <thead className="text-xs uppercase text-slate-550 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">User Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Roll Number</th>
                <th className="py-3 px-4 font-semibold">Class Grade</th>
                <th className="py-3 px-4 font-semibold text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="py-4 px-4 font-medium text-white">{u.name}</td>
                  <td className="py-4 px-4 font-mono text-slate-400 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      {u.email}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-3xs font-semibold font-mono ${getRoleStyle(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-400 text-xs">
                    {u.studentProfile?.rollNumber || '—'}
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    {u.studentProfile?.classGrade || '—'}
                  </td>
                  <td className="py-4 px-4 text-right text-slate-500 font-mono text-xs">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
