let masterData = null;
let compareData = null;
let compareHeaders = [];

let matchedResult = null;
let unmatchedResult = null;

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const dropZoneMaster = document.getElementById('drop-zone-master');
    const fileMaster = document.getElementById('file-master');
    const fileInfoMaster = document.getElementById('file-info-master');

    const dropZoneCompare = document.getElementById('drop-zone-compare');
    const fileCompare = document.getElementById('file-compare');
    const fileInfoCompare = document.getElementById('file-info-compare');

    const settingsSection = document.getElementById('settings-section');
    const compareColumnSelect = document.getElementById('compare-column');
    const processBtn = document.getElementById('process-btn');
    const resultSection = document.getElementById('result-section');

    const matchedCount = document.getElementById('matched-count');
    const unmatchedCount = document.getElementById('unmatched-count');
    const downloadMatchedBtn = document.getElementById('download-matched');
    const downloadUnmatchedBtn = document.getElementById('download-unmatched');

    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeModal = document.getElementById('close-modal');

    // Modal Logic
    helpBtn.addEventListener('click', () => {
        helpModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        helpModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });

    // Setup Drag & Drop and File Selection
    setupFileBox(dropZoneMaster, fileMaster, fileInfoMaster, 'master');
    setupFileBox(dropZoneCompare, fileCompare, fileInfoCompare, 'compare');

    // Setup Event Listeners processing
    compareColumnSelect.addEventListener('change', checkReadyToProcess);
    
    processBtn.addEventListener('click', processFiles);

    downloadMatchedBtn.addEventListener('click', () => {
        if (matchedResult) downloadExcel(matchedResult, 'Matched_Data.xlsx');
    });

    downloadUnmatchedBtn.addEventListener('click', () => {
        if (unmatchedResult) downloadExcel(unmatchedResult, 'Unmatched_Data.xlsx');
    });

    function setupFileBox(dropZone, inputElement, infoElement, type) {
        // Click to upload
        dropZone.addEventListener('click', () => inputElement.click());

        // Drag & Drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                handleFile(file, infoElement, type);
            }
        });

        // File input change
        inputElement.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0], infoElement, type);
            }
        });
    }

    function handleFile(file, infoElement, type) {
        if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
            alert('กรุณาอัปโหลดไฟล์ Excel (.xlsx, .xls, .csv)');
            return;
        }

        infoElement.textContent = file.name;
        infoElement.classList.add('active');
        resultSection.style.display = 'none'; // hide previous results

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON (array of objects)
                const json_data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

                if (type === 'master') {
                    masterData = json_data;
                } else if (type === 'compare') {
                    compareData = json_data;
                    // Get Headers from compare data
                    if (json_data.length > 0) {
                        compareHeaders = Object.keys(json_data[0]);
                        populateHeadersSelect();
                        settingsSection.style.display = 'block';
                    }
                }
                
                checkReadyToProcess();

            } catch (err) {
                console.error("Error reading file:", err);
                alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function populateHeadersSelect() {
        compareColumnSelect.innerHTML = '<option value="">-- กรุณาเลือกคอลัมน์ --</option>';
        compareHeaders.forEach(header => {
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            compareColumnSelect.appendChild(option);
        });
    }

    function checkReadyToProcess() {
        if (masterData && compareData && compareColumnSelect.value) {
            processBtn.disabled = false;
        } else {
            processBtn.disabled = true;
        }
    }

    function processFiles() {
        processBtn.disabled = true;
        const btnText = processBtn.querySelector('.btn-text');
        const loader = processBtn.querySelector('.loader');
        
        btnText.style.display = 'none';
        loader.style.display = 'block';

        const selectedCol = compareColumnSelect.value;

        // Use a small timeout to allow UI to update to loading state
        setTimeout(() => {
            // Processing logic
            
            // 1. Gather all values from the master file across ALL columns (to be very robust, 
            // or we could ask them to select master column, but for simplicity we will check if the value 
            // exists in ANY column of the master document, or we try to find a matching column name)
            // Let's create a Set of all values in the master data for quick lookup.
            // A common requirement is matching based on same column name, but what if they are named differently?
            // To be safest based on "exists in original file", let's collect ALL values from the master data.
            
            // Wait, let's look at a more standard approach: 
            // Often, they want to compare specific column from compare with a specific or any column in master.
            // Let's create a Set of all stringified values from the master data.
            const masterValuesSet = new Set();
            masterData.forEach(row => {
                Object.values(row).forEach(val => {
                    if (val !== null && val !== undefined && val !== "") {
                        masterValuesSet.add(String(val).trim().toLowerCase());
                    }
                });
            });

            matchedResult = [];
            unmatchedResult = [];

            compareData.forEach(row => {
                const valToCompare = row[selectedCol];
                const cleanVal = (valToCompare !== null && valToCompare !== undefined) ? String(valToCompare).trim().toLowerCase() : "";

                if (cleanVal && masterValuesSet.has(cleanVal)) {
                    matchedResult.push(row);
                } else {
                    unmatchedResult.push(row);
                }
            });

            // Update UI
            matchedCount.textContent = matchedResult.length;
            unmatchedCount.textContent = unmatchedResult.length;
            
            // Restore btn
            btnText.style.display = 'block';
            loader.style.display = 'none';
            processBtn.disabled = false;

            // Show results
            resultSection.style.display = 'grid';

        }, 100);
    }

    function downloadExcel(dataArray, filename) {
        if (dataArray.length === 0) {
            alert("ไม่มีข้อมูลที่จะดาวน์โหลด");
            return;
        }

        const ws = XLSX.utils.json_to_sheet(dataArray);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Result");
        XLSX.writeFile(wb, filename);
    }
});
