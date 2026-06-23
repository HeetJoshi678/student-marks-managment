import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import StudentProfileClient from '@/components/student-profile-client';

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Fetch current student profile
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
        orderBy: {
          awardedAt: 'desc',
        },
      },
      attendanceRecords: {
        orderBy: {
          date: 'desc',
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

  // Fetch all students to calculate ranks
  const allStudents = await db.studentProfile.findMany({
    include: {
      marks: true,
    },
  });

  const getGPA = (percentage: number) => {
    if (percentage >= 90) return 4.0;
    if (percentage >= 80) return 3.0;
    if (percentage >= 70) return 2.0;
    if (percentage >= 60) return 1.0;
    return 0.0;
  };

  // Compute GPAs for all students
  const studentGPAs = allStudents.map((st) => {
    let gpa = 0.0;
    if (st.marks.length > 0) {
      let gpaSum = 0;
      st.marks.forEach((m) => {
        const pct = (m.marksObtained / m.maxMarks) * 100;
        gpaSum += getGPA(pct);
      });
      gpa = gpaSum / st.marks.length;
    }
    return {
      id: st.id,
      classGrade: st.classGrade,
      gpa,
    };
  });

  // Sort overall for school rank
  const schoolSorted = [...studentGPAs].sort((a, b) => b.gpa - a.gpa);
  const schoolRank = schoolSorted.findIndex((s) => s.id === student.id) + 1;
  const schoolSize = schoolSorted.length;

  // Filter and sort for class rank
  const classSorted = [...studentGPAs]
    .filter((s) => s.classGrade === student.classGrade)
    .sort((a, b) => b.gpa - a.gpa);
  const classRank = classSorted.findIndex((s) => s.id === student.id) + 1;
  const classSize = classSorted.length;

  return (
    <StudentProfileClient
      student={student as any}
      ranks={{
        classRank,
        schoolRank,
        classSize,
        schoolSize,
      }}
    />
  );
}
