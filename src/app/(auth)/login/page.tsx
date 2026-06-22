'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  ShieldAlert, 
  BookOpen, 
  Loader2, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleQuickLogin = async (roleName: string, email: string, pass: string) => {
    setError(null);
    setLoadingRole(roleName);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password: pass,
      });

      if (res?.error) {
        setError(res.error);
        setLoadingRole(null);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoadingRole(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 px-4 py-12 sm:px-6 lg:px-8">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Portal Branding */}
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-450 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 backdrop-blur-sm transition-all duration-300">
            <GraduationCap className="h-9 w-9 text-indigo-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            GradePortal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Direct Access Panel — Select a Role
          </p>
        </div>

        {/* Access Panel Card */}
        <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            Choose Dashboard to Enter
          </h3>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 animate-pulse">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* 1. Admin Entrance Button */}
            <button
              onClick={() => handleQuickLogin('ADMIN', 'admin@school.com', 'admin123')}
              disabled={loadingRole !== null}
              className="flex w-full items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-left transition-all duration-200 hover:bg-rose-500/10 hover:border-rose-500/40 hover:scale-[1.01] disabled:opacity-50 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-450 border border-rose-500/20 group-hover:bg-rose-500/20">
                  <ShieldAlert className="h-5 w-5 text-rose-450" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-white">Administrator Panel</span>
                  <span className="block text-2xs text-rose-400">Manage all accounts and analytics</span>
                </div>
              </div>
              <div>
                {loadingRole === 'ADMIN' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-rose-450" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-rose-500 transition-transform group-hover:translate-x-1" />
                )}
              </div>
            </button>

            {/* 2. Teacher Entrance Button */}
            <button
              onClick={() => handleQuickLogin('TEACHER', 'teacher@school.com', 'teacher123')}
              disabled={loadingRole !== null}
              className="flex w-full items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left transition-all duration-200 hover:bg-amber-500/10 hover:border-amber-500/40 hover:scale-[1.01] disabled:opacity-50 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-450 border border-amber-500/20 group-hover:bg-amber-500/20">
                  <BookOpen className="h-5 w-5 text-amber-455" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-white">Teacher Console</span>
                  <span className="block text-2xs text-amber-400">Input student grades & subjects metrics</span>
                </div>
              </div>
              <div>
                {loadingRole === 'TEACHER' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-amber-455" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-amber-500 transition-transform group-hover:translate-x-1" />
                )}
              </div>
            </button>

            {/* 3. Student Entrance Button */}
            <button
              onClick={() => handleQuickLogin('STUDENT', 'student@school.com', 'student123')}
              disabled={loadingRole !== null}
              className="flex w-full items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left transition-all duration-200 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:scale-[1.01] disabled:opacity-50 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 group-hover:bg-emerald-500/20">
                  <GraduationCap className="h-5 w-5 text-emerald-450" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-white">Student Dashboard</span>
                  <span className="block text-2xs text-emerald-400">View grades, transcripts & GPA projection</span>
                </div>
              </div>
              <div>
                {loadingRole === 'STUDENT' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-450" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-emerald-500 transition-transform group-hover:translate-x-1" />
                )}
              </div>
            </button>
          </div>

          <div className="mt-8 border-t border-slate-800/80 pt-4 text-center text-3xs text-slate-500">
            GradePortal Marks Manager &copy; {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
}
