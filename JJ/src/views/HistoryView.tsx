// src/views/HistoryView.tsx
import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  CalendarDays, 
  List, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  Clock,
  Briefcase,
  Car,
  Receipt,
  Utensils,
  Coffee,
  Tags,
  X
} from 'lucide-react';
import { db } from '../db';
import { formatThaiDate, formatThaiCurrency, getTodayDateString } from '../utils/thaiDate';
import { WORK_EXPENSE_TYPE_LABELS, MEAL_TYPE_LABELS } from '../utils/categories';
import { ConfirmModal } from '../components/ConfirmModal';
import type { 
  RecordCategory, 
  WorkLog, 
  WorkExpense, 
  Receivable, 
  FoodExpense, 
  CoffeeExpense, 
  CustomExpense,
  UnifiedRecordItem
} from '../types';

interface HistoryViewProps {
  onEditItem: (category: RecordCategory, rawItem: any) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onEditItem }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<UnifiedRecordItem | null>(null);

  // Load all tables
  const workLogs = useLiveQuery(() => db.workLogs.toArray(), []) || [];
  const workExpenses = useLiveQuery(() => db.workExpenses.toArray(), []) || [];
  const receivables = useLiveQuery(() => db.receivables.toArray(), []) || [];
  const foodExpenses = useLiveQuery(() => db.foodExpenses.toArray(), []) || [];
  const coffeeExpenses = useLiveQuery(() => db.coffeeExpenses.toArray(), []) || [];
  const customExpenses = useLiveQuery(() => db.customExpenses.toArray(), []) || [];

  // Normalize into UnifiedRecordItem list
  const allRecords: UnifiedRecordItem[] = useMemo(() => {
    const list: UnifiedRecordItem[] = [];

    workLogs.forEach((w) => {
      list.push({
        id: w.id!,
        category: 'work',
        categoryTitle: 'การทำงาน',
        categoryColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        date: w.date,
        title: w.location,
        subtitle: `${w.startTime} - ${w.endTime} (${w.hoursWorked} ชม.)`,
        notes: w.notes,
        raw: w,
      });
    });

    workExpenses.forEach((we) => {
      list.push({
        id: we.id!,
        category: 'work_expense',
        categoryTitle: 'ค่าเดินทาง',
        categoryColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
        date: we.date,
        title: WORK_EXPENSE_TYPE_LABELS[we.type] || we.type,
        amount: we.amount,
        notes: we.notes,
        raw: we,
      });
    });

    receivables.forEach((r) => {
      list.push({
        id: r.id!,
        category: 'receivable',
        categoryTitle: 'รอรับเงิน',
        categoryColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        date: r.issueDate,
        title: r.title,
        amount: r.amount,
        subtitle: `ครบกำหนด: ${formatThaiDate(r.dueDate)}`,
        statusBadge: r.status === 'paid' ? 'ได้รับแล้ว' : 'ยังไม่ได้รับ',
        notes: r.notes,
        raw: r,
      });
    });

    foodExpenses.forEach((f) => {
      list.push({
        id: f.id!,
        category: 'food',
        categoryTitle: 'ค่าข้าว',
        categoryColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
        date: f.date,
        title: MEAL_TYPE_LABELS[f.meal] || f.meal,
        amount: f.amount,
        notes: f.notes,
        raw: f,
      });
    });

    coffeeExpenses.forEach((c) => {
      list.push({
        id: c.id!,
        category: 'coffee',
        categoryTitle: 'ค่ากาแฟ',
        categoryColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        date: c.date,
        title: c.shopOrMenu || 'กาแฟ / เครื่องดื่ม',
        amount: c.amount,
        notes: c.notes,
        raw: c,
      });
    });

    customExpenses.forEach((cu) => {
      list.push({
        id: cu.id!,
        category: 'custom_expense',
        categoryTitle: cu.category,
        categoryColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
        date: cu.date,
        title: cu.title,
        amount: cu.amount,
        notes: cu.notes,
        raw: cu,
      });
    });

    // Default sort by date descending
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [workLogs, workExpenses, receivables, foodExpenses, coffeeExpenses, customExpenses]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return allRecords.filter((item) => {
      // Calendar date click filter
      if (viewMode === 'calendar' && selectedCalendarDay) {
        if (item.date !== selectedCalendarDay) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Date range filter
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSubtitle = item.subtitle?.toLowerCase().includes(q) || false;
        const matchNotes = item.notes?.toLowerCase().includes(q) || false;
        const matchCategory = item.categoryTitle.toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle && !matchNotes && !matchCategory) {
          return false;
        }
      }

      return true;
    });
  }, [
    allRecords,
    viewMode,
    selectedCalendarDay,
    selectedCategory,
    startDate,
    endDate,
    searchQuery,
  ]);

  // Calendar Day Map: counts how many records each date has
  const calendarRecordDates = useMemo(() => {
    const map = new Map<string, { work: boolean; expense: boolean; count: number }>();
    allRecords.forEach((item) => {
      const existing = map.get(item.date) || { work: false, expense: false, count: 0 };
      if (item.category === 'work') existing.work = true;
      if (item.category !== 'work') existing.expense = true;
      existing.count += 1;
      map.set(item.date, existing);
    });
    return map;
  }, [allRecords]);

  // Calendar Month Grid Generation
  const calendarGrid = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Blank slots for previous month days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days of current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateStr,
        hasRecords: calendarRecordDates.get(dateStr),
      });
    }

    return days;
  }, [currentCalendarDate, calendarRecordDates]);

  // Handle month switch
  const prevMonth = () => {
    setCurrentCalendarDate(
      new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1)
    );
  };
  const nextMonth = () => {
    setCurrentCalendarDate(
      new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1)
    );
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { category, id } = deleteTarget;

    switch (category) {
      case 'work':
        await db.workLogs.delete(id);
        break;
      case 'work_expense':
        await db.workExpenses.delete(id);
        break;
      case 'receivable':
        await db.receivables.delete(id);
        break;
      case 'food':
        await db.foodExpenses.delete(id);
        break;
      case 'coffee':
        await db.coffeeExpenses.delete(id);
        break;
      case 'custom_expense':
        await db.customExpenses.delete(id);
        break;
    }
    setDeleteTarget(null);
  };

  const getCategoryIcon = (cat: RecordCategory) => {
    switch (cat) {
      case 'work':
        return Briefcase;
      case 'work_expense':
        return Car;
      case 'receivable':
        return Receipt;
      case 'food':
        return Utensils;
      case 'coffee':
        return Coffee;
      case 'custom_expense':
        return Tags;
    }
  };

  const categoryChips = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'work', label: 'การทำงาน' },
    { key: 'work_expense', label: 'ค่าเดินทาง' },
    { key: 'receivable', label: 'รอรับเงิน' },
    { key: 'food', label: 'ค่าข้าว' },
    { key: 'coffee', label: 'ค่ากาแฟ' },
    { key: 'custom_expense', label: 'ทั่วไป' },
  ];

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header & View Mode Switch */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            ประวัติย้อนหลัง
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ดูและค้นหาข้อมูลที่เคยบันทึกไว้
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedCalendarDay(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>รายการ</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>ปฏิทิน</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาชื่อรายการ, สถานที่, หมายเหตุ..."
          className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categoryChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setSelectedCategory(chip.key)}
            className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-medium ${
              selectedCategory === chip.key
                ? 'bg-brand-600 text-white font-semibold shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {formatThaiDate(currentCalendarDate, { fullMonth: true, showYear: true })}
            </h3>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            <span>อา.</span>
            <span>จ.</span>
            <span>อ.</span>
            <span>พ.</span>
            <span>พฤ.</span>
            <span>ศ.</span>
            <span>ส.</span>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarGrid.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} className="h-10" />;
              }

              const isSelected = selectedCalendarDay === item.dateStr;
              const isToday = item.dateStr === getTodayDateString();

              return (
                <button
                  key={item.dateStr}
                  onClick={() =>
                    setSelectedCalendarDay(
                      selectedCalendarDay === item.dateStr ? null : item.dateStr
                    )
                  }
                  className={`h-10 rounded-xl flex flex-col items-center justify-center relative transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-500/30'
                      : isToday
                      ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-brand-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xs">{item.dayNumber}</span>

                  {/* Indicator dots */}
                  {item.hasRecords && (
                    <div className="flex space-x-0.5 mt-0.5">
                      {item.hasRecords.work && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : 'bg-blue-500'
                          }`}
                        />
                      )}
                      {item.hasRecords.expense && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-amber-300' : 'bg-emerald-500'
                          }`}
                        />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day filter reset pill */}
          {selectedCalendarDay && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                กำลังแสดงเฉพาะวันที่: <span className="font-bold text-brand-600 dark:text-brand-400">{formatThaiDate(selectedCalendarDay)}</span>
              </span>
              <button
                onClick={() => setSelectedCalendarDay(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs underline"
              >
                ดูทุกวันในเดือน
              </button>
            </div>
          )}
        </section>
      )}

      {/* Records Count Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          พบ {filteredRecords.length} รายการ
        </span>
      </div>

      {/* Unified Records List */}
      <section className="space-y-2.5">
        {filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              ไม่พบรายการบันทึก
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น
            </p>
          </div>
        ) : (
          filteredRecords.map((item) => {
            const Icon = getCategoryIcon(item.category);

            return (
              <div
                key={`${item.category}-${item.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 shadow-xs border border-slate-100 dark:border-slate-800 transition-all hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 min-w-0 flex-1 mr-2">
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${item.categoryColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-0.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.categoryColor}`}>
                          {item.categoryTitle}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatThaiDate(item.date)}
                        </span>
                        {item.statusBadge && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            • {item.statusBadge}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>

                      {item.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}

                      {item.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl mt-1.5">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side: Amount and Actions */}
                  <div className="text-right shrink-0">
                    {item.amount !== undefined && (
                      <p className="text-sm font-black text-slate-900 dark:text-white">
                        {formatThaiCurrency(item.amount)}
                      </p>
                    )}

                    <div className="flex items-center space-x-1 mt-2 justify-end">
                      <button
                        onClick={() => onEditItem(item.category, item.raw)}
                        className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="ยืนยันการลบรายการ"
        message={`คุณต้องการลบ "${deleteTarget?.title}" ออกจากระบบใช่หรือไม่?`}
        confirmLabel="ลบรายการ"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
