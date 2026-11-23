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
  AlertCircle,
  FolderKanban,
  ListFilter,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers
} from 'lucide-react';
import { db } from '../db';
import { formatThaiDate, formatThaiCurrency } from '../utils/thaiDate';
import { ConfirmModal } from '../components/ConfirmModal';
import { ImagePreviewModal } from '../components/ImagePreviewModal';
import type { Receivable, ReceivableStatus } from '../types';

interface ReceivablesViewProps {
  onOpenReceivableModal: (receivable?: Receivable) => void;
}

export interface JobTopicGroup {
  topic: string;
  items: Receivable[];
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paidCount: number;
  pendingCount: number;
  status: 'fully_paid' | 'partial' | 'pending';
  latestDate: string;
}

export const ReceivablesView: React.FC<ReceivablesViewProps> = ({
  onOpenReceivableModal,
}) => {
  // View mode: 'grouped' (สรุปแยกตามหัวข้องาน) or 'list' (รายการบิลเดี่ยว)
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Grouped status filter: 'all' | 'fully_paid' | 'partial' | 'pending'
  const [groupStatusFilter, setGroupStatusFilter] = useState<'all' | 'fully_paid' | 'partial' | 'pending'>('all');

  // Flat list status filter: 'all' | ReceivableStatus
  const [listStatusFilter, setListStatusFilter] = useState<'all' | ReceivableStatus>('all');

  // Track expanded topic groups (Set of topic names)
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  // Modal targets
  const [deleteTarget, setDeleteTarget] = useState<Receivable | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const receivables = useLiveQuery(
    () => db.receivables.orderBy('issueDate').reverse().toArray(),
    []
  ) || [];

  // Overall Statistics
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

  // Group receivables by topic / job title
  const jobGroups: JobTopicGroup[] = useMemo(() => {
    const map = new Map<string, Receivable[]>();

    receivables.forEach((item) => {
      const topic = (item.title || 'ไม่ระบุหัวข้อ').trim();
      if (!map.has(topic)) {
        map.set(topic, []);
      }
      map.get(topic)!.push(item);
    });

    const groups: JobTopicGroup[] = [];
    map.forEach((items, topic) => {
      const totalAmount = items.reduce((sum, i) => sum + (i.amount || 0), 0);
      const paidItemsList = items.filter((i) => i.status === 'paid');
      const pendingItemsList = items.filter((i) => i.status === 'pending');
      const paidAmount = paidItemsList.reduce((sum, i) => sum + (i.amount || 0), 0);
      const pendingAmount = pendingItemsList.reduce((sum, i) => sum + (i.amount || 0), 0);

      let status: 'fully_paid' | 'partial' | 'pending' = 'pending';
      if (pendingItemsList.length === 0 && items.length > 0) {
        status = 'fully_paid';
      } else if (paidItemsList.length > 0 && pendingItemsList.length > 0) {
        status = 'partial';
      } else {
        status = 'pending';
      }

      const latestDate = items.reduce(
        (latest, i) => (i.issueDate > latest ? i.issueDate : latest),
        ''
      );

      groups.push({
        topic,
        items,
        totalAmount,
        paidAmount,
        pendingAmount,
        paidCount: paidItemsList.length,
        pendingCount: pendingItemsList.length,
        status,
        latestDate,
      });
    });

    return groups.sort((a, b) => b.latestDate.localeCompare(a.latestDate));
  }, [receivables]);

  // Topic Group Statistics
  const fullyPaidGroups = useMemo(() => jobGroups.filter((g) => g.status === 'fully_paid'), [jobGroups]);
  const partialGroups = useMemo(() => jobGroups.filter((g) => g.status === 'partial'), [jobGroups]);
  const pendingGroups = useMemo(() => jobGroups.filter((g) => g.status === 'pending'), [jobGroups]);

  // Filtered Job Groups
  const filteredGroups = useMemo(() => {
    return jobGroups.filter((group) => {
      // Status filter
      if (groupStatusFilter !== 'all' && group.status !== groupStatusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = group.topic.toLowerCase().includes(query);
        const matchNotes = group.items.some((i) => i.notes?.toLowerCase().includes(query));
        return matchTitle || matchNotes;
      }
      return true;
    });
  }, [jobGroups, groupStatusFilter, searchQuery]);

  // Filtered Flat List
  const filteredFlatList = useMemo(() => {
    return receivables.filter((item) => {
      // Status filter
      if (listStatusFilter !== 'all' && item.status !== listStatusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchNotes = item.notes?.toLowerCase().includes(query);
        return matchTitle || matchNotes;
      }
      return true;
    });
  }, [receivables, listStatusFilter, searchQuery]);

  // Toggle group expansion
  const toggleTopicExpand = (topic: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  };

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
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-4 text-white shadow-lg shadow-emerald-500/15">
          <div className="flex items-center space-x-1.5 text-emerald-100 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ได้รับเงินแล้ว</span>
          </div>
          <p className="text-xl font-black text-white">
            {formatThaiCurrency(totalPaidAmount)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-emerald-100 mt-1">
            <span>ได้ครบ {fullyPaidGroups.length} งาน</span>
            <span className="opacity-80">({paidItems.length} บิล)</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-4 text-white shadow-lg shadow-amber-500/15">
          <div className="flex items-center space-x-1.5 text-amber-100 text-xs font-semibold mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>ยังไม่ได้รับ / รอรับ</span>
          </div>
          <p className="text-xl font-black text-white">
            {formatThaiCurrency(totalPendingAmount)}
          </p>
          <div className="flex items-center justify-between text-[11px] text-amber-100 mt-1">
            <span>ค้าง {pendingGroups.length + partialGroups.length} งาน</span>
            <span className="opacity-80">({pendingItems.length} บิล)</span>
          </div>
        </div>
      </div>

      {/* Main View Mode Switcher (สรุปตามหัวข้องาน vs รายการบิลทั้งหมด) */}
      <div className="bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center text-xs font-semibold">
        <button
          onClick={() => setViewMode('grouped')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            viewMode === 'grouped'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>สรุปตามหัวข้องาน ({jobGroups.length})</span>
        </button>

        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            viewMode === 'list'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>รายการบิลทั้งหมด ({receivables.length})</span>
        </button>
      </div>

      {/* Search Bar & Add Button */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={viewMode === 'grouped' ? 'ค้นหาตามชื่องาน / ลูกค้า...' : 'ค้นหาบิล...'}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => onOpenReceivableModal()}
          className="flex items-center space-x-1.5 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>เพิ่มบิล</span>
        </button>
      </div>

      {/* VIEW 1: GROUPED BY TOPIC / JOB */}
      {viewMode === 'grouped' && (
        <section className="space-y-3">
          {/* Grouped Status Filter Pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-medium overflow-x-auto scrollbar-none">
            <button
              onClick={() => setGroupStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                groupStatusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              ทั้งหมด ({jobGroups.length})
            </button>
            <button
              onClick={() => setGroupStatusFilter('fully_paid')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                groupStatusFilter === 'fully_paid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              🟢 ได้เงินครบแล้ว ({fullyPaidGroups.length})
            </button>
            <button
              onClick={() => setGroupStatusFilter('partial')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                groupStatusFilter === 'partial'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              🟡 ได้บางส่วน ({partialGroups.length})
            </button>
            <button
              onClick={() => setGroupStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                groupStatusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              🟠 ยังไม่ได้ ({pendingGroups.length})
            </button>
          </div>

          {/* Grouped Cards */}
          {filteredGroups.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                <FolderKanban className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                ไม่พบงานในกลุ่มที่เลือก
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ลองเปลี่ยนตัวกรอง หรือกดปุ่ม "เพิ่มบิล" เพื่อสร้างรายการใหม่
              </p>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isExpanded = expandedTopics.has(group.topic);
              const percentPaid = group.totalAmount > 0 
                ? Math.min(100, Math.round((group.paidAmount / group.totalAmount) * 100))
                : 0;

              return (
                <div
                  key={group.topic}
                  className={`bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-xs border transition-all ${
                    group.status === 'fully_paid'
                      ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/20 to-transparent'
                      : group.status === 'partial'
                      ? 'border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-b from-amber-50/20 to-transparent'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Topic Header & Status Badge */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1 mr-3">
                      <div className="flex items-center space-x-2 mb-1.5">
                        {group.status === 'fully_paid' && (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>ได้รับเงินครบแล้ว</span>
                          </span>
                        )}

                        {group.status === 'partial' && (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                            <Clock className="w-3 h-3" />
                            <span>ได้เงินแล้วบางส่วน ({percentPaid}%)</span>
                          </span>
                        )}

                        {group.status === 'pending' && (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                            <AlertCircle className="w-3 h-3" />
                            <span>ยังไม่ได้รับเงิน</span>
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 font-medium">
                          {group.items.length} บิล (ได้แล้ว {group.paidCount}/{group.items.length})
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {group.topic}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        {formatThaiCurrency(group.totalAmount)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        ยอดรวมทั้งงาน
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Amount Breakdown */}
                  <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ได้รับแล้ว: {formatThaiCurrency(group.paidAmount)}
                      </span>
                      {group.pendingAmount > 0 ? (
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          ค้างอีก: {formatThaiCurrency(group.pendingAmount)}
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                          <Sparkles className="w-3 h-3" />
                          <span>ครบ 100%</span>
                        </span>
                      )}
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          group.status === 'fully_paid'
                            ? 'bg-emerald-500'
                            : group.status === 'partial'
                            ? 'bg-amber-500'
                            : 'bg-rose-400'
                        }`}
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Bar: Expand/Collapse & Add bill in this topic */}
                  <div className="mt-3 pt-2 flex items-center justify-between">
                    <button
                      onClick={() => toggleTopicExpand(group.topic)}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <span>ซ่อนรายละเอียดบิล</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>ดูบิลย่อยทั้งหมด ({group.items.length})</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        onOpenReceivableModal({
                          title: group.topic,
                          amount: 0,
                          issueDate: '',
                          dueDate: '',
                          status: 'pending',
                          createdAt: 0,
                          updatedAt: 0,
                        })
                      }
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 py-1 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 flex items-center space-x-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>เพิ่มบิลในงานนี้</span>
                    </button>
                  </div>

                  {/* Expanded Nested Bills */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        รายการบิลในหัวข้อนี้:
                      </p>

                      {group.items.map((item) => {
                        const isPending = item.status === 'pending';

                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-2xl border text-xs transition-all ${
                              isPending
                                ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40'
                                : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1 mr-2">
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
                                  <span className="text-[11px] text-slate-400">
                                    ออกบิล: {formatThaiDate(item.issueDate)}
                                  </span>
                                </div>

                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                  ครบกำหนด: {formatThaiDate(item.dueDate)}
                                </div>

                                {item.notes && (
                                  <p className="mt-1 text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 p-1.5 rounded-lg">
                                    {item.notes}
                                  </p>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                  {formatThaiCurrency(item.amount)}
                                </span>

                                {item.receiptImage && (
                                  <button
                                    onClick={() =>
                                      setPreviewImage({
                                        url: item.receiptImage!,
                                        title: `ใบเสร็จ - ${item.title}`,
                                      })
                                    }
                                    className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center space-x-1 ml-auto bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-lg hover:bg-blue-100"
                                  >
                                    <ImageIcon className="w-3 h-3" />
                                    <span>ใบเสร็จ</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Status Toggle & Edit/Delete */}
                            <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                              <button
                                onClick={() => handleToggleStatus(item)}
                                className={`py-1 px-2.5 rounded-xl text-[11px] font-semibold flex items-center space-x-1 active:scale-95 transition-all ${
                                  isPending
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 hover:bg-amber-200'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>
                                  {isPending ? 'กดเมื่อได้รับเงินแล้ว' : 'เปลี่ยนเป็นยังไม่ได้รับ'}
                                </span>
                              </button>

                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => onOpenReceivableModal(item)}
                                  className="p-1 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-white dark:hover:bg-slate-800"
                                  title="แก้ไข"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(item)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white dark:hover:bg-slate-800"
                                  title="ลบ"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {/* VIEW 2: ALL BILLS LIST (FLAT VIEW) */}
      {viewMode === 'list' && (
        <section className="space-y-3">
          {/* Status Filter Pills */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setListStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                listStatusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              ทั้งหมด ({receivables.length})
            </button>
            <button
              onClick={() => setListStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                listStatusFilter === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              รอรับ ({pendingItems.length})
            </button>
            <button
              onClick={() => setListStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                listStatusFilter === 'paid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              ได้แล้ว ({paidItems.length})
            </button>
          </div>

          {/* Flat List Cards */}
          {filteredFlatList.length === 0 ? (
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
            filteredFlatList.map((item) => {
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
      )}

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
