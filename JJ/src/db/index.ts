// src/db/index.ts
import Dexie, { type Table } from 'dexie';
import type { 
  WorkLog, 
  WorkExpense, 
  Receivable, 
  FoodExpense, 
  CoffeeExpense, 
  CustomExpense, 
  UserPreferences,
  DatabaseBackup
} from '../types';

export class NotebookDatabase extends Dexie {
  workLogs!: Table<WorkLog, number>;
  workExpenses!: Table<WorkExpense, number>;
  receivables!: Table<Receivable, number>;
  foodExpenses!: Table<FoodExpense, number>;
  coffeeExpenses!: Table<CoffeeExpense, number>;
  customExpenses!: Table<CustomExpense, number>;
  preferences!: Table<UserPreferences, string>;

  constructor() {
    super('JawnaiNotebookDB');
    this.version(1).stores({
      workLogs: '++id, location, date, createdAt',
      workExpenses: '++id, type, date, workLogId, createdAt',
      receivables: '++id, title, status, issueDate, dueDate, createdAt',
      foodExpenses: '++id, meal, date, createdAt',
      coffeeExpenses: '++id, shopOrMenu, date, createdAt',
      customExpenses: '++id, title, category, date, createdAt',
      preferences: 'id'
    });
  }
}

export const db = new NotebookDatabase();

// Default values & seed data
const DEFAULT_LOCATIONS = [
  'สำนักงานใหญ่ (Office)',
  'ทำงานที่บ้าน (WFH)',
  'พบลูกค้านอกสถานที่',
  'สาขาย่อย',
  'Co-Working Space'
];

const DEFAULT_CATEGORIES = [
  'ของใช้ส่วนตัว',
  'ค่าเน็ต / โทรศัพท์',
  'ของใช้ในบ้าน',
  'ความบันเทิง',
  'สุขภาพ / ยา',
  'ช้อปปิ้ง',
  'อื่น ๆ'
];

export async function initPreferences(): Promise<UserPreferences> {
  const existing = await db.preferences.get('current');
  if (existing) {
    return existing;
  }
  const initial: UserPreferences = {
    id: 'current',
    theme: 'system',
    savedLocations: DEFAULT_LOCATIONS,
    savedCustomCategories: DEFAULT_CATEGORIES,
  };
  await db.preferences.put(initial);
  return initial;
}

export async function addSavedLocation(loc: string): Promise<void> {
  if (!loc || !loc.trim()) return;
  const trimmed = loc.trim();
  const prefs = await initPreferences();
  if (!prefs.savedLocations.includes(trimmed)) {
    const updated = [trimmed, ...prefs.savedLocations];
    await db.preferences.update('current', { savedLocations: updated });
  }
}

export async function addSavedCustomCategory(cat: string): Promise<void> {
  if (!cat || !cat.trim()) return;
  const trimmed = cat.trim();
  const prefs = await initPreferences();
  if (!prefs.savedCustomCategories.includes(trimmed)) {
    const updated = [trimmed, ...prefs.savedCustomCategories];
    await db.preferences.update('current', { savedCustomCategories: updated });
  }
}

// Backup database to JSON
export async function exportDatabaseBackup(): Promise<DatabaseBackup> {
  const [
    workLogs,
    workExpenses,
    receivables,
    foodExpenses,
    coffeeExpenses,
    customExpenses,
    prefs
  ] = await Promise.all([
    db.workLogs.toArray(),
    db.workExpenses.toArray(),
    db.receivables.toArray(),
    db.foodExpenses.toArray(),
    db.coffeeExpenses.toArray(),
    db.customExpenses.toArray(),
    db.preferences.get('current')
  ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    workLogs,
    workExpenses,
    receivables,
    foodExpenses,
    coffeeExpenses,
    customExpenses,
    preferences: prefs
  };
}

// Restore database from JSON
export async function restoreDatabaseBackup(backup: DatabaseBackup): Promise<{ success: boolean; message: string }> {
  try {
    if (!backup || !backup.workLogs || !backup.receivables) {
      return { success: false, message: 'รูปแบบไฟล์สำรองข้อมูลไม่ถูกต้อง' };
    }

    await db.transaction('rw', [
      db.workLogs,
      db.workExpenses,
      db.receivables,
      db.foodExpenses,
      db.coffeeExpenses,
      db.customExpenses,
      db.preferences
    ], async () => {
      await db.workLogs.clear();
      await db.workExpenses.clear();
      await db.receivables.clear();
      await db.foodExpenses.clear();
      await db.coffeeExpenses.clear();
      await db.customExpenses.clear();

      if (backup.workLogs.length) await db.workLogs.bulkAdd(backup.workLogs);
      if (backup.workExpenses.length) await db.workExpenses.bulkAdd(backup.workExpenses);
      if (backup.receivables.length) await db.receivables.bulkAdd(backup.receivables);
      if (backup.foodExpenses.length) await db.foodExpenses.bulkAdd(backup.foodExpenses);
      if (backup.coffeeExpenses.length) await db.coffeeExpenses.bulkAdd(backup.coffeeExpenses);
      if (backup.customExpenses.length) await db.customExpenses.bulkAdd(backup.customExpenses);

      if (backup.preferences) {
        await db.preferences.put(backup.preferences);
      }
    });

    return { success: true, message: 'กู้คืนข้อมูลสำเร็จ เรียบร้อยแล้ว' };
  } catch (err: any) {
    console.error('Failed to restore backup:', err);
    return { success: false, message: `เกิดข้อผิดพลาดในการกู้คืนข้อมูล: ${err?.message || err}` };
  }
}

// Clear all data helper
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [
    db.workLogs,
    db.workExpenses,
    db.receivables,
    db.foodExpenses,
    db.coffeeExpenses,
    db.customExpenses
  ], async () => {
    await db.workLogs.clear();
    await db.workExpenses.clear();
    await db.receivables.clear();
    await db.foodExpenses.clear();
    await db.coffeeExpenses.clear();
    await db.customExpenses.clear();
  });
}
