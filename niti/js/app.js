/**
 * Kindergarten Score Assessment & Print System (ระบบบันทึกและพิมพ์ผลการประเมินพัฒนาการปฐมวัย)
 * Engineered for exact 1:1 match with forme.pdf (โรงเรียนนิธิปริญญา)
 */

// Initial Default Configuration matching forme.pdf
const DEFAULT_CONFIG = {
  schoolName: "โรงเรียนนิธิปริญญา",
  schoolLogo: "images/niti.png",
  docTitle: "ผลการประเมินพัฒนาการเด็กปฐมวัย",
  className: "ชั้นอนุบาลปีที่ 1/2",
  gradeLevel: "ชั้นอนุบาลปีที่ 1",
  term: "ภาคเรียนที่ 1",
  year: "2569",
  fullScoreArea1: 25,
  fullScoreArea2: 25,
  fullScoreArea3: 25,
  fullScoreArea4: 25,
  teacherName: "นางสาวอริสา ศิริบูรณ์",
  teacherRole: "ครูประจำชั้น",
  academicHeadName: "นางสาวน้ำฝน พุ่มมาลี",
  academicHeadRole: "หัวหน้าฝ่ายวิชาการ",
  principalName: "นางกาญจนา เดชฟุ้ง",
  principalRole: "ผู้อำนวยการโรงเรียนนิธิปริญญา"
};

// Initial Demo Students (Student #1 matches forme.pdf exactly)
const DEMO_STUDENTS = [
  {
    id: "std-1",
    no: 1,
    name: "เด็กหญิงรัชนี -",
    score1: 22,
    score2: 19,
    score3: 17,
    score4: 23,
    remark: ""
  },
  {
    id: "std-2",
    no: 2,
    name: "เด็กชายกิตติศักดิ์ เจริญพร",
    score1: 24,
    score2: 23,
    score3: 22,
    score4: 24,
    remark: "มีพัฒนาการดีเด่นทุกด้าน มีความเป็นผู้นำและช่วยเหลือผู้อื่นเสมอ"
  },
  {
    id: "std-3",
    no: 3,
    name: "เด็กหญิงปวริศา สุขสมบูรณ์",
    score1: 23,
    score2: 21,
    score3: 20,
    score4: 22,
    remark: "ร่าเริงแจ่มใส กล้ามเนื้อมือแข็งแรง วาดภาพระบายสีได้สวยงาม"
  },
  {
    id: "std-4",
    no: 4,
    name: "เด็กชายนภัทร มงคลกุล",
    score1: 20,
    score2: 18,
    score3: 19,
    score4: 21,
    remark: "เข้ากับเพื่อนได้ดี มีระเบียบวินัยในการทำกิจกรรมร่วมกัน"
  },
  {
    id: "std-5",
    no: 5,
    name: "เด็กหญิงกัญญารัตน์ ศรีวิไล",
    score1: 21,
    score2: 20,
    score3: 18,
    score4: 20,
    remark: "มีความตั้งใจในการเรียนรู้ กล้าแสดงออกอย่างเหมาะสม"
  }
];

// Preset comments/remarks for quick tagging
const PRESET_REMARKS = [
  "มีพัฒนาการสมวัย ร่าเริงแจ่มใส มีน้ำใจต่อเพื่อน",
  "กล้ามเนื้อมัดเล็กและมัดใหญ่แข็งแรง ปฏิบัติกิจวัตรประจำวันได้คล่องแคล่ว",
  "มีสมาธิในการทำกิจกรรมดี กล้าคิดกล้าแสดงออก",
  "อารมณ์ดี ยิ้มแย้มแจ่มใส ปรับตัวเข้ากับเพื่อนร่วมชั้นได้ดีมาก",
  "มีความคิดสร้างสรรค์ ช่างซักถามและใฝ่รู้สิ่งใหม่ๆ",
  "ควรส่งเสริมการทรงตัวและการจับดินสอให้กระชับขึ้น",
  "ควรส่งเสริมการรับประทานอาหารให้หลากหลายและฝึกการเล่าเรื่อง",
  "สื่อสารได้ชัดเจน มีทักษะการฟังและการแก้ปัญหาเฉพาะหน้าได้ดี"
];

// State Object
let appState = {
  config: { ...DEFAULT_CONFIG },
  students: [...DEMO_STUDENTS],
  selectedStudentIds: new Set(),
  searchQuery: "",
  activePreviewStudentIndex: 0
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  initEventListeners();
  renderApp();
});

// Storage Functions
function saveToStorage() {
  try {
    localStorage.setItem("niti_eval_config", JSON.stringify(appState.config));
    localStorage.setItem("niti_eval_students", JSON.stringify(appState.students));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }
}

function loadFromStorage() {
  try {
    const savedConfig = localStorage.getItem("niti_eval_config");
    const savedStudents = localStorage.getItem("niti_eval_students");

    if (savedConfig) {
      appState.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
    }
    if (savedStudents) {
      appState.students = JSON.parse(savedStudents);
    }
  } catch (e) {
    console.warn("Storage load error, using defaults", e);
  }
}

// Calculations
function calculateStudentScores(student) {
  const full1 = Number(appState.config.fullScoreArea1) || 25;
  const full2 = Number(appState.config.fullScoreArea2) || 25;
  const full3 = Number(appState.config.fullScoreArea3) || 25;
  const full4 = Number(appState.config.fullScoreArea4) || 25;
  const totalFull = full1 + full2 + full3 + full4;

  const s1 = student.score1 !== null && student.score1 !== "" && !isNaN(student.score1) ? Number(student.score1) : null;
  const s2 = student.score2 !== null && student.score2 !== "" && !isNaN(student.score2) ? Number(student.score2) : null;
  const s3 = student.score3 !== null && student.score3 !== "" && !isNaN(student.score3) ? Number(student.score3) : null;
  const s4 = student.score4 !== null && student.score4 !== "" && !isNaN(student.score4) ? Number(student.score4) : null;

  const pct1 = s1 !== null ? ((s1 / full1) * 100).toFixed(2) : "-";
  const pct2 = s2 !== null ? ((s2 / full2) * 100).toFixed(2) : "-";
  const pct3 = s3 !== null ? ((s3 / full3) * 100).toFixed(2) : "-";
  const pct4 = s4 !== null ? ((s4 / full4) * 100).toFixed(2) : "-";

  const isEvaluated = s1 !== null && s2 !== null && s3 !== null && s4 !== null;
  const totalScore = isEvaluated ? (s1 + s2 + s3 + s4) : null;
  const totalPct = isEvaluated ? ((totalScore / totalFull) * 100).toFixed(2) : "-";

  let level = "-";
  let badgeClass = "badge-empty";

  if (isEvaluated) {
    const pctNum = Number(totalPct);
    if (pctNum >= 80) {
      level = "ดีเยี่ยม";
      badgeClass = "badge-excellent";
    } else if (pctNum >= 70) {
      level = "ดีมาก";
      badgeClass = "badge-very-good";
    } else if (pctNum >= 60) {
      level = "ดี";
      badgeClass = "badge-good";
    } else if (pctNum >= 50) {
      level = "พอใช้";
      badgeClass = "badge-fair";
    } else {
      level = "ควรส่งเสริม";
      badgeClass = "badge-need-help";
    }
  }

  return {
    s1, s2, s3, s4,
    pct1, pct2, pct3, pct4,
    isEvaluated,
    totalScore,
    totalFull,
    totalPct,
    level,
    badgeClass
  };
}

