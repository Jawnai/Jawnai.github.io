/**
 * CYBER SECURITY / FUTURISTIC SOC CONTROLLER
 * Profile of Petty Officer First Class Thitiwut Kongsomsak (Jawnai)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all cyber components
    initCyberCanvas();
    initMobileNav();
    initScrollSpy();
    initScrollReveal();
    initThemeToggle();
    initSlideshow();
    initLightbox();
    initTimelineTabs();
    initCyberTerminal();
});

/* ==========================================================================
   1. Interactive Cyber Network Canvas (Nodes & Synapses)
   ========================================================================== */
function initCyberCanvas() {
    const canvas = document.getElementById('cyber-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    const connectionDistance = 140;
    const mouseRadius = 160;

    let mouse = { x: null, y: null };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2 + 1.2;
            this.baseColor = Math.random() > 0.3 ? 'rgba(0, 240, 255, ' : 'rgba(0, 255, 157, ';
            this.alpha = Math.random() * 0.6 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouseRadius) {
                    const force = (mouseRadius - dist) / mouseRadius;
                    this.x -= (dx / dist) * force * 1.5;
                    this.y -= (dy / dist) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${this.baseColor}${this.alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f0ff';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Packet pulse simulator
    let packet = {
        from: null,
        to: null,
        progress: 0,
        speed: 0.02
    };

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const opacity = (1 - dist / connectionDistance) * 0.22;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();

                    // Chance to trigger packet animation between connected nodes
                    if (!packet.from && Math.random() < 0.0005) {
                        packet.from = particles[i];
                        packet.to = particles[j];
                        packet.progress = 0;
                    }
                }
            }

            // Mouse connections
            if (mouse.x !== null && mouse.y !== null) {
                const mdx = particles[i].x - mouse.x;
                const mdy = particles[i].y - mouse.y;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mdist < mouseRadius) {
                    const mOpacity = (1 - mdist / mouseRadius) * 0.45;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(0, 255, 157, ${mOpacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // Render packet pulse
        if (packet.from && packet.to) {
            packet.progress += packet.speed;
            const px = packet.from.x + (packet.to.x - packet.from.x) * packet.progress;
            const py = packet.from.y + (packet.to.y - packet.from.y) * packet.progress;

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#00ff9d';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#00ff9d';
            ctx.fill();
            ctx.shadowBlur = 0;

            if (packet.progress >= 1) {
                packet.from = null;
                packet.to = null;
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   2. Mobile Navigation
   ========================================================================== */
function initMobileNav() {
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

/* ==========================================================================
   3. ScrollSpy & Sticky Navbar
   ========================================================================== */
function initScrollSpy() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section, header');
    const navItems = document.querySelectorAll('.nav-links li a');

    window.addEventListener('scroll', () => {
        // Sticky Header shrink
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active link detection
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   4. Scroll Reveal Animation
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    const checkReveal = () => {
        const triggerBottom = window.innerHeight * 0.88;
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    checkReveal();
    window.addEventListener('scroll', checkReveal);
}

/* ==========================================================================
   5. Cyber Theme Toggle (Dark Ops vs High-Tech Lab)
   ========================================================================== */
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    if (!themeBtn) return;
    const icon = themeBtn.querySelector('i');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        html.setAttribute('data-theme', 'light');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    } else {
        html.removeAttribute('data-theme');
    }

    themeBtn.addEventListener('click', () => {
        const isLight = html.getAttribute('data-theme') === 'light';
        if (isLight) {
            html.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            if (icon) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        } else {
            html.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            if (icon) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    });
}

/* ==========================================================================
   6. Slideshow System
   ========================================================================== */
let slideIndex = 1;

function initSlideshow() {
    showSlides(slideIndex);

    // Auto-advance slideshow every 6s unless hovered
    const container = document.querySelector('.slideshow-hud-container');
    let autoInterval = setInterval(() => plusSlides(1), 6000);

    if (container) {
        container.addEventListener('mouseenter', () => clearInterval(autoInterval));
        container.addEventListener('mouseleave', () => {
            clearInterval(autoInterval);
            autoInterval = setInterval(() => plusSlides(1), 6000);
        });
    }
}

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");
    const wrapper = document.getElementById("slides-wrapper");
    const counter = document.getElementById("slide-counter");

    if (!slides || slides.length === 0) return;

    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;

    if (wrapper) {
        wrapper.style.transform = `translateX(-${(slideIndex - 1) * 100}%)`;
    }

    if (counter) {
        const paddedIndex = String(slideIndex).padStart(2, '0');
        const paddedTotal = String(slides.length).padStart(2, '0');
        counter.textContent = `[EVIDENCE ${paddedIndex} / ${paddedTotal}]`;
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active-dot");
    }
    if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].classList.add("active-dot");
    }
}

/* ==========================================================================
   7. Interactive Lightbox Modal
   ========================================================================== */
function initLightbox() {
    const modal = document.getElementById('cyber-modal');
    const modalImg = document.getElementById('modal-img');
    const closeBtn = document.getElementById('modal-close');
    const slideItems = document.querySelectorAll('.mySlides img');

    if (!modal || !modalImg) return;

    slideItems.forEach(img => {
        img.addEventListener('click', () => {
            modalImg.src = img.src;
            modalImg.alt = img.alt || 'Certificate Proof';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/* ==========================================================================
   8. Timeline Tabs (Academic vs Military Training Filter)
   ========================================================================== */
function initTimelineTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const academicTimeline = document.getElementById('academic-timeline');
    const militaryGrid = document.getElementById('military-grid');

    if (!tabBtns.length || !academicTimeline || !militaryGrid) return;

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.getAttribute('data-tab');
            if (tab === 'all') {
                academicTimeline.style.display = 'block';
                militaryGrid.style.display = 'grid';
            } else if (tab === 'academic') {
                academicTimeline.style.display = 'block';
                militaryGrid.style.display = 'none';
            } else if (tab === 'military') {
                academicTimeline.style.display = 'none';
                militaryGrid.style.display = 'grid';
            }
        });
    });
}

/* ==========================================================================
   9. Interactive Cyber Terminal (SOC Terminal Emulator)
   ========================================================================== */
function initCyberTerminal() {
    const termInput = document.getElementById('term-input');
    const termBody = document.getElementById('term-body');
    const quickBtns = document.querySelectorAll('.quick-cmd-btn');

    if (!termInput || !termBody) return;

    const commands = {
        'help': 'Commands available: whoami, skills, research, ops, contact, clear, matrix, ping',
        'whoami': 'จ.อ. ฐิติวุฒิ คงสมศักดิ์ (เจ้านาย) | จนท.ปฏิบัติการ แผนกเทคโนโลยีดิจิทัล บก.รร.ชท.สปท. | Cyber Security & Network Specialist',
        'skills': 'CTF Challenge Design, Network Infrastructure, Security Awareness, Wireshark Packet Inspection, Linux (Arch/Ubuntu), IT Troubleshooting',
        'research': 'AI-driven Network Packet Anomaly Detection: Machine Learning models for Zero-Day & Exploit mitigation in defense networks.',
        'ops': 'Cybersecurity MTTS CTF Event Management, Infrastructure Hardening, IT Support, Military Network Operations',
        'contact': 'Email: thitiwut.k@rtarf.mi.th | Tel: 061-836-1116',
        'ping': 'PING 127.0.0.1 (localhost): 56 data bytes. 64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.038 ms. Connection: SECURE.',
        'matrix': 'Wake up, Neo... The Matrix has you. Follow the white rabbit.'
    };

    function executeCommand(cmd) {
        const cleanCmd = cmd.trim().toLowerCase();
        if (!cleanCmd) return;

        // Add user command to terminal body
        const cmdRow = document.createElement('div');
        cmdRow.className = 'term-line';
        cmdRow.innerHTML = `<span class="term-prompt">operator@sec-ops:~$</span> <span class="term-cmd">${escapeHtml(cleanCmd)}</span>`;
        termBody.appendChild(cmdRow);

        if (cleanCmd === 'clear') {
            termBody.innerHTML = '';
            return;
        }

        const outRow = document.createElement('div');
        outRow.className = 'term-output';

        if (commands[cleanCmd]) {
            outRow.classList.add('success');
            outRow.textContent = commands[cleanCmd];
        } else {
            outRow.style.color = '#ff3366';
            outRow.textContent = `Command not recognized: "${cleanCmd}". Type "help" for allowed commands.`;
        }

        termBody.appendChild(outRow);
        termBody.scrollTop = termBody.scrollHeight;
    }

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            executeCommand(termInput.value);
            termInput.value = '';
        }
    });

    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            if (cmd) {
                executeCommand(cmd);
            }
        });
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
