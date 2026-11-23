// src/components/BottomNav.tsx
import React from 'react';
import { 
  Home, 
  Briefcase, 
  Receipt, 
  CalendarDays, 
  Settings, 
  Plus 
} from 'lucide-react';

export type TabType = 'dashboard' | 'work' | 'receivables' | 'history' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenFAB: () => void;
  pendingReceivablesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  onOpenFAB,
  pendingReceivablesCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'หน้าแรก', icon: Home },
    { id: 'work' as TabType, label: 'การทำงาน', icon: Briefcase },
    // Center placeholder for FAB
    { id: 'fab', label: '', icon: Plus },
    { 
      id: 'receivables' as TabType, 
      label: 'รอรับเงิน', 
      icon: Receipt,
      badge: pendingReceivablesCount > 0 ? pendingReceivablesCount : undefined 
    },
    { id: 'history' as TabType, label: 'ประวัติ', icon: CalendarDays },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 transition-colors pb-safe">
      <div className="max-w-md mx-auto px-2 h-16 flex items-center justify-around relative">
        {navItems.map((item) => {
          if (item.id === 'fab') {
            return (
              <div key="fab-btn" className="relative -top-5 flex flex-col items-center">
                <button
                  type="button"
                  onClick={onOpenFAB}
                  aria-label="บันทึกรายการใหม่"
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/40 active:scale-90 hover:brightness-105 transition-all transform"
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                  บันทึก
                </span>
              </div>
            );
          }

          const isActive = currentTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id as TabType)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <IconComponent className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-2'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