// Render Header & Meta Information
function renderHeaderInfo() {
  const metaClassEl = document.getElementById("header-meta-class");
  const metaTermYearEl = document.getElementById("header-meta-termyear");
  const headerSchoolLogo = document.getElementById("header-school-logo");

  if (metaClassEl) metaClassEl.textContent = appState.config.className;
  if (metaTermYearEl) metaTermYearEl.textContent = `${appState.config.term} / ${appState.config.year}`;
  if (headerSchoolLogo && appState.config.schoolLogo) {
    headerSchoolLogo.src = appState.config.schoolLogo;
  }
}

// Render Dashboard Statistics
function renderStats() {
  const total = appState.students.length;
  let evaluatedCount = 0;
  let totalScoreSum = 0;
  const levelCounts = {
    "ดีเยี่ยม": 0,
    "ดีมาก": 0,
    "ดี": 0,
    "พอใช้": 0,
    "ควรส่งเสริม": 0
  };

  appState.students.forEach(st => {
    const calc = calculateStudentScores(st);
    if (calc.isEvaluated) {
      evaluatedCount++;
      totalScoreSum += calc.totalScore;
      if (levelCounts[calc.level] !== undefined) {
        levelCounts[calc.level]++;
      }
    }
  });

  const avg = evaluatedCount > 0 ? (totalScoreSum / evaluatedCount).toFixed(2) : "0.00";

  document.getElementById("stat-total-students").textContent = total;
  document.getElementById("stat-evaluated-students").textContent = `${evaluatedCount} / ${total}`;
  document.getElementById("stat-avg-score").textContent = avg;
  document.getElementById("stat-excellent-count").textContent = levelCounts["ดีเยี่ยม"];
  document.getElementById("stat-evaluated-pct").textContent = total > 0 ? `${Math.round((evaluatedCount / total) * 100)}%` : "0%";
}

