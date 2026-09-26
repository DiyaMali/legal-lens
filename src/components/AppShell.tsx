'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileSearch, 
  Scale, 
  LayoutDashboard, 
  FileText,
  X 
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/analyze', label: 'Analyze', icon: FileSearch },
    { href: '/compare', label: 'Compare', icon: Scale },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  const isPublicPage = pathname === '/' || pathname === '/login';

  if (isPublicPage) {
    return <main id="main-content" className="min-h-screen w-full">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased">
      {/* Desktop Sidebar (fixed w-64) */}
      <Sidebar />

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          role="presentation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 shadow-2xl animate-in slide-in-from-left duration-200 lg:hidden dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <Link 
                href="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-tight">Legal Lens</div>
                  <div className="text-[10px] text-slate-400 font-normal">Compliance Suite</div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Active Docket Pill */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="text-[10px] font-semibold uppercase tracking-wider">Active Docket</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
              B-782 Arbitral Dispute
            </div>
            <div className="text-xs text-slate-400">Enforceable • Live Sync</div>
          </div>
        </div>
      )}

      {/* Main Content Shell with pl-0 on mobile, lg:pl-64 on desktop */}
      <div className="flex flex-col min-h-screen lg:pl-64">
        <TopHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <div className="flex-1" id="main-content">
          {children}
        </div>
      </div>
    </div>
  );
}
