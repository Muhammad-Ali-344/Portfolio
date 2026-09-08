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
    initProfileModal();
    initContactForm();
    initHeroSequence();
    initScrollReveals();
    initInteractiveSpotlights();
    initMagneticElements();
    initBackToTop();
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
let soundEnabled = false;

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

    // Sound only on key interactive moments (clicks on primary CTA, inspect, filter buttons)
    const interactiveBtns = document.querySelectorAll('.btn-primary, .btn-inspect, .filter-btn');
    interactiveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (soundEnabled) playTone(580, 'sine', 0.08, 0.06);
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
   3. NAVBAR SCROLL, ACTIVE SECTIONS & MOBILE DRAWER
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinksContainer = document.getElementById('nav-links');

    // Scroll listener for sticky background & scroll-spy
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 140;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        // Map featured section to highlight projects link
        if (current === 'featured') {
            current = 'games';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile drawer toggle
    if (mobileToggle && navLinksContainer) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinksContainer.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
            }
            mobileToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close when clicking any nav link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navLinksContainer.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-bars';
                }
                mobileToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close when clicking outside navbar
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target)) {
                navLinksContainer.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-bars';
                }
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/* ==========================================================================
   4. PORTFOLIO FILTERING SYSTEM (ANIMATED LAYOUT)
   ========================================================================== */
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const gameCards = document.querySelectorAll('.game-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            let matchIndex = 0;

            gameCards.forEach(card => {
                const categories = (card.dataset.category || '').trim().split(/\s+/);
                const isMatch = (filter === 'all') || categories.includes(filter);

                card.classList.add('filter-transitioning');

                if (isMatch) {
                    card.classList.remove('is-hidden');
                    card.style.display = 'flex';
                    const delay = (matchIndex * 50);
                    matchIndex++;

                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, delay);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(12px) scale(0.96)';
                    setTimeout(() => {
                        if (!card.classList.contains('active-filter-match')) {
                            card.classList.add('is-hidden');
                            card.style.display = 'none';
                        }
                    }, 280);
                }
            });
        });
    });
}

/* ==========================================================================
   5. PROJECT CASE STUDY & SPECS MODAL MANAGER
   ========================================================================== */
