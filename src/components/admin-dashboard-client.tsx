'use client';

import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  School,
  TrendingUp,
  Mail,
  ShieldCheck,
  Search,
  Calendar,
  Award
} from 'lucide-react';

interface AdminStudentProfile {
  rollNumber: string;
  classGrade: string;
}

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date | string;
  studentProfile: AdminStudentProfile | null;
}

interface AdminDashboardClientProps {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalSubjects: number;
    totalUsers: number;
    totalResults: number;
    passPercentage: number;
    schoolAverage: number;
  };
  users: AdminUserItem[];
  subjectAverages: { name: string; average: number }[];
  gradeDistribution: { name: string; value: number }[];
  monthlyTrends: { month: string; average: number }[];
  attendanceStats: { class: string; attendanceRate: number }[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

export default function AdminDashboardClient({
  stats,
  users,
  subjectAverages,
  gradeDistribution,
  monthlyTrends,
  attendanceStats,
}: AdminDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Filtering users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const search = searchQuery.toLowerCase();
      const matchSearch = u.name.toLowerCase().includes(search) || 
                          u.email.toLowerCase().includes(search) ||
                          (u.studentProfile?.rollNumber && u.studentProfile.rollNumber.toLowerCase().includes(search)) ||
                          (u.studentProfile?.classGrade && u.studentProfile.classGrade.toLowerCase().includes(search));
      
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-505/10 text-rose-500 border-rose-500/20';
      case 'TEACHER': return 'bg-blue-505/10 text-blue-500 border-blue-500/20';
      default: return 'bg-emerald-505/10 text-emerald-500 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <School className="text-blue-500 h-6 w-6" />
          School Operations Center
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor academic indices, class attendance parameters, grade registries, and user logins.
        </p>
      </div>

      {/* SaaS Dashboard Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {/* Total Accounts */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-450 dark:text-slate-500 text-3xs font-bold uppercase tracking-wider block">Total Accounts</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stats.totalUsers}</strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center dark:bg-slate-950 dark:text-slate-450">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-455 dark:text-slate-500 text-3xs font-bold uppercase tracking-wider block">Teachers</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stats.totalTeachers}</strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center dark:bg-blue-950/20 dark:border-blue-900/30">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        {/* Students */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-455 dark:text-slate-500 text-3xs font-bold uppercase tracking-wider block">Students</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stats.totalStudents}</strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center dark:bg-emerald-950/20 dark:border-emerald-900/30">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>

        {/* Results Published */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-455 dark:text-slate-500 text-3xs font-bold uppercase tracking-wider block">Grades Recorded</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stats.totalResults}</strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center dark:bg-indigo-950/20 dark:border-indigo-900/30">
            <Award className="h-5 w-5" />
          </div>
        </div>

        {/* Pass rate */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-455 dark:text-slate-500 text-3xs font-bold uppercase tracking-wider block">Pass Rate</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stats.passPercentage}%</strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center dark:bg-amber-950/20 dark:border-amber-900/30">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Average score */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-455 dark:text-slate-500 text-3xs font-bold uppercase tracking-wider block">School Average</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{stats.schoolAverage}%</strong>
          </div>
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center dark:bg-violet-950/20 dark:border-violet-900/30">
            <School className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Double Charts Panel: Performance Averages & Grade Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject wise average */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Subject Performance Averages (%)</h3>
          <div className="h-64 w-full">
            {subjectAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectAverages} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No subject averages recorded.</div>
            )}
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Grade Distribution</h3>
          <div className="h-56 w-full flex justify-center items-center">
            {gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-400">No grades recorded.</span>
            )}
          </div>
          <div className="border-t border-slate-100 pt-3.5 dark:border-slate-850 flex flex-wrap justify-center gap-3 text-3xs font-mono font-bold text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#10b981] inline-block" /> A</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#3b82f6] inline-block" /> B</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#f59e0b] inline-block" /> C</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#f97316] inline-block" /> D</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#ef4444] inline-block" /> F</span>
          </div>
        </div>
      </div>

      {/* Double Charts Panel: Monthly Trends & Attendance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Result Trends (Line chart) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-blue-500" />
            Monthly Result Trends (%)
          </h3>
          <div className="h-64 w-full">
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Line type="monotone" dataKey="average" stroke="#4f46e5" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No trend metrics generated.</div>
            )}
          </div>
        </div>

        {/* Attendance Analytics (Bar chart by class) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-blue-500" />
            Class-wise Attendance Rates (%)
          </h3>
          <div className="h-64 w-full">
            {attendanceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis dataKey="class" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Bar dataKey="attendanceRate" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">No attendance records found.</div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Registry Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
          <div>
            <h3 className="text-md font-bold text-slate-900 dark:text-white">Active System User Directory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Audit user access, roles, classgrades, and enrollment records.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="TEACHER">TEACHER</option>
              <option value="STUDENT">STUDENT</option>
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="Filter users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-650 dark:text-slate-350">
            <thead className="text-3xs uppercase text-slate-500 border-b border-slate-200 bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-850">
              <tr>
                <th className="py-2.5 px-4 font-bold">User Name</th>
                <th className="py-2.5 px-4 font-bold">Email</th>
                <th className="py-2.5 px-4 font-bold">Role</th>
                <th className="py-2.5 px-4 font-bold">Roll Number</th>
                <th className="py-2.5 px-4 font-bold">Class Grade</th>
                <th className="py-2.5 px-4 font-bold text-right">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/10">
                    <td className="py-3 px-4 font-bold text-slate-850 dark:text-white">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-405 text-xs">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-4xs font-bold font-mono tracking-wider ${getRoleStyle(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{u.studentProfile?.rollNumber || '—'}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{u.studentProfile?.classGrade || '—'}</td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching users found.
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
