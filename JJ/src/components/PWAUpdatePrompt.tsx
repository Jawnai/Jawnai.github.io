// src/components/PWAUpdatePrompt.tsx
import React, { useEffect, useState } from 'react';
import { RefreshCw, Download, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAUpdatePrompt: React.FC = () => {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  const {
    needRefresh: [needRefreshSW, setNeedRefreshSW],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefreshSW) {
      setNeedRefresh(true);
    }
  }, [needRefreshSW]);

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex items-center justify-between space-x-3 modal-enter">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2 bg-brand-500/20 text-brand-400 rounded-xl shrink-0">
            {needRefresh ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          </div>
          <div className="text-xs min-w-0">
            <p className="font-semibold text-white truncate">
              {needRefresh ? 'มีเวอร์ชันใหม่พร้อมใช้งาน' : 'พร้อมใช้งานแบบออฟไลน์'}
            </p>
            <p className="text-slate-400 text-[11px] truncate">
              {needRefresh ? 'ข้อมูลของคุณจะไม่สูญหาย' : 'คุณสามารถเปิดใช้งานได้แม้ไม่มีเน็ต'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="py-1.5 px-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              โหลดใหม่
            </button>
          )}
          <button
            onClick={() => {
              setNeedRefresh(false);
              setOfflineReady(false);
              setNeedRefreshSW(false);
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
