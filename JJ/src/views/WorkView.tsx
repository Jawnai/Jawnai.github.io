// src/views/WorkView.tsx
import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  Plus, 
  Car, 
  Edit3, 
  Trash2, 
  Calendar,
  AlertCircle 
} from 'lucide-react';
import { db } from '../db';
import { formatThaiDate, formatThaiCurrency } from '../utils/thaiDate';
import { WORK_EXPENSE_TYPE_LABELS } from '../utils/categories';
import { ConfirmModal } from '../components/ConfirmModal';
import type { WorkLog, WorkExpense } from '../types';

interface WorkViewProps {
  onOpenWorkModal: (work?: WorkLog) => void;
  onOpenWorkExpenseModal: (expense?: WorkExpense) => void;
}

export const WorkView: React.FC<WorkViewProps> = ({
  onOpenWorkModal,
  onOpenWorkExpenseModal,
}) => {
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'work' | 'expense';
    id: number;
    title: string;
  } | null>(null);

  // Load all work logs & work expenses
  const workLogs = useLiveQuery(() => db.workLogs.orderBy('date').reverse().toArray(), []) || [];
  const workExpenses = useLiveQuery(() => db.workExpenses.orderBy('date').reverse().toArray(), []) || [];

  // Summary statistics for current month
  const currentYearMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthWorkLogs = useMemo(
    () => workLogs.filter((w) => w.date.startsWith(currentYearMonth)),
    [workLogs, currentYearMonth]
  );
  const monthWorkExpenses = useMemo(
    () => workExpenses.filter((e) => e.date.startsWith(currentYearMonth)),
    [workExpenses, currentYearMonth]
  );

  const totalMonthHours = useMemo(
    () => monthWorkLogs.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0),
    [monthWorkLogs]
  );

  const totalMonthTransit = useMemo(
    () => monthWorkExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0),
    [monthWorkExpenses]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'work') {
      await db.workLogs.delete(deleteTarget.id);
      // Unlink any expenses that were linked to this workLog
      const linked = await db.workExpenses.where('workLogId').equals(deleteTarget.id).toArray();
      for (const item of linked) {
        if (item.id) await db.workExpenses.update(item.id, { workLogId: null });
      }
    } else {
      await db.workExpenses.delete(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Monthly Stat Card */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/15">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-blue-200" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-100">
              สรุปการทำงานเดือนนี้
            </h3>
          </div>
          <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
            {formatThaiDate(new Date(), { fullMonth: true, showYear: true })}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
            <p className="text-[11px] text-blue-100">วันที่ทำงาน</p>
            <p className="text-lg font-black text-white mt-0.5">
              {monthWorkLogs.length} <span className="text-xs font-normal">วัน</span>
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
            <p className="text-[11px] text-blue-100">ชั่วโมงรวม</p>
            <p className="text-lg font-black text-white mt-0.5">
              {totalMonthHours.toFixed(1)} <span className="text-xs font-normal">ชม.</span>
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
            <p className="text-[11px] text-blue-100">ค่าเดินทางรวม</p>
            <p className="text-sm font-black text-white mt-1.5 truncate">
              {formatThaiCurrency(totalMonthTransit)}
            </p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onOpenWorkModal()}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>ลงเวลาทำงาน</span>
        </button>
        <button
          onClick={() => onOpenWorkExpenseModal()}
          className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>เพิ่มค่าเดินทาง</span>
        </button>
      </div>

      {/* Work Logs List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            ประวัติการทำงานและค่าเดินทาง
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {workLogs.length} รายการ
          </span>
        </div>

        {workLogs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              ยังไม่มีบันทึกการทำงาน
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              กดปุ่ม "ลงเวลาทำงาน" เพื่อบันทึกวันและสถานที่
            </p>
          </div>
        ) : (
          workLogs.map((log) => {
            // Associated transit expenses for this work log
            const linkedExpenses = workExpenses.filter(
              (e) => e.workLogId === log.id || (!e.workLogId && e.date === log.date)
            );

            return (
              <div
                key={log.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-100 dark:border-slate-800 transition-all hover:border-blue-200 dark:hover:border-blue-900"
              >
                {/* Header: Date & Action icons */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatThaiDate(log.date)}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {log.hoursWorked} ชม.
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onOpenWorkModal(log)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: 'work',
                          id: log.id!,
                          title: `การทำงานที่ ${log.location} (${formatThaiDate(log.date)})`,
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Location & Time */}
                <div className="mt-2.5">
                  <div className="flex items-center space-x-1.5 text-sm font-bold text-slate-900 dark:text-white">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">{log.location}</span>
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mt-1 ml-5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {log.startTime} น. - {log.endTime} น.
                    </span>
                  </div>

                  {log.notes && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                      {log.notes}
                    </p>
                  )}
                </div>

                {/* Linked Expenses Section */}
                {linkedExpenses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 mb-2">
                      <Car className="w-3.5 h-3.5 text-emerald-500" />
                      <span>ค่าเดินทางในวันนี้:</span>
                    </p>
                    <div className="space-y-1.5">
                      {linkedExpenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex items-center justify-between text-xs p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="font-medium text-emerald-900 dark:text-emerald-300 truncate">
                              {WORK_EXPENSE_TYPE_LABELS[exp.type] || exp.type}
                            </span>
                            {exp.notes && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                ({exp.notes})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 shrink-0 ml-2">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {formatThaiCurrency(exp.amount)}
                            </span>
                            <button
                              onClick={() => onOpenWorkExpenseModal(exp)}
                              className="text-slate-400 hover:text-emerald-600"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'expense',
                                  id: exp.id!,
                                  title: `ค่าใช้จ่าย ${WORK_EXPENSE_TYPE_LABELS[exp.type]} (${formatThaiCurrency(exp.amount)})`,
                                })
                              }
                              className="text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="ยืนยันการลบรายการ"
        message={`คุณต้องการลบ "${deleteTarget?.title}" ใช่หรือไม่? ข้อมูลที่ลบแล้วจะไม่สามารถกู้คืนได้`}
        confirmLabel="ลบรายการ"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