// Render Main Student Table
function renderStudentTable() {
  const tbody = document.getElementById("student-table-body");
  if (!tbody) return;

  const query = appState.searchQuery.trim().toLowerCase();
  const filtered = appState.students.filter(st => {
    if (!query) return true;
    return (
      (st.no && String(st.no).includes(query)) ||
      (st.name && st.name.toLowerCase().includes(query))
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align: center; padding: 3rem 1rem; color: #94a3b8;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📂</div>
          <p style="font-size: 1rem; font-weight: 500;">ยังไม่มีข้อมูลนักเรียน</p>
          <p style="font-size: 0.825rem; margin-top: 0.25rem;">คลิก "นำเข้ารายชื่อ" หรือ "เพิ่มนักเรียน" เพื่อเริ่มต้น</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map((st, index) => {
    const calc = calculateStudentScores(st);
    const isSelected = appState.selectedStudentIds.has(st.id);

    return `
      <tr class="${isSelected ? 'selected' : ''}" data-id="${st.id}">
        <td class="col-center">
          <input type="checkbox" class="student-select-cb" data-id="${st.id}" ${isSelected ? 'checked' : ''}>
        </td>
        <td class="col-center" style="font-weight: 600;">${st.no}</td>
        <td>
          <span style="font-weight: 500; color: #1e293b;">${escapeHtml(st.name)}</span>
        </td>
        <td class="col-center">
          <input type="number" step="0.5" min="0" max="${appState.config.fullScoreArea1}" 
            class="score-input ${st.score1 > appState.config.fullScoreArea1 ? 'invalid' : ''}" 
            data-field="score1" data-id="${st.id}" value="${st.score1 !== null ? st.score1 : ''}" 
            title="พัฒนาการด้านร่างกาย (เต็ม ${appState.config.fullScoreArea1})">
        </td>
        <td class="col-center">
          <input type="number" step="0.5" min="0" max="${appState.config.fullScoreArea2}" 
            class="score-input ${st.score2 > appState.config.fullScoreArea2 ? 'invalid' : ''}" 
            data-field="score2" data-id="${st.id}" value="${st.score2 !== null ? st.score2 : ''}" 
            title="พัฒนาการด้านอารมณ์-จิตใจ (เต็ม ${appState.config.fullScoreArea2})">
        </td>
        <td class="col-center">
          <input type="number" step="0.5" min="0" max="${appState.config.fullScoreArea3}" 
            class="score-input ${st.score3 > appState.config.fullScoreArea3 ? 'invalid' : ''}" 
            data-field="score3" data-id="${st.id}" value="${st.score3 !== null ? st.score3 : ''}" 
            title="พัฒนาการด้านสังคม (เต็ม ${appState.config.fullScoreArea3})">
        </td>
        <td class="col-center">
          <input type="number" step="0.5" min="0" max="${appState.config.fullScoreArea4}" 
            class="score-input ${st.score4 > appState.config.fullScoreArea4 ? 'invalid' : ''}" 
            data-field="score4" data-id="${st.id}" value="${st.score4 !== null ? st.score4 : ''}" 
            title="พัฒนาการด้านสติปัญญา (เต็ม ${appState.config.fullScoreArea4})">
        </td>
        <td class="col-center" style="font-weight: 700; color: #4338ca;">
          ${calc.totalScore !== null ? calc.totalScore : '-'}
        </td>
        <td class="col-center" style="font-weight: 600;">
          ${calc.totalPct !== '-' ? `${calc.totalPct}%` : '-'}
        </td>
        <td class="col-center">
          <span class="badge-level ${calc.badgeClass}">${calc.level}</span>
        </td>
        <td>
          <div class="suggestion-preview" onclick="openRemarkModal('${st.id}')" title="${escapeHtml(st.remark || 'คลิกเพื่อพิมพ์ข้อเสนอแนะ')}">
            ${st.remark ? escapeHtml(st.remark) : '<span style="color:#94a3b8;">+ ใส่ข้อเสนอแนะ</span>'}
          </div>
        </td>
        <td class="col-center" style="white-space: nowrap;">
          <button class="btn btn-sm btn-light" onclick="previewSingleStudent('${st.id}')" title="ดูตัวอย่างเอกสาร">
            👁️
          </button>
          <button class="btn btn-sm btn-primary" onclick="printSingleStudent('${st.id}')" title="พิมพ์เอกสาร">
            🖨️ พิมพ์
          </button>
          <button class="btn btn-sm btn-light" onclick="openEditStudentModal('${st.id}')" title="แก้ไขชื่อ">
            ✏️
          </button>
          <button class="btn btn-sm btn-danger-outline" onclick="deleteStudent('${st.id}')" title="ลบนักเรียน">
            🗑️
          </button>
        </td>
      </tr>
    `;
  }).join("");

  updateSelectedCount();
}

function renderApp() {
  renderHeaderInfo();
  renderStats();
  renderStudentTable();
  updatePrintContainer();
}

function updatePrintContainer() {
  const container = document.getElementById("print-container");
  if (!container) return;
  if (appState.students.length > 0) {
    container.innerHTML = appState.students.map(st => generateStudentPrintHTML(st)).join("");
  } else {
    container.innerHTML = "";
  }
}

window.onafterprint = function() {
  updatePrintContainer();
};

// Event Listeners Initialization
function initEventListeners() {
  // Search input
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      appState.searchQuery = e.target.value;
      renderStudentTable();
    });
  }

  // Select all checkbox
  const selectAllCb = document.getElementById("select-all-cb");
  if (selectAllCb) {
    selectAllCb.addEventListener("change", (e) => {
      if (e.target.checked) {
        appState.students.forEach(st => appState.selectedStudentIds.add(st.id));
      } else {
        appState.selectedStudentIds.clear();
      }
      renderStudentTable();
    });
  }

  // Delegate score input & checkbox events
  const tbody = document.getElementById("student-table-body");
  if (tbody) {
    tbody.addEventListener("input", (e) => {
      if (e.target.classList.contains("score-input")) {
        const id = e.target.getAttribute("data-id");
        const field = e.target.getAttribute("data-field");
        const val = e.target.value;
        const student = appState.students.find(s => s.id === id);
        if (student) {
          student[field] = val === "" ? null : Number(val);
          saveToStorage();
          renderStats();
          // update total and pct in row directly for fast UI
          updateRowScores(id);
        }
      }
    });

    // Keyboard navigation (Enter / ArrowDown to jump to next student's same field)
    tbody.addEventListener("keydown", (e) => {
      if (e.target.classList.contains("score-input") && (e.key === "Enter" || e.key === "ArrowDown")) {
        e.preventDefault();
        const field = e.target.getAttribute("data-field");
        const currentTr = e.target.closest("tr");
        const nextTr = currentTr.nextElementSibling;
        if (nextTr) {
          const nextInput = nextTr.querySelector(`input[data-field="${field}"]`);
          if (nextInput) {
            nextInput.focus();
            nextInput.select();
          }
        }
      } else if (e.target.classList.contains("score-input") && e.key === "ArrowUp") {
        e.preventDefault();
        const field = e.target.getAttribute("data-field");
        const currentTr = e.target.closest("tr");
        const prevTr = currentTr.previousElementSibling;
        if (prevTr) {
          const prevInput = prevTr.querySelector(`input[data-field="${field}"]`);
          if (prevInput) {
            prevInput.focus();
            prevInput.select();
          }
        }
      }
    });

    tbody.addEventListener("change", (e) => {
      if (e.target.classList.contains("student-select-cb")) {
        const id = e.target.getAttribute("data-id");
        if (e.target.checked) {
          appState.selectedStudentIds.add(id);
        } else {
          appState.selectedStudentIds.delete(id);
        }
        updateSelectedCount();
        const row = e.target.closest("tr");
        if (row) {
          row.classList.toggle("selected", e.target.checked);
        }
      }
    });
  }

  // Setup drag and drop for import modal
  setupDropZone();
}

function updateRowScores(studentId) {
  const row = document.querySelector(`tr[data-id="${studentId}"]`);
  if (!row) return;
  const student = appState.students.find(s => s.id === studentId);
  if (!student) return;

  const calc = calculateStudentScores(student);
  const totalCell = row.children[7];
  const pctCell = row.children[8];
  const levelCell = row.children[9];

  if (totalCell) totalCell.textContent = calc.totalScore !== null ? calc.totalScore : '-';
  if (pctCell) pctCell.textContent = calc.totalPct !== '-' ? `${calc.totalPct}%` : '-';
  if (levelCell) {
    levelCell.innerHTML = `<span class="badge-level ${calc.badgeClass}">${calc.level}</span>`;
  }
}

function updateSelectedCount() {
  const countEl = document.getElementById("selected-count-badge");
  const selectAllCb = document.getElementById("select-all-cb");
  const count = appState.selectedStudentIds.size;

  if (countEl) {
    countEl.textContent = count > 0 ? `(เลือก ${count} คน)` : "";
  }

  if (selectAllCb) {
    selectAllCb.checked = count > 0 && count === appState.students.length;
    selectAllCb.indeterminate = count > 0 && count < appState.students.length;
  }
}

