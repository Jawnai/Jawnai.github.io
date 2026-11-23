// src/components/forms/CustomExpenseFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Tags, Calendar, Check, Plus } from 'lucide-react';
import { db, addSavedCustomCategory, initPreferences } from '../../db';
import { getTodayDateString } from '../../utils/thaiDate';
import type { CustomExpense } from '../../types';

interface CustomExpenseFormModalProps {
  isOpen: boolean;
  initialData?: CustomExpense | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CustomExpenseFormModal: React.FC<CustomExpenseFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [notes, setNotes] = useState('');
  const [savedCategories, setSavedCategories] = useState<string[]>([]);
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setCategory(initialData.category);
        setAmount(String(initialData.amount));
        setDate(initialData.date);
        setNotes(initialData.notes || '');
      } else {
        setTitle('');
        setCategory('');
        setAmount('');
        setDate(getTodayDateString());
        setNotes('');
      }
      setShowNewCatInput(false);
      setNewCatInput('');

      initPreferences().then((p) => {
        setSavedCategories(p.savedCustomCategories || []);
        if (!initialData && p.savedCustomCategories && p.savedCustomCategories.length > 0) {
          setCategory(p.savedCustomCategories[0]);
        }
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddNewCategory = () => {
    if (!newCatInput.trim()) return;
    const cat = newCatInput.trim();
    setCategory(cat);
    if (!savedCategories.includes(cat)) {
      setSavedCategories([cat, ...savedCategories]);
      addSavedCustomCategory(cat);
    }
    setNewCatInput('');
    setShowNewCatInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      alert('กรุณาระบุชื่อรายการ');
      return;
    }
    if (!category.trim()) {
      alert('กรุณาเลือกหรือระบุหมวดหมู่');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    const payload: Omit<CustomExpense, 'id'> = {
      title: title.trim(),
      category: category.trim(),
      amount: parsedAmount,
      date,
      notes: notes.trim(),
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (initialData?.id) {
      await db.customExpenses.update(initialData.id, payload);
    } else {
      await db.customExpenses.add(payload);
    }

    await addSavedCustomCategory(category.trim());
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
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {initialData ? 'แก้ไขค่าใช้จ่ายทั่วไป' : 'บันทึกค่าใช้จ่ายนอกเหนือรายการ'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ค่าใช้จ่ายทั่วไป หรือสร้างหมวดหมู่ใหม่เองได้
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
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ชื่อรายการ *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ค่าเน็ตบ้าน, สบู่ยาสระผม, ค่าซ่อมรถ..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Category selection & addition */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              หมวดหมู่ *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {savedCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-xl transition-all ${
                    category === cat
                      ? 'bg-purple-600 text-white font-medium shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowNewCatInput(!showNewCatInput)}
                className="text-xs px-2 py-1 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>สร้างหมวดใหม่</span>
              </button>
            </div>

            {showNewCatInput && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  placeholder="พิมพ์หมวดหมู่ใหม่..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddNewCategory}
                  className="px-3 py-2 bg-purple-600 text-white text-xs font-semibold rounded-xl"
                >
                  ใช้หมวดนี้
                </button>
              </div>
            )}
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
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                <span>วันที่ *</span>
              </span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              placeholder="บันทึกรายละเอียดเพิ่มเติม..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
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
