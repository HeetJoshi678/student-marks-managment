'use server';

import { revalidatePath } from 'next/cache';
import db from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Record a system activity in the logs.
 */
export async function recordActivity(action: string, details: string) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  try {
    const log = await db.activityLog.create({
      data: {
        userId: session.user.id,
        action,
        details,
      },
    });
    return log;
  } catch (err) {
    console.error('Failed to log activity:', err);
    return null;
  }
}

/**
 * Record user login history details.
 */
export async function recordLogin(ipAddress: string, userAgent: string) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  try {
    const log = await db.loginHistory.create({
      data: {
        userId: session.user.id,
        ipAddress,
        userAgent,
      },
    });
    return log;
  } catch (err) {
    console.error('Failed to log login:', err);
    return null;
  }
}

/**
 * Fetch activity logs for admin overview.
 */
export async function getActivityLogs() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  return await db.activityLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });
}

/**
 * Fetch login history logs for admin overview.
 */
export async function getLoginHistory() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  return await db.loginHistory.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  });
}
