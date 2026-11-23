// src/components/forms/FoodFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Utensils, Calendar, Check } from 'lucide-react';
import { db } from '../../db';
import { getTodayDateString } from '../../utils/thaiDate';
import type { FoodExpense, MealType } from '../../types';

interface FoodFormModalProps {
  isOpen: boolean;
  initialData?: FoodExpense | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FoodFormModal: React.FC<FoodFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [meal, setMeal] = useState<MealType>('lunch');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setMeal(initialData.meal);
        setAmount(String(initialData.amount));
        setDate(initialData.date);
        setNotes(initialData.notes || '');
      } else {
        setMeal('lunch');
        setAmount('');
        setDate(getTodayDateString());
        setNotes('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    const payload: Omit<FoodExpense, 'id'> = {
      meal,
      amount: parsedAmount,
      date,
      notes: notes.trim(),
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (initialData?.id) {
      await db.foodExpenses.update(initialData.id, payload);
    } else {
      await db.foodExpenses.add(payload);
    }

    onSuccess?.();
    onClose();
  };

  const meals: Array<{ key: MealType; label: string }> = [
    { key: 'breakfast', label: 'มื้อเช้า' },
    { key: 'lunch', label: 'มื้อกลางวัน' },
    { key: 'dinner', label: 'มื้อเย็น' },
    { key: 'other', label: 'ของว่าง / อื่น ๆ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 modal-enter z-10 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 rounded-xl">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {initialData ? 'แก้ไขค่าอาหาร' : 'บันทึกค่าข้าว / อาหาร'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                มื้อเช้า กลางวัน เย็น หรือของว่าง
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
          {/* Meal selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              มื้ออาหาร *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {meals.map((m) => (
                <button
                  type="button"
                  key={m.key}
                  onClick={() => setMeal(m.key)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    meal === m.key
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {m.label}
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
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span>วันที่ *</span>
              </span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
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
              placeholder="เช่น ข้าวกะเพราไข่ดาว, ก๋วยเตี๋ยวเรือ..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
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
