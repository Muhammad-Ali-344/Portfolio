/* ==========================================================================
   MUHAMMAD ALI PORTFOLIO - WARM LIGHT BROWN & ESPRESSO SCRIPT
   Interactive Light Canvas, WebAudio SFX, Modal & Filters
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initBgCanvas();
    initWebAudio();
    initNavbarScroll();
    initPortfolioFilters();
    initProjectModals();
    initContactForm();
});

/* ==========================================================================
   1. WARM LIGHT AMBIENT PARTICLE CANVAS
   ========================================================================== */
function initBgCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 18), 65);

    let mouse = { x: null, y: null, radius: 180 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class LightParticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 2.5 + 1;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = -(Math.random() * 0.4 + 0.1);
            this.alpha = Math.random() * 0.35 + 0.15;
            this.maxAlpha = this.alpha;
            this.pulse = Math.random() * 0.02 + 0.005;
            this.pulseDir = 1;
            // Warm Mocha or Golden Tan
            this.color = Math.random() > 0.4 ? '140, 94, 60' : '166, 116, 73';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            this.alpha += this.pulse * this.pulseDir;
            if (this.alpha >= this.maxAlpha || this.alpha <= 0.1) {
                this.pulseDir *= -1;
            }

            if (this.y < -10) this.y = height + 10;
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;

            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x -= Math.cos(angle) * force * 1.5;
                    this.y -= Math.sin(angle) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new LightParticle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(140, 94, 60, ${0.1 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   2. WEB AUDIO SYNTHESIZER
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initWebAudio() {
    const soundToggle = document.getElementById('sound-toggle');
    if (!soundToggle) return;

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        const icon = soundToggle.querySelector('i');
        const span = soundToggle.querySelector('span');

        if (soundEnabled) {
            icon.className = 'fa-solid fa-volume-high';
            span.textContent = 'SFX ON';
            playTone(520, 'sine', 0.1);
        } else {
            icon.className = 'fa-solid fa-volume-xmark';
            span.textContent = 'SFX OFF';
        }
    });

    const btns = document.querySelectorAll('.btn, .nav-link, .filter-btn, .game-card');
    btns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            if (soundEnabled) playTone(400, 'sine', 0.04, 0.04);
        });
        btn.addEventListener('click', () => {
            if (soundEnabled) playTone(650, 'sine', 0.08, 0.08);
        });
    });
}

function playTone(freq, type = 'sine', duration = 0.1, vol = 0.08) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        // Ignore fallback
    }
}

/* ==========================================================================
   3. NAVBAR SCROLL & ACTIVE SECTIONS
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   4. PORTFOLIO FILTERING SYSTEM
   ========================================================================== */
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            gameCards.forEach(card => {
                const categories = (card.dataset.category || '').trim().split(/\s+/);
                const isMatch = (filter === 'all') || categories.includes(filter);

                if (isMatch) {
                    card.classList.remove('is-hidden');
                    card.style.display = 'flex';
                    requestAnimationFrame(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    });
                } else {
                    card.classList.add('is-hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    card.style.display = 'none';
                }
            });
        });
    });
}

/* ==========================================================================
   5. PROJECT SPECS MODAL MANAGER
   ========================================================================== */
