// src/components/forms/WorkExpenseFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Car, Calendar, Check, Link2 } from 'lucide-react';
import { db } from '../../db';
import { getTodayDateString } from '../../utils/thaiDate';
import { WORK_EXPENSE_TYPE_LABELS } from '../../utils/categories';
import type { WorkExpense, WorkExpenseType, WorkLog } from '../../types';

interface WorkExpenseFormModalProps {
  isOpen: boolean;
  initialData?: WorkExpense | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WorkExpenseFormModal: React.FC<WorkExpenseFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [type, setType] = useState<WorkExpenseType>('fuel');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(getTodayDateString());
  const [workLogId, setWorkLogId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [dailyWorkLogs, setDailyWorkLogs] = useState<WorkLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setAmount(String(initialData.amount));
        setDate(initialData.date);
        setWorkLogId(initialData.workLogId ?? null);
        setNotes(initialData.notes || '');
      } else {
        setType('fuel');
        setAmount('');
        setDate(getTodayDateString());
        setWorkLogId(null);
        setNotes('');
      }
    }
  }, [isOpen, initialData]);

  // Load work logs for selected date
  useEffect(() => {
    if (isOpen && date) {
      db.workLogs.where('date').equals(date).toArray().then((logs) => {
        setDailyWorkLogs(logs);
        if (logs.length > 0 && !workLogId && !initialData) {
          setWorkLogId(logs[0].id || null);
        }
      });
    }
  }, [isOpen, date]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    const payload: Omit<WorkExpense, 'id'> = {
      type,
      amount: parsedAmount,
      date,
      workLogId: workLogId || undefined,
      notes: notes.trim(),
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (initialData?.id) {
      await db.workExpenses.update(initialData.id, payload);
    } else {
      await db.workExpenses.add(payload);
    }

    onSuccess?.();
    onClose();
  };

  const expenseTypes: Array<{ key: WorkExpenseType; label: string }> = [
    { key: 'fuel', label: 'ค่าน้ำมัน' },
    { key: 'transit', label: 'ค่าเดินทาง (รถไฟฟ้า/รถเมล์/แท็กซี่)' },
    { key: 'toll', label: 'ค่าทางด่วน' },
    { key: 'parking', label: 'ค่าจอดรถ' },
    { key: 'other', label: 'อื่น ๆ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 modal-enter z-10 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {initialData ? 'แก้ไขค่าเดินทาง' : 'บันทึกค่าใช้จ่ายไปทำงาน'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ค่าน้ำมัน ค่าทางด่วน ค่ารถ ค่าจอด
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ประเภทค่าใช้จ่าย *
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {expenseTypes.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`text-xs p-2 rounded-xl border text-left font-medium transition-all ${
                    type === t.key
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <span>วันที่ *</span>
              </span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Optional Link to Work Log */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center space-x-1">
                <Link2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>ผูกกับรายการ "การทำงาน" ของวันนี้</span>
              </span>
            </label>
            {dailyWorkLogs.length > 0 ? (
              <select
                value={workLogId || ''}
                onChange={(e) => setWorkLogId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- ไม่ผูกกับงาน --</option>
                {dailyWorkLogs.map((log) => (
                  <option key={log.id} value={log.id}>
                    {log.location} ({log.startTime} - {log.endTime})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-850 p-2 rounded-xl">
                ยังไม่มีรายการการทำงานในวันที่เลือก (ผูกอัตโนมัติเมื่อมี)
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              หมายเหตุ (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น เติม ปตท., ทางด่วนอโศก..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>บันทึก</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
