import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with SaaS metadata...');

  // Clean existing data
  await prisma.activityLog.deleteMany({});
  await prisma.loginHistory.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.mark.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.teacherProfile.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      name: 'System Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Created Admin: ${adminUser.email}`);

  // 2. Create Teacher
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@school.com',
      name: 'Sarah Jenkins',
      password: teacherPassword,
      role: 'TEACHER',
    },
  });

  const teacherProfile = await prisma.teacherProfile.create({
    data: {
      userId: teacherUser.id,
    },
  });
  console.log(`Created Teacher: ${teacherUser.email}`);

  // 3. Create Subjects for Teacher
  const mathSubject = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      teacherProfileId: teacherProfile.id,
    },
  });

  const scienceSubject = await prisma.subject.create({
    data: {
      name: 'Science',
      teacherProfileId: teacherProfile.id,
    },
  });
  console.log(`Created Subjects: Mathematics, Science`);

  // 4. Create Students
  const student1Password = await bcrypt.hash('student123', 10);
  const student1User = await prisma.user.create({
    data: {
      email: 'student@school.com',
      name: 'Alex Rivera',
      password: student1Password,
      role: 'STUDENT',
    },
  });

  const student1Profile = await prisma.studentProfile.create({
    data: {
      userId: student1User.id,
      rollNumber: 'S202601',
      classGrade: 'Grade 10A',
      dob: new Date('2010-05-15'),
      gender: 'Male',
      phone: '+1 (555) 123-4567',
      address: '742 Evergreen Terrace, Springfield',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
      academicHistory: JSON.stringify([
        { year: '2024', grade: '9th Grade', school: 'Springfield Middle School', GPA: '3.4' },
        { year: '2025', grade: '10th Grade (Term 1)', school: 'Springfield High School', GPA: '3.6' }
      ])
    },
  });
  console.log(`Created Student 1: ${student1User.email}`);

  const student2Password = await bcrypt.hash('student123', 10);
  const student2User = await prisma.user.create({
    data: {
      email: 'student2@school.com',
      name: 'Emily Chen',
      password: student2Password,
      role: 'STUDENT',
    },
  });

  const student2Profile = await prisma.studentProfile.create({
    data: {
      userId: student2User.id,
      rollNumber: 'S202602',
      classGrade: 'Grade 10A',
      dob: new Date('2010-09-22'),
      gender: 'Female',
      phone: '+1 (555) 987-6543',
      address: '12 Grimmauld Place, London',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
      academicHistory: JSON.stringify([
        { year: '2024', grade: '9th Grade', school: 'Hogwarts High School', GPA: '3.9' },
        { year: '2025', grade: '10th Grade (Term 1)', school: 'London Academy', GPA: '4.0' }
      ])
    },
  });
  console.log(`Created Student 2: ${student2User.email}`);

  // 5. Add Marks for Student 1 (Alex Rivera)
  await prisma.mark.createMany({
    data: [
      {
        studentId: student1Profile.id,
        subjectId: mathSubject.id,
        examType: 'Midterm',
        marksObtained: 85,
        maxMarks: 100,
        term: 'Term 1',
      },
      {
        studentId: student1Profile.id,
        subjectId: mathSubject.id,
        examType: 'Final',
        marksObtained: 92,
        maxMarks: 100,
        term: 'Term 1',
      },
      {
        studentId: student1Profile.id,
        subjectId: scienceSubject.id,
        examType: 'Midterm',
        marksObtained: 78,
        maxMarks: 100,
        term: 'Term 1',
      },
      {
        studentId: student1Profile.id,
        subjectId: scienceSubject.id,
        examType: 'Final',
        marksObtained: 88,
        maxMarks: 100,
        term: 'Term 1',
      },
    ],
  });

  // Add Marks for Student 2 (Emily Chen)
  await prisma.mark.createMany({
    data: [
      {
        studentId: student2Profile.id,
        subjectId: mathSubject.id,
        examType: 'Midterm',
        marksObtained: 95,
        maxMarks: 100,
        term: 'Term 1',
      },
      {
        studentId: student2Profile.id,
        subjectId: mathSubject.id,
        examType: 'Final',
        marksObtained: 98,
        maxMarks: 100,
        term: 'Term 1',
      },
      {
        studentId: student2Profile.id,
        subjectId: scienceSubject.id,
        examType: 'Midterm',
        marksObtained: 91,
        maxMarks: 100,
        term: 'Term 1',
      },
      {
        studentId: student2Profile.id,
        subjectId: scienceSubject.id,
        examType: 'Final',
        marksObtained: 94,
        maxMarks: 100,
        term: 'Term 1',
      },
    ],
  });

  // 6. Add Attendance Records (Past 30 Days)
  const attendanceData1: any[] = [];
  const attendanceData2: any[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Student 1 (Alex Rivera) - 90% attendance, some LATE, some ABSENT
    let status1 = 'PRESENT';
    if (i === 5) status1 = 'ABSENT';
    else if (i === 15) status1 = 'LATE';
    else if (i === 22) status1 = 'PRESENT';
    
    attendanceData1.push({
      studentId: student1Profile.id,
      date: new Date(date.setHours(0,0,0,0)),
      status: status1
    });

    // Student 2 (Emily Chen) - 100% attendance
    attendanceData2.push({
      studentId: student2Profile.id,
      date: new Date(date.setHours(0,0,0,0)),
      status: 'PRESENT'
    });
  }

  await prisma.attendanceRecord.createMany({ data: attendanceData1 });
  await prisma.attendanceRecord.createMany({ data: attendanceData2 });
  console.log(`Created Attendance records: ${attendanceData1.length} for Alex, ${attendanceData2.length} for Emily`);

  // 7. Add Achievement Badges
  await prisma.badge.createMany({
    data: [
      {
        studentId: student1Profile.id,
        name: 'Most Improved Student',
        description: 'Increased final scores by over 10% in Mathematics.',
        icon: 'trending-up'
      },
      {
        studentId: student1Profile.id,
        name: 'Subject Topper',
        description: 'Earned the highest class grade in Science Midterm.',
        icon: 'star'
      },
      {
        studentId: student2Profile.id,
        name: 'Top Performer',
        description: 'Maintained a GPA of 3.9+ for the current academic term.',
        icon: 'trophy'
      },
      {
        studentId: student2Profile.id,
        name: 'Perfect Attendance',
        description: 'Attended 100% of classes for the current month.',
        icon: 'calendar'
      }
    ]
  });
  console.log('Created achievement badges.');

  // 8. Add Security/Audit Logs
  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      details: 'Admin user successfully re-seeded the marks database with SaaS analytics profiles.'
    }
  });

  await prisma.loginHistory.createMany({
    data: [
      { userId: adminUser.id, ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
      { userId: teacherUser.id, ipAddress: '192.168.1.15', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/15.6.1' },
      { userId: student1User.id, ipAddress: '10.0.0.4', userAgent: 'Mozilla/5.0 (Linux; Android 10; K) Chrome/119.0.0.0 Mobile' }
    ]
  });
  console.log('Created security activity and login logs.');

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
