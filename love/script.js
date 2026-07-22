/* ==========================================================================
   Cute Pink 24th Birthday JavaScript Core
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. ALL 25 IMAGES DATASET
    // ----------------------------------------------------------------------
    const memoryPhotos = [
        { src: 'image/02F1D49D-3985-40B3-B7A5-70630146DB38.JPG', title: 'รอยยิ้มที่น่ารักที่สุด 💖', tag: 'smile' },
        { src: 'image/21CA9F24-3448-4991-8B41-0DDCA3F123B9.JPG', title: 'วันที่แสนพิเศษ ✨', tag: 'sweet' },
        { src: 'image/256BFE44-719B-4ABF-BD96-AFFD11212B33.JPG', title: 'ความสดใสของเค้า 😊', tag: 'cute' },
        { src: 'image/3DD2BE77-0DCA-44E2-922A-2E9D1FAC29C1.JPG', title: 'เจ้าหญิงคนเก่ง 🌸', tag: 'smile' },
        { src: 'image/468626C9-A1EC-4527-A8CE-971B4C4B6301.JPG', title: 'น่ารักเกินไปแล้ว 💕', tag: 'cute' },
        { src: 'image/5270FA19-B8E8-40E7-BDD7-B6F93B82EE71.JPG', title: 'เดทสุดแสนประทับใจ 🍦', tag: 'sweet' },
        { src: 'image/6A2B7EE0-0595-4B09-B279-EB536E51D3EC.JPG', title: 'มุมเผลอก็น่ารัก 📸', tag: 'cute' },
        { src: 'image/6B8DB9B1-07DB-4B7E-A419-7C3A658BEB94.JPG', title: 'รอยยิ้มทำลายล้าง 😍', tag: 'smile' },
        { src: 'image/E483C4F3-B522-429E-9F4D-F3ED941B87CC.JPG', title: 'โมเมนต์อบอุ่นหัวใจ 💖', tag: 'sweet' },
        { src: 'image/IMG_0314.JPG', title: 'คนเก่งในวัย 24 ปี 👑', tag: 'sweet' },
        { src: 'image/IMG_0315.JPG', title: 'ตาแป๋วสุดน่ารัก 🥺', tag: 'cute' },
        { src: 'image/IMG_0316.JPG', title: 'รอยยิ้มพิมพ์ใจ ✨', tag: 'smile' },
        { src: 'image/IMG_0317.JPG', title: 'สดใสรับวันใหม่ ☀️', tag: 'smile' },
        { src: 'image/IMG_0318.JPG', title: 'น่ารักที่สุดในสามโลก 🌎', tag: 'cute' },
        { src: 'image/IMG_0319.JPG', title: 'ความสุขของกันและกัน 💞', tag: 'sweet' },
        { src: 'image/IMG_1426.JPG', title: 'ความทรงจำอันแสนหวาน 🍰', tag: 'sweet' },
        { src: 'image/IMG_1427.JPG', title: 'ยิ้มหวานของคนโปรด 🥰', tag: 'smile' },
        { src: 'image/IMG_1469.JPG', title: 'แก้มยุ้ยน่าฟัด 😚', tag: 'cute' },
        { src: 'image/IMG_2714.JPG', title: 'ความน่ารักเต็มสิบไม่หัก ✨', tag: 'cute' },
        { src: 'image/IMG_4360.jpg', title: 'เดินทางไปด้วยกันนะ 🚗', tag: 'sweet' },
        { src: 'image/IMG_4611.jpg', title: 'คนสำคัญในทุกๆ วัน ❤️', tag: 'sweet' },
        { src: 'image/IMG_7916.jpg', title: 'รอยยิ้มที่ทำให้โลกสดใส 🌟', tag: 'smile' },
        { src: 'image/IMG_7917.jpg', title: 'ความสดใสวัย 24 ปี 🎀', tag: 'cute' },
        { src: 'image/fxn 2026-02-01 0006434B5DF098CBE5.JPG', title: 'โมเมนต์น่ารักๆ ของเรา 💌', tag: 'sweet' },
        { src: 'image/fxn 2026-02-01 000659FB41AB9FC4B6.JPG', title: 'รักเธอในทุกๆ วันนะ 💕', tag: 'sweet' }
    ];

    // ----------------------------------------------------------------------
    // 2. CANVAS HEART PARTICLE SYSTEM
    // ----------------------------------------------------------------------
    const canvas = document.getElementById('heartCanvas');
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class HeartParticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 50;
            this.size = Math.random() * 14 + 8;
            this.speedY = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.8;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.color = `hsl(${Math.random() * 30 + 330}, 100%, 75%)`;
            this.rotation = Math.random() * Math.PI;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.rotation += 0.01;

            if (this.y < -20 || this.x < -20 || this.x > width + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;

            // Draw Heart Path
            ctx.beginPath();
            const topCurveHeight = this.size * 0.3;
            ctx.moveTo(0, topCurveHeight);
            ctx.bezierCurveTo(
                0, 0, 
                -this.size / 2, 0, 
                -this.size / 2, topCurveHeight
            );
            ctx.bezierCurveTo(
                -this.size / 2, (this.size + topCurveHeight) / 2, 
                0, this.size, 
                0, this.size
            );
            ctx.bezierCurveTo(
                0, this.size, 
                this.size / 2, (this.size + topCurveHeight) / 2, 
                this.size / 2, topCurveHeight
            );
            ctx.bezierCurveTo(
                this.size / 2, 0, 
                0, 0, 
                0, topCurveHeight
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    const particles = Array.from({ length: 40 }, () => new HeartParticle());

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Spawn heart on mouse click
    window.addEventListener('click', (e) => {
        for (let i = 0; i < 5; i++) {
            const p = new HeartParticle();
            p.x = e.clientX + (Math.random() - 0.5) * 20;
            p.y = e.clientY + (Math.random() - 0.5) * 20;
            p.speedY = Math.random() * 2 + 1;
            particles.push(p);
            if (particles.length > 70) particles.shift();
        }
    });

    // ----------------------------------------------------------------------
    // 3. AUGUST 1ST BIRTHDAY COUNTDOWN / CELEBRATION TIMER
    // ----------------------------------------------------------------------
    function updateCountdown() {
        const now = new Date();
        const currentYear = now.getFullYear();
        let targetDate = new Date(currentYear, 7, 1); // August is month 7 (0-indexed)

        // If today is past Aug 1st of current year, countdown to next year's Aug 1st
        if (now > targetDate && (now.getMonth() !== 7 || now.getDate() !== 1)) {
            targetDate = new Date(currentYear + 1, 7, 1);
        }

        const diff = targetDate - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ----------------------------------------------------------------------
    // 4. CANDLE BLOW INTERACTION
    // ----------------------------------------------------------------------
    const blowBtn = document.getElementById('blowCandleBtn');
    const flames = document.querySelectorAll('.flame');
    const wishStatus = document.getElementById('wishStatusMessage');

    blowBtn.addEventListener('click', () => {
        flames.forEach(flame => flame.classList.remove('active'));
        wishStatus.textContent = '✨ คำอธิษฐานส่งถึงดวงดาวแล้ว! สุขสันต์วันเกิดครบรอบ 24 ปีนะ 💕 🎉';
        playBirthdayTune();

        // Confetti Burst
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                confetti({
                    particleCount: 80,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 }
                });
                confetti({
                    particleCount: 80,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 }
                });
            }, 300);
        }
    });

    // ----------------------------------------------------------------------
    // 5. GALLERY RENDERING & FILTERS
    // ----------------------------------------------------------------------
    const galleryGrid = document.getElementById('galleryGrid');

    function renderGallery(filter = 'all') {
        galleryGrid.innerHTML = '';
        const filtered = filter === 'all' 
            ? memoryPhotos 
            : memoryPhotos.filter(item => item.tag === filter);

        filtered.forEach((photo, index) => {
            const card = document.createElement('div');
            card.className = 'polaroid-card';
            card.style.transform = `rotate(${(Math.random() - 0.5) * 6}deg)`;
            card.innerHTML = `
                <div class="polaroid-img-box">
                    <img src="${photo.src}" alt="${photo.title}" loading="lazy">
                </div>
                <div class="polaroid-info">
                    <div class="polaroid-title">${photo.title}</div>
                    <span class="polaroid-tag"><i class="fa-solid fa-heart"></i> Special Moment</span>
                </div>
            `;

            card.addEventListener('click', () => openLightbox(index, filtered));
            galleryGrid.appendChild(card);
        });
    }

    renderGallery();

    // Filter Buttons logic
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderGallery(e.target.getAttribute('data-filter'));
        });
    });

    // ----------------------------------------------------------------------
    // 6. LIGHTBOX MODAL
    // ----------------------------------------------------------------------
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let currentList = memoryPhotos;
    let currentIndex = 0;

    function openLightbox(index, list = memoryPhotos) {
        currentList = list;
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
    }

    function updateLightboxContent() {
        const item = currentList[currentIndex];
        lightboxImg.src = item.src;
        lightboxCaption.textContent = item.title;
    }

    lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
    lightboxPrev.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
        updateLightboxContent();
    });
    lightboxNext.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % currentList.length;
        updateLightboxContent();
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('active');
    });

    // ----------------------------------------------------------------------
    // 7. 24 REASONS WHY I LOVE YOU
    // ----------------------------------------------------------------------
    const reasonsList = [
        "รอยยิ้มสดใสของเธอที่ทำให้เค้าอารมณ์ดีได้เสมอ 😊",
        "แววตาที่อบอุ่นและคอยใส่ใจเค้าในทุกเรื่อง 💖",
        "เสียงหัวเราะน่ารักๆ ที่ฟังเท่าไรก็ไม่เคยเบื่อ 🎶",
        "ความใส่ใจในเรื่องเล็กๆ น้อยๆ ที่เธอมอบให้ 🌸",
        "เป็นเซฟโซนและกำลังใจที่ดีที่สุดในชีวิตเค้า 🏡",
        "หน้าเอ๋อเวลาสงสัยอะไรบางอย่าง น่าเอ็นดูสุดๆ 🥺",
        "แก้มยุ้ยนุ่มฟูเวลากินของอร่อย 🍰",
        "ชอบเวลาเธอยิ้มตาหยี โลกสดใสขึ้นทันที ✨",
        "ความใจดีและอ่อนโยนกับทุกคนรอบข้าง 👼",
        "เป็นคนที่ตั้งใจทำอะไรก็ทำได้ดีเสมอ 🌟",
        "เวลาอ้อนเค้า น่ารักจนใจเจ็บ 💕",
        "คอยรับฟังและคอยซัพพอร์ตเค้าเสมอมา 🤝",
        "ความน่ารักสดใสที่ไม่เหมือนใครในโลก 🎀",
        "เป็นเพื่อนกิน เพื่อนเที่ยว คู่คิดที่ดีที่สุด 🚗",
        "ทำให้ทุกวันที่ได้อยู่ด้วยกันมีแต่ความสุข 🥰",
        "จับมือเค้าแน่นเสมอไม่ว่าจะเจอปัญหาอะไร 🤝",
        "คำพูดให้กำลังใจในวันที่เค้าเหนื่อย 💬",
        "ความสดใสแบบเด็กๆ ที่ดูแล้วน่ารักตื่นตาตื่นใจ 🎈",
        "ชอบแต่งตัวน่ารักๆ จนมองเพลิน 👗",
        "ความคิ้วท์เวลาเถียงเค้าแบบงุ้งงิ้ง 😚",
        "สร้างเสียงหัวเราะและความทรงจำดีๆ ให้เค้าเสมอ 📸",
        "เป็นความอบอุ่นในหัวใจเค้าทุกช่วงเวลา ☀️",
        "ขอบคุณที่เกิดมาให้เค้าได้รักนะ 💖",
        "เพราะเธอคือคนเดียวและรักมากที่สุดในชีวิต! 👑"
    ];

    const reasonsGrid = document.getElementById('reasonsGrid');
    reasonsList.forEach((reason, i) => {
        const card = document.createElement('div');
        card.className = 'reason-card glass-card';
        card.innerHTML = `
            <div class="reason-number">${i + 1}</div>
            <h4>เหตุผลข้อที่ ${i + 1}</h4>
            <p>${reason}</p>
        `;
        reasonsGrid.appendChild(card);
    });

    // ----------------------------------------------------------------------
    // 8. GIFT BOX & LOVE LETTER TYPEWRITER
    // ----------------------------------------------------------------------
    const giftBox = document.getElementById('giftBox');
    const openGiftBtn = document.getElementById('openGiftBtn');
    const letterModal = document.getElementById('letterModal');
    const letterClose = document.getElementById('letterClose');
    const closeLetterBtn = document.getElementById('closeLetterBtn');
    const typewriterText = document.getElementById('typewriterText');

    const loveLetterParagraphs = [
        "สุขสันต์วันเกิดครบรอบ 24 ปีนะคนเก่งของเค้า! 🎂💖",
        "วันที่ 1 สิงหาคมนี้ เป็นวันพิเศษที่สุดอีกหนึ่งวันเลย เพราะเป็นวันที่เธอเติบโตขึ้นอีกปี มีความสุขและสดใสขึ้นในทุกๆ วัน",
        "ขอบคุณสำหรับทุกรอยยิ้ม ความอบอุ่น และความน่ารักที่มอบให้เค้ามาตลอดนะ เธอน่ารักขึ้นในทุกวันจริงๆ",
        "ขอให้วัย 24 ปีนี้ เป็นปีที่เต็มไปด้วยความสุข ความสำเร็จ สุขภาพแข็งแรง ได้กินของอร่อยเยอะๆ ได้ไปเที่ยวในที่ที่อยากไป และสมหวังในทุกๆ สิ่งที่ตั้งใจเลยนะ",
        "ไม่ว่าจะวันไหนๆ เค้าก็จะคอยอยู่ข้างๆ คอยจับมือ และเป็นกำลังใจให้เธอเสมอ รักเธอที่สุดในโลกเลยนะเจ้าตัวเล็ก! 💕"
    ];

    function openGift() {
        giftBox.classList.add('open');
        playGiftSound();
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.5 }
            });
        }
        setTimeout(() => {
            letterModal.classList.add('active');
            startTypewriter();
        }, 800);
    }

    giftBox.addEventListener('click', openGift);
    openGiftBtn.addEventListener('click', openGift);

    letterClose.addEventListener('click', () => letterModal.classList.remove('active'));
    closeLetterBtn.addEventListener('click', () => letterModal.classList.remove('active'));

    let isTyping = false;
    function startTypewriter() {
        if (isTyping) return;
        isTyping = true;
        typewriterText.innerHTML = '';
        
        let pIndex = 0;
        let cIndex = 0;

        function typeLine() {
            if (pIndex < loveLetterParagraphs.length) {
                const currentText = loveLetterParagraphs[pIndex];
                if (cIndex === 0) {
                    const p = document.createElement('p');
                    p.id = `para-${pIndex}`;
                    typewriterText.appendChild(p);
                }

                const currentP = document.getElementById(`para-${pIndex}`);
                currentP.textContent += currentText[cIndex];
                cIndex++;

                if (cIndex < currentText.length) {
                    setTimeout(typeLine, 35);
                } else {
                    pIndex++;
                    cIndex = 0;
                    setTimeout(typeLine, 300);
                }
            } else {
                isTyping = false;
            }
        }
        typeLine();
    }

    // ----------------------------------------------------------------------
    // 9. WEB AUDIO API SYNTHESIZER FOR BACKGROUND MELODY & SFX
    // ----------------------------------------------------------------------
    let audioCtx = null;
    let isMusicPlaying = false;
    let timerId = null;

    const musicBtn = document.getElementById('musicToggleBtn');
    const musicWaves = document.getElementById('musicWaves');

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Gentle Happy Birthday synth notes sequence
    const notes = [
        { note: 261.63, duration: 0.4 }, // C4
        { note: 261.63, duration: 0.4 }, // C4
        { note: 293.66, duration: 0.8 }, // D4
        { note: 261.63, duration: 0.8 }, // C4
        { note: 349.23, duration: 0.8 }, // F4
        { note: 329.63, duration: 1.2 }, // E4

        { note: 261.63, duration: 0.4 }, // C4
        { note: 261.63, duration: 0.4 }, // C4
        { note: 293.66, duration: 0.8 }, // D4
        { note: 261.63, duration: 0.8 }, // C4
        { note: 392.00, duration: 0.8 }, // G4
        { note: 349.23, duration: 1.2 }, // F4
    ];

    function playNote(freq, duration) {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }

    function startMelodyLoop() {
        let noteIdx = 0;
        function step() {
            if (!isMusicPlaying) return;
            const current = notes[noteIdx];
            playNote(current.note, current.duration);
            noteIdx = (noteIdx + 1) % notes.length;
            timerId = setTimeout(step, current.duration * 600);
        }
        step();
    }

    function toggleMusic() {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        isMusicPlaying = !isMusicPlaying;
        if (isMusicPlaying) {
            musicWaves.classList.add('playing');
            startMelodyLoop();
        } else {
            musicWaves.classList.remove('playing');
            clearTimeout(timerId);
        }
    }

    musicBtn.addEventListener('click', toggleMusic);

    function playBirthdayTune() {
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        // Play quick celebration chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
            setTimeout(() => playNote(freq, 0.5), idx * 120);
        });
    }

    function playGiftSound() {
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        [349.23, 440.00, 523.25, 698.46].forEach((freq, idx) => {
            setTimeout(() => playNote(freq, 0.4), idx * 100);
        });
    }

    // ----------------------------------------------------------------------
    // 10. PASSCODE LOCK OVERLAY LOGIC (CODE: 050168)
    // ----------------------------------------------------------------------
    const CORRECT_PIN = "050168";
    let enteredPin = "";

    const passcodeOverlay = document.getElementById('passcodeOverlay');
    const passcodeCard = passcodeOverlay ? passcodeOverlay.querySelector('.passcode-card') : null;
    const passcodeError = document.getElementById('passcodeError');
    const hintBtn = document.getElementById('hintBtn');
    const hintText = document.getElementById('hintText');
    const delKey = document.getElementById('delKey');

    function updatePinDots() {
        for (let i = 0; i < 6; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (dot) {
                if (i < enteredPin.length) {
                    dot.classList.add('filled');
                } else {
                    dot.classList.remove('filled');
                }
            }
        }
    }

    function checkPin() {
        if (enteredPin === CORRECT_PIN) {
            passcodeError.textContent = "✨ รหัสผ่านถูกต้องแล้ว! ยินดีต้อนรับนะ 💖";
            passcodeError.style.color = "#2E7D32";
            playBirthdayTune();
            if (typeof confetti === 'function') {
                confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            }
            setTimeout(() => {
                passcodeOverlay.classList.remove('active');
            }, 600);
        } else {
            if (passcodeCard) {
                passcodeCard.classList.add('shake');
                setTimeout(() => passcodeCard.classList.remove('shake'), 500);
            }
            passcodeError.textContent = "❌ รหัสผ่านไม่ถูกต้องน้า ลองอีกครั้ง! 💖";
            passcodeError.style.color = "#D32F2F";
            setTimeout(() => {
                enteredPin = "";
                updatePinDots();
            }, 600);
        }
    }

    document.querySelectorAll('.keypad .key-btn[data-key]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (enteredPin.length < 6) {
                enteredPin += e.target.getAttribute('data-key');
                updatePinDots();
                passcodeError.textContent = "";
                if (enteredPin.length === 6) {
                    setTimeout(checkPin, 200);
                }
            }
        });
    });

    if (delKey) {
        delKey.addEventListener('click', () => {
            if (enteredPin.length > 0) {
                enteredPin = enteredPin.slice(0, -1);
                updatePinDots();
                passcodeError.textContent = "";
            }
        });
    }

    if (hintBtn && hintText) {
        hintBtn.addEventListener('click', () => {
            hintText.classList.toggle('active');
        });
    }

    // Keyboard entry support
    window.addEventListener('keydown', (e) => {
        if (!passcodeOverlay || !passcodeOverlay.classList.contains('active')) return;
        if (e.key >= '0' && e.key <= '9') {
            if (enteredPin.length < 6) {
                enteredPin += e.key;
                updatePinDots();
                passcodeError.textContent = "";
                if (enteredPin.length === 6) {
                    setTimeout(checkPin, 200);
                }
            }
        } else if (e.key === 'Backspace') {
            if (enteredPin.length > 0) {
                enteredPin = enteredPin.slice(0, -1);
                updatePinDots();
                passcodeError.textContent = "";
            }
        }
    });

    // ----------------------------------------------------------------------
    // 11. PLAYFUL RUNAWAY REJECT BUTTON TRICK
    // ----------------------------------------------------------------------
    const acceptLoveBtn = document.getElementById('acceptLoveBtn');
    const rejectLoveBtn = document.getElementById('rejectLoveBtn');
    const quizResultMessage = document.getElementById('quizResultMessage');

    let rejectCount = 0;
    const rejectPhrases = [
        "ปฏิเสธ 😜",
        "กดไม่ได้หรอก 😜",
        "เอ๊ะ หนีแล้วนะ! 🏃‍♂️",
        "ต้องกดตกลงสิ 🥺",
        "ไม่ให้ปฏิเสธหรอก 💕",
        "ตกลงเถอะน้า 🥰",
        "ปุ่มนี้พังแล้ว กดตกลงได้เลย 💖"
    ];

    function moveRejectButton() {
        rejectCount++;
        
        // Scale accept button larger every time
        const newScale = Math.min(1 + rejectCount * 0.25, 2.2);
        acceptLoveBtn.style.transform = `scale(${newScale})`;
        acceptLoveBtn.style.zIndex = "100";

        // Change text of reject button
        const phraseIndex = Math.min(rejectCount, rejectPhrases.length - 1);
        rejectLoveBtn.innerHTML = `<i class="fa-solid fa-xmark"></i> ${rejectPhrases[phraseIndex]}`;

        // Calculate random position inside viewport
        const padding = 100;
        const maxX = window.innerWidth - padding - 150;
        const maxY = window.innerHeight - padding - 60;
        const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
        const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

        rejectLoveBtn.style.position = 'fixed';
        rejectLoveBtn.style.left = `${randomX}px`;
        rejectLoveBtn.style.top = `${randomY}px`;
        rejectLoveBtn.style.zIndex = '999';
    }

    if (rejectLoveBtn) {
        rejectLoveBtn.addEventListener('mouseenter', moveRejectButton);
        rejectLoveBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveRejectButton();
        });
        rejectLoveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            moveRejectButton();
        });
    }

    if (acceptLoveBtn) {
        acceptLoveBtn.addEventListener('click', () => {
            playBirthdayTune();
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.5 }
                });
            }
            quizResultMessage.innerHTML = '🎉 เย้! สัญญาแล้วนะ ห้ามคืนคำเด็ดขาดเลย! รักเธอที่สุดในโลกเลยนะ 💖🥰✨';
            acceptLoveBtn.innerHTML = '<i class="fa-solid fa-heart-circle-check"></i> สัญญากันแล้วนะ 💕';
            acceptLoveBtn.classList.remove('primary-btn');
            acceptLoveBtn.style.background = 'linear-gradient(135deg, #00C853, #64DD17)';
            acceptLoveBtn.style.transform = 'scale(1.1)';

            if (rejectLoveBtn) {
                rejectLoveBtn.style.display = 'none';
            }
        });
    }
});

