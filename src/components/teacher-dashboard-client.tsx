'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { saveMark, deleteMark } from '@/app/actions/marks';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Award, 
  BookOpen, 
  Save, 
  Trash2, 
  Check, 
  Loader2, 
  AlertCircle,
  GraduationCap,
  Users
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

  // Computations for Analytics
  const analytics = useMemo(() => {
    const currentExamMarks = marks.filter(
      (m) =>
        m.subjectId === selectedSubjectId &&
        m.examType === selectedExamType &&
        m.term === selectedTerm
    );

    const scoresList = currentExamMarks.map((m) => Math.round((m.marksObtained / m.maxMarks) * 100));
    const count = scoresList.length;
    const average = count > 0 ? Math.round(scoresList.reduce((a, b) => a + b, 0) / count) : 0;

    // Chart Data (student score comparison)
    const chartData = students.map((student) => {
      const match = currentExamMarks.find((m) => m.studentId === student.id);
      return {
        name: student.user.name,
        percentage: match ? Math.round((match.marksObtained / match.maxMarks) * 100) : 0,
        graded: !!match,
      };
    });

    return {
      average,
      count,
      chartData,
    };
  }, [marks, selectedSubjectId, selectedExamType, selectedTerm, students]);

  const selectedSubjectName = subjects.find(s => s.id === selectedSubjectId)?.name || 'Subject';

  return (
    <div className="space-y-8">
      {/* Configuration Control Panel */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-indigo-400 h-5 w-5" />
            Class Selection Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a subject, exam type, and term to manage grades.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-full lg:w-auto">
          {/* Subject Dropdown */}
          <div>
            <label className="block text-2xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="block w-full lg:w-48 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type Dropdown */}
          <div>
            <label className="block text-2xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Exam Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="block w-full lg:w-40 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Midterm">Midterm</option>
              <option value="Final">Final</option>
              <option value="Quiz 1">Quiz 1</option>
              <option value="Quiz 2">Quiz 2</option>
            </select>
          </div>

          {/* Term Dropdown */}
          <div>
            <label className="block text-2xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="block w-full lg:w-36 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Block */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Class Average</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{analytics.average}%</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Graded Students</span>
            <strong className="text-3xl font-extrabold text-white mt-1 block">{analytics.count} / {students.length}</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Subject Context</span>
            <strong className="text-lg font-bold text-white mt-2.5 block truncate max-w-[200px]">{selectedSubjectName}</strong>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grade entry and Chart grids */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Student Grade Entry List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Class Register & Grade Submission</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-350">
              <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 font-semibold">Roll No</th>
                  <th className="py-3 px-3 font-semibold">Student Name</th>
                  <th className="py-3 px-3 font-semibold text-center w-24">Obtained</th>
                  <th className="py-3 px-3 font-semibold text-center w-24">Max</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {students.map((student) => {
                  const studentInputs = inputs[student.id] || { obtained: '', max: '100' };
                  const isLoading = loadingStates[student.id];
                  const status = statusStates[student.id];
                  const hasMark = marks.some(
                    (m) =>
                      m.studentId === student.id &&
                      m.subjectId === selectedSubjectId &&
                      m.examType === selectedExamType &&
                      m.term === selectedTerm
                  );

                  return (
                    <tr key={student.id} className="hover:bg-slate-900/25 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400">{student.rollNumber}</td>
                      <td className="py-3 px-3 font-medium text-white">{student.user.name}</td>
                      
                      {/* Obtained Input */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          placeholder="—"
                          min="0"
                          max={studentInputs.max || 100}
                          value={studentInputs.obtained}
                          onChange={(e) => handleInputChange(student.id, 'obtained', e.target.value)}
                          className="w-16 rounded border border-slate-800 bg-slate-950 py-1 text-center font-mono text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Max Input */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="number"
                          placeholder="100"
                          min="1"
                          value={studentInputs.max}
                          onChange={(e) => handleInputChange(student.id, 'max', e.target.value)}
                          className="w-16 rounded border border-slate-800 bg-slate-950 py-1 text-center font-mono text-xs text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Alert info if error */}
                          {status?.type === 'error' && (
                            <span className="text-3xs text-rose-400 flex items-center gap-0.5" title={status.message}>
                              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                              <span>Error</span>
                            </span>
                          )}
                          {/* Check info if success */}
                          {status?.type === 'success' && (
                            <span className="text-emerald-400" title="Saved successfully">
                              <Check className="h-4.5 w-4.5 animate-bounce" />
                            </span>
                          )}

                          {/* Save Button */}
                          <button
                            onClick={() => handleSave(student.id)}
                            disabled={isLoading}
                            className="inline-flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 cursor-pointer"
                            title="Save grade"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(student.id)}
                            disabled={isLoading || !hasMark}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-800 bg-slate-950 text-slate-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30 cursor-pointer"
                            title="Delete grade"
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

        {/* Recharts Performance Visualizer */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Class Performance Comparison</h3>
            <p className="text-xs text-slate-405 mb-6">
              Visual overview of percentages scored by each student for the selected subject and exam.
            </p>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.chartData}
                  margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    cursor={{ fill: '#1e293b', opacity: 0.3 }}
                  />
                  <Bar dataKey="percentage" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800 pt-4 flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>Average Grade Distribution:</span>
            <span className="text-slate-200">
              {analytics.average >= 90 ? 'Excellent (A)' :
               analytics.average >= 80 ? 'Good (B)' :
               analytics.average >= 70 ? 'Satisfactory (C)' :
               analytics.average >= 60 ? 'Passing (D)' : 'Failing (F)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
