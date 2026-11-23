// src/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { Moon, Sun, BookOpen, WifiOff } from 'lucide-react';
import { formatThaiDate } from '../utils/thaiDate';

interface NavbarProps {
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, onToggleTheme }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const today = new Date();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors pt-safe">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        {/* App Title & Icon */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              สมุดบันทึกของฉัน
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {formatThaiDate(today, { showDayOfWeek: true })}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1.5">
          {!isOnline && (
            <span className="flex items-center space-x-1 text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span>ออฟไลน์</span>
            </span>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label="เปลี่ยนธีม"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
