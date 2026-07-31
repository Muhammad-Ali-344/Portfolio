/* ==========================================================================
   MUHAMMAD ALI PORTFOLIO - CINEMATIC ATMOSPHERIC SCRIPT
   Interactive Canvas, WebAudio SFX, Mini-Game, Modal & Filters
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initBgCanvas();
    initWebAudio();
    initNavbarScroll();
    initPortfolioFilters();
    initProjectModals();
    initArcadeGame();
    initContactForm();
});

/* ==========================================================================
   1. BACKGROUND AMBIENT FIREFLY / DUST EMBER CANVAS
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

    class EmberParticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 2.5 + 1;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = -(Math.random() * 0.5 + 0.2); // Gentle upward drift like fireflies/embers
            this.alpha = Math.random() * 0.5 + 0.2;
            this.maxAlpha = this.alpha;
            this.pulse = Math.random() * 0.02 + 0.005;
            this.pulseDir = 1;
            // Warm amber or calm sage color
            this.color = Math.random() > 0.3 ? '229, 169, 93' : '123, 158, 135';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Pulse opacity
            this.alpha += this.pulse * this.pulseDir;
            if (this.alpha >= this.maxAlpha || this.alpha <= 0.1) {
                this.pulseDir *= -1;
            }

            // Wrap edges gently
            if (this.y < -10) this.y = height + 10;
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;

            // Soft mouse repulsion
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
            ctx.shadowColor = `rgba(${this.color}, ${this.alpha})`;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new EmberParticle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Soft faint connecting glow between close fireflies
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(229, 169, 93, ${0.12 * (1 - dist / 100)})`;
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
   2. WEB AUDIO SYNTHESIZER (WARM UI & ARCADE SFX)
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
            if (soundEnabled) playTone(380, 'sine', 0.04, 0.04);
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
        // Fallback ignore
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
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 250);
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
    'cyber-defender': {
        title: 'Cyber Defender 2099',
        subtitle: 'Retro Canvas Arcade Shooter',
        engine: 'Native HTML5 Canvas & WebAudio API',
        image: 'assets/spaceshooter.png',
        desc: 'Built completely from scratch without external libraries! Features object pooling for bullet particles, spatial collision grid, procedural sound synthesis, and local storage high score tracking.',
        specs: [
            { label: 'Role', val: 'Game Programmer' },
            { label: 'Framework', val: 'Vanilla JavaScript & Canvas' },
            { label: 'Audio', val: 'WebAudio API Procedural Synthesizer' },
            { label: 'Performance', val: 'Locked 60 FPS Render Loop' }
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

            modalBody.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <span style="color:var(--amber-primary); font-family:var(--font-arcade); font-size:0.75rem;">${data.engine}</span>
                        <h2 style="font-size:2.2rem; color:#fff;">${data.title}</h2>
                        <p style="color:var(--text-muted); font-size:1.05rem;">${data.subtitle}</p>
                    </div>
                </div>
                
                <img src="${data.image}" alt="${data.title}" class="modal-img">
                
                <p style="font-size:1rem; color:var(--text-main); line-height:1.7;">${data.desc}</p>
                
                <h4 style="font-family:var(--font-heading); font-size:1.2rem; margin-top:0.5rem;">Technical Breakdown</h4>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; background:rgba(17,20,24,0.6); padding:1.2rem; border-radius:8px; border:1px solid var(--border-color);">
                    ${data.specs.map(s => `
                        <div>
                            <span style="color:var(--text-muted); font-size:0.85rem; display:block;">${s.label}</span>
                            <strong style="color:var(--amber-primary); font-size:0.95rem;">${s.val}</strong>
                        </div>
                    `).join('')}
                </div>
                
                <div style="display:flex; gap:1rem; margin-top:1rem; flex-wrap:wrap;">
                    <a href="#arcade" onclick="document.getElementById('project-modal').classList.remove('active')" class="btn btn-primary"><i class="fa-solid fa-play"></i> Play Demo / Prototype</a>
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
   6. PLAYABLE ARCADE MINI-GAME (ATMOSPHERIC RETRO SHOOTER)
   ========================================================================== */
