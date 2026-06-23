'use client';

import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Search, 
  Award, 
  Activity, 
  GraduationCap,
  Calendar,
  Medal,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  studentProfile: {
    id: string;
    rollNumber: string;
    classGrade: string;
    photoUrl: string | null;
    badges: { id: string }[];
  } | null;
}

interface LeaderboardItem {
  id: string;
  name: string;
  rollNumber: string;
  classGrade: string;
  photoUrl: string | null;
  gpa: number;
  attendancePct: number;
  healthScore: number;
  badgeCount: number;
}

interface LeaderboardClientProps {
  studentsData: LeaderboardItem[];
}

export default function LeaderboardClient({ studentsData }: LeaderboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter
  const filteredData = useMemo(() => {
    return studentsData.filter(item => {
      const search = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(search) ||
        item.rollNumber.toLowerCase().includes(search) ||
        item.classGrade.toLowerCase().includes(search)
      );
    });
  }, [studentsData, searchQuery]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25 shadow shadow-amber-500/10 animate-bounce">
            <Trophy className="h-4.5 w-4.5" />
          </div>
        );
      case 2:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400/10 text-slate-400 border border-slate-400/25 shadow shadow-slate-400/10">
            <Medal className="h-4.5 w-4.5" />
          </div>
        );
      case 3:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-700/10 text-amber-700 border border-amber-700/25 shadow shadow-amber-700/10">
            <Medal className="h-4.5 w-4.5" />
          </div>
        );
      default:
        return (
          <span className="text-sm font-bold font-mono text-slate-400 w-8 text-center block">
            #{rank}
          </span>
        );
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 75) return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    if (score >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-700 rounded-2xl p-6 shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-300" />
              Academic Leaderboard
            </h2>
            <p className="text-blue-100 text-xs mt-1">
              Celebrating top performance, perfect attendance, and academic health logs across the school.
            </p>
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-blue-200">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search leaderboard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border border-blue-500/30 bg-blue-700/20 py-2 pl-9 pr-3 text-sm text-white placeholder-blue-300 focus:outline-none focus:ring-1 focus:ring-yellow-350 focus:border-yellow-350"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-650 dark:text-slate-350">
            <thead className="text-xs uppercase text-slate-450 bg-slate-50/50 border-b border-slate-200 dark:bg-slate-950/20 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-bold text-center w-16">Rank</th>
                <th className="py-3 px-4 font-bold">Student</th>
                <th className="py-3 px-4 font-bold">Class Grade</th>
                <th className="py-3 px-4 font-bold text-center">GPA</th>
                <th className="py-3 px-4 font-bold text-center">Attendance</th>
                <th className="py-3 px-4 font-bold text-center">Badges</th>
                <th className="py-3 px-4 font-bold text-right">Health Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const rank = index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-950/10">
                      {/* Rank Icon/Number */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center">{getRankBadge(rank)}</div>
                      </td>

                      {/* Photo + Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={item.name}
                              className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500 font-bold">
                              {item.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-850 dark:text-white">{item.name}</div>
                            <div className="text-2xs text-slate-400 font-mono">{item.rollNumber}</div>
                          </div>
                        </div>
                      </td>

                      {/* Class Grade */}
                      <td className="py-4 px-4 text-slate-750 dark:text-slate-200">{item.classGrade}</td>

                      {/* GPA */}
                      <td className="py-4 px-4 text-center font-bold font-mono text-slate-800 dark:text-white">
                        {item.gpa.toFixed(2)}
                      </td>

                      {/* Attendance */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-mono text-slate-600 dark:text-slate-355">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {item.attendancePct}%
                        </span>
                      </td>

                      {/* Badges count */}
                      <td className="py-4 px-4 text-center">
                        {item.badgeCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-150 px-2 py-0.5 text-2xs font-bold font-mono text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400">
                            <Award className="h-3.5 w-3.5" />
                            {item.badgeCount}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Academic Health Score */}
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-bold font-mono ${getHealthScoreColor(item.healthScore)}`}>
                          <Activity className="h-3.5 w-3.5" />
                          {item.healthScore} / 100
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No students matching search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
