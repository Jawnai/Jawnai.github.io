// src/types/index.ts

export type RecordCategory = 
  | 'work'
  | 'work_expense'
  | 'receivable'
  | 'food'
  | 'coffee'
  | 'custom_expense';

export interface WorkLog {
  id?: number;
  location: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hoursWorked: number;
  paymentStatus?: ReceivableStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type WorkExpenseType = 'transit' | 'fuel' | 'toll' | 'parking' | 'other';

export interface WorkExpense {
  id?: number;
  type: WorkExpenseType;
  typeLabel?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  workLogId?: number | null; // optional link to work_log
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type ReceivableStatus = 'pending' | 'paid';

export interface Receivable {
  id?: number;
  title: string;
  amount: number;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: ReceivableStatus; // 'pending' = ยังไม่ได้รับ, 'paid' = ได้รับแล้ว
  receiptImage?: string; // Base64 data URL
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'other';

export interface FoodExpense {
  id?: number;
  meal: MealType;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CoffeeExpense {
  id?: number;
  shopOrMenu?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CustomExpense {
  id?: number;
  title: string;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserPreferences {
  id: string; // 'current'
  theme: 'light' | 'dark' | 'system';
  savedLocations: string[];
  savedCustomCategories: string[];
}

export interface UnifiedRecordItem {
  id: number;
  category: RecordCategory;
  categoryTitle: string;
  categoryColor: string;
  date: string;
  title: string;
  subtitle?: string;
  amount?: number;
  notes?: string;
  statusBadge?: string;
  raw: WorkLog | WorkExpense | Receivable | FoodExpense | CoffeeExpense | CustomExpense;
}

export interface DatabaseBackup {
  version: number;
  exportedAt: string;
  workLogs: WorkLog[];
  workExpenses: WorkExpense[];
  receivables: Receivable[];
  foodExpenses: FoodExpense[];
  coffeeExpenses: CoffeeExpense[];
  customExpenses: CustomExpense[];
  preferences?: UserPreferences;
}
