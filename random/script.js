const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const centerDisplay = document.getElementById('currentNumber');
const spinBtn = document.getElementById('spinBtn');
const remainingCountEl = document.getElementById('remainingCount');

const modal = document.getElementById('resultModal');
const resultDisplay = document.getElementById('resultNumberDisplay');
const keepBtn = document.getElementById('keepBtn');
const removeBtn = document.getElementById('removeBtn');
const historyList = document.getElementById('historyList');

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

        // Uplifting Bell Arpeggio (Game Show Style)
        // E5, G#5, B5, E6
        const notes = [659.25, 830.61, 987.77, 1318.51]; 
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            // Combining sine and a little triangle for a "bell" character
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time + (i * 0.12));
            
            const startTime = time + (i * 0.12);
            // Last note rings longer
            const duration = (i === notes.length - 1) ? 2.5 : 0.4;
            
            // Bell envelope (sharp attack, slow decay)
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        });
    }
};

// Initialize State
let numbers = Array.from({length: 600}, (_, i) => i + 1);
let currentRotation = 0; // in radians
let spinning = false;
let animationFrameId;
let selectedNumber = null;
let spinCount = 0; // Counter for spins

// Wheel settings
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = centerX;
const colors = ['#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce']; // Purple shades

// Draw Wheel Background
function drawWheel() {
    if (numbers.length === 0) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // We create a decorative wheel since 600 numbers is too many to show text
    const totalSegments = 60;
    const sliceAngle = (Math.PI * 2) / totalSegments;
    
    // Rotate canvas based on currentRotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);
    
    for (let i = 0; i < totalSegments; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        
        // Add thin border to separate slices
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    }
    
    ctx.restore();
}

// Easing Out function (smoother deceleration)
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Handle spinning
function spinWheel() {
    if (spinning || numbers.length === 0) return;
    
    spinning = true;
    spinBtn.disabled = true;
    
    // Increment spin count
    spinCount++;
    
    let winIndex;
    const specialNumbers = [64, 194, 13, 313, 60, 600, 16, 61];
    
    // Trigger special logic every 5 spins (5, 10, 15, ...)
    if (spinCount % 2 === 0) {
        const availableSpecials = specialNumbers.filter(n => numbers.includes(n));
        
        // 100% chance to pick if any specials are left
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

    // Math for random spin
    const spinDuration = 6000 + Math.random() * 2000; // 6 to 8 seconds
    const startTime = performance.now();
    const startRotation = currentRotation;
    
    // Calculate a target rotation: at least 15-20 full spins + random extra
    const baseRotations = (15 + Math.random() * 5) * Math.PI * 2;
    const targetRotation = startRotation + baseRotations;

    let lastTextUpdate = 0;

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / spinDuration, 1);
        
        // Apply easing curve
        const easeProgress = easeOutCubic(progress);
        
        // Current rotation
        currentRotation = startRotation + (targetRotation - startRotation) * easeProgress;
        
        // Draw the wheel at current rotation
        drawWheel();
        
        // Update center display rapidly but throttled to make it less jittery (every 50ms)
        if (progress < 0.95) {
            if (currentTime - lastTextUpdate > 50) {
                const randomFakeNum = numbers[Math.floor(Math.random() * numbers.length)];
                centerDisplay.textContent = randomFakeNum;
                SoundFX.playTick();
                lastTextUpdate = currentTime;
            }
        } else {
            // Near the end, show the real number to lock it in
            centerDisplay.textContent = selectedNumber;
        }

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            // Finish spin
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
    centerDisplay.textContent = selectedNumber; // Ensure it displays the right one
    
    // Prevent immediate re-click
    spinBtn.disabled = true;

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

function addHistoryBadge(number, removed) {
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
}

// Modal Actions
keepBtn.addEventListener('click', () => {
    addHistoryBadge(selectedNumber, false);
    modal.classList.add('hidden');
    resetWheelUI();
});

removeBtn.addEventListener('click', () => {
    addHistoryBadge(selectedNumber, true);
    // Remove the selected number from the array
    numbers = numbers.filter(n => n !== selectedNumber);
    remainingCountEl.textContent = numbers.length;
    
    modal.classList.add('hidden');
    
    if (numbers.length === 0) {
        centerDisplay.textContent = "จบ";
        spinBtn.disabled = true;
        spinBtn.textContent = "หมดตัวเลขแล้ว";
        // Optionally clear wheel or gray it out
        drawWheel();
    } else {
        resetWheelUI();
    }
});

function resetWheelUI() {
    spinBtn.disabled = false;
    centerDisplay.textContent = "?";
}

// Button Events
spinBtn.addEventListener('click', spinWheel);

// Initial Draw
drawWheel();
remainingCountEl.textContent = numbers.length;
