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
  Legend 
} from 'recharts';
import { 
  Award, 
  BookOpen, 
  Calculator, 
  GraduationCap, 
  TrendingUp, 
  TrendingDown, 
  Clock 
} from 'lucide-react';

interface Mark {
  id: string;
  examType: string;
  marksObtained: number;
  maxMarks: number;
  term: string;
  subject: {
    id: string;
    name: string;
  };
}

interface StudentData {
  rollNumber: string;
  classGrade: string;
  user: {
    name: string;
    email: string;
  };
  marks: Mark[];
}

export default function StudentDashboardClient({ student }: { student: StudentData }) {
  const [hypotheticalMarks, setHypotheticalMarks] = useState<Record<string, number>>({});

  // Helper: calculate letter grade
  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', gpa: 4.0, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' };
    if (percentage >= 80) return { grade: 'B', gpa: 3.0, color: 'text-blue-400 border-blue-500/20 bg-blue-500/5' };
    if (percentage >= 70) return { grade: 'C', gpa: 2.0, color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5' };
    if (percentage >= 60) return { grade: 'D', gpa: 1.0, color: 'text-orange-400 border-orange-500/20 bg-orange-500/5' };
    return { grade: 'F', gpa: 0.0, color: 'text-rose-400 border-rose-500/20 bg-rose-500/5' };
  };

  // 1. Calculate Statistics
  const stats = useMemo(() => {
    if (!student.marks.length) return { average: 0, gpa: 0, totalMarks: 0, subjectsCount: 0 };
    
    let sumObtained = 0;
    let sumMax = 0;
    let gpaSum = 0;
    const subjects = new Set<string>();

    student.marks.forEach(m => {
      sumObtained += m.marksObtained;
      sumMax += m.maxMarks;
      subjects.add(m.subject.name);
      
      const pct = (m.marksObtained / m.maxMarks) * 100;
      gpaSum += getLetterGrade(pct).gpa;
    });

    const average = sumMax > 0 ? (sumObtained / sumMax) * 100 : 0;
    const gpa = gpaSum / student.marks.length;

    return {
      average: parseFloat(average.toFixed(1)),
      gpa: parseFloat(gpa.toFixed(2)),
      totalMarks: student.marks.length,
      subjectsCount: subjects.size
    };
  }, [student.marks]);

  // 2. Prepare Chart Data (group marks by subject)
  const chartData = useMemo(() => {
    const subjectGrades: Record<string, { subject: string; Midterm?: number; Final?: number }> = {};
    
    student.marks.forEach(m => {
      const subName = m.subject.name;
      if (!subjectGrades[subName]) {
        subjectGrades[subName] = { subject: subName };
      }
      const pct = Math.round((m.marksObtained / m.maxMarks) * 100);
      if (m.examType === 'Midterm') {
        subjectGrades[subName].Midterm = pct;
      } else if (m.examType === 'Final') {
        subjectGrades[subName].Final = pct;
      } else {
        // Handle other exam types by averaging
        (subjectGrades[subName] as any)[m.examType] = pct;
      }
    });

    return Object.values(subjectGrades);
  }, [student.marks]);

  // 3. GPA Calculator Logic
  const handleHypotheticalChange = (markId: string, value: string) => {
    const num = parseFloat(value);
    setHypotheticalMarks(prev => ({
      ...prev,
      [markId]: isNaN(num) ? 0 : num
    }));
  };

  const calculatedGPA = useMemo(() => {
    if (!student.marks.length) return 0;
    let gpaSum = 0;
    
    student.marks.forEach(m => {
      const markVal = m.id in hypotheticalMarks ? hypotheticalMarks[m.id] : m.marksObtained;
      const pct = (markVal / m.maxMarks) * 100;
      gpaSum += getLetterGrade(pct).gpa;
    });

    return parseFloat((gpaSum / student.marks.length).toFixed(2));
  }, [student.marks, hypotheticalMarks]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome back, {student.user.name}!</h2>
          <p className="text-slate-400 mt-1">Here is your academic overview for {student.classGrade}.</p>
        </div>
        <div className="flex gap-4 text-sm text-slate-400">
          <div className="px-4 py-2 bg-slate-950/50 rounded-lg border border-slate-850">
            <span className="text-slate-500 block text-xs">Roll Number</span>
            <strong className="text-white font-semibold">{student.rollNumber}</strong>
          </div>
          <div className="px-4 py-2 bg-slate-950/50 rounded-lg border border-slate-850">
            <span className="text-slate-500 block text-xs">Class Grade</span>
            <strong className="text-white font-semibold">{student.classGrade}</strong>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* GPA Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Cumulative GPA</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{stats.gpa} / 4.0</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        {/* Average Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Average Percentage</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{stats.average}%</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Subjects Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Enrolled Subjects</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{stats.subjectsCount}</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Total Exams Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Grades Recorded</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{stats.totalMarks}</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold text-white mb-6">Subject Performance Analysis (%)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="subject" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                cursor={{ fill: '#1e293b', opacity: 0.4 }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Midterm" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Final" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transcript & Report Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Report Card Table */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Official Academic Transcript</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Subject</th>
                  <th className="py-3 px-4 font-semibold">Exam Type</th>
                  <th className="py-3 px-4 font-semibold">Term</th>
                  <th className="py-3 px-4 font-semibold text-center">Score</th>
                  <th className="py-3 px-4 font-semibold text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {student.marks.length > 0 ? (
                  student.marks.map((mark) => {
                    const pct = (mark.marksObtained / mark.maxMarks) * 100;
                    const gradeInfo = getLetterGrade(pct);
                    return (
                      <tr key={mark.id} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-4 px-4 font-medium text-white">{mark.subject.name}</td>
                        <td className="py-4 px-4">{mark.examType}</td>
                        <td className="py-4 px-4">{mark.term}</td>
                        <td className="py-4 px-4 text-center font-mono">
                          {mark.marksObtained} / {mark.maxMarks}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold font-mono ${gradeInfo.color}`}>
                            {gradeInfo.grade} ({pct.toFixed(0)}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No grades recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive GPA Calculator */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">GPA Goal Planner</h3>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Simulate your grades to see how changes in exam scores affect your cumulative GPA.
            </p>

            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {student.marks.map((mark) => (
                <div key={mark.id} className="p-3 bg-slate-950/40 rounded-lg border border-slate-850/60 flex items-center justify-between gap-4">
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-300 block truncate">{mark.subject.name}</span>
                    <span className="text-2xs text-slate-500 font-mono">{mark.examType}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max={mark.maxMarks}
                      defaultValue={mark.marksObtained}
                      onChange={(e) => handleHypotheticalChange(mark.id, e.target.value)}
                      className="w-14 rounded border border-slate-800 bg-slate-950 text-center py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
                    <span className="text-slate-500 text-xs">/ {mark.maxMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Projected GPA:</span>
              <span className={`text-2xl font-extrabold font-mono transition-colors duration-250 ${
                calculatedGPA >= stats.gpa 
                  ? 'text-indigo-400' 
                  : 'text-amber-500'
              }`}>
                {calculatedGPA} / 4.0
              </span>
            </div>
            
            {calculatedGPA > stats.gpa && (
              <div className="mt-3 flex items-center gap-1.5 text-3xs text-emerald-400 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>Increase of +{(calculatedGPA - stats.gpa).toFixed(2)} from current.</span>
              </div>
            )}
            
            {calculatedGPA < stats.gpa && (
              <div className="mt-3 flex items-center gap-1.5 text-3xs text-amber-500 font-medium">
                <TrendingDown className="h-3 w-3" />
                <span>Decrease of -{(stats.gpa - calculatedGPA).toFixed(2)} from current.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
