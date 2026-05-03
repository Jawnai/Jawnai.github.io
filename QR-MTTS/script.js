document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentData = "https://jawnai.github.io";
    let currentLogo = "image/logo.png";
    let qrCode = null;

    // Elements
    const previewContainer = document.getElementById('qr-preview-container');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const inputLink = document.getElementById('qr-link');
    const inputText = document.getElementById('qr-text');
    const inputFile = document.getElementById('qr-file');
    const fileDrop = document.getElementById('file-drop');
    
    const colorDots = document.getElementById('color-dots');
    const colorBg = document.getElementById('color-bg');
    const dotStyle = document.getElementById('dot-style');
    const logoInput = document.getElementById('logo-file');
    const removeLogoBtn = document.getElementById('remove-logo');
    
    const downloadPng = document.getElementById('download-png');
    const downloadSvg = document.getElementById('download-svg');

    // Initialize QR Code
    const initQR = () => {
        qrCode = new QRCodeStyling({
            width: 300,
            height: 300,
            type: "canvas",
            data: currentData,
            image: currentLogo,
            dotsOptions: {
                color: colorDots.value,
                type: dotStyle.value
            },
            backgroundOptions: {
                color: colorBg.value,
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 10
            }
        });

        previewContainer.innerHTML = "";
        qrCode.append(previewContainer);
    };

    const updateQR = () => {
        if (!qrCode) return;
        
        qrCode.update({
            data: currentData,
            image: currentLogo,
            dotsOptions: {
                color: colorDots.value,
                type: dotStyle.value
            },
            backgroundOptions: {
                color: colorBg.value,
            }
        });
    };

    // Tab Switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // UI Update
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.add('hidden');
                if (content.id === `${tabId}-tab`) {
                    content.classList.remove('hidden');
                }
            });

            // Update state based on tab
            if (tabId === 'link') currentData = inputLink.value || " ";
            if (tabId === 'text') currentData = inputText.value || " ";
            // File data is updated when file is uploaded
            
            updateQR();
        });
    });

    // Input Listeners
    inputLink.addEventListener('input', (e) => {
        currentData = e.target.value || " ";
        updateQR();
    });

    inputText.addEventListener('input', (e) => {
        currentData = e.target.value || " ";
        updateQR();
    });

    // File Handling (Main Data)
    fileDrop.addEventListener('click', () => inputFile.click());
    
    inputFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5000) { // Slightly more than 3KB for buffer
            alert("File is too large! QR codes have very limited capacity. Please use a smaller file or a link.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            currentData = event.target.result;
            updateQR();
            fileDrop.querySelector('span').textContent = `File: ${file.name}`;
        };
        reader.readAsDataURL(file);
    });

    // Logo Handling
    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            currentLogo = event.target.result;
            updateQR();
            removeLogoBtn.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });

    removeLogoBtn.addEventListener('click', () => {
        currentLogo = "";
        logoInput.value = "";
        updateQR();
        removeLogoBtn.classList.add('hidden');
    });

    // Style Listeners
    colorDots.addEventListener('input', updateQR);
    colorBg.addEventListener('input', updateQR);
    dotStyle.addEventListener('change', updateQR);

    // Download
    downloadPng.addEventListener('click', () => {
        qrCode.download({ name: "qr-code", extension: "png" });
    });

    downloadSvg.addEventListener('click', () => {
        qrCode.download({ name: "qr-code", extension: "svg" });
    });

    // Drag and Drop Effects
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDrop.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    fileDrop.addEventListener('dragover', () => fileDrop.classList.add('dragover'));
    fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('dragover'));
    fileDrop.addEventListener('drop', (e) => {
        fileDrop.classList.remove('dragover');
        const dt = e.dataTransfer;
        const files = dt.files;
        inputFile.files = files;
        inputFile.dispatchEvent(new Event('change'));
    });

    // Initialize
    if (currentLogo) {
        removeLogoBtn.classList.remove('hidden');
    }
    initQR();
});
