'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Clock, 
  Activity, 
  Terminal,
  Monitor,
  Globe
} from 'lucide-react';

interface LogUser {
  name: string;
  email: string;
  role: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: Date;
  user: LogUser;
}

interface LoginLog {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: LogUser;
}

interface SecurityAuditProps {
  activityLogs: ActivityLog[];
  loginHistory: LoginLog[];
}

export default function SecurityAuditClient({ activityLogs, loginHistory }: SecurityAuditProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'login'>('activity');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering
  const filteredActivityLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const search = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(search) ||
        log.details.toLowerCase().includes(search) ||
        log.user.name.toLowerCase().includes(search) ||
        log.user.email.toLowerCase().includes(search)
      );
    });
  }, [activityLogs, searchQuery]);

  const filteredLoginLogs = useMemo(() => {
    return loginHistory.filter(log => {
      const search = searchQuery.toLowerCase();
      return (
        log.user.name.toLowerCase().includes(search) ||
        log.user.email.toLowerCase().includes(search) ||
        (log.ipAddress && log.ipAddress.includes(search)) ||
        (log.userAgent && log.userAgent.toLowerCase().includes(search))
      );
    });
  }, [loginHistory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="text-blue-500 h-5 w-5" />
              Security & Audit Console
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time server logs tracing system access controls, data modifications, and user logins.
            </p>
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => { setActiveTab('activity'); setSearchQuery(''); }}
          className={`flex items-center gap-2 border-b-2 py-2.5 px-4 text-sm font-semibold tracking-wide cursor-pointer transition-all duration-150 ${
            activeTab === 'activity'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Activity Audit Trail</span>
        </button>

        <button
          onClick={() => { setActiveTab('login'); setSearchQuery(''); }}
          className={`flex items-center gap-2 border-b-2 py-2.5 px-4 text-sm font-semibold tracking-wide cursor-pointer transition-all duration-150 ${
            activeTab === 'login'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Login History Logs</span>
        </button>
      </div>

      {/* Tables Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
        {activeTab === 'activity' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-650 dark:text-slate-350">
              <thead className="text-xs uppercase text-slate-450 bg-slate-50/50 border-b border-slate-200 dark:bg-slate-950/20 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">Triggered By</th>
                  <th className="py-3 px-4 font-bold">Action</th>
                  <th className="py-3 px-4 font-bold">Operation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredActivityLogs.length > 0 ? (
                  filteredActivityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-950/10">
                      <td className="py-4 px-4 font-mono text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-850 dark:text-white">{log.user.name}</div>
                        <div className="text-2xs text-slate-400 font-mono">{log.user.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-150 px-2 py-0.5 text-2xs font-bold font-mono text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400">
                          <Terminal className="h-3 w-3" />
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono max-w-sm truncate text-slate-500 dark:text-slate-400" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No matching activity logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-650 dark:text-slate-350">
              <thead className="text-xs uppercase text-slate-450 bg-slate-50/50 border-b border-slate-200 dark:bg-slate-950/20 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-bold">Login Time</th>
                  <th className="py-3 px-4 font-bold">User Name</th>
                  <th className="py-3 px-4 font-bold">IP Address</th>
                  <th className="py-3 px-4 font-bold">Browser UserAgent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredLoginLogs.length > 0 ? (
                  filteredLoginLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-950/10">
                      <td className="py-4 px-4 font-mono text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-850 dark:text-white">{log.user.name}</div>
                        <div className="text-2xs text-slate-400 font-mono">{log.user.email}</div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Globe className="h-3.5 w-3.5 text-slate-400" />
                          {log.ipAddress || '127.0.0.1'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-400 max-w-sm truncate" title={log.userAgent || 'Unknown'}>
                        <span className="flex items-center gap-1.5">
                          <Monitor className="h-3.5 w-3.5 text-slate-500" />
                          {log.userAgent || '—'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      No matching login logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