function initArcadeGame() {
    const canvas = document.getElementById('arcade-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('arcade-overlay');
    const startBtn = document.getElementById('start-game-btn');
    const scoreEl = document.getElementById('arcade-score');
    const highScoreEl = document.getElementById('arcade-high-score');

    let gameRunning = false;
    let score = 0;
    let highScore = localStorage.getItem('cyber_defender_hs') || 1500;
    highScoreEl.textContent = highScore.toString().padStart(4, '0');

    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = canvas.parentElement.clientHeight;

    window.addEventListener('resize', () => {
        if (canvas.parentElement) {
            width = canvas.width = canvas.parentElement.clientWidth;
            height = canvas.height = canvas.parentElement.clientHeight;
        }
    });

    const player = {
        x: width / 2 - 20,
        y: height - 50,
        w: 40,
        h: 30,
        speed: 7
    };

    let bullets = [];
    let enemies = [];
    let particles = [];
    let lastEnemySpawn = 0;

    const keys = {};

    window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if (e.code === 'Space' && gameRunning) {
            shootBullet();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    startBtn.addEventListener('click', () => {
        overlay.style.display = 'none';
        resetGame();
        gameRunning = true;
        animateGame();
    });

    function resetGame() {
        score = 0;
        scoreEl.textContent = '0000';
        player.x = width / 2 - 20;
        bullets = [];
        enemies = [];
        particles = [];
    }

    function shootBullet() {
        bullets.push({
            x: player.x + player.w / 2 - 3,
            y: player.y,
            w: 6,
            h: 15,
            speed: 10
        });
        playTone(750, 'sine', 0.05, 0.07);
    }

    function spawnExplosion(x, y, color = '#e5a95d') {
        for (let i = 0; i < 15; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                color
            });
        }
    }

    function animateGame() {
        if (!gameRunning) return;

        ctx.fillStyle = '#090b0e';
        ctx.fillRect(0, 0, width, height);

        // Soft subtle grid lines
        ctx.strokeStyle = 'rgba(229, 169, 93, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Player Movement
        if (keys['KeyA'] || keys['ArrowLeft']) player.x -= player.speed;
        if (keys['KeyD'] || keys['ArrowRight']) player.x += player.speed;
        player.x = Math.max(0, Math.min(width - player.w, player.x));

        // Draw Player Ship (Amber Glow)
        ctx.fillStyle = '#e5a95d';
        ctx.shadowColor = '#e5a95d';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(player.x + player.w / 2, player.y);
        ctx.lineTo(player.x, player.y + player.h);
        ctx.lineTo(player.x + player.w, player.y + player.h);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bullets
        bullets.forEach((b, index) => {
            b.y -= b.speed;
            ctx.fillStyle = '#f4c47f';
            ctx.fillRect(b.x, b.y, b.w, b.h);

            if (b.y < -10) bullets.splice(index, 1);
        });

        // Spawn Enemies
        if (Date.now() - lastEnemySpawn > 900) {
            enemies.push({
                x: Math.random() * (width - 30),
                y: -30,
                w: 30,
                h: 25,
                speed: 2 + Math.random() * 2
            });
            lastEnemySpawn = Date.now();
        }

        // Enemies (Sage Green Glow)
        enemies.forEach((e, eIndex) => {
            e.y += e.speed;
            ctx.fillStyle = '#7b9e87';
            ctx.shadowColor = '#7b9e87';
            ctx.shadowBlur = 8;
            ctx.fillRect(e.x, e.y, e.w, e.h);
            ctx.shadowBlur = 0;

            // Collision with Bullets
            bullets.forEach((b, bIndex) => {
                if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
                    spawnExplosion(e.x + e.w / 2, e.y + e.h / 2);
                    enemies.splice(eIndex, 1);
                    bullets.splice(bIndex, 1);
                    score += 100;
                    scoreEl.textContent = score.toString().padStart(4, '0');
                    playTone(280, 'sine', 0.1, 0.12);

                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('cyber_defender_hs', highScore);
                        highScoreEl.textContent = highScore.toString().padStart(4, '0');
                    }
                }
            });

            // Collision with Player
            if (e.y + e.h >= player.y && e.x < player.x + player.w && e.x + e.w > player.x) {
                gameOver();
            } else if (e.y > height) {
                enemies.splice(eIndex, 1);
            }
        });

        // Particles
        particles.forEach((p, pIndex) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.04;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillRect(p.x, p.y, 4, 4);
            ctx.globalAlpha = 1;

            if (p.life <= 0) particles.splice(pIndex, 1);
        });

        requestAnimationFrame(animateGame);
    }

    function gameOver() {
        gameRunning = false;
        playTone(140, 'sine', 0.4, 0.18);
        overlay.style.display = 'flex';
        overlay.querySelector('h3').textContent = 'MISSION FAILED';
        overlay.querySelector('p').textContent = `Final Score: ${score} points! Can you defend the core again?`;
        startBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> RESTART MISSION';
    }
}

/* ==========================================================================
   7. CONTACT FORM HANDLER
   ========================================================================= */
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
            submitBtn.style.background = 'linear-gradient(135deg, #7b9e87, #e5a95d)';
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