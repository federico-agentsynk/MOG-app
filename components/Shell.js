'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/',          label: 'Dashboard', icon: '🏠' },
  { href: '/workouts',  label: 'Workouts',  icon: '💪' },
  { href: '/metrics',   label: 'Metrics',   icon: '📊' },
  { href: '/settings',  label: 'Settings',  icon: '⚙️' },
];

export default function Shell({ children }) {
  const pathname = usePathname();
  return (
    <>
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-2xl mx-auto w-full pb-24">
          {children}
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 z-50 bg-slate-800 border-t border-slate-700">
        <div className="max-w-2xl mx-auto flex">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center py-3 gap-1 select-none ${
                  active
                    ? 'text-violet-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="text-xl leading-none">{icon}</span>
                <span className="text-xs leading-none font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
