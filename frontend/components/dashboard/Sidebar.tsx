"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Orbit,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  href?: string;
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'resume', label: 'Resume', icon: FileText, href: '/onboarding' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: 4, href: '/dashboard#jobs' },
  { id: 'companies', label: 'Companies', icon: Building2, href: '/companies' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard#analytics' },
];

const bottomNavItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard' },
  { id: 'help', label: 'Help & Support', icon: HelpCircle, href: '/dashboard' },
];

interface User {
  name: string;
  email?: string;
  avatar?: string;
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
  user?: User;
}

export function Sidebar({ activeItem = 'dashboard', onItemClick, user }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (id: string) => {
    onItemClick?.(id);
    setIsOpen(false);
  };

  const SidebarContent = (
    <div className="flex flex-col h-full w-72 bg-zinc-950 border-r border-white/5">
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/" onClick={() => setIsOpen(false)}>
          <motion.div
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-glow">
                <Orbit className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight">
                HireOrbit
                <span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                Career Intelligence
              </span>
            </div>
          </motion.div>
        </Link>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-zinc-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Main Menu
          </p>
          {mainNavItems.map((item, index) => {
            const isActive = activeItem === item.id;
            const isHovered = hoveredItem === item.id;
            const Icon = item.icon;

            return (
              <Link key={item.id} href={item.href || '#'} onClick={() => handleClick(item.id)}>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden group mb-1',
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBg"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent border border-emerald-500/20 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {isHovered && !isActive && <div className="absolute inset-0 bg-white/5 rounded-xl" />}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full shadow-glow-sm"
                    />
                  )}
                  <span className="relative z-10">
                    <Icon className={cn('w-5 h-5 transition-all duration-200', isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300')} />
                  </span>
                  <span className="relative z-10 flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="relative z-10 px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 space-y-1">
          <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Support
          </p>
          {bottomNavItems.map((item, index) => {
            const isActive = activeItem === item.id;
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.href || '#'} onClick={() => handleClick(item.id)}>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group mb-1',
                    isActive ? 'text-white bg-white/5' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                  <span>{item.label}</span>
                </motion.button>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm uppercase">
            {user?.name?.slice(0, 2) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email || "No email"}</p>
          </div>
          <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </motion.div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-zinc-900 text-white rounded-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="hidden lg:block fixed left-0 top-0 z-50 h-screen w-72">
        {SidebarContent}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-screen w-72 lg:hidden"
            >
              {SidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
