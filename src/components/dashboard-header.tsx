'use client';

import { useSession } from 'next-auth/react';
import { Menu, GraduationCap, User } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      {/* Mobile Trigger & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-950 lg:hidden dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
            GradePortal
          </span>
        </div>
        
        <h1 className="hidden text-sm font-bold text-slate-700 dark:text-slate-350 lg:block uppercase tracking-wider">
          SaaS Management Portal
        </h1>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden text-right lg:block">
            <div className="text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Account</div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{session?.user?.email}</div>
          </div>
          
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
            <User className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