const projectData = {
    'forgotten-train': {
        title: 'The Forgotten Train: VR Escape',
        subtitle: 'Virtual Reality Puzzle Escape Game · 100% Solo Built from Scratch',
        engine: 'Unity 3D (URP), C#, XR Interaction Toolkit, Blender 3D, Substance Painter',
        role: 'Solo Developer & 3D Artist (100% Made from Scratch: 3D Models, Textures, Code & UI)',
        image: 'assets/forgotten_train.jpg',
        fallbackImage: 'assets/forgotten_train.jpg',
        desc: 'An atmospheric VR escape room game set inside an accelerating vintage Victorian train carriage hurtling through misty mountain terrain. Created 100% independently from the ground up: every 3D environment asset, mechanical puzzle prop, and carriage structure was manually modeled and textured, paired with custom gameplay code, diegetic in-world VR UI, tactile hand physics, and intricate lock & puzzle mechanics.',
        gallery: [
            'assets/forgotten_train.jpg',
            'assets/forgotten_train/train_1.jpg',
            'assets/forgotten_train/train_2.jpg',
            'assets/forgotten_train/train_3.jpg',
            'assets/forgotten_train/train_4.jpg',
            'assets/forgotten_train/train_5.jpg',
            'assets/forgotten_train/train_6.jpg'
        ],
        videoDemo: 'placeholder',
        contributions: [
            '100% Solo Development: Handcrafted every single component of the project from scratch without premade asset packs — including all 3D modeling, texturing, C# programming, VR physics, and spatial UI.',
            '3D Modeling from Scratch: Hand-modeled the vintage Victorian train carriage, interior seating, luggage racks, clockwork puzzle mechanisms, keys, lockboxes, and brass gauges in Blender 3D.',
            'Custom PBR Texturing: Hand-authored all PBR material maps (weathered wood grains, polished brass, rusted iron gears, fabric upholstery, and frosted glass) in Substance Painter.',
            'VR Physical Interactions: Architected core VR tactile mechanics using Unity XR Interaction Toolkit (two-handed object grabs, socket docking, rotational valves, pull levers, and physical keyhole turning).',
            'Diegetic In-Game UI / UX: Designed immersive in-world VR interfaces, tactile wrist dials, physical notebook clues, and custom haptic feedback for Meta Quest touch controllers.',
            'Puzzle & State Architecture: Programmed cascading puzzle state logic, mechanical lock feedback, interactive drawer/compartment physics, and spatial audio cues.'
        ],
        challenge: 'Designing stable, tactile physical hand interactions and realistic continuous collision responses within the confined space of a moving train carriage without physics clipping or unstable jitter.',
        solution: 'Implemented custom physics-based hand grab constraints and kinematic secondary dampening on interactables, paired with continuous dynamic collision detection and responsive haptic pulses to deliver authentic weight, tactile resistance, and solid feel when manipulating locks, levers, and carriage mechanisms.',
        specs: [
            { label: 'Role & Scope', val: '100% Solo Creator (Code, 3D Models, Textures, UI & Mechanics)' },
            { label: 'Workflow', val: '100% Made from Scratch (No Premade Asset Packs)' },
            { label: 'Art & Texturing', val: 'Blender 3D, Substance Painter (PBR Materials)' },
            { label: 'Engine & Pipeline', val: 'Unity 3D (URP), C#' },
            { label: 'Target Platforms', val: 'Meta Quest 2/3 / PC VR (SteamVR)' },
            { label: 'Interaction Systems', val: 'XR Interaction Toolkit, Physics Hands, Diegetic VR UI' },
            { label: 'Key Mechanics', val: 'Tactile Lock & Key, Kinetic Levers, Clockwork Puzzles' }
        ]
    },
    'selah-charades': {
        title: 'Selah: Bible Charades',
        subtitle: '2D Mobile Party Game · Available on Google Play',
        engine: 'Unity 2D (C# / Mobile / URP)',
        role: 'Lead Unity Developer & Mechanics Programmer',
        image: 'assets/Selah.png',
        desc: 'A faith-filled, forehead-style mobile party game developed with Unity 2D. Features interactive tilt-based mechanics where players guess Bible-themed words before time expires, full in-game video recording of player reactions saved directly to device storage, remotely configurable card decks, and complete Google Play monetization integration.',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.selah.bible.headsup.quiz.games&hl=en-US',
        gallery: [
            'assets/Selah.png'
        ],
        videoDemo: 'placeholder',
        contributions: [
            'Developed core gameplay controls with gyroscope and accelerometer tilt detection for seamless guess/pass motions.',
            'Implemented in-game video recording system capturing forehead-level reactions and exporting to device media storage.',
            'Integrated remotely configurable deck values for dynamic live updates without requiring full app store updates.',
            'Designed and developed the user interface flow, round timers, animated category cards, and results screens.',
            'Integrated Google Play In-App Purchases (IAP) and AdMob monetization architecture.'
        ],
        challenge: 'Capturing real-time in-game video recording of players’ expressions during high-energy party gameplay without generating memory spikes, thermal throttling, or dropped frames on low-to-mid-range Android smartphones.',
        solution: 'Utilized hardware-accelerated texture buffers with asynchronous background encoding pipelines directly targeting native Android storage streams, decoupling frame capture from the main 60 FPS Unity render thread.',
        specs: [
            { label: 'Role', val: 'Lead Unity Developer & Mechanics Programmer' },
            { label: 'Tech Stack', val: 'Unity 2D, C#, URP Mobile' },
            { label: 'Services', val: 'Google Play Services, Remote Config, IAP, AdMob' },
            { label: 'Key Systems', val: 'Video Recording, Gyro Tilt Controls, Deck Config' }
        ]
    },
    'jewel-crush': {
        title: 'Jewel Crush Quest: Match 3',
        subtitle: '2D Match-3 Mobile Puzzle · Available on Google Play',
        engine: 'Unity 2D (C# / Android)',
        role: 'Gameplay Programmer & UI/UX Specialist',
        image: 'assets/Jewel_Crush.png',
        desc: 'A vibrant match-3 mobile puzzle game featuring interactive tutorial onboarding, redesigned responsive UI panels, enhanced gem-matching animations, and polished juice with rewarding combo cascades.',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.kurlybrackets.jewelswap',
        gallery: [
            'assets/Jewel_Crush.png'
        ],
        videoDemo: 'placeholder',
        contributions: [
            'Designed and implemented an interactive in-game tutorial system guiding new players through basic matches and special combo creation.',
            'Redesigned responsive UI panels, score counters, and win/loss dialogs across diverse phone aspect ratios.',
            'Enhanced visual juice with particle bursts, screen shakes, and tweening animations for explosive cascades.',
            'Polished touch input responsiveness and gem-swapping feel with tactile spring animations.'
        ],
        challenge: 'Eliminating layout clipping and input misalignment across non-standard aspect ratios while making multi-tier gem cascades feel punchy and responsive without animation backlog lag.',
        solution: 'Refactored canvas anchors to a unified layout framework and implemented dynamic event-driven tween queues that speed up animation playback when players trigger rapid successive combos.',
        specs: [
            { label: 'Role', val: 'Gameplay Programmer & UI/UX Specialist' },
            { label: 'Tech Stack', val: 'Unity 2D, C#, Animation Systems' },
            { label: 'Platform', val: 'Android / Google Play' },
            { label: 'Key Systems', val: 'Tutorial System, UI/UX Redesign, VFX & Juice' }
        ]
    },
    'block-puzzle': {
        title: '2468 Block Puzzle: 2048 Merge',
        subtitle: '2D Number Merge Puzzle · Available on Google Play',
        engine: 'Unity 2D (C# / Firebase / Android)',
        role: 'Full Gameplay & Backend Developer',
        image: 'assets/Block_Puzzle.png',
        desc: 'An addictive 2048 number-merging block puzzle title where players connect numbered tiles to reach 2048, 2468, and beyond. Built with real-time cloud leaderboards, player authentication, in-game analytics, tutorials, and full monetization.',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=stone.puzzle.merge.connect',
        gallery: [
            'assets/Block_Puzzle.png'
        ],
        videoDemo: 'placeholder',
        contributions: [
            'Developed and implemented the core grid mathematics and merging mechanics from scratch.',
            'Integrated Firebase Realtime Database for live global and weekly high score leaderboards.',
            'Implemented Firebase Authentication for persistent cross-session player profiles.',
            'Configured Firebase Analytics and Crashlytics for user retention tracking and crash diagnostics.',
            'Engineered interactive tutorial steps teaching multi-tile combo merges.',
            'Integrated AdMob banners, interstitials, and rewarded ads alongside IAP features.'
        ],
        challenge: 'Managing high-frequency leaderboard write requests and handling intermittent offline gameplay without data corruption or lost high scores.',
        solution: 'Implemented atomic local database caching with transactional synchronization upon network reconnection, verified with Firebase server-side timestamp validation.',
        specs: [
            { label: 'Role', val: 'Full Gameplay & Backend Developer' },
            { label: 'Tech Stack', val: 'Unity 2D, C#, Firebase Suite' },
            { label: 'Backend Services', val: 'Realtime Database, Auth, Crashlytics, Analytics' },
            { label: 'Monetization & UX', val: 'AdMob, IAP, Interactive Tutorial, Leaderboards' }
        ]
    },
    'mr-greedy': {
        title: 'Mr Greedy: Ragdoll Punch',
        subtitle: '3D Ragdoll Physics Mobile Game · Available on Google Play',
        engine: 'Unity 3D (C# / Mobile)',
        role: 'Gameplay Systems & Level Designer (200+ Levels)',
        image: 'assets/Greedy_Ragdoll .png',
        desc: 'A hilarious 3D ragdoll physics mobile brawler where players punch, launch, and demolish enemies across 200+ handcrafted levels. Built from the ground up with tight touch controls, interactive tutorial onboarding, polished UI systems, and satisfying physics-driven gameplay.',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.cbjstudios.mrgreedypunch&hl=en-US',
        gallery: [
            'assets/Greedy_Ragdoll .png'
        ],
        videoDemo: 'placeholder',
        contributions: [
            'Handcrafted 200+ progressive gameplay levels balancing obstacle layouts, enemy counts, and physical traps.',
            'Developed and tuned ragdoll joint physics, impact impulse multipliers, and knockout triggers.',
            'Implemented touch swipe-and-punch control schemes with directional aiming indicators.',
            'Created interactive tutorial steps demonstrating ragdoll combos and environmental hazards.',
            'Designed and hooked up full UI flow including stage selection, star ratings, and shop interfaces.'
        ],
        challenge: 'Maintaining physical joint stability for humanoid ragdolls during extreme impact impulses without limbs popping out of sockets or penetrating floor colliders.',
        solution: 'Implemented continuous collision detection on key bone colliders, tuned configurable joint angular drive dampening, and clamped maximum instantaneous angular velocities during punch impacts.',
        specs: [
            { label: 'Role', val: 'Gameplay Systems & Level Designer' },
            { label: 'Tech Stack', val: 'Unity 3D, C#, 3D Physics, Ragdoll Systems' },
            { label: 'Platform', val: 'Android / Google Play' },
            { label: 'Key Systems', val: 'Ragdoll Physics, 200+ Handcrafted Levels, Touch Controls' }
        ]
    },
    'snake-escape': {
        title: 'Snake Escape: Tap Out Puzzle',
        subtitle: '2D Logic Tap Out Mobile Puzzle · Available on Google Play',
        engine: 'Unity 2D (C# / Mobile)',
        role: 'Core Mechanics & Level Designer (100+ Levels)',
        image: 'assets/Snake_Game.png',
        desc: 'A relaxing, brain-teasing 2D puzzle game where players solve tangled grid layouts by tapping snakes in the correct order to guide them to freedom. Features intuitive swipe/tap mechanics, zero-pressure zen gameplay, responsive haptic feedback, and 100+ meticulously handcrafted levels.',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.BitAdventure.SnakeEscape',
        gallery: [
            'assets/Snake_Game.png'
        ],
        videoDemo: 'placeholder',
        contributions: [
            'Created and tuned 100+ intricate puzzle levels with increasing complexity and spatial twists.',
            'Developed the core grid movement state machine and collision raycast checks.',
            'Implemented interactive tutorial onboarding introducing blocked path mechanics and directional rules.',
            'Polished visual juice including squishy head turns, smooth body following, and celebratory particle confetti.',
            'Integrated responsive mobile touch controls with haptic vibration feedback.'
        ],
        challenge: 'Calculating smooth multi-segment body slithering paths along dense, overlapping grid matrices without path overlap glitches or visual desynchronization between head and tail.',
        solution: 'Developed an optimized discrete node reservation array where each segment follows an indexed breadcrumb waypoint buffer, preventing collisions while ensuring perfectly smooth interpolated movement.',
        specs: [
            { label: 'Role', val: 'Core Mechanics & Level Designer' },
            { label: 'Tech Stack', val: 'Unity 2D, C#, UI Systems' },
            { label: 'Platform', val: 'Android / Google Play' },
            { label: 'Key Systems', val: '100+ Levels, Grid Movement, Tutorial System, Level Design' }
        ]
    },
    'cave-env': {
        title: 'Sunlit Grotto: Subterranean Cavern',
        subtitle: 'Unreal Engine 5 · Environment Section Study · Volumetric Sun Shaft & Lumen Lighting',
        engine: 'Unreal Engine 5, Lumen Indirect Illumination, Rock Meshes & Foliage',
        role: 'Environment Artist & Lighting Designer',
        image: 'assets/cave_env/cave_1.jpg',
        fallbackImage: 'assets/cave_env/cave_1.jpg',
        desc: 'A natural subterranean grotto and sinkhole cave environment study created in Unreal Engine 5. Focused on realistic verticality and lighting, the scene features stratified sedimentary rock cliff faces, a jagged ceiling rupture allowing bright volumetric sunlight to flood into the subterranean hollow, tiered stone ledges, and clusters of wild green grasses thriving in the light shaft.',
        gallery: [
            'assets/cave_env/cave_1.jpg'
        ],
        contributions: [
            'Crafted a focused natural subterranean cave section study in Unreal Engine 5.',
            'Engineered realistic overhead sunlight shaft penetrating through a natural ceiling sinkhole aperture.',
            'Utilized Unreal Engine 5 Lumen for deep subterranean indirect light bounce and soft cavity shading.',
            'Sculpted and layered stratified sedimentary rock shelves, overhangs, and cliff wall textures.',
            'Placed organic wild cave grass foliage scattered specifically along the sunlit ground and elevated stone ledges.'
        ],
        challenge: 'Preventing severe indirect light leaking in deep subterranean cave geometry while keeping real-time Lumen frame rates smooth at high resolutions.',
        solution: 'Engineered two-sided shadow casting geometry blockers encasing exterior cave meshes, tuned Lumen surface cache resolution, and balanced directional sun lux with distance field ambient occlusion.',
        specs: [
            { label: 'Role', val: 'Environment Artist & Lighting Designer' },
            { label: 'Engine', val: 'Unreal Engine 5 (UE5)' },
            { label: 'Lighting Technology', val: 'Lumen Real-Time Global Illumination & Volumetric Sunbeams' },
            { label: 'Key Features', val: 'Ceiling Skylight Aperture, Sedimentary Rock Layers, Wild Cave Grass' }
        ]
    },
    'sword-stone-env': {
        title: 'The Sword in the Stone: Ancient Courtyard',
        subtitle: 'Unreal Engine 5 · Lumen Real-Time Global Illumination & Environment Art',
        engine: 'Unreal Engine 5, Lumen Dynamic Lighting, Modular Geometry & PBR Shaders',
        role: 'Environment Artist & Lighting Designer',
        image: 'assets/sword_stone/sword_1.jpg',
        fallbackImage: 'assets/sword_stone/sword_1.jpg',
        desc: 'A legendary medieval fortress courtyard scene crafted in Unreal Engine 5. The composition centers on the iconic Arthurian sword wedged deep into an ancient boulder, enclosed by towering weathered stone fortress walls, crenellated battlements, stone column sentinels, mossy ground scatter, and bathed in crisp daytime sunlight with realistic Lumen global illumination and sky reflections.',
        gallery: [
            'assets/sword_stone/sword_1.jpg'
        ],
        contributions: [
            'Assembled and art-directed the medieval fortress courtyard in Unreal Engine 5.',
            'Created realistic Lumen global illumination setup with directional sun, sky atmosphere, and natural bounced lighting.',
            'Authored and textured multi-colored stone masonry walls, round stone columns, and ruined archways.',
            'Composed dynamic low-angle framing focusing the focal point onto the mythical sword and stone centerpiece.',
            'Populated organic ground scatter including moss patches, rocky terrain blend, and sparse wild vegetation.'
        ],
        challenge: 'Balancing harsh direct midday sunlight with soft ambient shadows across weathered stone fortifications without losing focal emphasis on the hero sword prop.',
        solution: 'Created a targeted cinematic lighting rig utilizing localized sky atmosphere scattering, contact shadows, and subtle rim lights framing the sword silhouette.',
        specs: [
            { label: 'Role', val: 'Environment Artist & Lighting Designer' },
            { label: 'Engine', val: 'Unreal Engine 5 (UE5)' },
            { label: 'Lighting Technology', val: 'Lumen Real-Time Global Illumination & Virtual Shadow Maps' },
            { label: 'Key Features', val: 'Hero Sword & Boulder, Weathered Ashlar Masonry, Stone Columns' }
        ]
    },
    'ruins-env': {
        title: 'Overgrown Sanctuary: Ancient Ivy Portal',
        subtitle: 'Unreal Engine 5 · Foliage Scattering, Lumen Lighting & Natural Daylight',
        engine: 'Unreal Engine 5, Lumen Global Illumination, Procedural Ivy & Foliage',
        role: 'Environment Artist & Foliage / Lighting Specialist',
        image: 'assets/overgrown_ruins/ruins_1.jpg',
        fallbackImage: 'assets/overgrown_ruins/ruins_1.jpg',
        desc: 'A realistic outdoor nature-reclaimed ruin environment built in Unreal Engine 5. Features weathered stone ashlar masonry walls enveloped by dense creeping ivy foliage, an aged wooden doorway with wrought-iron knocker ring, fallen moss-covered timber logs, scattered stones and bricks, and antique farming tools rendered with Lumen real-time lighting.',
        gallery: [
            'assets/overgrown_ruins/ruins_1.jpg',
            'assets/overgrown_ruins/ruins_2.jpg'
        ],
        contributions: [
            'Designed a nature-reclaimed environment layout in Unreal Engine 5 balancing dense organic foliage with weathered stone architecture.',
            'Configured realistic creeping ivy vine distribution along tall masonry walls and doorway architraves with sub-surface leaf scattering.',
            'Authored aged natural elements including rotten hollow logs, moss-covered bark textures, and rocky soil ground scatter.',
            'Engineered crisp directional sun lighting in UE5 using Lumen, featuring realistic hard shadow falloff and ambient light bounce.',
            'Dressed the foreground with period props including rustic wooden pitchforks, weathered bricks, and broken rock debris.'
        ],
        challenge: 'Distributing dense creeping ivy foliage along weathered masonry walls naturally without causing geometry budget spikes or unnatural repetition.',
        solution: 'Combined procedural vine splines with optimized foliage scatter instances, incorporating sub-surface scattering shaders for realistic leaf translucency.',
        specs: [
            { label: 'Role', val: 'Environment Artist & Foliage Specialist' },
            { label: 'Engine', val: 'Unreal Engine 5 (UE5)' },
            { label: 'Lighting Technology', val: 'Lumen Real-Time Lighting & Directional Sun Atmosphere' },
            { label: 'Key Elements', val: 'Creeping Ivy, Weathered Stone Walls, Aged Doorway, Fallen Logs & Props' }
        ]
    },
    'dungeon-env': {
        title: 'Forgotten Crypt: Medieval Courtyard',
        subtitle: 'Unreal Engine 5 · Atmospheric Lumen Dungeon Lighting & Stone Architecture',
        engine: 'Unreal Engine 5, Lumen Dynamic Lighting, Point Lights & PBR Materials',
        role: 'Environment Artist & Lighting Designer',
        image: 'assets/dungeon/dungeon_1.jpg',
        fallbackImage: 'assets/dungeon/dungeon_1.jpg',
        desc: 'A dark, atmospheric medieval dungeon courtyard and subterranean crypt gateway created in Unreal Engine 5. Built with massive stone masonry walls, heavy timber beams with hanging rusted iron chains, a reinforced arched wooden portal flanked by stacked stone pillars, a central stone staircase, and warm, flickering candlelit altar lighting casting dramatic deep shadows.',
        gallery: [
            'assets/dungeon/dungeon_1.jpg',
            'assets/dungeon/dungeon_2.jpg'
        ],
        contributions: [
            'Composed a high-atmosphere medieval courtyard scene in Unreal Engine 5 with dynamic verticality, arches, and hanging suspended chain elements.',
            'Crafted realistic weathered PBR stone masonry, rough mortar walls, and carved stone column pillars.',
            'Authored aged wooden elements: heavy beams, arched portal door with iron ring-pull, handcart, and ladder props.',
            'Engineered realistic multi-source mood lighting in UE5 with warm candle clusters on foreground pedestals and Lumen bounce fill.'
        ],
        challenge: 'Creating high-contrast dramatic mood lighting using dozens of flickering candle flame sources without triggering dynamic light overlapping penalties.',
        solution: 'Clustered proximate candle light sources into calibrated stationary radii with Lumen indirect diffuse bounce, prioritizing dynamic shadows strictly on hero altar focal points.',
        specs: [
            { label: 'Role', val: 'Environment Artist & Lighting Designer' },
            { label: 'Engine', val: 'Unreal Engine 5 (UE5)' },
            { label: 'Lighting Technology', val: 'Lumen Real-Time Global Illumination & Dynamic Candle Point Lights' },
            { label: 'Key Elements', val: 'Modular Masonry, Arched Portal, Iron Chains, Wooden Beams & Altar' }
        ]
    },
    'lighthouse-env': {
        title: 'Coastal Sentinel: Ocean Lighthouse',
        subtitle: 'Unity High Definition Render Pipeline (HDRP) · Dynamic Lighting & Volumetrics',
        engine: 'Unity HDRP, Volumetric Fog & Physically-Based Water System',
        role: 'Environment Artist & Unity HDRP Lighting Specialist',
        image: 'assets/environment/env_1.jpg',
        fallbackImage: 'assets/environment/env_1.jpg',
        desc: 'A cinematic coastal maritime environment designed and lit in Unity HDRP. Showcases an isolated stone watchtower lighthouse atop rugged sea cliffs, facing vast open ocean waters with physically simulated wave motion, volumetric clouds, sun-position lighting transitions, atmospheric haze, and distant seafaring vessels.',
        gallery: [
            'assets/environment/env_1.jpg',
            'assets/environment/env_2.jpg',
            'assets/environment/env_3.jpg'
        ],
        contributions: [
            'Architected complete maritime coastline scene using Unity High Definition Render Pipeline (HDRP).',
            'Configured physically-based ocean water shader with sub-surface scattering, foam crests, and sun glint reflections.',
            'Created multi-state time-of-day sky profiles comparing Golden Sunset and High Noon solar angles.',
            'Implemented volumetric fog, atmospheric Rayleigh scattering, and dynamic cloud shadow layers.',
            'Sculpted and textured weathered coastal rock cliffs and lighthouse tower with PBR materials.'
        ],
        challenge: 'Simulating physically accurate ocean surface displacement, crest foam, and sun glint reflections simultaneously with heavy volumetric fog in Unity HDRP.',
        solution: 'Authored a custom vertex-displacement water shader interacting with HDRP volumetric fog volumes, featuring Fresnel reflections and wave crest mask buffers.',
        specs: [
            { label: 'Role', val: 'Environment Artist & Unity HDRP Lighting Specialist' },
            { label: 'Engine & Pipeline', val: 'Unity HDRP' },
            { label: 'Key Features', val: 'Physically Based Sky, Water Shader, Volumetrics, Rock Formations' },
            { label: 'Lighting Profiles', val: 'Sunset / Golden Hour, Midday Sun, Horizon Atmospheric Fog' }
        ]
    },
    'nordic-cabin': {
        title: 'Modern Nordic Cabin: 3D Model',
        subtitle: 'Blender 3D · Modeled & Textured 100% From Scratch · Architectural Rendering',
        engine: 'Blender 3D, Procedural & PBR Texturing, Architectural Lighting',
        role: '3D Modeler & Texture Artist (100% From Scratch)',
        image: 'assets/cabin/cabin_1.jpg',
        fallbackImage: 'assets/cabin/cabin_1.jpg',
        desc: 'A complete 3D architectural project designed, modeled, textured, and rendered entirely from scratch in Blender. Featuring a minimalist Scandinavian wooden cottage with vertical timber battens, a gabled roofline with dual skylights and chimney, a recessed entrance porch with patio seating, concrete plinth foundation, and atmospheric golden-hour sunset lighting.',
        gallery: [
            'assets/cabin/cabin_1.jpg'
        ],
        contributions: [
            'Modeled the entire cabin structure from scratch in Blender using clean hard-surface geometry and modular measurements.',
            'Created detailed architectural elements including vertical wood slat cladding, window casings, skylights, and rooftop chimney.',
            'Modeled custom porch furniture (Adirondack lounge chairs) and recessed timber entryway.',
            'Authored and mapped realistic PBR wood textures, concrete foundation materials, and glass reflections from scratch.',
            'Configured golden-hour lighting with warm directional sunlight, soft ambient sky fill, and realistic shadow falloff in Blender.'
        ],
        challenge: 'Modeling clean architectural bevels and authentic vertical wood slat geometry completely from scratch without excessive polygon counts.',
        solution: 'Employed modular hard-surface workflows with weighted normal modifiers and procedural PBR wood textures mapped across seamless UV quadrants.',
        specs: [
            { label: 'Role', val: '3D Modeler & Texture Artist' },
            { label: 'Software', val: 'Blender 3D' },
            { label: 'Workflow', val: '100% Made from Scratch (Modeling, UVs & Texturing)' },
            { label: 'Style', val: 'Scandinavian Architectural Design & Golden Hour Render' }
        ]
    },
    'isometric-house': {
        title: 'Traditional Isometric House: Cutaway',
        subtitle: 'Blender 3D · Modeled & Textured 100% From Scratch · Multi-Room Cutaway Diorama',
        engine: 'Blender 3D, Custom PBR Texturing, Interior Light Design',
        role: '3D Architectural Modeler & Texture Artist (100% From Scratch)',
        image: 'assets/isometric_house/isometric_1.jpg',
        fallbackImage: 'assets/isometric_house/isometric_1.jpg',
        desc: 'An intricate, multi-room two-story traditional house cutaway modeled and textured entirely from scratch in Blender. Features an expansive layout including a living room with wooden sofa and tea table, tatami and shoji screens with landscape artwork, an open-concept kitchen and dining area, upstairs bedroom suite with canopy bed and nightstand, private soaking bathroom, and ornate wooden lattice railings throughout.',
        gallery: [
            'assets/isometric_house/isometric_1.jpg',
            'assets/isometric_house/isometric_2.jpg',
            'assets/isometric_house/isometric_3.jpg',
            'assets/isometric_house/isometric_4.jpg',
            'assets/isometric_house/isometric_5.jpg',
            'assets/isometric_house/isometric_6.jpg'
        ],
        contributions: [
            'Designed and modeled every room, architectural cutaway, and structural wall 100% from scratch in Blender.',
            'Modeled complex custom furniture assets including canopy bed, wardrobe, kitchen stove, soaking tub, wooden benches, and lattice railings.',
            'Authored all custom materials and textures (wood grain, ceramic tile floors, wall plaster, fabrics, and decorative porcelain) from scratch.',
            'Created decorative props such as ceramic tea sets, wall art, vases, floor lanterns, and pillows.',
            'Engineered realistic multi-point interior lighting, simulating warm room lamps, overhead glow, and architectural depth.'
        ],
        challenge: 'Managing dozens of detailed furniture assets and distinct interior lighting zones inside an open cutaway diorama without visual clutter.',
        solution: 'Established a unified color palette and modular scale grid in Blender, balancing cool exterior daylight with warm localized interior practical lamps.',
        specs: [
            { label: 'Role', val: '3D Architectural & Interior Modeler / Texture Artist' },
            { label: 'Software', val: 'Blender 3D' },
            { label: 'Workflow', val: '100% Made from Scratch (Modeling, Props, UVs & Texturing)' },
            { label: 'Render Style', val: 'Isometric Diorama with Warm Interior Ambient Lighting' }
        ]
    },
    'dragon-car': {
        title: 'Wyvern Beast: Dragon Hypercar',
        subtitle: '3D Concept Vehicle · Creature-Machine Hybrid Modeling & Renders',
        engine: '3D Modeling, PBR Materials & Cinematic Raytracing',
        role: 'Concept Artist & 3D Vehicle/Creature Modeler',
        image: 'assets/dragon_car/dragon_car_1.png',
        fallbackImage: 'assets/dragon_car/dragon_car_1.png',
        comparison: {
            before: 'assets/dragon_car/dragon_car_before.png',
            after: 'assets/dragon_car/dragon_car_after.png',
            beforeLabel: 'Simple / White Texture',
            afterLabel: 'Fully Textured'
        },
        desc: 'A striking fantasy automotive concept that fuses the aggressive body architecture of a high-performance supercar with the organic majesty of a winged dragon. Features a sculpted gold metallic finish, fanged predator grille, bat-like wyvern wing aerodynamics, and moody wet-asphalt night city raytraced reflections.',
        gallery: [
            'assets/dragon_car/dragon_car_1.png',
            'assets/dragon_car/dragon_car_2.png',
            'assets/dragon_car/dragon_car_3.png'
        ],
        contributions: [
            'Conceived and designed unique creature-vehicle hybrid aesthetic marrying hard-surface car panels with organic creature anatomy.',
            'Modeled aerodynamic chassis contours, custom front fascia with fanged tooth grille, and rear wing structural joints.',
            'Sculpted intricate dragon wing membranes with realistic vein ridges and leather micro-textures.',
            'Authored rich metallic gold carpaint material with clearcoat gloss and contrasting dark wing textures.',
            'Configured dramatic cinematic night city environment with wet road puddle reflections and Gothic backdrop lighting.'
        ],
        challenge: 'Harmonizing angular aerodynamic supercar sheet metal with organic creature anatomy and wing membrane folds.',
        solution: 'Developed custom transition blend surfaces connecting hard-surface chassis panels with sculpted organic wing joints and metallic multi-coat shaders.',
        specs: [
            { label: 'Role', val: 'Concept Artist & 3D Vehicle/Creature Modeler' },
            { label: 'Category', val: 'Hard-Surface & Organic Hybrid Modeling' },
            { label: 'Materials', val: 'Gold Metallic Automotive Paint & Leather Wings' },
            { label: 'Environment', val: 'Gothic Nocturnal Cityscape with Raytraced Puddles' }
        ]
    },
    'dragon-sculpt': {
        title: 'Fire Dragon: 3D Creature Sculpt',
        subtitle: 'Pixologic ZBrush · High-Poly Creature Sculpting & Hand Texturing',
        engine: 'ZBrush & Cinematic Lighting Renders',
        role: '3D Creature Sculptor & Texture Artist',
        image: 'assets/dragon/dragon_1.png',
        fallbackImage: 'assets/dragon/dragon_1.png',
        comparison: {
            before: 'assets/dragon/dragon_before.png',
            after: 'assets/dragon/dragon_after.png',
            beforeLabel: 'Simple / White Texture',
            afterLabel: 'Fully Textured'
        },
        desc: 'A high-detail 3D fantasy creature sculpt crafted and textured in Pixologic ZBrush. Developed with realistic reptilian anatomical landmarks, intricate hand-sculpted skin scales, horned head silhouettes, leather-textured wing membranes, and atmospheric fiery lighting for cinematic beauty renders.',
        gallery: [
            'assets/dragon/dragon_1.png',
            'assets/dragon/Dragon_2.png',
            'assets/dragon/Dragon_3.png',
            'assets/dragon/Dragon_4.png'
        ],
        contributions: [
            'Sculpted primary, secondary, and micro-detail creature forms from a base mesh in ZBrush.',
            'Hand-sculpted detailed horn horns, teeth, facial expressions, and horned cranial ridge.',
            'Created realistic organic scale alphas, skin wrinkle folds, and wing membrane tension.',
            'PolyPainted and textured high-frequency color variations, glowing amber eyes, and scorched chest plates.',
            'Set up multi-point rim lighting and atmospheric volcanic environment rendering.'
        ],
        challenge: 'Sculpting micro-scale reptilian skin detail across an entire dragon anatomy while maintaining anatomical volume and silhouette strength.',
        solution: 'Worked through progressive subdivision levels in ZBrush, sculpting primary muscle landmarks first, followed by secondary skin folds, and hand-painting high-frequency scales with custom alphas.',
        specs: [
            { label: 'Role', val: '3D Creature Sculptor & Texture Artist' },
            { label: 'Software', val: 'Pixologic ZBrush, Rendering Suite' },
            { label: 'Discipline', val: 'Digital Sculpting & Creature Anatomy' },
            { label: 'Details', val: 'Multi-million High-Poly Sculpt, Polypaint & Texturing' }
        ]
    },
    'neon-bike': {
        title: 'Cyberpunk Neon Bike: 3D Textures',
        subtitle: 'Substance 3D Painter · PBR Workflow · Sketchfab 3D Model',
        engine: 'Substance 3D Painter & Marmoset / Blender Renders',
        role: '3D Texture Artist & Lighting Specialist',
        image: 'assets/bike/bike_1.png',
        fallbackImage: 'assets/cyberpunk.png',
        desc: 'A complete texturing and rendering project created for a futuristic cyberpunk bike model sourced from Sketchfab. Textured with Substance 3D Painter using realistic PBR materials, custom decals, metallic edge-wear, and vibrant neon emissive details, followed by cinematic multi-angle studio lighting and 4K beauty renders.',
        gallery: [
            'assets/bike/bike_1.png',
            'assets/bike/bike_2.png',
            'assets/bike/bike_3.png',
            'assets/bike/bike_4.png',
            'assets/bike/bike_5.png',
            'assets/bike/bike_6.png',
            'assets/bike/bike_7.png',
            'assets/bike/bike_8.png',
            'assets/bike/bike_9.png',
            'assets/bike/bike_10.png'
        ],
        contributions: [
            'Imported and prepared high-fidelity motorcycle 3D mesh from Sketchfab with clean UV unwrap inspection.',
            'Authored realistic multi-layered PBR materials (Albedo, Roughness, Metallic, Normal, Ambient Occlusion).',
            'Designed vibrant cyberpunk neon emissive elements with intensity masks and bloom control.',
            'Hand-crafted procedural edge wear, scratches, dirt buildup, and carbon-fiber finish textures.',
            'Configured studio lighting, HDRIs, raytraced shadows, and high-resolution camera angles for showcase rendering.'
        ],
        challenge: 'Balancing intense emissive cyberpunk neon elements with realistic metallic edge wear and weathering without blowing out exposure.',
        solution: 'Layered micro-scratches, dust occlusion masks, and calibrated emissive color maps in Substance 3D Painter with ACES tone mapping in Marmoset.',
        specs: [
            { label: 'Role', val: '3D Texture Artist & Render Specialist' },
            { label: 'Software', val: 'Substance 3D Painter, Marmoset / Blender' },
            { label: 'Workflow', val: 'PBR Metallic/Roughness & Emissive Shading' },
            { label: 'Asset Origin', val: 'Sketchfab 3D Mesh / Hand-painted & Procedural Textures' }
        ]
    }
};

