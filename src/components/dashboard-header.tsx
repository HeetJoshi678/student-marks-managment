'use client';

import { useSession } from 'next-auth/react';
import { Menu, GraduationCap, User } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function DashboardHeader({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-md">
      {/* Mobile Toggle & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden cursor-pointer"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-indigo-600 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            GradePortal
          </span>
        </div>
        
        <h1 className="hidden text-lg font-semibold text-slate-200 lg:block">
          Dashboard Control Panel
        </h1>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden text-right lg:block">
            <div className="text-xs font-semibold text-slate-400">Logged in as</div>
            <div className="text-sm font-medium text-slate-200">{session?.user?.email}</div>
          </div>
          
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
