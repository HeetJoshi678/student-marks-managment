import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
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