// Generate Exact HTML for 1 Student matching forme.pdf
function generateStudentPrintHTML(student) {
  const calc = calculateStudentScores(student);
  const cfg = appState.config;

  // Remark formatting: split into lines or render on dotted lines
  const remarkText = student.remark ? escapeHtml(student.remark) : "";

  return `
    <div class="print-page">
      <div class="a4-sheet">
        <!-- Logo -->
        <div class="print-header">
          <img src="${cfg.schoolLogo || 'images/niti.png'}" class="print-logo" alt="ตราโรงเรียน">
          <div class="print-title-1">${escapeHtml(cfg.docTitle)}</div>
          <div class="print-title-2">${escapeHtml(cfg.gradeLevel)} ${escapeHtml(cfg.term)} ${escapeHtml(cfg.year ? 'ปีการศึกษา ' + cfg.year : '')}</div>
        </div>

        <!-- Dotted Divider Line -->
        <div class="print-dots-divider">
          ....................................................................................................................................................................................
        </div>

        <!-- Student Info Line -->
        <div class="print-student-info">
          <div class="info-name">
            <strong>ชื่อ - สกุล</strong>&nbsp;&nbsp;${escapeHtml(student.name)}
          </div>
          <div class="info-class">
            <strong>${escapeHtml(cfg.className)}</strong>
          </div>
          <div class="info-no">
            <strong>เลขที่</strong>&nbsp;&nbsp;${student.no}
          </div>
        </div>

        <!-- Assessment Table (Exact Dimensions from forme.pdf) -->
        <table class="print-eval-table">
          <thead>
            <tr>
              <th style="width: 42%;">ด้านพัฒนาการ</th>
              <th style="width: 18%;">คะแนนเต็ม</th>
              <th style="width: 18%;">คะแนนที่ได้</th>
              <th style="width: 22%;">ร้อยละ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="col-area">พัฒนาการด้านร่างกาย</td>
              <td class="col-num">${cfg.fullScoreArea1}</td>
              <td class="col-num">${calc.s1 !== null ? calc.s1 : ''}</td>
              <td class="col-num">${calc.pct1 !== '-' ? calc.pct1 : ''}</td>
            </tr>
            <tr>
              <td class="col-area">พัฒนาการด้านอารมณ์-จิตใจ</td>
              <td class="col-num">${cfg.fullScoreArea2}</td>
              <td class="col-num">${calc.s2 !== null ? calc.s2 : ''}</td>
              <td class="col-num">${calc.pct2 !== '-' ? calc.pct2 : ''}</td>
            </tr>
            <tr>
              <td class="col-area">พัฒนาการด้านสังคม</td>
              <td class="col-num">${cfg.fullScoreArea3}</td>
              <td class="col-num">${calc.s3 !== null ? calc.s3 : ''}</td>
              <td class="col-num">${calc.pct3 !== '-' ? calc.pct3 : ''}</td>
            </tr>
            <tr>
              <td class="col-area">พัฒนาการด้านสติปัญญา</td>
              <td class="col-num">${cfg.fullScoreArea4}</td>
              <td class="col-num">${calc.s4 !== null ? calc.s4 : ''}</td>
              <td class="col-num">${calc.pct4 !== '-' ? calc.pct4 : ''}</td>
            </tr>
            <tr class="row-total">
              <td class="col-area" style="text-align: center;">คะแนนรวม</td>
              <td class="col-num">${calc.totalFull}</td>
              <td class="col-num">${calc.totalScore !== null ? calc.totalScore : ''}</td>
              <td class="col-num">${calc.totalPct !== '-' ? calc.totalPct : ''}</td>
            </tr>
          </tbody>
        </table>

        <!-- Comments Section -->
        <div class="print-comments-section">
          <div class="print-comments-title">ข้อเสนอแนะ</div>
          <div class="print-dotted-line-container">
            ${remarkText ? `
              <div class="print-comment-line filled">${remarkText}</div>
              <div class="print-dotted-line">....................................................................................................................................................................................</div>
              <div class="print-dotted-line">....................................................................................................................................................................................</div>
            ` : `
              <div class="print-dotted-line">....................................................................................................................................................................................</div>
              <div class="print-dotted-line">....................................................................................................................................................................................</div>
              <div class="print-dotted-line">....................................................................................................................................................................................</div>
            `}
          </div>
        </div>

        <!-- Bottom Criteria & Signatures Section -->
        <div class="print-bottom-layout">
          <!-- Evaluation Criteria on Left -->
          <div class="print-criteria-box">
            <div class="print-criteria-title">เกณฑ์การประเมิน</div>
            <div class="print-criteria-item">
              <span class="print-criteria-score">คะแนน&nbsp;&nbsp;80-100</span>
              <span class="print-criteria-level">อยู่ในระดับ&nbsp;&nbsp;ดีเยี่ยม</span>
            </div>
            <div class="print-criteria-item">
              <span class="print-criteria-score">คะแนน&nbsp;&nbsp;70-79</span>
              <span class="print-criteria-level">อยู่ในระดับ&nbsp;&nbsp;ดีมาก</span>
            </div>
            <div class="print-criteria-item">
              <span class="print-criteria-score">คะแนน&nbsp;&nbsp;60-69</span>
              <span class="print-criteria-level">อยู่ในระดับ&nbsp;&nbsp;ดี</span>
            </div>
            <div class="print-criteria-item">
              <span class="print-criteria-score">คะแนน&nbsp;&nbsp;50-59</span>
              <span class="print-criteria-level">อยู่ในระดับ&nbsp;&nbsp;พอใช้</span>
            </div>
            <div class="print-criteria-item">
              <span class="print-criteria-score">คะแนน&nbsp;&nbsp;50</span>
              <span class="print-criteria-level">อยู่ในระดับ&nbsp;&nbsp;ควรส่งเสริม</span>
            </div>
          </div>

          <!-- Signatures on Right -->
          <div class="print-signatures-box">
            <div class="signature-group">
              <div class="signature-line">ลงชื่อ........................................${escapeHtml(cfg.teacherRole || 'ครูประจำชั้น')}</div>
              <div class="signature-name">(${escapeHtml(cfg.teacherName)})</div>
            </div>

            <div class="signature-group">
              <div class="signature-line">ลงชื่อ.....................................${escapeHtml(cfg.academicHeadRole || 'หัวหน้าฝ่ายวิชาการ')}</div>
              <div class="signature-name">(${escapeHtml(cfg.academicHeadName)})</div>
            </div>

            <div class="signature-group">
              <div class="signature-line">.................................................................</div>
              <div class="signature-name">(${escapeHtml(cfg.principalName)})</div>
              <div class="signature-role">${escapeHtml(cfg.principalRole || 'ผู้อำนวยการโรงเรียนนิธิปริญญา')}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

// Print Functions
function triggerBrowserPrint() {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      setTimeout(() => {
        window.print();
      }, 50);
    });
  } else {
    setTimeout(() => {
      window.print();
    }, 150);
  }
}

window.printSingleStudent = function(studentId) {
  const student = appState.students.find(s => s.id === studentId);
  if (!student) return;

  const container = document.getElementById("print-container");
  container.innerHTML = generateStudentPrintHTML(student);
  
  triggerBrowserPrint();
};

window.printBatch = function(type) {
  let targets = [];
  if (type === 'selected') {
    if (appState.selectedStudentIds.size === 0) {
      alert("กรุณาเลือกนักเรียนที่ต้องการพิมพ์อย่างน้อย 1 คน (ติ๊กเครื่องหมายถูกที่หน้าแถว)");
      return;
    }
    targets = appState.students.filter(s => appState.selectedStudentIds.has(s.id));
  } else {
    // Print all
    if (appState.students.length === 0) {
      alert("ยังไม่มีรายชื่อนักเรียนสำหรับพิมพ์");
      return;
    }
    targets = appState.students;
  }

  // Sort by 'no'
  targets.sort((a, b) => Number(a.no) - Number(b.no));

  const container = document.getElementById("print-container");
  container.innerHTML = targets.map(st => generateStudentPrintHTML(st)).join("");

  triggerBrowserPrint();
};

// Preview Modal Functions
window.previewSingleStudent = function(studentId) {
  const index = appState.students.findIndex(s => s.id === studentId);
  if (index !== -1) {
    appState.activePreviewStudentIndex = index;
    renderPreviewModal();
    openModal("modal-preview");
  }
};

window.openBatchPreview = function() {
  if (appState.students.length === 0) {
    alert("ยังไม่มีข้อมูลนักเรียนสำหรับดูตัวอย่าง");
    return;
  }
  appState.activePreviewStudentIndex = 0;
  renderPreviewModal();
  openModal("modal-preview");
};

function renderPreviewModal() {
  const student = appState.students[appState.activePreviewStudentIndex];
  if (!student) return;

  const viewport = document.getElementById("preview-sheet-container");
  viewport.innerHTML = generateStudentPrintHTML(student);

  const counterEl = document.getElementById("preview-page-indicator");
  if (counterEl) {
    counterEl.textContent = `คนที่ ${appState.activePreviewStudentIndex + 1} จากทั้งหมด ${appState.students.length} คน (เลขที่ ${student.no}: ${student.name})`;
  }

  const prevBtn = document.getElementById("btn-preview-prev");
  const nextBtn = document.getElementById("btn-preview-next");
  if (prevBtn) prevBtn.disabled = appState.activePreviewStudentIndex === 0;
  if (nextBtn) nextBtn.disabled = appState.activePreviewStudentIndex === appState.students.length - 1;

  applyPreviewZoom();
}

let currentPreviewZoom = 1.0;
window.setPreviewZoom = function(scale) {
  currentPreviewZoom = scale;
  applyPreviewZoom();
};

function applyPreviewZoom() {
  const container = document.getElementById("preview-sheet-container");
  if (!container) return;
  
  if (currentPreviewZoom === 1.0) {
    container.style.transform = "none";
    container.style.transformOrigin = "top center";
    container.style.marginBottom = "0";
  } else {
    container.style.transform = `scale(${currentPreviewZoom})`;
    container.style.transformOrigin = "top center";
    const height = container.offsetHeight || 1120;
    const reducedHeight = height * (1 - currentPreviewZoom);
    container.style.marginBottom = `-${reducedHeight - 20}px`;
  }
}

window.previewPrevStudent = function() {
  if (appState.activePreviewStudentIndex > 0) {
    appState.activePreviewStudentIndex--;
    renderPreviewModal();
  }
};

window.previewNextStudent = function() {
  if (appState.activePreviewStudentIndex < appState.students.length - 1) {
    appState.activePreviewStudentIndex++;
    renderPreviewModal();
  }
};

window.printCurrentPreview = function() {
  const student = appState.students[appState.activePreviewStudentIndex];
  if (student) {
    printSingleStudent(student.id);
  }
};

// Student Add/Edit Modal
window.openAddStudentModal = function() {
  document.getElementById("modal-student-title").textContent = "เพิ่มนักเรียนใหม่";
  document.getElementById("form-student-id").value = "";
  
  // Suggest next 'no'
  let nextNo = 1;
  if (appState.students.length > 0) {
    const maxNo = Math.max(...appState.students.map(s => Number(s.no) || 0));
    nextNo = maxNo + 1;
  }
  document.getElementById("form-student-no").value = nextNo;
  document.getElementById("form-student-name").value = "";
  document.getElementById("form-student-s1").value = "";
  document.getElementById("form-student-s2").value = "";
  document.getElementById("form-student-s3").value = "";
  document.getElementById("form-student-s4").value = "";
  document.getElementById("form-student-remark").value = "";

  openModal("modal-student-edit");
};

window.openEditStudentModal = function(studentId) {
  const student = appState.students.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById("modal-student-title").textContent = "แก้ไขข้อมูลนักเรียน";
  document.getElementById("form-student-id").value = student.id;
  document.getElementById("form-student-no").value = student.no;
  document.getElementById("form-student-name").value = student.name;
  document.getElementById("form-student-s1").value = student.score1 !== null ? student.score1 : "";
  document.getElementById("form-student-s2").value = student.score2 !== null ? student.score2 : "";
  document.getElementById("form-student-s3").value = student.score3 !== null ? student.score3 : "";
  document.getElementById("form-student-s4").value = student.score4 !== null ? student.score4 : "";
  document.getElementById("form-student-remark").value = student.remark || "";

  openModal("modal-student-edit");
};

window.saveStudentForm = function(e) {
  if (e) e.preventDefault();

  const id = document.getElementById("form-student-id").value;
  const no = Number(document.getElementById("form-student-no").value) || 1;
  const name = document.getElementById("form-student-name").value.trim();
  const s1Val = document.getElementById("form-student-s1").value;
  const s2Val = document.getElementById("form-student-s2").value;
  const s3Val = document.getElementById("form-student-s3").value;
  const s4Val = document.getElementById("form-student-s4").value;
  const remark = document.getElementById("form-student-remark").value.trim();

  if (!name) {
    alert("กรุณากรอกชื่อ-นามสกุลนักเรียน");
    return;
  }

  const s1 = s1Val !== "" ? Number(s1Val) : null;
  const s2 = s2Val !== "" ? Number(s2Val) : null;
  const s3 = s3Val !== "" ? Number(s3Val) : null;
  const s4 = s4Val !== "" ? Number(s4Val) : null;

  if (id) {
    // Edit existing
    const student = appState.students.find(s => s.id === id);
    if (student) {
      student.no = no;
      student.name = name;
      student.score1 = s1;
      student.score2 = s2;
      student.score3 = s3;
      student.score4 = s4;
      student.remark = remark;
    }
  } else {
    // Add new
    const newStudent = {
      id: "std-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      no,
      name,
      score1: s1,
      score2: s2,
      score3: s3,
      score4: s4,
      remark
    };
    appState.students.push(newStudent);
  }

  // Sort by 'no'
  appState.students.sort((a, b) => Number(a.no) - Number(b.no));

  saveToStorage();
  renderApp();
  closeModal("modal-student-edit");
};

window.deleteStudent = function(studentId) {
  const student = appState.students.find(s => s.id === studentId);
  if (!student) return;

  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${student.name}" (เลขที่ ${student.no})?`)) {
    appState.students = appState.students.filter(s => s.id !== studentId);
    appState.selectedStudentIds.delete(studentId);
    saveToStorage();
    renderApp();
  }
};

