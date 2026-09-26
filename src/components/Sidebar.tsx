'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Folder, 
  Search, 
  Layers, 
  LayoutGrid,
  Lock
} from 'lucide-react';

interface SidebarProps {
  activeMatterCode?: string;
  activeMatterStatus?: string;
}

export function Sidebar({ 
  activeMatterCode = 'B-782 Arbitral Dispute',
  activeMatterStatus = 'Enforceable • Cross-Border'
}: SidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: '/', label: 'Home', icon: Folder },
    { href: '/analyze', label: 'Analyze', icon: Search },
    { href: '/compare', label: 'Compare', icon: Layers },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 select-none flex-col justify-between border-r border-slate-800 bg-[#0B132B] z-40 lg:flex text-slate-300">
      <div className="flex flex-col">
        {/* Brand Header */}
        <Link 
          href="/"
          className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-6 transition-opacity hover:opacity-90 group"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full overflow-hidden border-2 border-blue-400/40 bg-slate-900 shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Image
              src="/images/mascot.png"
              alt="Legal Lens Mascot"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-serif font-bold tracking-tight text-white leading-tight">
              Legal Lens
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              JUDICIAL DOSSIER
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <div className="px-4 py-6">
          <div className="px-3 pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            CASE ARCHIVE
          </div>
          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 font-semibold text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Active Matter Bottom Pill */}
      <div className="p-4">
        <div className="rounded-xl border border-slate-800/80 bg-[#131F3A] p-3.5 transition-colors">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              ACTIVE MATTER
            </span>
            <Lock className="h-3 w-3 text-slate-400" />
          </div>
          <div className="text-sm font-bold text-white">
            {activeMatterCode}
          </div>
          <div className="truncate text-xs text-slate-400 mt-0.5">
            {activeMatterStatus}
          </div>
        </div>
      </div>
    </aside>
  );
}
