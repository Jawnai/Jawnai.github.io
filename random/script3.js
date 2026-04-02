const canvas = document.getElementById('reelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const remainingCountEl = document.getElementById('remainingCount');

const modal = document.getElementById('resultModal');
const resultDisplay = document.getElementById('resultNumberDisplay');
const keepBtn = document.getElementById('keepBtn');
const removeBtn = document.getElementById('removeBtn');
const historyList = document.getElementById('historyList');

const reelContainer = document.querySelector('.reel-container');
const sliderSelector = document.querySelector('.slider-selector');

// Config Elements
const configModal = document.getElementById('configModal');
const maxNumberInput = document.getElementById('maxNumberInput');
const startBtn = document.getElementById('startBtn');
const cancelConfigBtn = document.getElementById('cancelConfigBtn');
const settingsBtn = document.getElementById('settingsBtn');
const maxNumberDisplay = document.getElementById('maxNumberDisplay');

// Initialize Web Audio API for sound effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const SoundFX = {
    playTick: () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
    },
    playCheer: () => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const time = audioCtx.currentTime;
        const notes = [659.25, 830.61, 987.77, 1318.51]; 
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time + (i * 0.12));
            const startTime = time + (i * 0.12);
            const duration = (i === notes.length - 1) ? 2.5 : 0.4;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }
};

// Initialize State
const STATE_KEY = 'randomWheelStateSlot';
let maxNumber = 600;
let numbers = [];
let spinning = false;
let animationFrameId;
let selectedNumber = null;
let spinCount = 0; // Counter for spins
let historyData = []; // Store history objects

function saveState() {
    const state = { maxNumber, numbers, historyData, spinCount };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function loadState() {
    const stateStr = localStorage.getItem(STATE_KEY);
    if (stateStr) {
        try { return JSON.parse(stateStr); } catch (e) { return null; }
    }
    return null;
}

// Reel settings
const boxHeight = 100;
let spinSequence = [];
let currentOffset = 0;
const WIN_INDEX = 3;

// Draw Reel Background
function drawReel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 4rem Outfit';
    
    if (spinSequence.length === 0) {
        ctx.fillStyle = '#1f2937';
        let displayTxt = numbers.length === 0 ? 'จบ' : '?';
        ctx.fillText(displayTxt, canvas.width / 2, canvas.height / 2);
        return;
    }
    
    for (let i = 0; i < spinSequence.length; i++) {
        const yBase = (canvas.height / 2) + (i * boxHeight);
        const yPos = yBase + currentOffset;
        
        if (yPos > -boxHeight && yPos < canvas.height + boxHeight) {
            // Highlight winner only when spinning is completely finished
            const isWinner = (i === WIN_INDEX) && !spinning;
            ctx.fillStyle = isWinner ? '#ef4444' : '#7e22ce';
            ctx.font = isWinner ? 'bold 4.5rem Outfit' : 'bold 4rem Outfit';
            ctx.fillText(spinSequence[i], canvas.width / 2, yPos);
        }
    }
}

