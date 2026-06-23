import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import StudentDashboardClient from '@/components/student-dashboard-client';

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Fetch student profile, marks, and badges from DB
  const student = await db.studentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      badges: {
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
        },
      },
      marks: {
        include: {
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Student Profile Missing</h2>
        <p className="text-slate-400">
          We could not find a student profile associated with your user account. Please contact an administrator.
        </p>
      </div>
    );
  }

  // Convert schema mapping safely to match client component typings
  const studentData = {
    id: student.id,
    rollNumber: student.rollNumber,
    classGrade: student.classGrade,
    user: {
      name: student.user.name,
      email: student.user.email,
    },
    marks: student.marks,
    badges: student.badges,
  };

  return <StudentDashboardClient student={studentData} />;
}
