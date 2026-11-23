// src/views/SettingsView.tsx
import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Smartphone, 
  Share2, 
  PlusSquare, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Sun, 
  Moon, 
  Monitor, 
  Database, 
  MapPin, 
  Tags,
  Info 
} from 'lucide-react';
import { 
  db, 
  exportDatabaseBackup, 
  restoreDatabaseBackup, 
  clearAllData, 
  initPreferences 
} from '../db';
import { exportAllDataToCSV } from '../utils/export';
import { ConfirmModal } from '../components/ConfirmModal';
import type { UserPreferences } from '../types';

interface SettingsViewProps {
  theme: 'light' | 'dark' | 'system';
  onChangeTheme: (theme: 'light' | 'dark' | 'system') => void;
  deferredPrompt: any; // BeforeInstallPromptEvent
  onInstallPWA: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onChangeTheme,
  deferredPrompt,
  onInstallPWA,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already installed/running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsStandalone(Boolean(standalone));

    // Load preferences
    initPreferences().then(setPrefs);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export JSON Backup
  const handleBackupJSON = async () => {
    try {
      const backup = await exportDatabaseBackup();
      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `สมุดบันทึก_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อยแล้ว');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการสำรองข้อมูล: ' + err.message);
    }
  };

  // Restore JSON Backup
  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);
        const result = await restoreDatabaseBackup(json);
        if (result.success) {
          showToast('กู้คืนข้อมูลสำเร็จเรียบร้อย');
          initPreferences().then(setPrefs);
        } else {
          alert(result.message);
        }
      } catch (err) {
        alert('ไฟล์สำรองไม่ถูกต้อง หรือรูปแบบไฟล์เสียหาย');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      await exportAllDataToCSV();
      showToast('ส่งออกไฟล์ Excel/CSV เรียบร้อยแล้ว');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการส่งออก: ' + err.message);
    }
  };

  // Clear all data
  const handleClearAllData = async () => {
    await clearAllData();
    setShowClearConfirm(false);
    showToast('ล้างข้อมูลทั้งหมดในเครื่องเรียบร้อยแล้ว');
  };

  // Delete saved location
  const handleDeleteLocation = async (loc: string) => {
    if (!prefs) return;
    const updated = prefs.savedLocations.filter((l) => l !== loc);
    await db.preferences.update('current', { savedLocations: updated });
    setPrefs({ ...prefs, savedLocations: updated });
  };

  // Delete custom category
  const handleDeleteCategory = async (cat: string) => {
    if (!prefs) return;
    const updated = prefs.savedCustomCategories.filter((c) => c !== cat);
    await db.preferences.update('current', { savedCustomCategories: updated });
    setPrefs({ ...prefs, savedCustomCategories: updated });
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto">
          <div className="bg-emerald-600 text-white rounded-2xl p-3 shadow-xl flex items-center space-x-2 text-xs font-semibold modal-enter">
            <Check className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          การตั้งค่าและระบบ
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          การติดตั้งแอป, การสำรองข้อมูล และธีมแสดงผล
        </p>
      </div>

      {/* 1. PWA INSTALLATION SECTION */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2 mb-3">
          <Smartphone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            ติดตั้งลงหน้าจอมือถือ (PWA)
          </h3>
        </div>

        {isStandalone ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>คุณกำลังใช้งานแอปที่ติดตั้งลงหน้าจอแล้วแบบเต็มจอ</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Android / Desktop Install Button */}
            {deferredPrompt && (
              <button
                onClick={onInstallPWA}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 active:scale-98 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>ติดตั้งแอปลงหน้าจอมือถือ (Android)</span>
              </button>
            )}

            {/* iOS Safari Instructions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-blue-500" />
                <span>วิธีติดตั้งสำหรับ iPhone / iPad (Safari):</span>
              </h4>
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside pl-1">
                <li>เปิดเว็บนี้ด้วย <strong>Safari</strong> บน iPhone</li>
                <li>
                  แตะปุ่ม <strong>แชร์ (Share)</strong> <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-500" /> ที่แถบด้านล่างของหน้าจอ
                </li>
                <li>
                  เลื่อนลงมาแล้วเลือก <strong>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-700 dark:text-slate-300" />
                </li>
                <li>แตะ <strong>"เพิ่ม" (Add)</strong> เพื่อเปิดใช้งานแบบเต็มจอเหมือนแอปจริง</li>
              </ol>
            </div>
          </div>
        )}
      </section>

      {/* 2. THEME SELECTOR */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          ธีมการแสดงผล
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onChangeTheme('light')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              theme === 'light'
                ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-600 font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5 mb-1 text-amber-500" />
            <span className="text-xs">สว่าง</span>
          </button>
          <button
            onClick={() => onChangeTheme('dark')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-400 font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5 mb-1 text-indigo-400" />
            <span className="text-xs">มืด</span>
          </button>
          <button
            onClick={() => onChangeTheme('system')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              theme === 'system'
                ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-600 dark:text-brand-400 font-bold'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Monitor className="w-5 h-5 mb-1 text-slate-500" />
            <span className="text-xs">ตามระบบ</span>
          </button>
        </div>
      </section>

      {/* 3. EXPORT & BACKUP */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            สำรองและส่งออกข้อมูล
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          ข้อมูลทั้งหมดบันทึกอยู่ในเครื่องของคุณ (IndexedDB) ปลอดภัย ใช้งานออฟไลน์ได้ ข้อมูลไม่หายเมื่ออัปเดตแอป
        </p>

        <div className="space-y-2 pt-1">
          {/* Export to Excel / CSV */}
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ส่งออกเป็นไฟล์ Excel / CSV
                </p>
                <p className="text-[11px] text-slate-400">
                  รองรับภาษาไทย ไม่เป็นภาษาต่างดาว
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>

          {/* Backup to JSON */}
          <button
            onClick={handleBackupJSON}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  สำรองข้อมูลทั้งหมด (ดาวน์โหลด JSON)
                </p>
                <p className="text-[11px] text-slate-400">
                  เก็บไฟล์ไว้เพื่อนำไปเปิดในเครื่องอื่นได้
                </p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </button>

          {/* Restore from JSON */}
          <label className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-98 transition-all cursor-pointer">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  นำเข้าไฟล์สำรองข้อมูล (JSON)
                </p>
                <p className="text-[11px] text-slate-400">
                  กู้คืนข้อมูลจากไฟล์สำรองที่เคยบันทึกไว้
                </p>
              </div>
            </div>
            <Upload className="w-4 h-4 text-slate-400" />
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreJSON}
              className="hidden"
            />
          </label>
        </div>
      </section>

      {/* 4. MANAGE SAVED LOCATIONS & CATEGORIES */}
      {prefs && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            จัดการสถานที่และหมวดหมู่ที่จำไว้
          </h3>

          {/* Locations */}
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-1 mb-2">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>สถานที่ทำงานที่บันทึกไว้:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {prefs.savedLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-xl"
                >
                  <span className="truncate max-w-[180px]">{loc}</span>
                  <button
                    onClick={() => handleDeleteLocation(loc)}
                    className="ml-1.5 text-slate-400 hover:text-red-500"
                    title="ลบ"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Custom Categories */}
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-1 mb-2">
              <Tags className="w-3.5 h-3.5 text-purple-500" />
              <span>หมวดหมู่ค่าใช้จ่ายทั่วไป:</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {prefs.savedCustomCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-xl"
                >
                  <span className="truncate max-w-[180px]">{cat}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="ml-1.5 text-slate-400 hover:text-red-500"
                    title="ลบ"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. DANGER ZONE */}
      <section className="bg-red-50/50 dark:bg-red-950/20 rounded-3xl p-5 border border-red-100 dark:border-red-900/50">
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            จัดการข้อมูลขั้นสูง
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          การล้างข้อมูลจะลบรายการการทำงานและค่าใช้จ่ายทั้งหมดออกจากเครื่องนี้อย่างถาวร
        </p>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="py-2.5 px-4 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/50 active:scale-98 transition-all flex items-center space-x-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>ล้างข้อมูลทั้งหมดในเครื่อง</span>
        </button>
      </section>

      {/* App Version Info */}
      <div className="text-center pt-2 text-[11px] text-slate-400">
        <p>สมุดบันทึกของฉัน v1.0.0 (PWA)</p>
        <p className="mt-0.5">ทำงานแบบออฟไลน์ 100% ข้อมูลเป็นส่วนตัวในเครื่อง</p>
      </div>

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="ยืนยันการล้างข้อมูลทั้งหมด"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด? ข้อมูลทั้งหมดจะหายไปและไม่สามารถกู้คืนได้ ยกเว้นคุณจะมีไฟล์สำรอง JSON"
        confirmLabel="ล้างข้อมูลทั้งหมด"
        isDanger={true}
        onConfirm={handleClearAllData}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
