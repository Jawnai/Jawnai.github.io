// src/views/DashboardView.tsx
import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Briefcase, 
  Receipt, 
  ArrowRight, 
  Clock, 
  Calendar, 
  TrendingUp,
  Sparkles,
  Plus
} from 'lucide-react';
import { db } from '../db';
import { formatThaiDate, formatThaiCurrency, getTodayDateString } from '../utils/thaiDate';
import { DonutChart, type ChartSegment } from '../components/DonutChart';
import type { TabType } from '../components/BottomNav';
import type { RecordCategory } from '../types';

interface DashboardViewProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenFAB: () => void;
  onSelectCategory: (cat: RecordCategory) => void;
}

type PeriodFilter = 'today' | 'week' | 'month' | 'all';

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenFAB,
  onSelectCategory,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('today');
  const todayStr = getTodayDateString();

  // Reactive Dexie queries
  const workLogs = useLiveQuery(() => db.workLogs.toArray(), []) || [];
  const workExpenses = useLiveQuery(() => db.workExpenses.toArray(), []) || [];
  const receivables = useLiveQuery(() => db.receivables.toArray(), []) || [];
  const foodExpenses = useLiveQuery(() => db.foodExpenses.toArray(), []) || [];
  const coffeeExpenses = useLiveQuery(() => db.coffeeExpenses.toArray(), []) || [];
  const customExpenses = useLiveQuery(() => db.customExpenses.toArray(), []) || [];

  // Today's work summary
  const todayWorkLogs = useMemo(() => {
    return workLogs.filter((w) => w.date === todayStr);
  }, [workLogs, todayStr]);

  const todayWorkHours = useMemo(() => {
    return todayWorkLogs.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0);
  }, [todayWorkLogs]);

  // Outstanding receivables
  const pendingReceivables = useMemo(() => {
    return receivables.filter((r) => r.status === 'pending');
  }, [receivables]);

  const totalPendingAmount = useMemo(() => {
    return pendingReceivables.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [pendingReceivables]);

  // Date filtering logic
  const isDateInPeriod = (dateStr: string, p: PeriodFilter): boolean => {
    if (p === 'all') return true;
    if (p === 'today') return dateStr === todayStr;

    const itemDate = new Date(dateStr);
    const today = new Date(todayStr);

    if (p === 'week') {
      const dayOfWeek = today.getDay(); // 0 is Sunday
      const diffToMonday = (dayOfWeek + 6) % 7;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      return itemDate >= monday && itemDate <= sunday;
    }

    if (p === 'month') {
      return (
        itemDate.getFullYear() === today.getFullYear() &&
        itemDate.getMonth() === today.getMonth()
      );
    }

    return true;
  };

  // Filter expenses by selected period
  const filteredWorkExpenses = useMemo(
    () => workExpenses.filter((e) => isDateInPeriod(e.date, period)),
    [workExpenses, period, todayStr]
  );
  const filteredFoodExpenses = useMemo(
    () => foodExpenses.filter((f) => isDateInPeriod(f.date, period)),
    [foodExpenses, period, todayStr]
  );
  const filteredCoffeeExpenses = useMemo(
    () => coffeeExpenses.filter((c) => isDateInPeriod(c.date, period)),
    [coffeeExpenses, period, todayStr]
  );
  const filteredCustomExpenses = useMemo(
    () => customExpenses.filter((cu) => isDateInPeriod(cu.date, period)),
    [customExpenses, period, todayStr]
  );

  // Today's total spending
  const todayTotalSpent = useMemo(() => {
    const we = workExpenses.filter((e) => e.date === todayStr).reduce((a, c) => a + c.amount, 0);
    const fe = foodExpenses.filter((f) => f.date === todayStr).reduce((a, c) => a + c.amount, 0);
    const ce = coffeeExpenses.filter((c) => c.date === todayStr).reduce((a, c) => a + c.amount, 0);
    const cu = customExpenses.filter((cu) => cu.date === todayStr).reduce((a, c) => a + c.amount, 0);
    return we + fe + ce + cu;
  }, [workExpenses, foodExpenses, coffeeExpenses, customExpenses, todayStr]);

  // Expense Totals for the selected period
  const totalWorkExp = useMemo(() => filteredWorkExpenses.reduce((a, c) => a + c.amount, 0), [filteredWorkExpenses]);
  const totalFoodExp = useMemo(() => filteredFoodExpenses.reduce((a, c) => a + c.amount, 0), [filteredFoodExpenses]);
  const totalCoffeeExp = useMemo(() => filteredCoffeeExpenses.reduce((a, c) => a + c.amount, 0), [filteredCoffeeExpenses]);
  const totalCustomExp = useMemo(() => filteredCustomExpenses.reduce((a, c) => a + c.amount, 0), [filteredCustomExpenses]);

  const grandTotalExpenses = totalWorkExp + totalFoodExp + totalCoffeeExp + totalCustomExp;

  // Chart data
  const chartData: ChartSegment[] = useMemo(() => {
    if (grandTotalExpenses === 0) return [];
    const list: ChartSegment[] = [];

    if (totalWorkExp > 0) {
      list.push({
        name: 'ค่าเดินทาง/งาน',
        value: totalWorkExp,
        color: '#10b981', // emerald-500
        percentage: (totalWorkExp / grandTotalExpenses) * 100,
      });
    }
    if (totalFoodExp > 0) {
      list.push({
        name: 'ค่าข้าว/อาหาร',
        value: totalFoodExp,
        color: '#f97316', // orange-500
        percentage: (totalFoodExp / grandTotalExpenses) * 100,
      });
    }
    if (totalCoffeeExp > 0) {
      list.push({
        name: 'ค่ากาแฟ',
        value: totalCoffeeExp,
        color: '#b45309', // amber-700
        percentage: (totalCoffeeExp / grandTotalExpenses) * 100,
      });
    }
    if (totalCustomExp > 0) {
      list.push({
        name: 'ค่าใช้จ่ายทั่วไป',
        value: totalCustomExp,
        color: '#a855f7', // purple-500
        percentage: (totalCustomExp / grandTotalExpenses) * 100,
      });
    }

    return list;
  }, [grandTotalExpenses, totalWorkExp, totalFoodExp, totalCoffeeExp, totalCustomExp]);

  // Recent 5 activities
  const recentItems = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      categoryTitle: string;
      date: string;
      amount?: number;
      badgeColor: string;
    }> = [];

    workLogs.forEach((w) => {
      list.push({
        id: `w-${w.id}`,
        title: `${w.location} (${w.hoursWorked} ชม.)`,
        categoryTitle: 'การทำงาน',
        date: w.date,
        badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      });
    });

    workExpenses.forEach((we) => {
      list.push({
        id: `we-${we.id}`,
        title: we.notes || 'ค่าเดินทาง/ไปทำงาน',
        categoryTitle: 'เดินทาง',
        date: we.date,
        amount: we.amount,
        badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
      });
    });

    foodExpenses.forEach((f) => {
      list.push({
        id: `f-${f.id}`,
        title: f.notes || 'ค่าอาหาร',
        categoryTitle: 'ค่าข้าว',
        date: f.date,
        amount: f.amount,
        badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
      });
    });

    coffeeExpenses.forEach((c) => {
      list.push({
        id: `c-${c.id}`,
        title: c.shopOrMenu || 'กาแฟ / เครื่องดื่ม',
        categoryTitle: 'ค่ากาแฟ',
        date: c.date,
        amount: c.amount,
        badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
      });
    });

    customExpenses.forEach((cu) => {
      list.push({
        id: `cu-${cu.id}`,
        title: cu.title,
        categoryTitle: cu.category,
        date: cu.date,
        amount: cu.amount,
        badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [workLogs, workExpenses, foodExpenses, coffeeExpenses, customExpenses]);

  return (
    <div className="space-y-4 pb-20">
      {/* 1. Today's Summary Card */}
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 rounded-3xl p-5 text-white shadow-xl shadow-brand-500/15 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-brand-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-200 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>สรุปภาพรวมวันนี้</span>
            </span>
            <span className="text-xs text-brand-100 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-sm">
              {formatThaiDate(todayStr)}
            </span>
          </div>

          {/* Today's Work info */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 mb-3 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-brand-100">การทำงานวันนี้</p>
                {todayWorkLogs.length > 0 ? (
                  <p className="text-sm font-bold text-white">
                    {todayWorkLogs.map((w) => w.location).join(', ')}
                  </p>
                ) : (
                  <p className="text-sm text-brand-200 italic">ยังไม่ได้บันทึกงาน</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-1 text-xs text-brand-100 justify-end">
                <Clock className="w-3.5 h-3.5" />
                <span>ชั่วโมงงาน</span>
              </div>
              <p className="text-sm font-bold text-white">
                {todayWorkHours > 0 ? `${todayWorkHours} ชม.` : '-'}
              </p>
            </div>
          </div>

          {/* Today's Total Spending */}
          <div className="flex items-end justify-between pt-1">
            <div>
              <p className="text-xs text-brand-200">ค่าใช้จ่ายรวมวันนี้</p>
              <h2 className="text-2xl font-black tracking-tight text-white mt-0.5">
                {formatThaiCurrency(todayTotalSpent)}
              </h2>
            </div>
            <button
              onClick={() => onSelectCategory('work')}
              className="py-1.5 px-3 bg-white text-brand-700 hover:bg-brand-50 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ลงเวลา</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Outstanding Receivables Alert Card (if any pending) */}
      <section
        onClick={() => onNavigateTab('receivables')}
        className="bg-amber-500/10 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all hover:bg-amber-500/20"
      >
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                ยอดบิลที่ยังค้างรับ
              </h3>
              {pendingReceivables.length > 0 && (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                  {pendingReceivables.length} บิล
                </span>
              )}
            </div>
            <p className="text-base font-extrabold text-amber-800 dark:text-amber-200 mt-0.5">
              {formatThaiCurrency(totalPendingAmount)}
            </p>
          </div>
        </div>
        <div className="flex items-center text-xs text-amber-700 dark:text-amber-400 font-semibold space-x-1 shrink-0 ml-2">
          <span>ดูรายการ</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </section>

      {/* 3. Expense Statistics & Donut Chart */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              สัดส่วนค่าใช้จ่าย
            </h3>
          </div>

          {/* Period selector pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setPeriod('today')}
              className={`px-2 py-1 rounded-lg transition-all ${
                period === 'today'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              วันนี้
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-2 py-1 rounded-lg transition-all ${
                period === 'week'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              สัปดาห์นี้
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-2 py-1 rounded-lg transition-all ${
                period === 'month'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              เดือนนี้
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-2 py-1 rounded-lg transition-all ${
                period === 'all'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              ทั้งหมด
            </button>
          </div>
        </div>

        {/* Donut Chart */}
        <DonutChart data={chartData} total={grandTotalExpenses} />
      </section>

      {/* 4. Recent Activities */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              รายการบันทึกล่าสุด
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center space-x-1"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
            <p>ยังไม่มีรายการบันทึก</p>
            <button
              onClick={onOpenFAB}
              className="mt-2 text-brand-600 dark:text-brand-400 font-medium underline"
            >
              แตะที่นี่เพื่อเริ่มบันทึกรายการแรก
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigateTab('history')}
                className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 rounded-xl px-1.5 transition-colors"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.categoryTitle}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatThaiDate(item.date)}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {item.title}
                  </p>
                </div>

                {item.amount !== undefined && (
                  <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0">
                    {formatThaiCurrency(item.amount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
