
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSoundSystem();
    initMobileNav();
    initProjectFilters();
    initCopyEmail();
    initScrollObserver();
    initNavHighlight();
});

/* THEME TOGGLE SYSTEM */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlEl = document.documentElement;

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(currentTheme);
            localStorage.setItem('theme', currentTheme);
            playPopSound(currentTheme === 'dark' ? 320 : 540);
        });
    }

    function applyTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

/* TACTILE SOUND SYNTHESIZER (Web Audio API) */
let audioCtx = null;
let soundEnabled = true;

function initSoundSystem() {
    const soundToggleBtn = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');

    const savedSound = localStorage.getItem('sound_enabled');
    if (savedSound !== null) {
        soundEnabled = savedSound === 'true';
    }

    updateSoundIcon();

    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem('sound_enabled', soundEnabled);
            updateSoundIcon();
            if (soundEnabled) playPopSound(480);
        });
    }

    function updateSoundIcon() {
        if (soundIcon) {
            soundIcon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
    }

    // Attach click listeners to Neo-Brutalist buttons & interactive chips
    document.querySelectorAll('.nb-btn, .filter-btn, .skill-chip, .logo').forEach(el => {
        el.addEventListener('click', () => {
            playPopSound(420);
        });
    });
}

function playPopSound(freq = 400) {
    if (!soundEnabled) return;
    try {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, audioCtx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {
        // Fallback gracefully if Web Audio API fails
    }
}

/* MOBILE NAVIGATION DRAWER */
function initMobileNav() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileIcon = document.getElementById('mobile-icon');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('open');
            if (mobileIcon) {
                mobileIcon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
            }
        });

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                if (mobileIcon) mobileIcon.className = 'fas fa-bars';
            });
        });
    }
}

/* PROJECT CATEGORY FILTERS */
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const categories = (card.getAttribute('data-category') || '').split(' ');
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

/* COPY EMAIL & TOAST SYSTEM */
function initCopyEmail() {
    const copyBtns = [
        document.getElementById('copy-email-btn'),
        document.getElementById('contact-copy-email-btn')
    ];
    const emailText = 'info@nitinyadav.xyz';

    copyBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(emailText).then(() => {
                        showToast('Email copied to clipboard! 📋');
                    }).catch(() => {
                        fallbackCopyText(emailText);
                    });
                } else {
                    fallbackCopyText(emailText);
                }
            });
        }
    });
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showToast('Email copied to clipboard! 📋');
    } catch (err) {
        showToast('Email: info@nitinyadav.xyz');
    }
    document.body.removeChild(textArea);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');

    if (toast && toastMsg) {
        toastMsg.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
}

/* SCROLL REVEAL OBSERVER & ACTIVE NAV HIGHLIGHTING */
function initScrollObserver() {
    const sections = document.querySelectorAll('.fade-in-section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

function initNavHighlight() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}