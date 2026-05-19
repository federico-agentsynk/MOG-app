'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/',         label: 'Dashboard', icon: '🏠' },
  { href: '/workouts', label: 'Workouts',  icon: '💪' },
  { href: '/metrics',  label: 'Metrics',   icon: '📊' },
  { href: '/settings', label: 'Settings',  icon: '⚙️'  },
];

export default function Shell({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/user/init').catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto pb-24">
        {children}
      </div>
      <nav className="fixed bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 z-50">
        <div className="max-w-2xl mx-auto flex">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 flex flex-col items-center py-3 text-xs gap-1 ${
                  active ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
