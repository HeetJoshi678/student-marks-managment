import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import TeacherDashboardClient from '@/components/teacher-dashboard-client';

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Find teacher profile with subjects
  const teacher = await db.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      subjects: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Teacher Profile Missing</h2>
        <p className="text-slate-400">
          We could not find a teacher profile associated with your user account. Please contact an administrator.
        </p>
      </div>
    );
  }

  // Get all registered students
  const students = await db.studentProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      rollNumber: 'asc',
    },
  });

  // Get all mark records matching teacher's subjects
  const subjectIds = teacher.subjects.map((s) => s.id);
  const marks = await db.mark.findMany({
    where: {
      subjectId: {
        in: subjectIds,
      },
    },
  });

  return (
    <TeacherDashboardClient
      subjects={teacher.subjects}
      students={students}
      initialMarks={marks}
    />
  );
}
