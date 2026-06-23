import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';
import AdminDashboardClient from '@/components/admin-dashboard-client';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // 1. Core Counts
  const totalStudents = await db.studentProfile.count();
  const totalTeachers = await db.teacherProfile.count();
  const totalSubjects = await db.subject.count();
  const totalUsers = await db.user.count();
  const totalResults = await db.mark.count();

  // 2. School-wide Averages and Pass Rates
  const allMarks = await db.mark.findMany({
    select: {
      marksObtained: true,
      maxMarks: true,
      createdAt: true,
      subject: {
        select: {
          name: true,
        },
      },
    },
  });

  const scoresPctList = allMarks.map((m) => (m.marksObtained / m.maxMarks) * 100);
  const schoolAverage = scoresPctList.length > 0
    ? Math.round(scoresPctList.reduce((sum, val) => sum + val, 0) / scoresPctList.length)
    : 0;

  const passedCount = scoresPctList.filter((pct) => pct >= 60).length;
  const passPercentage = scoresPctList.length > 0
    ? Math.round((passedCount / scoresPctList.length) * 100)
    : 0;

  // 3. Subject-wise performance averages
  const subjectsWithMarks = await db.subject.findMany({
    include: {
      marks: true,
    },
  });

  const subjectAverages = subjectsWithMarks.map((sub) => {
    const subPctList = sub.marks.map((m) => (m.marksObtained / m.maxMarks) * 100);
    const avg = subPctList.length > 0
      ? Math.round(subPctList.reduce((a, b) => a + b, 0) / subPctList.length)
      : 0;
    return {
      name: sub.name,
      average: avg,
    };
  });

  // 4. Grade distribution buckets
  let aCount = 0, bCount = 0, cCount = 0, dCount = 0, fCount = 0;
  scoresPctList.forEach((pct) => {
    if (pct >= 90) aCount++;
    else if (pct >= 80) bCount++;
    else if (pct >= 70) cCount++;
    else if (pct >= 60) dCount++;
    else fCount++;
  });

  const gradeDistribution = [
    { name: 'Grade A', value: aCount },
    { name: 'Grade B', value: bCount },
    { name: 'Grade C', value: cCount },
    { name: 'Grade D', value: dCount },
    { name: 'Grade F', value: fCount },
  ].filter((d) => d.value > 0);

  // 5. Monthly result trends
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyAveragesMap: Record<string, { sum: number; count: number }> = {};

  allMarks.forEach((m) => {
    const month = monthNames[new Date(m.createdAt).getMonth()];
    const pct = (m.marksObtained / m.maxMarks) * 100;
    if (!monthlyAveragesMap[month]) {
      monthlyAveragesMap[month] = { sum: 0, count: 0 };
    }
    monthlyAveragesMap[month].sum += pct;
    monthlyAveragesMap[month].count++;
  });

  const monthlyTrends = Object.entries(monthlyAveragesMap).map(([month, data]) => ({
    month,
    average: Math.round(data.sum / data.count),
  }));

  // Sort monthly trends based on chronological order (fallback to order of entries or filter)
  const monthOrder = monthNames.reduce((acc, m, idx) => ({ ...acc, [m]: idx }), {});
  monthlyTrends.sort((a, b) => (monthOrder as any)[a.month] - (monthOrder as any)[b.month]);

  // 6. Attendance rates grouped by classGrade
  const attendanceRecords = await db.attendanceRecord.findMany({
    include: {
      student: {
        select: {
          classGrade: true,
        },
      },
    },
  });

  const classAttendanceMap: Record<string, { presents: number; total: number }> = {};
  attendanceRecords.forEach((record) => {
    const className = record.student.classGrade;
    if (!classAttendanceMap[className]) {
      classAttendanceMap[className] = { presents: 0, total: 0 };
    }
    if (record.status === 'PRESENT' || record.status === 'LATE') {
      classAttendanceMap[className].presents++;
    }
    classAttendanceMap[className].total++;
  });

  const attendanceStats = Object.entries(classAttendanceMap).map(([className, data]) => ({
    class: className,
    attendanceRate: Math.round((data.presents / data.total) * 100),
  }));

  // 7. Users directory
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

  return (
    <AdminDashboardClient
      stats={{
        totalStudents,
        totalTeachers,
        totalSubjects,
        totalUsers,
        totalResults,
        passPercentage,
        schoolAverage,
      }}
      users={users as any}
      subjectAverages={subjectAverages}
      gradeDistribution={gradeDistribution}
      monthlyTrends={monthlyTrends}
      attendanceStats={attendanceStats}
    />
  );
}
