// src/components/forms/WorkFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Briefcase, Clock, MapPin, Calendar, Check, Plus } from 'lucide-react';
import { db, addSavedLocation, initPreferences } from '../../db';
import { getTodayDateString, calculateWorkHours } from '../../utils/thaiDate';
import type { WorkLog } from '../../types';

interface WorkFormModalProps {
  isOpen: boolean;
  initialData?: WorkLog | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WorkFormModal: React.FC<WorkFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('17:30');
  const [notes, setNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [customLocInput, setCustomLocInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setLocation(initialData.location);
        setDate(initialData.date);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
        setNotes(initialData.notes || '');
        setPaymentStatus(initialData.paymentStatus || 'pending');
      } else {
        setLocation('');
        setDate(getTodayDateString());
        setStartTime('08:30');
        setEndTime('17:30');
        setNotes('');
        setPaymentStatus('pending');
      }
      setShowLocationInput(false);
      setCustomLocInput('');

      initPreferences().then((p) => {
        setSavedLocations(p.savedLocations || []);
        if (!initialData && p.savedLocations && p.savedLocations.length > 0) {
          setLocation(p.savedLocations[0]);
        }
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const { hours, formatted } = calculateWorkHours(startTime, endTime);

  const handleAddCustomLocation = () => {
    if (!customLocInput.trim()) return;
    const loc = customLocInput.trim();
    setLocation(loc);
    if (!savedLocations.includes(loc)) {
      setSavedLocations([loc, ...savedLocations]);
      addSavedLocation(loc);
    }
    setCustomLocInput('');
    setShowLocationInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert('กรุณาระบุสถานที่ทำงาน');
      return;
    }

    const payload: Omit<WorkLog, 'id'> = {
      location: location.trim(),
      date,
      startTime,
      endTime,
      hoursWorked: hours,
      paymentStatus,
      notes: notes.trim(),
      createdAt: initialData?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    if (initialData?.id) {
      await db.workLogs.update(initialData.id, payload);
    } else {
      await db.workLogs.add(payload);
    }

    await addSavedLocation(location.trim());
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
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {initialData ? 'แก้ไขการทำงาน' : 'บันทึกการทำงาน'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                บันทึกเวลาเข้า-ออกงานและสถานที่
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
          {/* Work Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>สถานที่ทำงาน *</span>
              </span>
            </label>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {savedLocations.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className={`text-xs px-2.5 py-1 rounded-xl transition-all ${
                    location === loc
                      ? 'bg-blue-600 text-white font-medium shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {loc}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowLocationInput(!showLocationInput)}
                className="text-xs px-2 py-1 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>เพิ่มที่ใหม่</span>
              </button>
            </div>

            {showLocationInput ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customLocInput}
                  onChange={(e) => setCustomLocInput(e.target.value)}
                  placeholder="พิมพ์สถานที่ใหม่..."
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomLocation}
                  className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
                >
                  ใช้ที่นี้
                </button>
              </div>
            ) : (
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ระบุสถานที่ทำงาน..."
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>วันที่ *</span>
              </span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Times: Start & End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>เวลาเข้างาน</span>
                </span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span>เวลาออกงาน</span>
                </span>
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Auto calculated hours banner */}
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
            <span className="text-xs font-medium text-blue-800 dark:text-blue-300">
              คำนวณชั่วโมงทำงาน:
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {formatted} ({hours} ชม.)
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">สถานะการรับเงิน</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as 'pending' | 'paid')} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white">
              <option value="pending">ยังไม่ได้รับเงิน</option>
              <option value="paid">ได้รับเงินแล้ว</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              หมายเหตุ (ไม่บังคับ)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="รายละเอียดงาน ความคืบหน้า หรือบันทึกช่วยจำ..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
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
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
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
