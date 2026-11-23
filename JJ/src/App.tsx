// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initPreferences } from './db';
import { Navbar } from './components/Navbar';
import { BottomNav, type TabType } from './components/BottomNav';
import { FABModal } from './components/FABModal';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';

// Views
import { DashboardView } from './views/DashboardView';
import { WorkView } from './views/WorkView';
import { ReceivablesView } from './views/ReceivablesView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';

// Forms
import { WorkFormModal } from './components/forms/WorkFormModal';
import { WorkExpenseFormModal } from './components/forms/WorkExpenseFormModal';
import { ReceivableFormModal } from './components/forms/ReceivableFormModal';
import { FoodFormModal } from './components/forms/FoodFormModal';
import { CoffeeFormModal } from './components/forms/CoffeeFormModal';
import { CustomExpenseFormModal } from './components/forms/CustomExpenseFormModal';

import type { 
  RecordCategory, 
  WorkLog, 
  WorkExpense, 
  Receivable, 
  FoodExpense, 
  CoffeeExpense, 
  CustomExpense 
} from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [isFABOpen, setIsFABOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Modal states for adding or editing
  const [workModal, setWorkModal] = useState<{ isOpen: boolean; data?: WorkLog | null }>({ isOpen: false });
  const [workExpenseModal, setWorkExpenseModal] = useState<{ isOpen: boolean; data?: WorkExpense | null }>({ isOpen: false });
  const [receivableModal, setReceivableModal] = useState<{ isOpen: boolean; data?: Receivable | null }>({ isOpen: false });
  const [foodModal, setFoodModal] = useState<{ isOpen: boolean; data?: FoodExpense | null }>({ isOpen: false });
  const [coffeeModal, setCoffeeModal] = useState<{ isOpen: boolean; data?: CoffeeExpense | null }>({ isOpen: false });
  const [customExpenseModal, setCustomExpenseModal] = useState<{ isOpen: boolean; data?: CustomExpense | null }>({ isOpen: false });

  // Count pending receivables for bottom nav badge
  const pendingReceivables = useLiveQuery(
    () => db.receivables.where('status').equals('pending').count(),
    []
  );

  // Initialize theme and PWA beforeinstallprompt listener
  useEffect(() => {
    initPreferences().then((p) => {
      if (p.theme) setTheme(p.theme);
    });

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Apply dark mode class to document root
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (theme === 'dark' || (theme === 'system' && mediaQuery.matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  const handleChangeTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    await db.preferences.update('current', { theme: newTheme });
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    handleChangeTheme(nextTheme);
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Open appropriate modal from FAB category choice
  const handleSelectCategory = (cat: RecordCategory) => {
    switch (cat) {
      case 'work':
        setWorkModal({ isOpen: true, data: null });
        break;
      case 'work_expense':
        setWorkExpenseModal({ isOpen: true, data: null });
        break;
      case 'receivable':
        setReceivableModal({ isOpen: true, data: null });
        break;
      case 'food':
        setFoodModal({ isOpen: true, data: null });
        break;
      case 'coffee':
        setCoffeeModal({ isOpen: true, data: null });
        break;
      case 'custom_expense':
        setCustomExpenseModal({ isOpen: true, data: null });
        break;
    }
  };

  // Edit item from History view
  const handleEditItem = (cat: RecordCategory, rawItem: any) => {
    switch (cat) {
      case 'work':
        setWorkModal({ isOpen: true, data: rawItem });
        break;
      case 'work_expense':
        setWorkExpenseModal({ isOpen: true, data: rawItem });
        break;
      case 'receivable':
        setReceivableModal({ isOpen: true, data: rawItem });
        break;
      case 'food':
        setFoodModal({ isOpen: true, data: rawItem });
        break;
      case 'coffee':
        setCoffeeModal({ isOpen: true, data: rawItem });
        break;
      case 'custom_expense':
        setCustomExpenseModal({ isOpen: true, data: rawItem });
        break;
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar theme={theme} onToggleTheme={handleToggleTheme} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-4 pb-safe">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigateTab={setCurrentTab}
            onOpenFAB={() => setIsFABOpen(true)}
            onSelectCategory={handleSelectCategory}
          />
        )}
        {currentTab === 'work' && (
          <WorkView
            onOpenWorkModal={(work) => setWorkModal({ isOpen: true, data: work || null })}
            onOpenWorkExpenseModal={(exp) =>
              setWorkExpenseModal({ isOpen: true, data: exp || null })
            }
          />
        )}
        {currentTab === 'receivables' && (
          <ReceivablesView
            onOpenReceivableModal={(rec) =>
              setReceivableModal({ isOpen: true, data: rec || null })
            }
          />
        )}
        {currentTab === 'history' && (
          <HistoryView onEditItem={handleEditItem} />
        )}
        {currentTab === 'settings' && (
          <SettingsView
            theme={theme}
            onChangeTheme={handleChangeTheme}
            deferredPrompt={deferredPrompt}
            onInstallPWA={handleInstallPWA}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        onOpenFAB={() => setIsFABOpen(true)}
        pendingReceivablesCount={pendingReceivables}
      />

      {/* Floating Action Button Category Modal */}
      <FABModal
        isOpen={isFABOpen}
        onClose={() => setIsFABOpen(false)}
        onSelectCategory={handleSelectCategory}
      />

      {/* PWA Update notification toast */}
      <PWAUpdatePrompt />

      {/* Record Modals */}
      <WorkFormModal
        isOpen={workModal.isOpen}
        initialData={workModal.data}
        onClose={() => setWorkModal({ isOpen: false, data: null })}
      />
      <WorkExpenseFormModal
        isOpen={workExpenseModal.isOpen}
        initialData={workExpenseModal.data}
        onClose={() => setWorkExpenseModal({ isOpen: false, data: null })}
      />
      <ReceivableFormModal
        isOpen={receivableModal.isOpen}
        initialData={receivableModal.data}
        onClose={() => setReceivableModal({ isOpen: false, data: null })}
      />
      <FoodFormModal
        isOpen={foodModal.isOpen}
        initialData={foodModal.data}
        onClose={() => setFoodModal({ isOpen: false, data: null })}
      />
      <CoffeeFormModal
        isOpen={coffeeModal.isOpen}
        initialData={coffeeModal.data}
        onClose={() => setCoffeeModal({ isOpen: false, data: null })}
      />
      <CustomExpenseFormModal
        isOpen={customExpenseModal.isOpen}
        initialData={customExpenseModal.data}
        onClose={() => setCustomExpenseModal({ isOpen: false, data: null })}
      />
    </div>
  );
};