window.clearAllStudents = function() {
  if (confirm("คำเตือน: คุณต้องการล้างรายชื่อนักเรียนทั้งหมดใช่หรือไม่? ข้อมูลคะแนนจะหายไปทั้งหมด")) {
    appState.students = [];
    appState.selectedStudentIds.clear();
    saveToStorage();
    renderApp();
  }
};

window.restoreDemoData = function() {
  if (confirm("ต้องการโหลดข้อมูลตัวอย่างกลับคืนมาใช่หรือไม่?")) {
    appState.config = { ...DEFAULT_CONFIG };
    appState.students = [...DEMO_STUDENTS];
    appState.selectedStudentIds.clear();
    saveToStorage();
    renderApp();
  }
};

// Remark Modal with Presets
let activeRemarkStudentId = null;
window.openRemarkModal = function(studentId) {
  activeRemarkStudentId = studentId;
  const student = appState.students.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById("remark-student-name").textContent = `เลขที่ ${student.no}: ${student.name}`;
  document.getElementById("remark-input-text").value = student.remark || "";

  // Render Preset Tags
  const container = document.getElementById("preset-remarks-container");
  container.innerHTML = PRESET_REMARKS.map(text => `
    <button type="button" class="remark-tag" onclick="insertRemarkText('${escapeHtml(text)}')">
      + ${escapeHtml(text)}
    </button>
  `).join("");

  openModal("modal-remark");
};

