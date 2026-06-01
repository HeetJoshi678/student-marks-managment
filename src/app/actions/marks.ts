'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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

  await db.mark.delete({
    where: {
      id: markId,
    },
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/teacher');
  revalidatePath('/dashboard/student');
  return { success: true };
}