const projectData = {
    'neon-eclipse': {
        title: 'Neon Eclipse',
        subtitle: '3D Action RPG & Combat Prototype',
        engine: 'Unity 3D (C# / HDRP)',
        image: 'assets/cyberpunk.png',
        desc: 'An immersive action RPG built in Unity featuring dynamic character state machine combat, fluid parkour system, real-time lighting, and custom gameplay C# architectures.',
        specs: [
            { label: 'Role', val: 'Game Developer & Mechanics Architect' },
            { label: 'Engine', val: 'Unity 2022 LTS' },
            { label: 'Platforms', val: 'PC & Console' },
            { label: 'Features', val: 'Fluid Movement, State Machines, Custom Shader Graphs' }
        ]
    },
    'valley-eternity': {
        title: 'Valley of Eternity',
        subtitle: '3D Fantasy VR & Platforming Experience',
        engine: 'Unity VR / URP',
        image: 'assets/platformer.png',
        desc: 'A visually engaging 3D VR & platformer title with spherical gravity zones, immersive hand interaction mechanics, and optimized rendering for Quest & PC VR.',
        specs: [
            { label: 'Role', val: 'VR Gameplay Developer' },
            { label: 'Engine', val: 'Unity OpenXR / URP' },
            { label: 'Platforms', val: 'Meta Quest, SteamVR, PC' },
            { label: 'Features', val: 'Physics Hand Grabbing, VR Locomotion, Optimization' }
        ]
    },
    'aether-vfx': {
        title: 'Aether Shader Suite',
        subtitle: 'Real-time Shaders & VFX Library',
        engine: 'Technical Art (HLSL / Shader Graph)',
        image: 'assets/vfx.png',
        desc: 'A collection of optimized real-time volumetric energy shaders, water displacement nodes, dissolve effects, and particle system blueprints for Unity.',
        specs: [
            { label: 'Role', val: 'Technical Artist' },
            { label: 'Tech Stack', val: 'HLSL, Unity Shader Graph, VFX Graph' },
            { label: 'Performance', val: 'Sub-millisecond render pass' },
            { label: 'Features', val: 'Volumetric Fog, Dissolve Effects, Multi-pass Bloom' }
        ]
    },
    'selah-charades': {
        title: 'Selah: Bible Charades',
        subtitle: '2D Mobile Party Game · Available on Google Play',
        engine: 'Unity 2D (C# / Mobile)',
        image: 'assets/Selah.png',
        desc: 'A faith-filled, forehead-style mobile party game developed with Unity 2D. Features interactive tilt-based mechanics where players guess Bible-themed words before time expires, full video recording of gameplay moments with device storage saving, remotely configurable card decks, and complete Google Play monetization integration.',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.selah.bible.headsup.quiz.games&hl=en-US',
        contributions: [
            'Developed core gameplay controls and tilt-based guess/pass mechanics.',
            'Implemented character animation systems and polished UI transitions.',
            'Developed in-game video recording system with direct device saving.',
            'Implemented remotely configurable deck values for dynamic live updates.',
            'Integrated In-App Purchases (IAP) and Google Play monetization features.'
        ],
        specs: [
            { label: 'Role', val: 'Lead Unity Developer & Mechanics Programmer' },
            { label: 'Tech Stack', val: 'Unity 2D, C#, URP Mobile' },
            { label: 'Services', val: 'Google Play Services, Remote Config, IAP' },
            { label: 'Key Systems', val: 'Video Recording, Animation Systems, Deck Config' }
        ]
    },
    'jewel-crush': {
        title: 'Jewel Crush Quest: Match 3',
        subtitle: '2D Match-3 Mobile Puzzle · Available on Google Play',
        engine: 'Unity 2D (C# / Android)',
        image: 'assets/Jewel_Crush.png',
        desc: 'A classic and colorful match-3 puzzle game on Android featuring hundreds of challenge levels, dynamic gem-swapping mechanics, rewarding combo cascades, and full offline accessibility.',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.kurlybrackets.jewelswap',
        contributions: [
            'Designed and implemented an interactive in-game tutorial system to guide new players through the core gameplay.',
            'Redesigned and refined UI panels to create a cleaner and more polished player experience.',
            'Improved existing animations and visual presentation to enhance the overall game feel.',
            'Polished gameplay visuals, transitions, and UI interactions for a more engaging experience.'
        ],
        specs: [
            { label: 'Role', val: 'Lead Unity Developer & Mechanics Programmer' },
            { label: 'Tech Stack', val: 'Unity 2D, C#, Animation Systems' },
            { label: 'Platform', val: 'Android / Google Play' },
            { label: 'Key Systems', val: 'Tutorial System, UI/UX Redesign, VFX & Juice' }
        ]
    },
    'block-puzzle': {
        title: '2468 Block Puzzle: 2048 Merge',
        subtitle: '2D Number Merge Puzzle · Available on Google Play',
        engine: 'Unity 2D (C# / Firebase / Android)',
        image: 'assets/Block_Puzzle.png',
        desc: 'An engaging number-merging block puzzle title where players connect numbered tiles to reach 2048, 2468, and beyond. Built with real-time cloud leaderboards, player authentication, in-game analytics, tutorials, and full monetization.',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=stone.puzzle.merge.connect',
        contributions: [
            'Developed and implemented the core gameplay mechanics and systems from the ground up.',
            'Designed and implemented an interactive tutorial system to guide new players through the game.',
            'Integrated Firebase Realtime Database for player data and leaderboard functionality.',
            'Implemented Firebase Analytics and Crashlytics for player behavior tracking, analytics, and crash monitoring.',
            'Integrated Firebase Events to track important in-game player actions and events.',
            'Implemented player login and authentication systems for a seamless player experience.',
            'Designed and developed the game’s UI panels and user interface systems.',
            'Integrated and configured in-game advertisements and In-App Purchases for monetization.',
            'Polished gameplay systems, UI interactions, and overall game flow to improve the player experience.'
        ],
        specs: [
            { label: 'Role', val: 'Lead Unity Developer & Mechanics Programmer' },
            { label: 'Tech Stack', val: 'Unity 2D, C#, Firebase Suite' },
            { label: 'Backend Services', val: 'Realtime Database, Auth, Crashlytics, Analytics' },
            { label: 'Monetization & UX', val: 'AdMob, IAP, Interactive Tutorial, Leaderboards' }
        ]
    }
};

