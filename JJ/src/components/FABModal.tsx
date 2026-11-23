// src/components/FABModal.tsx
import React from 'react';
import { 
  X, 
  Briefcase, 
  Car, 
  Receipt, 
  Utensils, 
  Coffee, 
  Tags 
} from 'lucide-react';
import type { RecordCategory } from '../types';

interface FABModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: RecordCategory) => void;
}

export const FABModal: React.FC<FABModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  if (!isOpen) return null;

  const options: Array<{
    category: RecordCategory;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }> = [
    {
      category: 'work',
      title: 'การทำงาน',
      subtitle: 'บันทึกเวลาเข้า-ออก และสถานที่',
      icon: Briefcase,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900',
    },
    {
      category: 'work_expense',
      title: 'ค่าใช้จ่ายไปทำงาน',
      subtitle: 'ค่าน้ำมัน, ค่าทางด่วน, ค่ารถ, ค่าจอด',
      icon: Car,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900',
    },
    {
      category: 'receivable',
      title: 'บิลที่ต้องรับเงิน',
      subtitle: 'บิลเบิกบริษัท, เงินรอเก็บจากลูกค้า/เพื่อน',
      icon: Receipt,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900',
    },
    {
      category: 'food',
      title: 'ค่าข้าว / อาหาร',
      subtitle: 'เช้า, กลางวัน, เย็น, ของว่าง',
      icon: Utensils,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/40 border-orange-100 dark:border-orange-900',
    },
    {
      category: 'coffee',
      title: 'ค่ากาแฟ / เครื่องดื่ม',
      subtitle: 'กาแฟ ชา เครื่องดื่มประจำวัน',
      icon: Coffee,
      color: 'text-amber-800 dark:text-amber-300',
      bgColor: 'bg-amber-100/60 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800',
    },
    {
      category: 'custom_expense',
      title: 'ค่าใช้จ่ายทั่วไป',
      subtitle: 'บันทึกตามหมวดหมู่ที่คุณสร้างเอง',
      icon: Tags,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-900',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 modal-enter z-10">
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              เลือกหมวดหมู่ที่ต้องการบันทึก
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              แตะเลือกหมวดเพื่อกรอกข้อมูล
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[68vh] overflow-y-auto pr-0.5">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.category}
                onClick={() => {
                  onSelectCategory(opt.category);
                  onClose();
                }}
                className={`flex items-center p-3 rounded-2xl border text-left active:scale-[0.98] transition-all ${opt.bgColor} hover:shadow-sm`}
              >
                <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm shrink-0 mr-3 ${opt.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                    {opt.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {opt.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
