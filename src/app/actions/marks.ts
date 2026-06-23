'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { recordActivity } from '@/app/actions/admin';

/**
 * Creates or updates a student's marks for a subject, exam type, and term.
 */
export async function saveMark(data: {
  studentId: string;
  subjectId: string;
  examType: string;
  marksObtained: number;
  maxMarks: number;
  term: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const { studentId, subjectId, examType, marksObtained, maxMarks, term } = data;

  if (marksObtained < 0 || marksObtained > maxMarks) {
    throw new Error(`Marks obtained must be between 0 and ${maxMarks}`);
  }

  // Fetch names for logging details
  const student = await db.studentProfile.findUnique({
    where: { id: studentId },
    include: { user: { select: { name: true } } },
  });
  const subject = await db.subject.findUnique({
    where: { id: subjectId },
    select: { name: true },
  });

  const mark = await db.mark.upsert({
    where: {
      studentId_subjectId_examType_term: {
        studentId,
        subjectId,
        examType,
        term,
      },
    },
    update: {
      marksObtained,
      maxMarks,
    },
    create: {
      studentId,
      subjectId,
      examType,
      marksObtained,
      maxMarks,
      term,
    },
  });

  // Record audit log
  await recordActivity(
    'UPDATE_MARKS',
    `Updated grade for ${student?.user?.name || studentId} in ${subject?.name || subjectId}: ${marksObtained}/${maxMarks} (${examType}, ${term})`
  );

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/teacher');
  revalidatePath('/dashboard/student');
  return mark;
}

/**
 * Deletes a student mark record by ID.
 */
export async function deleteMark(markId: string) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  // Fetch details for logging
  const existing = await db.mark.findUnique({
    where: { id: markId },
    include: {
      student: { include: { user: { select: { name: true } } } },
      subject: { select: { name: true } },
    },
  });

  await db.mark.delete({
    where: {
      id: markId,
    },
  });

  if (existing) {
    await recordActivity(
      'DELETE_MARKS',
      `Deleted grade record for ${existing.student.user.name} in ${existing.subject.name} (${existing.examType}, ${existing.term})`
    );
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/teacher');
  revalidatePath('/dashboard/student');
  return { success: true };
}
