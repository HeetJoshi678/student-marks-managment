'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  Users, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  Trophy,
  User
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export default function DashboardSidebar({ onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const role = session?.user?.role || 'STUDENT';
  const name = session?.user?.name || 'User';

  const menuItems = {
    ADMIN: [
      { name: 'SaaS Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
      { name: 'Subjects List', href: '/dashboard/admin/subjects', icon: BookOpen },
      { name: 'Security Audit Logs', href: '/dashboard/admin/security', icon: ShieldCheck },
    ],
    TEACHER: [
      { name: 'Grades Console', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    ],
    STUDENT: [
      { name: 'Report Card & GPA', href: '/dashboard', icon: Award },
      { name: 'My Profile Card', href: '/dashboard/student/profile', icon: User },
      { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
    ],
  };

  const currentItems = menuItems[role as keyof typeof menuItems] || menuItems.STUDENT;

  const getRoleBadgeColor = (roleStr: string) => {
    switch (roleStr) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-450 border-rose-500/20';
      case 'TEACHER': return 'bg-blue-500/10 text-blue-450 border-blue-500/20';
      default: return 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20';
    }
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white text-slate-800 shadow-xl dark:border-slate-800 dark:bg-slate-950 dark:text-white">
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:rotate-6">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-white dark:to-slate-400">
          GradePortal
        </span>
      </div>

      {/* User Profile Summary */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30">
        <div className="flex flex-col gap-1.5">
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">{name}</div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-3xs font-semibold tracking-wider font-mono ${getRoleBadgeColor(role)}`}>
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar Items */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {currentItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 group cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white'}`} />
                <span>{item.name}</span>
              </div>
              <ChevronRight className={`h-4 w-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${isActive ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`} />
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-650 dark:text-slate-450 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
