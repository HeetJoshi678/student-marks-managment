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
  ShieldAlert
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
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
      { name: 'Subjects List', href: '/dashboard/admin/subjects', icon: BookOpen },
    ],
    TEACHER: [
      { name: 'Teacher Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Marks Management', href: '/dashboard/teacher/marks', icon: Award },
    ],
    STUDENT: [
      { name: 'My Report Card', href: '/dashboard', icon: Award },
    ],
  };

  const currentItems = menuItems[role as keyof typeof menuItems] || menuItems.STUDENT;

  const getRoleBadgeColor = (roleStr: string) => {
    switch (roleStr) {
      case 'ADMIN': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'TEACHER': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          GradePortal
        </span>
      </div>

      {/* User Info Block */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/30">
        <div className="flex flex-col gap-1.5">
          <div className="font-semibold text-sm text-slate-200 truncate">{name}</div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-semibold ${getRoleBadgeColor(role)}`}>
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {currentItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{item.name}</span>
              </div>
              <ChevronRight className={`h-4 w-4 opacity-0 transition-opacity duration-150 group-hover:opacity-100 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`} />
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