window.insertRemarkText = function(text) {
  const input = document.getElementById("remark-input-text");
  if (input.value.trim()) {
    input.value += " " + text;
  } else {
    input.value = text;
  }
  input.focus();
};

window.saveRemark = function() {
  if (!activeRemarkStudentId) return;
  const text = document.getElementById("remark-input-text").value.trim();
  const student = appState.students.find(s => s.id === activeRemarkStudentId);
  if (student) {
    student.remark = text;
    saveToStorage();
    renderStudentTable();
  }
  closeModal("modal-remark");
};

// Settings Modal
window.openSettingsModal = function() {
  const cfg = appState.config;
  document.getElementById("cfg-school-name").value = cfg.schoolName || "";
  document.getElementById("cfg-doc-title").value = cfg.docTitle || "";
  document.getElementById("cfg-class-name").value = cfg.className || "";
  document.getElementById("cfg-grade-level").value = cfg.gradeLevel || "";
  document.getElementById("cfg-term").value = cfg.term || "";
  document.getElementById("cfg-year").value = cfg.year || "";
  document.getElementById("cfg-teacher-name").value = cfg.teacherName || "";
  document.getElementById("cfg-teacher-role").value = cfg.teacherRole || "";
  document.getElementById("cfg-academic-head-name").value = cfg.academicHeadName || "";
  document.getElementById("cfg-academic-head-role").value = cfg.academicHeadRole || "";
  document.getElementById("cfg-principal-name").value = cfg.principalName || "";
  document.getElementById("cfg-principal-role").value = cfg.principalRole || "";
  document.getElementById("cfg-full-s1").value = cfg.fullScoreArea1 || 25;
  document.getElementById("cfg-full-s2").value = cfg.fullScoreArea2 || 25;
  document.getElementById("cfg-full-s3").value = cfg.fullScoreArea3 || 25;
  document.getElementById("cfg-full-s4").value = cfg.fullScoreArea4 || 25;

  openModal("modal-settings");
};

window.saveSettings = function(e) {
  if (e) e.preventDefault();

  appState.config.schoolName = document.getElementById("cfg-school-name").value.trim();
  appState.config.docTitle = document.getElementById("cfg-doc-title").value.trim();
  appState.config.className = document.getElementById("cfg-class-name").value.trim();
  appState.config.gradeLevel = document.getElementById("cfg-grade-level").value.trim();
  appState.config.term = document.getElementById("cfg-term").value.trim();
  appState.config.year = document.getElementById("cfg-year").value.trim();
  appState.config.teacherName = document.getElementById("cfg-teacher-name").value.trim();
  appState.config.teacherRole = document.getElementById("cfg-teacher-role").value.trim();
  appState.config.academicHeadName = document.getElementById("cfg-academic-head-name").value.trim();
  appState.config.academicHeadRole = document.getElementById("cfg-academic-head-role").value.trim();
  appState.config.principalName = document.getElementById("cfg-principal-name").value.trim();
  appState.config.principalRole = document.getElementById("cfg-principal-role").value.trim();

  appState.config.fullScoreArea1 = Number(document.getElementById("cfg-full-s1").value) || 25;
  appState.config.fullScoreArea2 = Number(document.getElementById("cfg-full-s2").value) || 25;
  appState.config.fullScoreArea3 = Number(document.getElementById("cfg-full-s3").value) || 25;
  appState.config.fullScoreArea4 = Number(document.getElementById("cfg-full-s4").value) || 25;

  saveToStorage();
  renderApp();
  closeModal("modal-settings");
};

// Logo Upload Handler
window.handleLogoUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    appState.config.schoolLogo = e.target.result;
    saveToStorage();
    renderHeaderInfo();
    alert("เปลี่ยนโลโก้โรงเรียนสำเร็จแล้ว");
  };
  reader.readAsDataURL(file);
};

window.resetLogoToDefault = function() {
  appState.config.schoolLogo = "images/niti.png";
  saveToStorage();
  renderHeaderInfo();
  alert("คืนค่าโลโก้โรงเรียนนิธิปริญญาแล้ว");
};

// ==========================================================================
// IMPORT ENGINE (EXCEL / CSV / PASTE)
// ==========================================================================
let pendingImportStudents = [];

function setupDropZone() {
  const dropzone = document.getElementById("import-dropzone");
  const fileInput = document.getElementById("import-file-input");

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImportFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImportFile(e.target.files[0]);
    }
  });
}

