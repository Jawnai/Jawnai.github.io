// src/utils/categories.ts
import type { MealType, WorkExpenseType, RecordCategory } from '../types';

export interface CategoryMeta {
  key: RecordCategory;
  name: string;
  shortName: string;
  description: string;
  color: string; // Tailwind color classes
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconName: string;
}

export const CATEGORIES_CONFIG: Record<RecordCategory, CategoryMeta> = {
  work: {
    key: 'work',
    name: 'การทำงาน',
    shortName: 'งาน',
    description: 'บันทึกเวลาเข้า-ออกงาน และสถานที่ทำงาน',
    color: 'blue',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconName: 'Briefcase',
  },
  work_expense: {
    key: 'work_expense',
    name: 'ค่าเดินทาง/ไปทำงาน',
    shortName: 'เดินทาง',
    description: 'ค่าน้ำมัน, ค่าทางด่วน, ค่ารถ, ค่าจอดรถ',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    iconName: 'Car',
  },
  receivable: {
    key: 'receivable',
    name: 'บิลที่ต้องรับเงิน',
    shortName: 'รอรับเงิน',
    description: 'บิลเบิกบริษัท หรือเงินที่ต้องทวงถาม',
    color: 'amber',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconName: 'Receipt',
  },
  food: {
    key: 'food',
    name: 'ค่าข้าว / อาหาร',
    shortName: 'อาหาร',
    description: 'มื้อเช้า, กลางวัน, เย็น และของว่าง',
    color: 'orange',
    bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
    textColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-800',
    iconName: 'Utensils',
  },
  coffee: {
    key: 'coffee',
    name: 'ค่ากาแฟ / เครื่องดื่ม',
    shortName: 'กาแฟ',
    description: 'กาแฟ ชา เครื่องดื่มประจำวัน',
    color: 'amber',
    bgColor: 'bg-amber-700/10 dark:bg-amber-700/20',
    textColor: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-300 dark:border-amber-900',
    iconName: 'Coffee',
  },
  custom_expense: {
    key: 'custom_expense',
    name: 'ค่าใช้จ่ายทั่วไป',
    shortName: 'อื่นๆ',
    description: 'ค่าใช้จ่ายนอกเหนือรายการตามหมวดที่กำหนดเอง',
    color: 'purple',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconName: 'Tags',
  },
};

export const WORK_EXPENSE_TYPE_LABELS: Record<WorkExpenseType, string> = {
  transit: 'ค่าเดินทาง (รถไฟฟ้า/รถเมล์/แท็กซี่)',
  fuel: 'ค่าน้ำมัน',
  toll: 'ค่าทางด่วน',
  parking: 'ค่าจอดรถ',
  other: 'อื่น ๆ',
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'มื้อเช้า',
  lunch: 'มื้อกลางวัน',
  dinner: 'มื้อเย็น',
  other: 'มื้ออื่น ๆ / ของว่าง',
};