function initProjectModals() {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close');
    const inspectBtns = document.querySelectorAll('.btn-inspect');

    inspectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const gameKey = btn.dataset.game;
            const data = projectData[gameKey];
            if (!data) return;

            const contributionsHtml = data.contributions && data.contributions.length > 0 ? `
                <h4 style="font-family:var(--font-heading); font-size:1.2rem; margin-top:1.2rem; color:var(--text-main);">What I Did / Key Contributions</h4>
                <ul style="padding-left:1.4rem; margin-bottom:1.2rem; color:var(--text-muted); line-height:1.8;">
                    ${data.contributions.map(c => `<li style="margin-bottom:0.35rem;"><strong style="color:var(--text-main);">${c}</strong></li>`).join('')}
                </ul>
            ` : '';

            const playStoreBtn = data.playStoreUrl ? `
                <a href="${data.playStoreUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="background:linear-gradient(135deg, #01875f, #0d654a);"><i class="fa-brands fa-google-play"></i> View on Google Play</a>
            ` : '';

            modalBody.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <span style="color:var(--amber-primary); font-family:var(--font-arcade); font-size:0.75rem;">${data.engine}</span>
                        <h2 style="font-size:2.2rem; color:var(--text-main);">${data.title}</h2>
                        <p style="color:var(--text-muted); font-size:1.05rem;">${data.subtitle}</p>
                    </div>
                </div>
                
                <img src="${data.image}" alt="${data.title}" class="modal-img">
                
                <p style="font-size:1rem; color:var(--text-main); line-height:1.7;">${data.desc}</p>
                
                ${contributionsHtml}
                
                <h4 style="font-family:var(--font-heading); font-size:1.2rem; margin-top:0.5rem; color:var(--text-main);">Technical Breakdown</h4>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; background:rgba(245,239,230,0.8); padding:1.2rem; border-radius:8px; border:1px solid var(--border-color);">
                    ${data.specs.map(s => `
                        <div>
                            <span style="color:var(--text-muted); font-size:0.85rem; display:block;">${s.label}</span>
                            <strong style="color:var(--amber-primary); font-size:0.95rem;">${s.val}</strong>
                        </div>
                    `).join('')}
                </div>
                
                <div style="display:flex; gap:1rem; margin-top:1.2rem; flex-wrap:wrap;">
                    ${playStoreBtn}
                    <a href="#contact" onclick="document.getElementById('project-modal').classList.remove('active')" class="btn btn-primary"><i class="fa-solid fa-envelope"></i> Inquire About Project</a>
                    <button class="btn btn-outline" onclick="document.getElementById('project-modal').classList.remove('active')"><i class="fa-solid fa-check"></i> Close Details</button>
                </div>
            `;

            modal.classList.add('active');
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

/* ==========================================================================
   6. CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');

        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Transmitting...';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Transmission Received!';
            submitBtn.style.background = 'linear-gradient(135deg, #8c5e3c, #3d2817)';
            playTone(700, 'sine', 0.2, 0.15);
            form.reset();

            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 3000);
        }, 1200);
    });
}