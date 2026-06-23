'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { saveMark, deleteMark } from '@/app/actions/marks';
import { importMarksCSV } from '@/app/actions/import-export';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Award, 
  BookOpen, 
  Trash2, 
  Check, 
  Loader2, 
  AlertCircle,
  GraduationCap,
  Users,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Sparkles,
  TrendingUp,
  FileDown
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
}

interface Student {
  id: string;
  rollNumber: string;
  user: {
    name: string;
  };
}

interface Mark {
  id: string;
  studentId: string;
  subjectId: string;
  examType: string;
  marksObtained: number;
  maxMarks: number;
  term: string;
}

interface TeacherDashboardProps {
  subjects: Subject[];
  students: Student[];
  initialMarks: Mark[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

export default function TeacherDashboardClient({
  subjects,
  students,
  initialMarks,
}: TeacherDashboardProps) {
  // Config States
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedExamType, setSelectedExamType] = useState('Midterm');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  // Interactive UI States
  const [marks, setMarks] = useState<Mark[]>(initialMarks);
  const [inputs, setInputs] = useState<Record<string, { obtained: string; max: string }>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [statusStates, setStatusStates] = useState<Record<string, { type: 'success' | 'error'; message?: string }>>({});
  
  // CSV Import States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; successCount: number; errorCount: number; errors: string[] } | null>(null);

  // Sync marks from props
  useEffect(() => {
    setMarks(initialMarks);
  }, [initialMarks]);

  // Load existing marks into input fields when settings change
  useEffect(() => {
    const newInputs: Record<string, { obtained: string; max: string }> = {};
    students.forEach((student) => {
      const existing = marks.find(
        (m) =>
          m.studentId === student.id &&
          m.subjectId === selectedSubjectId &&
          m.examType === selectedExamType &&
          m.term === selectedTerm
      );
      newInputs[student.id] = {
        obtained: existing ? existing.marksObtained.toString() : '',
        max: existing ? existing.maxMarks.toString() : '100',
      };
    });
    setInputs(newInputs);
    setStatusStates({});
    setImportResult(null);
  }, [selectedSubjectId, selectedExamType, selectedTerm, students, marks]);

  // Input Handlers
  const handleInputChange = (studentId: string, field: 'obtained' | 'max', value: string) => {
    setInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
    // Clear status when typing
    if (statusStates[studentId]) {
      setStatusStates((prev) => {
        const copy = { ...prev };
        delete copy[studentId];
        return copy;
      });
    }
  };

  // Save Mark Action
  const handleSave = async (studentId: string) => {
    const input = inputs[studentId];
    if (!input) return;

    const obtainedVal = parseFloat(input.obtained);
    const maxVal = parseFloat(input.max);

    // If inputs are blank, treat as not entered yet (no action on blur if empty)
    if (input.obtained.trim() === '') {
      return;
    }

    if (isNaN(obtainedVal) || isNaN(maxVal)) {
      setStatusStates((prev) => ({
        ...prev,
        [studentId]: { type: 'error', message: 'Enter valid numbers' },
      }));
      return;
    }

    if (obtainedVal < 0 || obtainedVal > maxVal) {
      setStatusStates((prev) => ({
        ...prev,
        [studentId]: { type: 'error', message: `Must be 0 to ${maxVal}` },
      }));
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [studentId]: true }));
    setStatusStates((prev) => {
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });

