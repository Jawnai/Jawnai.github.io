// src/utils/export.ts
import { db } from '../db';
import { formatThaiDate } from './thaiDate';
import { WORK_EXPENSE_TYPE_LABELS, MEAL_TYPE_LABELS } from './categories';

/**
 * Triggers browser file download with UTF-8 BOM encoding for Excel compatibility
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  // UTF-8 BOM header \uFEFF ensures Excel renders Thai characters correctly
  const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes CSV values with double quotes if needed
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Export all records to CSV formatted file
 */
export async function exportAllDataToCSV(): Promise<void> {
  const [
    workLogs,
    workExpenses,
    receivables,
    foodExpenses,
    coffeeExpenses,
    customExpenses
  ] = await Promise.all([
    db.workLogs.toArray(),
    db.workExpenses.toArray(),
    db.receivables.toArray(),
    db.foodExpenses.toArray(),
    db.coffeeExpenses.toArray(),
    db.customExpenses.toArray()
  ]);

  const rows: string[][] = [
    ['หมวดหมู่', 'วันที่', 'วันที่แบบไทย', 'รายการ / สถานที่ / รายละเอียด', 'จำนวนเงิน (บาท)', 'ชั่วโมงทำงาน / มื้ออาหาร / ประเภท', 'สถานะ', 'หมายเหตุ']
  ];

  // 1. Work logs
  workLogs.forEach(w => {
    rows.push([
      'การทำงาน',
      w.date,
      formatThaiDate(w.date),
      w.location,
      '0',
      `${w.startTime} - ${w.endTime} (${w.hoursWorked} ชม.)`,
      '-',
      w.notes || ''
    ]);
  });

  // 2. Work expenses
  workExpenses.forEach(e => {
    rows.push([
      'ค่าใช้จ่ายไปทำงาน',
      e.date,
      formatThaiDate(e.date),
      WORK_EXPENSE_TYPE_LABELS[e.type] || e.type,
      String(e.amount),
      e.type,
      '-',
      e.notes || ''
    ]);
  });

  // 3. Receivables
  receivables.forEach(r => {
    rows.push([
      'บิลที่ต้องรับเงิน',
      r.issueDate,
      formatThaiDate(r.issueDate),
      r.title,
      String(r.amount),
      `ครบกำหนด: ${r.dueDate}`,
      r.status === 'paid' ? 'ได้รับแล้ว' : 'ยังไม่ได้รับ',
      r.notes || ''
    ]);
  });

  // 4. Food expenses
  foodExpenses.forEach(f => {
    rows.push([
      'ค่าข้าว',
      f.date,
      formatThaiDate(f.date),
      MEAL_TYPE_LABELS[f.meal] || f.meal,
      String(f.amount),
      MEAL_TYPE_LABELS[f.meal] || f.meal,
      '-',
      f.notes || ''
    ]);
  });

  // 5. Coffee
  coffeeExpenses.forEach(c => {
    rows.push([
      'ค่ากาแฟ',
      c.date,
      formatThaiDate(c.date),
      c.shopOrMenu || 'กาแฟ / เครื่องดื่ม',
      String(c.amount),
      '-',
      '-',
      c.notes || ''
    ]);
  });

  // 6. Custom expenses
  customExpenses.forEach(cu => {
    rows.push([
      'ค่าใช้จ่ายทั่วไป',
      cu.date,
      formatThaiDate(cu.date),
      cu.title,
      String(cu.amount),
      cu.category,
      '-',
      cu.notes || ''
    ]);
  });

  // Sort rows by date descending (skipping header)
  const header = rows[0];
  const dataRows = rows.slice(1).sort((a, b) => b[1].localeCompare(a[1]));

  const csvContent = [header, ...dataRows]
    .map(row => row.map(escapeCSV).join(','))
    .join('\r\n');

  const todayStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `สมุดบันทึก_${todayStr}.csv`, 'text/csv');
}