window.openImportModal = function() {
  pendingImportStudents = [];
  document.getElementById("import-preview-box").style.display = "none";
  document.getElementById("btn-confirm-import").disabled = true;
  document.getElementById("paste-input-area").value = "";
  switchImportTab('file');
  openModal("modal-import");
};

window.switchImportTab = function(tab) {
  const tabFile = document.getElementById("tab-import-file");
  const tabPaste = document.getElementById("tab-import-paste");
  const viewFile = document.getElementById("view-import-file");
  const viewPaste = document.getElementById("view-import-paste");

  if (tab === 'file') {
    tabFile.classList.add("active");
    tabPaste.classList.remove("active");
    viewFile.style.display = "block";
    viewPaste.style.display = "none";
  } else {
    tabPaste.classList.add("active");
    tabFile.classList.remove("active");
    viewPaste.style.display = "block";
    viewFile.style.display = "none";
  }
};

function handleImportFile(file) {
  const fileName = file.name.toLowerCase();
  const reader = new FileReader();

  if (fileName.endsWith(".csv")) {
    reader.onload = (e) => {
      parseCSVText(e.target.result);
    };
    reader.readAsText(file);
  } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    reader.onload = (e) => {
      if (typeof XLSX === "undefined") {
        alert("กำลังโหลดโมดูลอ่านไฟล์ Excel กรุณาลองใหม่อีกครั้ง");
        return;
      }
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        parseSheetRows(json);
      } catch (err) {
        alert("ไม่สามารถอ่านไฟล์ Excel ได้: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    alert("รองรับเฉพาะไฟล์นามสกุล .xlsx, .xls หรือ .csv เท่านั้น");
  }
}

// Parse Raw 2D Array from Excel or CSV
function parseSheetRows(rows) {
  if (!rows || rows.length === 0) {
    alert("ไฟล์ว่างเปล่า ไม่มีข้อมูล");
    return;
  }

  // Find header row or column indices
  let headerIndex = -1;
  let colNo = -1;
  let colName = -1;
  let colPrefix = -1;
  let colFirstName = -1;
  let colLastName = -1;
  let colS1 = -1;
  let colS2 = -1;
  let colS3 = -1;
  let colS4 = -1;
  let colRemark = -1;

  for (let r = 0; r < Math.min(rows.length, 6); r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;

    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || "").trim().toLowerCase();
      if (val.includes("เลขที่") || val === "no" || val === "id" || val === "ลำดับ") colNo = c;
      if (val.includes("ชื่อ - สกุล") || val.includes("ชื่อ-สกุล") || val.includes("ชื่อสกุล") || val === "name" || val === "fullname") colName = c;
      if (val === "คำนำหน้า" || val === "prefix") colPrefix = c;
      if (val === "ชื่อ" || val === "firstname") colFirstName = c;
      if (val === "นามสกุล" || val === "lastname") colLastName = c;
      if (val.includes("ร่างกาย") || val === "s1" || val.includes("ด้านที่ 1")) colS1 = c;
      if (val.includes("อารมณ์") || val.includes("จิตใจ") || val === "s2" || val.includes("ด้านที่ 2")) colS2 = c;
      if (val.includes("สังคม") || val === "s3" || val.includes("ด้านที่ 3")) colS3 = c;
      if (val.includes("สติปัญญา") || val === "s4" || val.includes("ด้านที่ 4")) colS4 = c;
      if (val.includes("ข้อเสนอแนะ") || val.includes("หมายเหตุ") || val.includes("remark")) colRemark = c;
    }

    if (colNo !== -1 || colName !== -1 || colFirstName !== -1) {
      headerIndex = r;
      break;
    }
  }

  // If no recognizable headers, assume default column order: Col 0 = No, Col 1 = Name
  if (headerIndex === -1) {
    headerIndex = 0;
    colNo = 0;
    colName = 1;
    colS1 = 2;
    colS2 = 3;
    colS3 = 4;
    colS4 = 5;
    colRemark = 6;
  }

  const parsedStudents = [];
  let autoNo = 1;

  for (let r = headerIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    let no = colNo !== -1 && row[colNo] !== undefined ? parseInt(row[colNo]) : autoNo;
    if (isNaN(no)) no = autoNo;

    let fullName = "";
    if (colName !== -1 && row[colName]) {
      fullName = String(row[colName]).trim();
    } else if (colFirstName !== -1 && row[colFirstName]) {
      const prefix = colPrefix !== -1 && row[colPrefix] ? String(row[colPrefix]).trim() : "";
      const fname = String(row[colFirstName]).trim();
      const lname = colLastName !== -1 && row[colLastName] ? String(row[colLastName]).trim() : "";
      fullName = `${prefix}${fname} ${lname}`.trim();
    }

    // Skip empty row
    if (!fullName) continue;

    autoNo = no + 1;

    const s1 = colS1 !== -1 && row[colS1] !== undefined && row[colS1] !== "" ? Number(row[colS1]) : null;
    const s2 = colS2 !== -1 && row[colS2] !== undefined && row[colS2] !== "" ? Number(row[colS2]) : null;
    const s3 = colS3 !== -1 && row[colS3] !== undefined && row[colS3] !== "" ? Number(row[colS3]) : null;
    const s4 = colS4 !== -1 && row[colS4] !== undefined && row[colS4] !== "" ? Number(row[colS4]) : null;
    const remark = colRemark !== -1 && row[colRemark] ? String(row[colRemark]).trim() : "";

    parsedStudents.push({
      id: "std-" + Date.now() + "-" + r + "-" + Math.random().toString(36).substr(2, 3),
      no: no,
      name: fullName,
      score1: s1 !== null && !isNaN(s1) ? s1 : null,
      score2: s2 !== null && !isNaN(s2) ? s2 : null,
      score3: s3 !== null && !isNaN(s3) ? s3 : null,
      score4: s4 !== null && !isNaN(s4) ? s4 : null,
      remark: remark
    });
  }

  displayImportPreview(parsedStudents);
}

function parseCSVText(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
  const rows = lines.map(line => {
    // Simple split by tab or comma
    if (line.includes("\t")) {
      return line.split("\t");
    }
    return line.split(",").map(val => val.replace(/^"|"$/g, "").trim());
  });
  parseSheetRows(rows);
}

