import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import LeaderboardClient from '@/components/leaderboard-client';

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Fetch all students with marks, attendance, and badges
  const students = await db.studentProfile.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      marks: true,
      attendanceRecords: true,
      badges: {
        select: {
          id: true,
        },
      },
    },
  });

  const getGPA = (percentage: number) => {
    if (percentage >= 90) return 4.0;
    if (percentage >= 80) return 3.0;
    if (percentage >= 70) return 2.0;
    if (percentage >= 60) return 1.0;
    return 0.0;
  };

  // Process data
  const leaderboardData = students.map((student) => {
    // 1. Calculate GPA
    let gpa = 0.0;
    if (student.marks.length > 0) {
      let gpaSum = 0;
      student.marks.forEach((m) => {
        const pct = (m.marksObtained / m.maxMarks) * 100;
        gpaSum += getGPA(pct);
      });
      gpa = gpaSum / student.marks.length;
    }

    // 2. Calculate Attendance %
    let attendancePct = 100;
    if (student.attendanceRecords.length > 0) {
      const presents = student.attendanceRecords.filter(
        (a) => a.status === 'PRESENT' || a.status === 'LATE'
      ).length;
      attendancePct = Math.round((presents / student.attendanceRecords.length) * 100);
    }

    // 3. Academic Health Score = (GPA/4.0 * 75) + (AttendancePct/100 * 25)
    const gpaWeight = (gpa / 4.0) * 75;
    const attWeight = (attendancePct / 100) * 25;
    const healthScore = Math.round(gpaWeight + attWeight);

    return {
      id: student.id,
      name: student.user.name,
      rollNumber: student.rollNumber,
      classGrade: student.classGrade,
      photoUrl: student.photoUrl,
      gpa: parseFloat(gpa.toFixed(2)),
      attendancePct,
      healthScore,
      badgeCount: student.badges.length,
    };
  });

  // Sort by GPA descending, then by Health Score descending
  leaderboardData.sort((a, b) => {
    if (b.gpa !== a.gpa) {
      return b.gpa - a.gpa;
    }
    return b.healthScore - a.healthScore;
  });

  return <LeaderboardClient studentsData={leaderboardData} />;
}
