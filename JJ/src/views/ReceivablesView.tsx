// src/views/ReceivablesView.tsx
import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import confetti from 'canvas-confetti';
import { 
  Receipt, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Image as ImageIcon, 
  Edit3, 
  Trash2, 
  Calendar,
  AlertCircle 
} from 'lucide-react';
import { db } from '../db';
import { formatThaiDate, formatThaiCurrency } from '../utils/thaiDate';
import { ConfirmModal } from '../components/ConfirmModal';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import type { Receivable, ReceivableStatus } from '../types';

interface ReceivablesViewProps {
  onOpenReceivableModal: (receivable?: Receivable) => void;
}

export const ReceivablesView: React.FC<ReceivablesViewProps> = ({
  onOpenReceivableModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | ReceivableStatus>('all');
  const [deleteTarget, setDeleteTarget] = useState<Receivable | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const receivables = useLiveQuery(
    () => db.receivables.orderBy('issueDate').reverse().toArray(),
    []
  ) || [];

  // Statistics
  const pendingItems = useMemo(() => receivables.filter((r) => r.status === 'pending'), [receivables]);
  const paidItems = useMemo(() => receivables.filter((r) => r.status === 'paid'), [receivables]);

  const totalPendingAmount = useMemo(
    () => pendingItems.reduce((acc, curr) => acc + (curr.amount || 0), 0),
    [pendingItems]
  );
  const totalPaidAmount = useMemo(
    () => paidItems.reduce((acc, curr) => acc + (curr.amount || 0), 0),
    [paidItems]
  );

  // Filtered list
  const filteredList = useMemo(() => {
    if (statusFilter === 'all') return receivables;
    return receivables.filter((r) => r.status === statusFilter);
  }, [receivables, statusFilter]);

  // Toggle paid status
  const handleToggleStatus = async (item: Receivable) => {
    const newStatus: ReceivableStatus = item.status === 'pending' ? 'paid' : 'pending';
    if (item.id) {
      await db.receivables.update(item.id, {
        status: newStatus,
        updatedAt: Date.now(),
      });

      // Fire celebratory confetti when marked as paid
      if (newStatus === 'paid') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return;
    await db.receivables.delete(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-lg shadow-amber-500/20">
          <div className="flex items-center space-x-1.5 text-amber-100 text-xs font-semibold mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>ยังไม่ได้รับ</span>
          </div>
          <p className="text-xl font-black text-white">
            {formatThaiCurrency(totalPendingAmount)}
          </p>
          <p className="text-[11px] text-amber-100 mt-0.5">
            ค้างรับ {pendingItems.length} รายการ
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-500/20">
          <div className="flex items-center space-x-1.5 text-emerald-100 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ได้รับแล้ว</span>
          </div>
          <p className="text-xl font-black text-white">
            {formatThaiCurrency(totalPaidAmount)}
          </p>
          <p className="text-[11px] text-emerald-100 mt-0.5">
            รวม {paidItems.length} รายการ
          </p>
        </div>
      </div>

      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        {/* Status Filter Pills */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            ทั้งหมด ({receivables.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'pending'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            รอรับ ({pendingItems.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'paid'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            ได้แล้ว ({paidItems.length})
          </button>
        </div>

        <button
          onClick={() => onOpenReceivableModal()}
          className="flex items-center space-x-1.5 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>เพิ่มบิล</span>
        </button>
      </div>

      {/* Receivables List */}
      <section className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              ไม่มีบิลในหมวดนี้
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              กดปุ่ม "เพิ่มบิล" เพื่อสร้างรายการรอรับเงินใหม่
            </p>
          </div>
        ) : (
          filteredList.map((item) => {
            const isPending = item.status === 'pending';

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border transition-all ${
                  isPending
                    ? 'border-amber-200/80 dark:border-amber-900/60'
                    : 'border-slate-100 dark:border-slate-800 opacity-90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1 mr-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPending
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {isPending ? 'ยังไม่ได้รับ' : 'ได้รับแล้ว'}
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>ออกบิล: {formatThaiDate(item.issueDate)}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h4>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-2">
                      <span>ครบกำหนด: {formatThaiDate(item.dueDate)}</span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl mt-2">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Amount and Image preview */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-slate-900 dark:text-white">
                      {formatThaiCurrency(item.amount)}
                    </p>

                    {item.receiptImage && (
                      <button
                        onClick={() =>
                          setPreviewImage({
                            url: item.receiptImage!,
                            title: `ใบเสร็จ - ${item.title}`,
                          })
                        }
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center space-x-1 ml-auto bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-lg hover:bg-blue-100"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>ดูใบเสร็จ</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Actions: Toggle Status button, Edit, Delete */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(item)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center space-x-1.5 active:scale-95 transition-all ${
                      isPending
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isPending ? 'กดเมื่อ "ได้รับเงินแล้ว"' : 'เปลี่ยนเป็น "ยังไม่ได้รับ"'}
                    </span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onOpenReceivableModal(item)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="แก้ไข"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="ยืนยันการลบบิล"
        message={`คุณต้องการลบบิล "${deleteTarget?.title}" จำนวน ${formatThaiCurrency(deleteTarget?.amount)} ใช่หรือไม่?`}
        confirmLabel="ลบบิลนี้"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={previewImage !== null}
        imageUrl={previewImage?.url}
        title={previewImage?.title}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};
