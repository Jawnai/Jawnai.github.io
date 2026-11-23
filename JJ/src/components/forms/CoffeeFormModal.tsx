// src/components/forms/CoffeeFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Coffee, Calendar, Check } from 'lucide-react';
import { db } from '../../db';
import { getTodayDateString } from '../../utils/thaiDate';
import type { CoffeeExpense } from '../../types';

interface CoffeeFormModalProps {
  isOpen: boolean;
  initialData?: CoffeeExpense | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CoffeeFormModal: React.FC<CoffeeFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [shopOrMenu, setShopOrMenu] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');

  const suggestions = ['อเมริกาโน่เย็น', 'ลาเต้', 'ชาไทย', 'เอสเพรสโซ่', 'Amazon', 'Starbucks'];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setShopOrMenu(initialData.shopOrMenu || '');
        setAmount(String(initialData.amount));
        setDate(initialData.date);
        setNotes(initialData.notes || '');
      } else {
        setShopOrMenu('');
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

    const payload: Omit<CoffeeExpense, 'id'> = {
      shopOrMenu: shopOrMenu.trim() || undefined,
      amount: parsedAmount,
      date,
      notes: notes.trim(),
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (initialData?.id) {
      await db.coffeeExpenses.update(initialData.id, payload);
    } else {
      await db.coffeeExpenses.add(payload);
    }

    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 modal-enter z-10 max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-xl">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {initialData ? 'แก้ไขค่ากาแฟ' : 'บันทึกค่ากาแฟ / เครื่องดื่ม'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                กาแฟ ชา น้ำหวาน แก้วโปรดประจำวัน
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
          {/* Menu / Shop suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ชื่อร้านหรือเมนู (ไม่บังคับ)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setShopOrMenu(item)}
                  className={`text-xs px-2.5 py-1 rounded-xl transition-all ${
                    shopOrMenu === item
                      ? 'bg-amber-700 text-white font-medium shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={shopOrMenu}
              onChange={(e) => setShopOrMenu(e.target.value)}
              placeholder="พิมพ์ชื่อร้านหรือเมนู..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
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
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>วันที่ *</span>
              </span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
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
              placeholder="เช่น หวานน้อย 25%, สั่งกับเพื่อน..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-600"
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold shadow-md shadow-amber-700/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
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
