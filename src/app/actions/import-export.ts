'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { recordActivity } from './admin';

/**
 * Bulk imports student marks from a CSV string.
 * Format: rollNumber,marksObtained,maxMarks
 */
export async function importMarksCSV(data: {
  csvText: string;
  subjectId: string;
  examType: string;
  term: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
    throw new Error('Unauthorized');
  }

  const { csvText, subjectId, examType, term } = data;
  const lines = csvText.split(/\r?\n/);
  
  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect header line and skip it
    if (i === 0 && (line.toLowerCase().includes('roll') || line.toLowerCase().includes('mark'))) {
      continue;
    }

    const parts = line.split(',');
    if (parts.length < 2) {
      errorCount++;
      errors.push(`Line ${i + 1}: Invalid format. Expected rollNumber,marksObtained[,maxMarks]`);
      continue;
    }

    const rollNumber = parts[0].trim();
    const obtainedStr = parts[1].trim();
    const maxStr = parts[2] ? parts[2].trim() : '100';

    const marksObtained = parseFloat(obtainedStr);
    const maxMarks = parseFloat(maxStr);

    if (isNaN(marksObtained) || isNaN(maxMarks)) {
      errorCount++;
      errors.push(`Line ${i + 1} (${rollNumber}): Marks obtained and max marks must be numeric`);
      continue;
    }

    if (marksObtained < 0 || marksObtained > maxMarks) {
      errorCount++;
      errors.push(`Line ${i + 1} (${rollNumber}): Marks obtained (${marksObtained}) must be between 0 and ${maxMarks}`);
      continue;
    }

    try {
      // Find student profile by roll number
      const student = await db.studentProfile.findUnique({
        where: { rollNumber },
      });

      if (!student) {
        errorCount++;
        errors.push(`Line ${i + 1} (${rollNumber}): Roll number not found in school register`);
        continue;
      }

      // Upsert the marks
      await db.mark.upsert({
        where: {
          studentId_subjectId_examType_term: {
            studentId: student.id,
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
          studentId: student.id,
          subjectId,
          examType,
          marksObtained,
          maxMarks,
          term,
        },
      });

      successCount++;
    } catch (err: any) {
      errorCount++;
      errors.push(`Line ${i + 1} (${rollNumber}): Error writing to database: ${err.message}`);
    }
  }

  // Record audit activity log
  if (successCount > 0) {
    const subject = await db.subject.findUnique({ where: { id: subjectId } });
    await recordActivity(
      'BULK_IMPORT',
      `Imported ${successCount} grades for ${subject?.name || 'Subject'} (${examType}, ${term}). Failures: ${errorCount}.`
    );
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/teacher');
  revalidatePath('/dashboard/student');

  return {
    success: true,
    successCount,
    errorCount,
    errors,
  };
}