// Variety of 10 Easing Functions for completely unpredictable stopping patterns
const EasingFuncs = {
    snapHeavy: t => { const c1 = 1.70158; return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }, // 1. Classic strong mechanical kickback
    snapMedium: t => { const c1 = 1.2; return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },    // 2. Normal snap back
    snapLight: t => { const c1 = 0.5; return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },     // 3. Very gentle overshoot
    smoothQuint: t => 1 - Math.pow(1 - t, 5),                                                                  // 4. Agonizingly slow and smooth stop
    smoothCubic: t => 1 - Math.pow(1 - t, 3),                                                                  // 5. Standard fast smooth stop
    expoCrawl: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),                                                    // 6. Abrupt speed drop, then crawls infinitely slow
    sineHalt: t => Math.sin((t * Math.PI) / 2),                                                                // 7. Consistent speed that halts gracefully
    circBrake: t => Math.sqrt(1 - Math.pow(t - 1, 2)),                                                         // 8. Friction brake feeling
    elasticWobble: t => {                                                                                      // 9. Slams and wobbles back and forth like a spring
        if (t === 0) return 0;
        if (t === 1) return 1;
        const c4 = (2 * Math.PI) / 3;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    bounceDrop: t => {                                                                                         // 10. Bounces up and down slightly at the end
        const n1 = 7.5625; const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
};
let currentEasingFunc = EasingFuncs.snapMedium;
let previousEasingKey = null;

// Handle spinning
function spinWheel() {
    if (spinning || numbers.length === 0) return;
    
    spinning = true;
    spinBtn.disabled = true;
    spinCount++;
    
    // Randomize the easing pattern for this spin, strictly preventing repeats!
    const easingKeys = Object.keys(EasingFuncs);
    let availableKeys = easingKeys.filter(key => key !== previousEasingKey);
    const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    previousEasingKey = randomKey;
    currentEasingFunc = EasingFuncs[randomKey];
    
    reelContainer.classList.add('spinning');
    sliderSelector.classList.remove('winner-pulse');
    
    let winIndex;
    const specialNumbers = [64, 194, 13, 313, 60, 600, 16, 61];
    
    if (spinCount % 5 === 0) {
        const availableSpecials = specialNumbers.filter(n => numbers.includes(n));
        
        if (availableSpecials.length > 0) {
            const pick = availableSpecials[Math.floor(Math.random() * availableSpecials.length)];
            winIndex = numbers.indexOf(pick);
        } else {
            winIndex = Math.floor(Math.random() * numbers.length);
        }
    } else {
        winIndex = Math.floor(Math.random() * numbers.length);
    }
    
    selectedNumber = numbers[winIndex];

    const sequenceLength = 60 + Math.floor(Math.random() * 20); // 60-80 fake items below
    spinSequence = [];
    
    // Add fake items above the winner so the box isn't empty when stopped
    for (let i = 0; i < WIN_INDEX; i++) {
        spinSequence.push(numbers[Math.floor(Math.random() * numbers.length)]);
    }
    
    // The WINNER!
    spinSequence.push(selectedNumber);
    
    // Add fake items below the winner for the visual spin
    for (let i = 0; i < sequenceLength; i++) {
        spinSequence.push(numbers[Math.floor(Math.random() * numbers.length)]);
    }

    // Completely randomize the spin duration so it's unpredictable (5s to 11s)
    const spinDuration = 5000 + Math.random() * 6000;
    const startTime = performance.now();
    
    const targetOffset = -(WIN_INDEX * boxHeight);
    const startOffset = -((spinSequence.length - 1) * boxHeight);
    currentOffset = startOffset;
    
    let lastTick = 0;

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / spinDuration, 1);
        
        // Randomly picked easing calculates the unique physics of this run
        const easeProgress = currentEasingFunc(progress);
        
        currentOffset = startOffset + (targetOffset - startOffset) * easeProgress;
        
        drawReel();
        
        // Stop shaking near the end to build up the suspense perfectly
        if (progress > 0.8 && reelContainer.classList.contains('spinning')) {
            reelContainer.classList.remove('spinning');
        }
        
        // Calculate which box index is closest to center
        // center matches yPos = 200. box is centered when yPos = 200.
        // yPos = 200 + i*boxHeight + currentOffset
        // So i = -currentOffset / boxHeight
        let currentPassingBox = Math.floor(Math.abs(currentOffset / boxHeight));
        
        if (currentPassingBox !== lastTick && progress < 0.98) {
            SoundFX.playTick();
            lastTick = currentPassingBox;
        }

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            finishSpin();
        }
    }
    
    animationFrameId = requestAnimationFrame(animate);
}

function fireConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#7e22ce', '#a855f7', '#ffffff']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#7e22ce', '#a855f7', '#ffffff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

function finishSpin() {
    spinning = false;
    
    // The win item is already centered by drawReel offset.
    // Prevent immediate re-click
    spinBtn.disabled = true;
    
    sliderSelector.classList.add('winner-pulse');
    reelContainer.classList.remove('spinning');

    // Fire confetti!
    if (typeof confetti !== 'undefined') {
        fireConfetti();
    }
    
    SoundFX.playCheer();

    // Show modal after 1.5 second delay
    setTimeout(() => {
        resultDisplay.textContent = selectedNumber;
        modal.classList.remove('hidden');
    }, 1500);
}