    try {
      const result = await saveMark({
        studentId,
        subjectId: selectedSubjectId,
        examType: selectedExamType,
        maxMarks: maxVal,
        marksObtained: obtainedVal,
        term: selectedTerm,
      });

      // Update local marks list
      setMarks((prev) => {
        const index = prev.findIndex(
          (m) =>
            m.studentId === studentId &&
            m.subjectId === selectedSubjectId &&
            m.examType === selectedExamType &&
            m.term === selectedTerm
        );
        const newMarkObj = {
          id: result.id,
          studentId,
          subjectId: selectedSubjectId,
          examType: selectedExamType,
          marksObtained: obtainedVal,
          maxMarks: maxVal,
          term: selectedTerm,
        };
        if (index > -1) {
          const updated = [...prev];
          updated[index] = newMarkObj;
          return updated;
        } else {
          return [...prev, newMarkObj];
        }
      });

      setStatusStates((prev) => ({
        ...prev,
        [studentId]: { type: 'success' },
      }));
    } catch (err: any) {
      setStatusStates((prev) => ({
        ...prev,
        [studentId]: { type: 'error', message: err.message || 'Failed' },
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  // Delete Mark Action
  const handleDelete = async (studentId: string) => {
    const existing = marks.find(
      (m) =>
        m.studentId === studentId &&
        m.subjectId === selectedSubjectId &&
        m.examType === selectedExamType &&
        m.term === selectedTerm
    );
    if (!existing) return;

    setLoadingStates((prev) => ({ ...prev, [studentId]: true }));

    try {
      await deleteMark(existing.id);

      // Remove from local marks list
      setMarks((prev) => prev.filter((m) => m.id !== existing.id));

      // Clear input
      setInputs((prev) => ({
        ...prev,
        [studentId]: {
          obtained: '',
          max: '100',
        },
      }));

      setStatusStates((prev) => ({
        ...prev,
        [studentId]: { type: 'success' },
      }));
    } catch (err: any) {
      setStatusStates((prev) => ({
        ...prev,
        [studentId]: { type: 'error', message: err.message || 'Failed' },
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  // CSV Import File Handler
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      try {
        const res = await importMarksCSV({
          csvText,
          subjectId: selectedSubjectId,
          examType: selectedExamType,
          term: selectedTerm,
        });

        setImportResult(res as any);
        
        // Reload all marks from server (we can just fetch updated ones or let user know to refresh)
        // Since server action mutates cache, we reload page locally or force-update local marks list.
        if (res.successCount > 0) {
          // Re-trigger a reload logic: just refresh window to sync all database relations!
          window.location.reload();
        }
      } catch (err: any) {
        setImportResult({
          success: false,
          successCount: 0,
          errorCount: 1,
          errors: [err.message || 'Failed to import CSV file'],
        });
      } finally {
        setImportLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // CSV Export Template Generator
  const downloadCSVTemplate = () => {
    let csvContent = 'rollNumber,marksObtained,maxMarks\n';
    students.forEach((s) => {
      const existing = marks.find(
        (m) =>
          m.studentId === s.id &&
          m.subjectId === selectedSubjectId &&
          m.examType === selectedExamType &&
          m.term === selectedTerm
      );
      csvContent += `${s.rollNumber},${existing ? existing.marksObtained : ''},${existing ? existing.maxMarks : '100'}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `grade_template_${selectedExamType}_${selectedTerm}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Print Trigger
  const handlePrint = () => {
    window.print();
  };

  // Computations for Analytics & Dashboard cards
  const analytics = useMemo(() => {
    const currentExamMarks = marks.filter(
      (m) =>
        m.subjectId === selectedSubjectId &&
        m.examType === selectedExamType &&
        m.term === selectedTerm
    );

    const scoresPctList = currentExamMarks.map((m) => (m.marksObtained / m.maxMarks) * 100);
    const count = scoresPctList.length;
    
    // Average
    const average = count > 0 ? Math.round(scoresPctList.reduce((a, b) => a + b, 0) / count) : 0;
    
    // Pass percentage (marks >= 60%)
    const passedCount = scoresPctList.filter(pct => pct >= 60).length;
    const passPercentage = count > 0 ? Math.round((passedCount / count) * 100) : 0;

    // Grade Distribution (Pie Chart data)
    let aCount = 0, bCount = 0, cCount = 0, dCount = 0, fCount = 0;
    scoresPctList.forEach(pct => {
      if (pct >= 90) aCount++;
      else if (pct >= 80) bCount++;
      else if (pct >= 70) cCount++;
      else if (pct >= 60) dCount++;
      else fCount++;
    });

    const pieData = [
      { name: 'Grade A (>=90%)', value: aCount },
      { name: 'Grade B (80-89%)', value: bCount },
      { name: 'Grade C (70-79%)', value: cCount },
      { name: 'Grade D (60-69%)', value: dCount },
      { name: 'Grade F (<60%)', value: fCount },
    ].filter(d => d.value > 0);

    // Chart Data (student score comparison)
    const chartData = students.map((student) => {
      const match = currentExamMarks.find((m) => m.studentId === student.id);
      const pct = match ? Math.round((match.marksObtained / match.maxMarks) * 100) : 0;
      return {
        name: student.user.name,
        percentage: pct,
        isAtRisk: match ? pct < 60 : false,
        graded: !!match,
      };
    });

    return {
      average,
      count,
      passPercentage,
      pieData,
      chartData,
    };
  }, [marks, selectedSubjectId, selectedExamType, selectedTerm, students]);

  const selectedSubjectName = subjects.find(s => s.id === selectedSubjectId)?.name || 'Subject';

  return (
    <div className="space-y-8">
      {/* CSS print overrides */}
      <style jsx global>{`
        @media print {
          aside, header, .no-print, .actions-cell-header, .actions-cell {
            display: none !important;
          }
          main {
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
          #print-grades-card {
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>

      {/* Settings Selector */}
      <div className="no-print bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-blue-500 h-5 w-5" />
            Class Selection Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Choose a subject, exam type, and term to manage grades.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-full lg:w-auto">
          {/* Subject */}
          <div>
            <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="block w-full lg:w-48 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type */}
          <div>
            <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Exam Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="block w-full lg:w-40 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white cursor-pointer"
            >
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Quiz 1">Quiz 1</option>
              <option value="Quiz 2">Quiz 2</option>
            </select>
          </div>

          {/* Term */}
          <div>
            <label className="block text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="block w-full lg:w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white cursor-pointer"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* CSV Bulk Actions Bar */}
      <div className="no-print bg-slate-50 border border-slate-200 p-4 rounded-xl dark:bg-slate-900/40 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="text-emerald-500 h-5 w-5" />
          <div>
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-250">Bulk Grades Administration</span>
            <span className="block text-3xs text-slate-450 dark:text-slate-400">Download templates or import grades via CSV files</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* CSV File Input */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCSVUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importLoading}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow shadow-emerald-600/10 hover:bg-emerald-500 cursor-pointer disabled:opacity-50"
          >
            {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Bulk Import CSV
          </button>

          <button
            onClick={downloadCSVTemplate}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <Download className="h-4 w-4" />
            Download CSV Template
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            <Printer className="h-4 w-4" />
            Print Report Sheet
          </button>
        </div>
      </div>

      {/* CSV Import Results Banner */}
      {importResult && (
        <div className="no-print p-4 rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-white">
            <Check className="text-emerald-500 h-5 w-5" />
            <span>CSV Import Completed</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Successfully imported <strong className="text-emerald-600">{importResult.successCount}</strong> grades. Errors: <strong className="text-rose-500">{importResult.errorCount}</strong>.
          </p>
          {importResult.errors.length > 0 && (
            <div className="mt-3 text-2xs font-mono text-rose-500 bg-rose-500/5 p-3 rounded border border-rose-500/10 max-h-40 overflow-y-auto space-y-1">
              {importResult.errors.map((err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="no-print grid grid-cols-1 gap-5 md:grid-cols-4">
        {/* Class Size */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Class Size</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{students.length} Students</strong>
          </div>
          <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-500 border border-slate-250 flex items-center justify-center dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400">
            <Users className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Graded count */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Results Published</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{analytics.count} Graded</strong>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center dark:bg-blue-950/20 dark:border-blue-900/30">
            <Award className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Pass rate */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Pass Percentage</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{analytics.passPercentage}%</strong>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center dark:bg-emerald-950/20 dark:border-emerald-900/30">
            <TrendingUp className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Class Average */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div>
            <span className="text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider block">Class Average</span>
            <strong className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 block">{analytics.average}%</strong>
          </div>
          <div className="h-11 w-11 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center dark:bg-indigo-950/20 dark:border-indigo-900/30">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* Double Analytics Charts */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Performance Comparison (recharts bar) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4">Class Performance Comparison</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.chartData}
                margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                  cursor={{ fill: '#f1f5f9', opacity: 0.15 }}
                />
                <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {analytics.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isAtRisk ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution (recharts pie) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4">Grade Distribution</h3>
            <div className="h-60 w-full flex justify-center items-center">
              {analytics.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-slate-400">No grades recorded to build distribution.</span>
              )}
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-4 dark:border-slate-850 flex flex-wrap justify-center gap-3 text-3xs font-mono font-bold text-slate-500">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#10b981] inline-block" /> A (Ex)</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#3b82f6] inline-block" /> B (Gd)</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#f59e0b] inline-block" /> C (Sat)</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#f97316] inline-block" /> D (Pass)</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-[#ef4444] inline-block" /> F (Fail)</span>
          </div>
        </div>
      </div>

      {/* Grade Submission Table */}
      <div 
        id="print-grades-card"
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
          <div>
            <h3 className="text-md font-bold text-slate-900 dark:text-white">Class Register & Grade Submission</h3>
            <p className="no-print text-2xs text-slate-450 dark:text-slate-400 mt-0.5">
              Type scores and click out of the box (blur) to auto-save grades dynamically in the background.
            </p>
          </div>
          <div className="hidden print:block text-2xs font-bold text-slate-500 uppercase tracking-widest">
            {selectedSubjectName} — {selectedExamType} ({selectedTerm})
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-650 dark:text-slate-350">
            <thead className="text-3xs uppercase text-slate-500 border-b border-slate-200 bg-slate-50/50 dark:bg-slate-950/20 dark:border-slate-850">
              <tr>
                <th className="py-2.5 px-3 font-bold">Roll No</th>
                <th className="py-2.5 px-3 font-bold">Student Name</th>
                <th className="py-2.5 px-3 font-bold text-center w-24">Obtained</th>
                <th className="py-2.5 px-3 font-bold text-center w-24">Max</th>
                <th className="py-2.5 px-3 font-bold text-center">Status</th>
                <th className="py-2.5 px-3 font-bold text-right no-print actions-cell-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {students.map((student) => {
                const studentInputs = inputs[student.id] || { obtained: '', max: '100' };
                const isLoading = loadingStates[student.id];
                const status = statusStates[student.id];
                const existingMark = marks.find(
                  (m) =>
                    m.studentId === student.id &&
                    m.subjectId === selectedSubjectId &&
                    m.examType === selectedExamType &&
                    m.term === selectedTerm
                );

                const hasMark = !!existingMark;
                const percentage = existingMark ? (existingMark.marksObtained / existingMark.maxMarks) * 100 : null;
                const isAtRisk = percentage !== null && percentage < 60;

                return (
                  <tr key={student.id} className="hover:bg-slate-50/10">
                    <td className="py-3 px-3 font-mono text-slate-400 dark:text-slate-550">{student.rollNumber}</td>
                    <td className="py-3 px-3 font-bold text-slate-850 dark:text-white">{student.user.name}</td>
                    
                    {/* Obtained Input */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        placeholder="—"
                        min="0"
                        max={studentInputs.max || 100}
                        value={studentInputs.obtained}
                        onChange={(e) => handleInputChange(student.id, 'obtained', e.target.value)}
                        onBlur={() => handleSave(student.id)}
                        className="no-print w-16 rounded border border-slate-200 bg-white py-1 text-center font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                      <span className="hidden print:inline font-mono">{studentInputs.obtained || '—'}</span>
                    </td>

                    {/* Max Input */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        placeholder="100"
                        min="1"
                        value={studentInputs.max}
                        onChange={(e) => handleInputChange(student.id, 'max', e.target.value)}
                        onBlur={() => handleSave(student.id)}
                        className="no-print w-16 rounded border border-slate-200 bg-white py-1 text-center font-mono text-xs text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                      />
                      <span className="hidden print:inline font-mono">{studentInputs.max || '100'}</span>
                    </td>

                    {/* AI Risk / Status Indicator */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center">
                        {isAtRisk ? (
                          <span className="inline-flex items-center gap-0.5 rounded bg-rose-50 border border-rose-150 px-2 py-0.5 text-3xs font-bold font-mono text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
                            <Sparkles className="h-3 w-3 animate-pulse" />
                            At-Risk
                          </span>
                        ) : hasMark ? (
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 border border-emerald-150 px-2 py-0.5 text-3xs font-bold font-mono text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                            Passing
                          </span>
                        ) : (
                          <span className="text-slate-400 text-3xs">Pending</span>
                        )}
                      </div>
                    </td>

                    {/* Actions (Hidden in Print) */}
                    <td className="py-3 px-3 text-right no-print actions-cell">
                      <div className="flex items-center justify-end gap-2.5">
                        {/* Error info */}
                        {status?.type === 'error' && (
                          <span className="text-3xs text-rose-500 flex items-center gap-0.5" title={status.message}>
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            <span>Error</span>
                          </span>
                        )}
                        {/* Success info */}
                        {status?.type === 'success' && (
                          <span className="text-emerald-500 flex items-center gap-0.5" title="Auto-saved">
                            <Check className="h-4.5 w-4.5" />
                            <span className="text-3xs font-semibold">Saved</span>
                          </span>
                        )}
                        {/* Saving indicator */}
                        {isLoading && (
                          <span className="text-blue-500 flex items-center gap-0.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="text-3xs">Saving</span>
                          </span>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(student.id)}
                          disabled={isLoading || !hasMark}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-white text-slate-450 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30 cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                          title="Clear grade record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