function initProjectModals() {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.getElementById('modal-close');

    function openModal(gameKey) {
        const data = projectData[gameKey];
        if (!data) return;

        const roleBadgeHtml = data.role ? `
            <div style="margin: 0.6rem 0 0.8rem 0;">
                <span class="game-role-badge" style="font-size:0.85rem; padding: 0.4rem 0.8rem;"><i class="fa-solid fa-user-gear"></i> MY ROLE: ${data.role}</span>
            </div>
        ` : '';

        const contributionsHtml = data.contributions && data.contributions.length > 0 ? `
            <h4 style="font-family:var(--font-heading); font-size:1.25rem; margin-top:1.4rem; margin-bottom: 0.6rem; color:var(--text-main);">My Key Contributions</h4>
            <ul style="padding-left:1.4rem; margin-bottom:1.4rem; color:var(--text-muted); line-height:1.8;">
                ${data.contributions.map(c => `<li style="margin-bottom:0.4rem;"><strong style="color:var(--text-main);">${c}</strong></li>`).join('')}
            </ul>
        ` : '';

        let challengeSolutionHtml = '';
        if (data.challenge && data.solution) {
            challengeSolutionHtml = `
                <div class="cs-callout-grid">
                    <div class="cs-challenge-box">
                        <div class="cs-challenge-title"><i class="fa-solid fa-triangle-exclamation"></i> TECHNICAL CHALLENGE</div>
                        <p style="font-size:0.92rem; color:var(--text-main); margin:0; line-height:1.6;">${data.challenge}</p>
                    </div>
                    <div class="cs-solution-box">
                        <div class="cs-solution-title"><i class="fa-solid fa-lightbulb"></i> ENGINEERED SOLUTION</div>
                        <p style="font-size:0.92rem; color:var(--text-main); margin:0; line-height:1.6;">${data.solution}</p>
                    </div>
                </div>
            `;
        }

        let videoHtml = '';
        if (data.videoDemo === 'placeholder') {
            videoHtml = `
                <div class="cs-video-placeholder">
                    <i class="fa-solid fa-circle-play"></i>
                    <strong style="color:var(--text-main); font-size:0.95rem;">10–20s Gameplay Demo Video / GIF</strong>
                    <span>[Gameplay Media Container — Place your recording/GIF here]</span>
                </div>
            `;
        }

        const playStoreBtn = data.playStoreUrl ? `
            <a href="${data.playStoreUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="background:linear-gradient(135deg, #01875f, #0d654a);"><i class="fa-brands fa-google-play"></i> View on Google Play</a>
        ` : '';

        // Visual Media / Gallery / Comparison Builder
        let visualMediaHtml = '';
        let comparisonHtml = '';

        if (data.comparison) {
            comparisonHtml = `
                <div class="texture-compare-wrapper">
                    <div class="texture-compare-header">
                        <span class="compare-title"><i class="fa-solid fa-sliders"></i> Texture Comparison</span>
                        <span class="compare-instruction">Drag slider left/right to compare</span>
                    </div>
                    <div class="texture-compare-container" id="texture-comparator">
                        <img src="${data.comparison.after}" alt="${data.comparison.afterLabel}" class="compare-img compare-img-after" onerror="this.onerror=null; this.src='${data.image}';">
                        <span class="compare-badge compare-badge-right">${data.comparison.afterLabel}</span>

                        <div class="compare-overlay" id="compare-overlay" style="width: 50%;">
                            <img src="${data.comparison.before}" alt="${data.comparison.beforeLabel}" class="compare-img compare-img-before" onerror="this.onerror=null; this.src='${data.image}';">
                            <span class="compare-badge compare-badge-left">${data.comparison.beforeLabel}</span>
                        </div>

                        <div class="compare-handle" id="compare-handle" style="left: 50%;">
                            <div class="compare-handle-line"></div>
                            <div class="compare-handle-button">
                                <i class="fa-solid fa-arrows-left-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (data.gallery && data.gallery.length > 0) {
            visualMediaHtml = `
                <div class="modal-gallery-container">
                    <div class="modal-main-img-wrap">
                        <img id="modal-featured-img" src="${data.image}" alt="${data.title}" class="modal-img" onerror="this.onerror=null; this.src='${data.fallbackImage || 'assets/cyberpunk.png'}';">
                    </div>
                    <div class="modal-gallery-strip">
                        ${data.gallery.map((imgSrc, idx) => `
                            <img src="${imgSrc}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-full="${imgSrc}" alt="Render angle ${idx + 1}" onerror="this.style.display='none';">
                        `).join('')}
                    </div>
                    <span style="font-size:0.8rem; color:var(--text-muted); display:block; margin-top:0.3rem;"><i class="fa-solid fa-hand-pointer"></i> Click thumbnail to inspect high-resolution view</span>
                </div>
            `;
        } else {
            visualMediaHtml = `<img src="${data.image}" alt="${data.title}" class="modal-img">`;
        }

        modalBody.innerHTML = `
            <div>
                <span style="color:var(--amber-primary); font-family:var(--font-arcade); font-size:0.75rem;">${data.engine}</span>
                <h2 style="font-size:2.2rem; color:var(--text-main); margin-top:0.3rem;">${data.title}</h2>
                <p style="color:var(--text-muted); font-size:1.05rem;">${data.subtitle}</p>
                ${roleBadgeHtml}
            </div>
            
            ${visualMediaHtml}

            ${comparisonHtml}

            ${videoHtml}
            
            <h4 style="font-family:var(--font-heading); font-size:1.25rem; margin-top:1rem; color:var(--text-main);">The Project Overview</h4>
            <p style="font-size:1rem; color:var(--text-main); line-height:1.7;">${data.desc}</p>
            
            ${contributionsHtml}

            ${challengeSolutionHtml}
            
            <h4 style="font-family:var(--font-heading); font-size:1.25rem; margin-top:1.2rem; color:var(--text-main);">Technical Breakdown</h4>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; background:rgba(245,239,230,0.8); padding:1.2rem; border-radius:8px; border:1px solid var(--border-color);">
                ${data.specs.map(s => `
                    <div>
                        <span style="color:var(--text-muted); font-size:0.85rem; display:block;">${s.label}</span>
                        <strong style="color:var(--amber-primary); font-size:0.95rem;">${s.val}</strong>
                    </div>
                `).join('')}
            </div>
            
            <div style="display:flex; gap:1rem; margin-top:1.4rem; flex-wrap:wrap;">
                ${playStoreBtn}
                <a href="#contact" class="btn btn-primary btn-modal-close-trigger"><i class="fa-solid fa-envelope"></i> Inquire About Project</a>
                <button class="btn btn-outline btn-modal-close-trigger"><i class="fa-solid fa-check"></i> Close Case Study</button>
            </div>
        `;

        if (data.comparison) {
            initComparisonSlider();
        }

        modal.classList.add('active');
    }

    // Delegated click handler for inspect buttons and modal interactions
    document.addEventListener('click', (e) => {
        const inspectBtn = e.target.closest('.btn-inspect');
        if (inspectBtn) {
            e.preventDefault();
            const gameKey = inspectBtn.dataset.game;
            openModal(gameKey);
            return;
        }

        const thumb = e.target.closest('.gallery-thumb');
        if (thumb) {
            const mainImg = document.getElementById('modal-featured-img');
            if (mainImg && thumb.dataset.full) {
                mainImg.src = thumb.dataset.full;
                document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            }
            return;
        }

        if (e.target.closest('.btn-modal-close-trigger') || e.target === closeBtn || e.target.closest('#modal-close') || e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

/* ==========================================================================
   5A. PROFILE PHOTO LIGHTBOX MODAL
   ========================================================================== */
function initProfileModal() {
    const trigger = document.getElementById('avatar-zoom-trigger');
    const profileModal = document.getElementById('profile-modal');
    const closeBtn = document.getElementById('profile-modal-close');
    if (!trigger || !profileModal) return;

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        profileModal.classList.add('active');
        playTone(600, 'sine', 0.08, 0.08);
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            profileModal.classList.remove('active');
        });
    }

    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            profileModal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profileModal.classList.contains('active')) {
            profileModal.classList.remove('active');
        }
    });
}

/* ==========================================================================
   5B. BEFORE/AFTER TEXTURE COMPARISON SLIDER (DRAGON & DRAGON CAR ONLY)
   ========================================================================== */
function initComparisonSlider() {
    const container = document.getElementById('texture-comparator');
    const overlay = document.getElementById('compare-overlay');
    const handle = document.getElementById('compare-handle');
    if (!container || !overlay || !handle) return;

    let isDragging = false;

    function syncImageWidth() {
        const beforeImg = overlay.querySelector('.compare-img-before');
        if (beforeImg) {
            beforeImg.style.width = `${container.clientWidth}px`;
        }
    }

    function updateSliderPosition(clientX) {
        const rect = container.getBoundingClientRect();
        let offsetX = clientX - rect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;

        const percentage = (offsetX / rect.width) * 100;
        overlay.style.width = `${percentage}%`;
        handle.style.left = `${percentage}%`;
        syncImageWidth();
    }

    function onPointerDown(e) {
        isDragging = true;
        container.classList.add('is-dragging');
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        updateSliderPosition(clientX);
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        updateSliderPosition(clientX);
    }

    function onPointerUp() {
        if (isDragging) {
            isDragging = false;
            container.classList.remove('is-dragging');
        }
    }

    // Initialize dimensions and bind events
    syncImageWidth();
    window.addEventListener('resize', syncImageWidth);

    // Mouse & Touch events on container and document
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);
}

/* ==========================================================================
   6. CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Delivered!';
                submitBtn.style.background = 'linear-gradient(135deg, #2e7d32, #1b5e20)';
                playTone(700, 'sine', 0.2, 0.15);
                form.reset();
            } else {
                throw new Error('Delivery failed');
            }
        } catch (error) {
            submitBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Sending Failed';
            submitBtn.style.background = 'linear-gradient(135deg, #c62828, #b71c1c)';
        } finally {
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
            }, 4000);
        }
    });
}

/* ==========================================================================
   7. HERO SEQUENTIAL ENTRANCE CHOREOGRAPHY
   ========================================================================== */
function initHeroSequence() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    // Trigger sequential reveal on first frame
    requestAnimationFrame(() => {
        setTimeout(() => {
            hero.classList.add('hero-loaded');
        }, 120);
    });
}

/* ==========================================================================
   8. VIEWPORT-BASED SCROLL REVEALS (INTERSECTION OBSERVER)
   ========================================================================== */
function initScrollReveals() {
    // If reduced motion is preferred, reveal elements immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.querySelectorAll('.section-header, .discipline-card, .game-card, .skill-category-card, .career-card, .career-timeline, .contact-info-card, .contact-form').forEach(el => {
            el.classList.add('reveal-active');
        });
        return;
    }

    // Set up elements with reveal-init classes
    const targetGroups = [
        { selector: '.section-header', stagger: false },
        { selector: '.featured-spotlight-card', stagger: false },
        { selector: '.disciplines-grid .discipline-card', stagger: true },
        { selector: '.games-grid .game-card', stagger: true },
        { selector: '.skills-grid .skill-category-card', stagger: true },
        { selector: '.career-timeline', stagger: false },
        { selector: '.career-timeline .career-card', stagger: true },
        { selector: '.contact-grid > *', stagger: true }
    ];

    targetGroups.forEach(group => {
        const elements = document.querySelectorAll(group.selector);
        elements.forEach((el, index) => {
            el.classList.add('reveal-init');
            if (group.stagger) {
                el.classList.add(`stagger-${(index % 6) + 1}`);
            }
        });
    });

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                obs.unobserve(entry.target); // Trigger once only, no annoying replaying
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-init').forEach(el => {
        observer.observe(el);
    });
}

/* ==========================================================================
   9. INTERACTIVE CARD SPOTLIGHT (MOUSE-REACTIVE)
   ========================================================================== */
function initInteractiveSpotlights() {
    // Disable mouse effects on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const cards = document.querySelectorAll('.game-card, .discipline-card, .featured-spotlight-card, .skill-category-card, .career-card');
    cards.forEach(card => {
        card.classList.add('interactive-spotlight');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/* ==========================================================================
   10. MAGNETIC MICRO-INTERACTIONS FOR BUTTONS & SPOTLIGHT IMAGE PARALLAX
   ========================================================================== */
function initMagneticElements() {
    // Disable on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    // 1. Magnetic hover on primary CTA & resume buttons
    const magneticBtns = document.querySelectorAll('.hero-cta .btn, .nav-hire-btn, .btn-resume, .spotlight-actions .btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);

            // Subtle magnetic pull (max 5px)
            const factor = 0.18;
            btn.style.transform = `translate(${x * factor}px, ${y * factor - 2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // 2. Subtle cursor parallax on Featured Spotlight Media
    const spotlightCard = document.querySelector('.featured-spotlight-card');
    const spotlightImg = document.querySelector('.spotlight-media img');
    if (spotlightCard && spotlightImg) {
        spotlightCard.addEventListener('mousemove', (e) => {
            const rect = spotlightCard.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            // Restrained, premium depth shift
            spotlightImg.style.transform = `scale(1.08) translate(${x * 12}px, ${y * 12}px)`;
        });

        spotlightCard.addEventListener('mouseleave', () => {
            spotlightImg.style.transform = '';
        });
    }

    // 3. Hero Visual subtle tilt
    const heroVisual = document.querySelector('.hero-visual');
    const heroFrame = document.querySelector('.hero-card-frame');
    if (heroVisual && heroFrame) {
        heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            heroFrame.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
        });

        heroVisual.addEventListener('mouseleave', () => {
            heroFrame.style.transform = '';
        });
    }
}

/* ==========================================================================
   11. BACK TO TOP BUTTON HANDLER
   ========================================================================== */
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 450) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        if (soundEnabled) playTone(600, 'sine', 0.1, 0.08);
    });
}