function addHistoryBadge(number, removed, skipSave = false) {
    const span = document.createElement('span');
    span.classList.add('history-chip');
    if (!removed) {
        span.classList.add('kept');
        span.title = 'เก็บไว้ (หมุนซ้ำได้)';
    } else {
        span.title = 'ลบออกแล้ว';
    }
    span.textContent = number;
    // Insert at beginning
    historyList.insertBefore(span, historyList.firstChild);
    
    if (!skipSave) {
        historyData.unshift({ number, kept: !removed });
        saveState();
    }
}

function renderHistory() {
    historyList.innerHTML = '';
    historyData.forEach(item => {
        const span = document.createElement('span');
        span.classList.add('history-chip');
        if (item.kept) {
            span.classList.add('kept');
            span.title = 'เก็บไว้ (หมุนซ้ำได้)';
        } else {
            span.title = 'ลบออกแล้ว';
        }
        span.textContent = item.number;
        historyList.appendChild(span);
    });
}

// Modal Actions
keepBtn.addEventListener('click', () => {
    addHistoryBadge(selectedNumber, false);
    modal.classList.add('hidden');
    resetWheelUI();
    saveState();
});

removeBtn.addEventListener('click', () => {
    addHistoryBadge(selectedNumber, true);
    // Remove the selected number from the array
    numbers = numbers.filter(n => n !== selectedNumber);
    remainingCountEl.textContent = numbers.length;
    
    saveState();
    
    modal.classList.add('hidden');
    
    if (numbers.length === 0) {
        spinBtn.disabled = true;
        spinBtn.textContent = "หมดตัวเลขแล้ว";
        spinSequence = [];
        drawReel();
    } else {
        resetWheelUI();
    }
});

function resetWheelUI() {
    spinBtn.disabled = false;
    spinSequence = [];
    currentOffset = 0;
    sliderSelector.classList.remove('winner-pulse');
    reelContainer.classList.remove('spinning');
    drawReel();
}

// Config Modal Events
startBtn.addEventListener('click', () => {
    let inputVal = parseInt(maxNumberInput.value);
    if (isNaN(inputVal) || inputVal < 2) {
        alert("กรุณาระบุตัวเลขอย่างน้อย 2");
        return;
    }
    maxNumber = inputVal;
    maxNumberDisplay.textContent = maxNumber;
    numbers = Array.from({length: maxNumber}, (_, i) => i + 1);
    historyData = [];
    spinCount = 0;
    
    renderHistory();
    saveState();
    
    configModal.classList.add('hidden');
    
    remainingCountEl.textContent = numbers.length;
    spinBtn.textContent = "สุ่มหมายเลข";
    spinBtn.disabled = false;
    resetWheelUI();
});

settingsBtn.addEventListener('click', () => {
    maxNumberInput.value = maxNumber;
    configModal.classList.remove('hidden');
    cancelConfigBtn.classList.remove('hidden');
});

cancelConfigBtn.addEventListener('click', () => {
    configModal.classList.add('hidden');
});

// Button Events
spinBtn.addEventListener('click', spinWheel);

// Initial Logic
function initApp() {
    // If spinBtn has old text
    spinBtn.textContent = "สุ่มหมายเลข";
    
    const savedState = loadState();
    if (savedState) {
        maxNumber = savedState.maxNumber || 600;
        numbers = savedState.numbers || [];
        historyData = savedState.historyData || [];
        spinCount = savedState.spinCount || 0;
        
        maxNumberDisplay.textContent = maxNumber;
        remainingCountEl.textContent = numbers.length;
        renderHistory();
        
        if (numbers.length === 0) {
            spinBtn.disabled = true;
            spinBtn.textContent = "หมดตัวเลขแล้ว";
            spinSequence = [];
            drawReel();
        } else {
            resetWheelUI();
        }
    } else {
        // No saved state, show config prompt
        configModal.classList.remove('hidden');
        cancelConfigBtn.classList.add('hidden'); // Cannot cancel the first time
    }
}

initApp();
