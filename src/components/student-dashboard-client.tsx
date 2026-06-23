'use client';

import React, { useState, useMemo, useRef } from 'react';
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
  Printer,
  Sparkles,
  AlertTriangle,
  QrCode,
  CheckCircle,
  FileDown
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

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface StudentData {
  id: string;
  rollNumber: string;
  classGrade: string;
  user: {
    name: string;
    email: string;
  };
  marks: Mark[];
  badges: Badge[];
}

export default function StudentDashboardClient({ student }: { student: StudentData }) {
  const [hypotheticalMarks, setHypotheticalMarks] = useState<Record<string, number>>({});
  const reportRef = useRef<HTMLDivElement>(null);

  // Helper: calculate letter grade
  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', gpa: 4.0, color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' };
    if (percentage >= 80) return { grade: 'B', gpa: 3.0, color: 'text-blue-500 border-blue-500/20 bg-blue-500/5' };
    if (percentage >= 70) return { grade: 'C', gpa: 2.0, color: 'text-yellow-600 border-yellow-500/20 bg-yellow-500/5' };
    if (percentage >= 60) return { grade: 'D', gpa: 1.0, color: 'text-orange-500 border-orange-500/20 bg-orange-500/5' };
    return { grade: 'F', gpa: 0.0, color: 'text-rose-500 border-rose-500/20 bg-rose-500/5' };
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

  // 2. AI Diagnostics & Predictions
  const aiInsights = useMemo(() => {
    if (!student.marks.length) return { predictions: [], suggestions: [], isAtRisk: false };

    const predictions: { subject: string; currentPct: number; predictedPct: number; trend: 'up' | 'down' | 'stable' }[] = [];
    const suggestions: string[] = [];
    let isAtRisk = false;

    // Group marks by subject to evaluate trend
    const subjectMap: Record<string, Mark[]> = {};
    student.marks.forEach(m => {
      if (!subjectMap[m.subject.name]) subjectMap[m.subject.name] = [];
      subjectMap[m.subject.name].push(m);
    });

    Object.entries(subjectMap).forEach(([subName, marksList]) => {
      // Sort: Midterm first, then Final
      const sorted = [...marksList].sort((a, b) => {
        if (a.examType === 'Midterm') return -1;
        if (b.examType === 'Midterm') return 1;
        return 0;
      });

      const firstMark = sorted[0];
      const lastMark = sorted[sorted.length - 1];
      const firstPct = (firstMark.marksObtained / firstMark.maxMarks) * 100;
      const lastPct = (lastMark.marksObtained / lastMark.maxMarks) * 100;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      let predictedPct = lastPct;

      if (sorted.length > 1) {
        if (lastPct > firstPct) {
          trend = 'up';
          predictedPct = Math.min(100, Math.round(lastPct + (lastPct - firstPct) * 0.5));
        } else if (lastPct < firstPct) {
          trend = 'down';
          predictedPct = Math.max(0, Math.round(lastPct - (firstPct - lastPct) * 0.5));
        }
      } else {
        // baseline
        predictedPct = lastPct;
      }

      predictions.push({
        subject: subName,
        currentPct: Math.round(lastPct),
        predictedPct,
        trend,
      });

      // Flags students if any core predicted grade is failing (< 60%)
      if (predictedPct < 60) {
        isAtRisk = true;
      }

      // Generate Study Suggestions
      if (lastPct < 70) {
        if (subName.toLowerCase().includes('math')) {
          suggestions.push(`Mathematics: Revise quadratic equations, practice algebra worksheets, and schedule 1-on-1 tutoring sessions.`);
        } else if (subName.toLowerCase().includes('science')) {
          suggestions.push(`Science: Practice balancing chemistry equations, memorize biology diagrams, and review physics lab questions.`);
        } else {
          suggestions.push(`${subName}: Focus on core curriculum vocabulary and schedule review of previous midterm quiz errors.`);
        }
      } else if (lastPct >= 85) {
        suggestions.push(`${subName}: You are excelling! Consider taking advanced extension courses or participating in peer study groups.`);
      }
    });

    // Default suggestion if everything is fine
    if (suggestions.length === 0) {
      suggestions.push('Keep maintaining your current study schedule. Your scores reflect consistent performance across all areas.');
    }

    return {
      predictions,
      suggestions,
      isAtRisk,
    };
  }, [student.marks]);

  // 3. Prepare Chart Data (group marks by subject)
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
      }
    });

    return Object.values(subjectGrades);
  }, [student.marks]);

  // 4. GPA Calculator Logic
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* CSS print override styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-card, #printable-report-card * {
            visibility: visible;
          }
          #printable-report-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Overview Header Banner */}
      <div className="no-print flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Welcome back, {student.user.name}!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">Access your academic history, report cards, and GPA projections.</p>
        </div>
        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:hover:text-white cursor-pointer font-semibold"
          >
            <Printer className="h-4 w-4" />
            Print / PDF Report Card
          </button>
        </div>
      </div>

      {/* Ranks & Health Score Overview Cards */}
      <div className="no-print grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* GPA */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Cumulative GPA</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 block">{stats.gpa} / 4.0</strong>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center dark:bg-blue-950/20 dark:border-blue-900/30">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Avg Pct */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Avg Percentage</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 block">{stats.average}%</strong>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center dark:bg-emerald-950/20 dark:border-emerald-900/30">
            <TrendingUp className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Badges count */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Earned Badges</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 block">{student.badges.length} Achievements</strong>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center dark:bg-indigo-950/20 dark:border-indigo-900/30">
            <Award className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Exams Taken */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Exams Graded</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5 block">{stats.totalMarks} Records</strong>
          </div>
          <div className="h-11 w-11 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20 flex items-center justify-center dark:bg-violet-950/20 dark:border-violet-900/30">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* AI Performance Prediction & Study Suggestions */}
      <div className="no-print grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Predictions Panel */}
        <div className="xl:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-blue-500 h-5 w-5 animate-pulse" />
            AI Performance Projections (Next Term)
          </h3>
          
          {aiInsights.isAtRisk && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3.5 text-xs text-red-500">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>
                <strong>Warning Alert:</strong> Based on performance trends, you are flagged at risk of falling below passing grades in one or more courses. Please check study suggestions.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiInsights.predictions.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{p.subject}</span>
                  {p.trend === 'up' && <span className="text-3xs font-semibold font-mono text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> Improving</span>}
                  {p.trend === 'down' && <span className="text-3xs font-semibold font-mono text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 flex items-center gap-0.5"><TrendingDown className="h-3 w-3" /> Decreasing</span>}
                  {p.trend === 'stable' && <span className="text-3xs font-semibold font-mono text-slate-450 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 flex items-center gap-0.5">Stable</span>}
                </div>
                
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex-1">
                    <span className="text-slate-400 block text-3xs uppercase tracking-wider">Current Score</span>
                    <strong className="text-slate-700 dark:text-slate-200 text-sm mt-0.5 block">{p.currentPct}%</strong>
                  </div>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1">
                    <span className="text-indigo-400 block text-3xs uppercase tracking-wider">Predicted Score</span>
                    <strong className="text-indigo-500 text-sm mt-0.5 block">{p.predictedPct}%</strong>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-850">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.predictedPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Suggestions Panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-indigo-500 h-5 w-5" />
              AI Study Suggestions
            </h3>
            <p className="text-3xs text-slate-400 uppercase tracking-widest block mb-4">Personalized recommendations</p>
            
            <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300">
              {aiInsights.suggestions.map((s, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-850">
            <span className="text-3xs text-indigo-455 font-semibold flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Suggestions auto-regenerate on grade updates
            </span>
          </div>
        </div>
      </div>

      {/* Visual Recharts Progress Chart */}
      <div className="no-print bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <h3 className="text-md font-bold text-slate-900 dark:text-white mb-6">Subject Performance Analysis (%)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                cursor={{ fill: '#f1f5f9', opacity: 0.15 }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Midterm" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Final" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GPA simulator & Formal Printable Report Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Printable Report Card (Occupies full viewport on print) */}
        <div 
          id="printable-report-card"
          ref={reportRef}
          className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6 relative"
        >
          {/* Report Card Header (Logo, School Name, Details) */}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start border-b-2 border-slate-200 pb-5 gap-4">
            <div className="flex items-center gap-3.5">
              {/* Mock School Logo */}
              <div className="h-14 w-14 rounded-full bg-blue-600 border-2 border-blue-500 shadow-md flex items-center justify-center text-white font-extrabold text-xl shrink-0">
                S
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">Springfield Academy</h2>
                <p className="text-slate-500 text-3xs uppercase tracking-widest font-semibold mt-0.5">Accredited Academic Institution</p>
                <p className="text-slate-400 text-3xs font-mono mt-0.5">123 Education Way, Springfield, USA</p>
              </div>
            </div>

            {/* QR Verification Code */}
            <div className="flex flex-col items-center shrink-0 border border-slate-200 bg-slate-50 p-2.5 rounded-xl dark:border-slate-800 dark:bg-slate-950">
              <div className="w-16 h-16 text-slate-800 dark:text-white flex items-center justify-center">
                <QrCode className="w-14 h-14" />
              </div>
              <span className="text-4xs uppercase tracking-wider font-bold text-slate-400 mt-1 font-mono">Verify Grade</span>
            </div>
          </div>

          {/* Student details cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-450 dark:text-slate-500 text-3xs uppercase tracking-widest font-bold block">Student Name</span>
              <strong className="text-slate-850 dark:text-white font-bold block mt-1">{student.user.name}</strong>
            </div>
            <div>
              <span className="text-slate-450 dark:text-slate-500 text-3xs uppercase tracking-widest font-bold block">Roll Number</span>
              <strong className="text-slate-850 dark:text-white font-mono block mt-1">{student.rollNumber}</strong>
            </div>
            <div>
              <span className="text-slate-450 dark:text-slate-500 text-3xs uppercase tracking-widest font-bold block">Class Grade</span>
              <strong className="text-slate-850 dark:text-white block mt-1">{student.classGrade}</strong>
            </div>
            <div>
              <span className="text-slate-450 dark:text-slate-500 text-3xs uppercase tracking-widest font-bold block">Academic Term</span>
              <strong className="text-slate-850 dark:text-white block mt-1">2026 Term 1</strong>
            </div>
          </div>

          {/* Transcript Grades Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-650 dark:text-slate-350">
              <thead className="text-3xs uppercase text-slate-500 border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
                <tr>
                  <th className="py-2.5 px-3.5 font-bold">Subject</th>
                  <th className="py-2.5 px-3.5 font-bold">Exam Type</th>
                  <th className="py-2.5 px-3.5 font-bold">Term</th>
                  <th className="py-2.5 px-3.5 font-bold text-center">Score</th>
                  <th className="py-2.5 px-3.5 font-bold text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                {student.marks.length > 0 ? (
                  student.marks.map((mark) => {
                    const pct = (mark.marksObtained / mark.maxMarks) * 100;
                    const gradeInfo = getLetterGrade(pct);
                    return (
                      <tr key={mark.id} className="hover:bg-slate-50/10">
                        <td className="py-3 px-3.5 font-bold text-slate-800 dark:text-white">{mark.subject.name}</td>
                        <td className="py-3 px-3.5">{mark.examType}</td>
                        <td className="py-3 px-3.5">{mark.term}</td>
                        <td className="py-3 px-3.5 text-center font-mono">{mark.marksObtained} / {mark.maxMarks}</td>
                        <td className="py-3 px-3.5 text-right">
                          <span className={`inline-flex items-center rounded border px-2 py-0.5 font-bold font-mono text-3xs ${gradeInfo.color}`}>
                            {gradeInfo.grade} ({pct.toFixed(0)}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No grades recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Transcript Footer (Signature block, seal) */}
          <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-200 pt-6 gap-6 dark:border-slate-850">
            <div className="text-3xs text-slate-450 dark:text-slate-500 font-mono">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p className="mt-0.5">Verification Key: {student.id.slice(0, 8).toUpperCase()}-VERIFY</p>
            </div>
            
            {/* Principal Signature */}
            <div className="text-center sm:text-right shrink-0">
              <span className="font-serif italic text-lg text-slate-700 block pr-2 dark:text-slate-300">Dr. Arthur Vance</span>
              <div className="w-40 h-px bg-slate-350 dark:bg-slate-800 my-1 block" />
              <span className="text-4xs uppercase tracking-widest font-black text-slate-400">Principal Signature</span>
            </div>
          </div>
        </div>

        {/* GPA Simulator */}
        <div className="no-print bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">GPA Simulator</h3>
            </div>
            <p className="text-2xs text-slate-450 mb-5 dark:text-slate-400">
              Adjust your exam marks to evaluate changes to your projected cumulative GPA.
            </p>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {student.marks.map((mark) => (
                <div key={mark.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl dark:bg-slate-950/20 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-800 block truncate dark:text-white">{mark.subject.name}</span>
                    <span className="text-3xs text-slate-450 font-mono">{mark.examType}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      min="0"
                      max={mark.maxMarks}
                      defaultValue={mark.marksObtained}
                      onChange={(e) => handleHypotheticalChange(mark.id, e.target.value)}
                      className="w-14 rounded border border-slate-200 bg-white text-center py-1 text-xs text-slate-805 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                    <span className="text-slate-450 text-xs">/ {mark.maxMarks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-850">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-650 dark:text-slate-300">Projected GPA:</span>
              <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                {calculatedGPA} / 4.0
              </span>
            </div>
            
            {calculatedGPA > stats.gpa && (
              <div className="mt-3.5 flex items-center gap-1 text-3xs text-emerald-500 font-medium">
                <TrendingUp className="h-3 w-3" />
                <span>Projected increase of +{(calculatedGPA - stats.gpa).toFixed(2)} points.</span>
              </div>
            )}
            
            {calculatedGPA < stats.gpa && (
              <div className="mt-3.5 flex items-center gap-1 text-3xs text-amber-500 font-medium">
                <TrendingDown className="h-3 w-3" />
                <span>Projected decrease of -{(stats.gpa - calculatedGPA).toFixed(2)} points.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
