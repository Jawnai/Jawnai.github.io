document.addEventListener('DOMContentLoaded', () => {
    // State
    let selectedFiles = [];

    // DOM Elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const filesSection = document.getElementById('filesSection');
    const filesList = document.getElementById('filesList');
    const fileCount = document.getElementById('fileCount');
    const clearBtn = document.getElementById('clearBtn');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const portalBtn = document.getElementById('portalBtn');
    const portalMenu = document.getElementById('portalMenu');

    // Portal Menu Toggle
    portalBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        portalMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!portalMenu.contains(e.target) && e.target !== portalBtn) {
            portalMenu.classList.add('hidden');
        }
    });

    // Drag & Drop Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.remove('dragover');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    });

    // File Input Events
    browseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
        // Reset input so the same file can be selected again if removed
        this.value = null;
    });

    // Handle incoming files
    function handleFiles(files) {
        if (files.length === 0) return;
        
        const newFiles = Array.from(files);
        
        // Add new files to our array
        selectedFiles = [...selectedFiles, ...newFiles];
        
        updateUI();
    }

    // Remove file
    window.removeFile = function(index) {
        selectedFiles.splice(index, 1);
        updateUI();
    };

    // Download individual file
    window.downloadSingleFile = function(index) {
        const file = selectedFiles[index];
        downloadFile(file);
    };

    // Helper to trigger download
    function downloadFile(file) {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = file.name;
        
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }, 100);
    }

    // Clear all files
    clearBtn.addEventListener('click', () => {
        selectedFiles = [];
        updateUI();
    });

    // Update UI based on state
    function updateUI() {
        fileCount.textContent = selectedFiles.length;
        
        if (selectedFiles.length > 0) {
            filesSection.classList.remove('hidden');
            renderFilesList();
        } else {
            filesSection.classList.add('hidden');
        }
    }

    // Get file icon based on extension
    function getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        
        const iconMap = {
            'pdf': 'ph-file-pdf',
            'doc': 'ph-file-doc',
            'docx': 'ph-file-doc',
            'txt': 'ph-file-text',
            'jpg': 'ph-file-image',
            'jpeg': 'ph-file-image',
            'png': 'ph-file-image',
            'gif': 'ph-file-image',
            'svg': 'ph-file-image',
            'mp3': 'ph-file-audio',
            'wav': 'ph-file-audio',
            'mp4': 'ph-file-video',
            'zip': 'ph-file-archive',
            'rar': 'ph-file-archive',
            'html': 'ph-file-code',
            'css': 'ph-file-code',
            'js': 'ph-file-code',
        };

        return iconMap[ext] || 'ph-file';
    }

    // Render files in the list
    function renderFilesList() {
        filesList.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const sizeStr = formatBytes(file.size);
            const iconClass = getFileIcon(file.name);
            
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <i class="ph ${iconClass} file-icon"></i>
                    <div class="file-details">
                        <span class="file-name" title="${file.name}">${file.name}</span>
                        <span class="file-size">${sizeStr}</span>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="action-btn download" onclick="downloadSingleFile(${index})" title="Download this file">
                        <i class="ph ph-download-simple"></i>
                    </button>
                    <button class="action-btn remove" onclick="removeFile(${index})" title="Remove from list">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
            `;
            
            filesList.appendChild(fileItem);
        });
    }

    // Format bytes to readable string
    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    // Download All Logic
    downloadAllBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;
        
        loadingOverlay.classList.remove('hidden');
        document.getElementById('loadingText').textContent = 'Preparing downloads...';

        // Download files with a small delay to avoid browser blocking too many at once
        for (let i = 0; i < selectedFiles.length; i++) {
            downloadFile(selectedFiles[i]);
            // Small delay between downloads
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        setTimeout(() => {
            loadingOverlay.classList.add('hidden');
        }, 500);
    });
});