window.parsePastedText = function() {
  const text = document.getElementById("paste-input-area").value;
  if (!text.trim()) {
    alert("กรุณาวางข้อความรายชื่อนักเรียนก่อน");
    return;
  }

  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
  const rows = lines.map(line => {
    if (line.includes("\t")) return line.split("\t");
    if (line.includes(",")) return line.split(",");
    
    // Fallback: match pattern like "1 เด็กชายสมชาย ใจดี" or "1. ด.ช.กานต์"
    const match = line.match(/^(\d+)[\.\s\t]+(.+)$/);
    if (match) {
      return [match[1], match[2]];
    }
    return [line];
  });

  parseSheetRows(rows);
};

function displayImportPreview(students) {
  if (students.length === 0) {
    alert("ไม่พบข้อมูลนักเรียนที่สามารถอ่านได้ในไฟล์หรือข้อความนี้");
    return;
  }

  pendingImportStudents = students;
  const previewBox = document.getElementById("import-preview-box");
  const countBadge = document.getElementById("import-preview-count");
  const tbody = document.getElementById("import-preview-tbody");

  countBadge.textContent = `${students.length} คน`;
  tbody.innerHTML = students.map(st => `
    <tr>
      <td style="text-align:center;">${st.no}</td>
      <td><strong>${escapeHtml(st.name)}</strong></td>
      <td style="text-align:center;">${st.score1 !== null ? st.score1 : '-'}</td>
      <td style="text-align:center;">${st.score2 !== null ? st.score2 : '-'}</td>
      <td style="text-align:center;">${st.score3 !== null ? st.score3 : '-'}</td>
      <td style="text-align:center;">${st.score4 !== null ? st.score4 : '-'}</td>
      <td style="font-size:0.75rem; color:#64748b;">${escapeHtml(st.remark || '-')}</td>
    </tr>
  `).join("");

  previewBox.style.display = "block";
  document.getElementById("btn-confirm-import").disabled = false;
}

window.confirmImport = function() {
  if (pendingImportStudents.length === 0) return;

  const mode = document.querySelector('input[name="import-mode"]:checked').value;
  if (mode === "overwrite") {
    appState.students = [...pendingImportStudents];
  } else {
    // Append and renumber if needed
    appState.students = [...appState.students, ...pendingImportStudents];
  }

  // Sort by 'no'
  appState.students.sort((a, b) => Number(a.no) - Number(b.no));
  appState.selectedStudentIds.clear();

  saveToStorage();
  renderApp();
  closeModal("modal-import");
  alert(`นำเข้ารายชื่อนักเรียนสำเร็จทั้งหมด ${pendingImportStudents.length} คน!`);
};

// Download Excel Template File
window.downloadExcelTemplate = function() {
  if (typeof XLSX === "undefined") {
    alert("โมดูล XLSX ยังไม่พร้อมใช้งาน");
    return;
  }

  const sampleData = [
    { "เลขที่": 1, "ชื่อ - สกุล": "เด็กหญิงรัชนี พรสวรรค์", "ร่างกาย (25)": 22, "อารมณ์-จิตใจ (25)": 19, "สังคม (25)": 17, "สติปัญญา (25)": 23, "ข้อเสนอแนะ": "ร่าเริงแจ่มใส กล้ามเนื้อแข็งแรง" },
    { "เลขที่": 2, "ชื่อ - สกุล": "เด็กชายกิตติศักดิ์ เจริญพร", "ร่างกาย (25)": 24, "อารมณ์-จิตใจ (25)": 23, "สังคม (25)": 22, "สติปัญญา (25)": 24, "ข้อเสนอแนะ": "มีภาวะผู้นำ มีน้ำใจต่อเพื่อน" },
    { "เลขที่": 3, "ชื่อ - สกุล": "เด็กหญิงปวริศา สุขสมบูรณ์", "ร่างกาย (25)": 23, "อารมณ์-จิตใจ (25)": 21, "สังคม (25)": 20, "สติปัญญา (25)": 22, "ข้อเสนอแนะ": "" }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "รายชื่อและคะแนน");

  XLSX.writeFile(workbook, "แบบฟอร์มรายชื่อนักเรียน_อนุบาล.xlsx");
};

// Export Current Data to Excel
window.exportToExcel = function() {
  if (typeof XLSX === "undefined") {
    alert("โมดูล XLSX ยังไม่พร้อมใช้งาน");
    return;
  }

  if (appState.students.length === 0) {
    alert("ไม่มีข้อมูลนักเรียนสำหรับส่งออก");
    return;
  }

  const exportRows = appState.students.map(st => {
    const calc = calculateStudentScores(st);
    return {
      "เลขที่": st.no,
      "ชื่อ - สกุล": st.name,
      "ร่างกาย (เต็ม 25)": st.score1 !== null ? st.score1 : "",
      "ร้อยละร่างกาย": calc.pct1 !== '-' ? calc.pct1 : "",
      "อารมณ์-จิตใจ (เต็ม 25)": st.score2 !== null ? st.score2 : "",
      "ร้อยละอารมณ์": calc.pct2 !== '-' ? calc.pct2 : "",
      "สังคม (เต็ม 25)": st.score3 !== null ? st.score3 : "",
      "ร้อยละสังคม": calc.pct3 !== '-' ? calc.pct3 : "",
      "สติปัญญา (เต็ม 25)": st.score4 !== null ? st.score4 : "",
      "ร้อยละสติปัญญา": calc.pct4 !== '-' ? calc.pct4 : "",
      "คะแนนรวม (เต็ม 100)": calc.totalScore !== null ? calc.totalScore : "",
      "ร้อยละรวม": calc.totalPct !== '-' ? calc.totalPct : "",
      "ระดับคุณภาพ": calc.level,
      "ข้อเสนอแนะ": st.remark || ""
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "สรุปผลการประเมิน");

  const safeClassName = (appState.config.className || "อนุบาล").replace(/[\/\\?%*:|"<>]/g, '_');
  XLSX.writeFile(workbook, `ผลการประเมิน_${safeClassName}_${appState.config.year || '2569'}.xlsx`);
};

// Backup & Restore via JSON
window.exportProjectJSON = function() {
  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    config: appState.config,
    students: appState.students
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backup_niti_scores_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

window.importProjectJSON = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.config && Array.isArray(data.students)) {
        appState.config = { ...DEFAULT_CONFIG, ...data.config };
        appState.students = data.students;
        saveToStorage();
        renderApp();
        alert("นำเข้าไฟล์สำรองข้อมูลเรียบร้อยแล้ว");
      } else {
        alert("ไฟล์สำรองข้อมูลไม่ถูกต้อง");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอ่านไฟล์ JSON: " + err.message);
    }
  };
  reader.readAsText(file);
};

// Modal Helpers
window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
};

// Escape HTML utility
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
