import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import { BookOpen } from 'lucide-react';

export default async function AdminSubjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch subjects with teacher user profiles
  const subjects = await db.subject.findMany({
    include: {
      teacherProfile: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="text-indigo-400 h-5 w-5" />
          School Subjects & Instructors
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Directory of courses and assigned teaching profiles.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-350">
          <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 font-semibold">Subject Name</th>
              <th className="py-3 px-4 font-semibold">Instructor Name</th>
              <th className="py-3 px-4 font-semibold">Instructor Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {subjects.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-900/20 transition-colors">
                <td className="py-4 px-4 font-medium text-white">{sub.name}</td>
                <td className="py-4 px-4 text-slate-300">
                  {sub.teacherProfile?.user?.name || 'Unassigned'}
                </td>
                <td className="py-4 px-4 font-mono text-slate-400 text-xs">
                  {sub.teacherProfile?.user?.email || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
