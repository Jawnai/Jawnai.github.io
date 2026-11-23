// src/components/forms/ReceivableFormModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X, Receipt, Calendar, Check, Camera, Trash2, FolderKanban } from 'lucide-react';
import { db } from '../../db';
import { getTodayDateString } from '../../utils/thaiDate';
import type { Receivable, ReceivableStatus } from '../../types';

interface ReceivableFormModalProps {
  isOpen: boolean;
  initialData?: Receivable | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReceivableFormModal: React.FC<ReceivableFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [issueDate, setIssueDate] = useState(getTodayDateString());
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [status, setStatus] = useState<ReceivableStatus>('pending');
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');

  const allReceivables = useLiveQuery(() => db.receivables.toArray(), []) || [];
  const suggestedTitles = useMemo(() => {
    const set = new Set<string>();
    allReceivables.forEach((r) => {
      const t = r.title?.trim();
      if (t) set.add(t);
    });
    return Array.from(set).slice(0, 8);
  }, [allReceivables]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setAmount(String(initialData.amount));
        setIssueDate(initialData.issueDate);
        setDueDate(initialData.dueDate);
        setStatus(initialData.status);
        setReceiptImage(initialData.receiptImage);
        setNotes(initialData.notes || '');
      } else {
        setTitle('');
        setAmount('');
        const today = getTodayDateString();
        setIssueDate(today);
        setDueDate(today);
        setStatus('pending');
        setReceiptImage(undefined);
        setNotes('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Process and resize receipt image client-side to keep IndexedDB snappy
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setReceiptImage(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      alert('กรุณาระบุชื่อรายการหรือคนที่ต้องรับเงิน');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    const payload: Omit<Receivable, 'id'> = {
      title: title.trim(),
      amount: parsedAmount,
      issueDate,
      dueDate,
      status,
      receiptImage,
      notes: notes.trim(),
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (initialData?.id) {
      await db.receivables.update(initialData.id, payload);
    } else {
      await db.receivables.add(payload);
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
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {initialData ? 'แก้ไขบิลรอรับเงิน' : 'บันทึกบิลที่ต้องรับเงิน'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                บิลเบิกบริษัท หรือเงินที่ต้องทวงถาม
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ชื่องาน / หัวข้อ / ลูกค้า / บริษัทที่เบิก <span className="text-red-500">*</span>
              </label>
              {suggestedTitles.length > 0 && (
                <span className="text-[10px] text-slate-400">เลือกจากงานเดิมได้</span>
              )}
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น ออกแบบเว็บไซต์, ถ่ายภาพสินค้า, บ. สมชาย..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            {/* Quick Suggestions */}
            {suggestedTitles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-slate-400 font-medium">หัวข้องานเดิม:</span>
                {suggestedTitles.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTitle(t)}
                    className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all ${
                      title === t
                        ? 'bg-amber-500 text-white border-amber-500 font-semibold shadow-xs'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40'
                    }`}
                  >
                    {t}
                  </button>
                ))}
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
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Dates: Issue & Due */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>วันที่ออกบิล</span>
                </span>
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>วันที่ครบกำหนด</span>
                </span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              สถานะการรับเงิน
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  status === 'pending'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                ยังไม่ได้รับ
              </button>
              <button
                type="button"
                onClick={() => setStatus('paid')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  status === 'paid'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                ได้รับแล้ว
              </button>
            </div>
          </div>

          {/* Attach Receipt Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              แนบรูปใบเสร็จ (ไม่บังคับ)
            </label>
            {receiptImage ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <img
                  src={receiptImage}
                  alt="ใบเสร็จ"
                  className="max-h-44 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setReceiptImage(undefined)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
                  title="ลบรูป"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Camera className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  แตะเพื่อถ่ายรูป หรือเลือกรูปใบเสร็จ
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
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
              placeholder="เลขที่บิล, บัญชีโอน หรือรายละเอียด..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
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
