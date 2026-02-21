/* ============================================
   AIGAR SILD - PORTFOLIO WEBSITE
   JavaScript - Interactivity & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initNavHighlight();
    initHeroBlobParallax();
    initServiceBlobsParallax();
    initRandomPortfolioLayout();
    initPortfolioParallax();
    initDraggableItems();
    initCtaBlobParallax();
    initSvcsStackParallax();
    initCsGallery();
    initLightbox();
});

/* ============================================
   MOBILE MENU TOGGLE
   ============================================ */
function initMobileMenu() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    const navLinks = document.querySelectorAll('.nav__link');

    if (!navToggle || !navMenu) return;

    // Toggle menu on button click
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}



/* ============================================
   RANDOM PORTFOLIO LAYOUT
   Positions case study images randomly across
   the showcase area on page load
   ============================================ */
function initRandomPortfolioLayout() {
    const container = document.querySelector('.portfolio__ui-blob');
    const items = document.querySelectorAll('.portfolio__ui-item');
    if (!container || items.length === 0) return;

    const cW = container.offsetWidth;
    const cH = container.offsetHeight;
    const isMobile = window.innerWidth <= 768;
    const rotations = [-8, -5, -2, 0, 2, 5, 8];

    if (isMobile) {
        // Band-based layout for mobile:
        // Divide the tall container into equal vertical bands — one per card —
        // so every card is guaranteed to appear in a different part of the section.
        const itemSize = 220;
        const largeSize = 280;
        const bandHeight = cH / items.length;

        items.forEach((item, i) => {
            const isLarge = item.classList.contains('portfolio__ui-item--large');
            const w = isLarge ? largeSize : itemSize;
            const h = w * 0.7;

            // Horizontal: let cards scatter across the container width, slightly
            // hanging off either edge for a natural, dynamic feel
            const minX = -w * 0.15;
            const maxX = cW - w * 0.85;
            const x = minX + Math.random() * Math.max(0, maxX - minX);

            // Vertical: place within this card's assigned band
            const bandTop = i * bandHeight;
            const bandBottom = bandTop + bandHeight;
            const minY = bandTop;
            const maxY = Math.max(bandTop, bandBottom - h);
            const y = minY + Math.random() * Math.max(0, maxY - minY);

            const rotation = rotations[i % rotations.length] + (Math.random() * 4 - 2);

            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
            item.style.width = `${w}px`;
            item.style.zIndex = Math.floor(Math.random() * 5) + 1;
            item.style.transform = `rotate(${rotation}deg)`;
            item.dataset.baseRotation = rotation;
        });

        return;
    }

    // Desktop: random scatter with overlap detection
    const itemSize = 420;
    const largeSize = 560;
    const padding = 60;
    const placed = [];

    function overlaps(x, y, w, h) {
        for (const r of placed) {
            if (x < r.x + r.w + padding && x + w + padding > r.x &&
                y < r.y + r.h + padding && y + h + padding > r.y) {
                return true;
            }
        }
        return false;
    }

    items.forEach((item, i) => {
        const isLarge = item.classList.contains('portfolio__ui-item--large');
        const w = isLarge ? largeSize : itemSize;
        const h = w * 0.7;

        let x, y, attempts = 0;
        const minX = -w * 0.25;
        const maxX = cW - w * 0.75;
        const minY = -h * 0.15;
        const maxY = cH - h * 0.5;

        do {
            x = minX + Math.random() * (maxX - minX);
            y = minY + Math.random() * (maxY - minY);
            attempts++;
        } while (overlaps(x, y, w, h) && attempts < 100);

        placed.push({ x, y, w, h });

        const rotation = rotations[i % rotations.length] + (Math.random() * 6 - 3);

        item.style.left = `${x}px`;
        item.style.top = `${y}px`;
        if (!item.classList.contains('portfolio__ui-item--large')) {
            item.style.width = `${w}px`;
        }
        item.style.zIndex = Math.floor(Math.random() * 5) + 1;
        item.style.transform = `rotate(${rotation}deg)`;
        item.dataset.baseRotation = rotation;
    });
}

/* ============================================
   PORTFOLIO PARALLAX EFFECT
   Moves items with subtle floating on scroll
   ============================================ */
function initPortfolioParallax() {
    const portfolioSection = document.querySelector('.portfolio');
    const items = document.querySelectorAll('.portfolio__ui-item');
    const backgroundBlob = document.querySelector('.portfolio__blob');

    if (!portfolioSection || items.length === 0) return;

    items.forEach(item => {
        item.style.willChange = 'transform';
    });

    if (backgroundBlob) {
        backgroundBlob.style.willChange = 'transform';
        backgroundBlob.style.transition = 'transform 0.4s ease-out';
    }

    const speeds = items.length > 0
        ? Array.from(items).map(() => ({
            x: (Math.random() - 0.5) * 120,
            y: (Math.random() - 0.5) * 160
        }))
        : [];

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const sectionTop = portfolioSection.offsetTop;
                const sectionHeight = portfolioSection.offsetHeight;

                if (scrollY + windowHeight > sectionTop - 200 && scrollY < sectionTop + sectionHeight + 200) {
                    const start = sectionTop - windowHeight;
                    const end = sectionTop + sectionHeight;
                    const progress = (scrollY - start) / (end - start);
                    const centerProgress = progress - 0.5;

                    if (backgroundBlob) {
                        const blobMoveY = centerProgress * -100;
                        backgroundBlob.style.transform = `translate(-50%, calc(-50% + ${blobMoveY}px)) rotate(-10deg)`;
                    }

                    items.forEach((item, i) => {
                        if (item.dataset.dragged === 'true') return;
                        const s = speeds[i];
                        const rotation = parseFloat(item.dataset.baseRotation) || 0;
                        const xMove = centerProgress * s.x;
                        const yMove = centerProgress * s.y;
                        // translate3d keeps items on the GPU compositor layer for smooth parallax
                        item.style.transform = `translate3d(${xMove}px, ${yMove}px, 0) rotate(${rotation}deg)`;
                    });
                }

                ticking = false;
            });
            ticking = true;
        }
    });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ============================================
   SCROLL ANIMATIONS (Intersection Observer)
   ============================================ */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements that should animate on scroll
    const animateElements = document.querySelectorAll(
        '.services__item, .project-card, .cta-section__headline'
    );

    animateElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

/* ============================================
   NAVIGATION HIGHLIGHT ON SCROLL
   ============================================ */
function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.footer__nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ============================================
   HERO BLOB 3D PARALLAX EFFECT
   Combines mouse movement (desktop) and scroll parallax
   ============================================ */
function initHeroBlobParallax() {
    const blob = document.querySelector('.hero__blob');
    const hero = document.querySelector('.hero');
    if (!blob || !hero) return;

    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;
    let ticking = false;

    // Mouse movement (Desktop only logic)
    const isDesktop = window.matchMedia('(min-width: 769px)').matches;

    if (isDesktop) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const intensity = 20;

            // Calculate cursor position relative to center
            mouseX = ((e.clientX - rect.left - centerX) / centerX) * intensity;
            mouseY = ((e.clientY - rect.top - centerY) / centerY) * intensity;

            requestUpdate();
        });

        hero.addEventListener('mouseleave', () => {
            mouseX = 0;
            mouseY = 0;
            requestUpdate();
        });
    }

    // Scroll movement (All devices)
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        requestUpdate();
    });

    function requestUpdate() {
        if (!ticking) {
            window.requestAnimationFrame(updateTransform);
            ticking = true;
        }
    }

    function updateTransform() {
        // Calculate scroll effect
        // Move blob up slightly as we scroll down (parallax lag)
        const scrollEffect = scrollY * 0.5; // Increased from 0.2

        // Calculate rotation based on both inputs
        const rotation = (mouseX * 0.1) + (scrollY * 0.02);

        // Combine inputs
        // X: governed by mouse
        // Y: governed by mouse + scroll offset (moving up)
        const finalX = mouseX;
        const finalY = mouseY + scrollEffect;

        blob.style.transform = `translate(${finalX}px, ${finalY}px) rotate(${rotation}deg)`;

        ticking = false;
    }

    // Smooth transition
    blob.style.transition = 'transform 0.1s ease-out';
}

/* ============================================
   LOGO HOVER EFFECTS
   ============================================ */
document.querySelectorAll('.hero__logo').forEach(logo => {
    logo.addEventListener('mouseenter', () => {
        logo.style.transform = 'scale(1.1)';
    });

    logo.addEventListener('mouseleave', () => {
        logo.style.transform = 'scale(1)';
    });
});

/* ============================================
   SERVICE ITEM HOVER TRAIL
   ============================================ */
document.querySelectorAll('.services__item').forEach(item => {
    item.addEventListener('mouseenter', function () {
        this.style.color = '#DDFF00';
    });

    item.addEventListener('mouseleave', function () {
        this.style.color = '#FFFFFF';
    });
});

/* ============================================
   DRAGGABLE PORTFOLIO ITEMS
   ============================================ */
function initDraggableItems() {
    const items = document.querySelectorAll('.portfolio__ui-item');
    if (!items.length) return;

    const infobox = document.getElementById('portfolioInfobox');
    const infoboxTitle = document.getElementById('infoboxTitle');
    const infoboxDesc = document.getElementById('infoboxDesc');
    const infoboxLink = document.getElementById('infoboxLink');

    let topZ = 10;
    const DRAG_THRESHOLD = 5;

    // Shared drag state — one active drag at a time
    let activeItem = null;
    let isDragging = false;
    let hasMoved = false;
    let startX = 0, startY = 0;
    let baseTranslateX = 0, baseTranslateY = 0, baseAngle = 0;

    function showInfobox(item) {
        const project = item.dataset.project;
        const desc = item.dataset.desc;
        const link = item.dataset.link;
        if (!project) return;

        items.forEach(i => {
            if (i.classList.contains('is-active')) {
                i.classList.remove('is-active');
                const rot = parseFloat(i.dataset.baseRotation) || 0;
                const m = new DOMMatrixReadOnly(getComputedStyle(i).transform);
                i.style.transform = `translate3d(${m.e}px, ${m.f}px, 0) rotate(${rot}deg)`;
            }
        });
        item.classList.add('is-active');

        const m = new DOMMatrixReadOnly(getComputedStyle(item).transform);
        item.style.transform = `translate3d(${m.e}px, ${m.f}px, 0) rotate(0deg)`;

        infoboxTitle.textContent = project;
        infoboxDesc.textContent = desc || '';
        infoboxLink.href = link || '#';
        infoboxLink.onclick = (e) => {
            if (link) {
                e.stopPropagation();
                window.location.href = link;
            }
        };
        infobox.classList.add('is-visible');
    }

    function hideInfobox() {
        infobox.classList.remove('is-visible');
        items.forEach(i => {
            if (i.classList.contains('is-active')) {
                i.classList.remove('is-active');
                const rot = parseFloat(i.dataset.baseRotation) || 0;
                const m = new DOMMatrixReadOnly(getComputedStyle(i).transform);
                i.style.transform = `translate3d(${m.e}px, ${m.f}px, 0) rotate(${rot}deg)`;
            }
        });
    }

    const infoboxClose = document.getElementById('infoboxClose');
    if (infoboxClose) {
        infoboxClose.addEventListener('click', hideInfobox);
    }

    document.addEventListener('click', (e) => {
        if (!infobox.contains(e.target) && !e.target.closest('.portfolio__ui-item')) {
            hideInfobox();
        }
    });

    window.addEventListener('scroll', () => {
        if (infobox.classList.contains('is-visible')) {
            hideInfobox();
        }
    }, { passive: true });

    function beginDrag(item, clientX, clientY) {
        activeItem = item;
        isDragging = true;
        hasMoved = false;
        startX = clientX;
        startY = clientY;

        topZ++;
        item.style.zIndex = topZ;

        const computed = getComputedStyle(item).transform;
        if (computed && computed !== 'none') {
            const m = new DOMMatrixReadOnly(computed);
            baseTranslateX = m.e;
            baseTranslateY = m.f;
            baseAngle = Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI);
        } else {
            baseTranslateX = 0;
            baseTranslateY = 0;
            baseAngle = 0;
        }

        item.classList.add('is-dragging');
        item.dataset.dragged = 'true';
    }

    function moveDrag(clientX, clientY) {
        if (!isDragging || !activeItem) return;
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
            hasMoved = true;
        }

        // translate3d forces GPU compositing for smooth movement
        activeItem.style.transform = `translate3d(${baseTranslateX + dx}px, ${baseTranslateY + dy}px, 0) rotate(${baseAngle}deg)`;
    }

    function endDrag() {
        if (!isDragging || !activeItem) return;
        isDragging = false;
        activeItem.classList.remove('is-dragging');
        showInfobox(activeItem);
        activeItem = null;
    }

    // Per-item: only the start event needs to be on the item itself
    items.forEach(item => {
        item.setAttribute('draggable', 'false');

        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            beginDrag(item, e.clientX, e.clientY);
        });

        item.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            beginDrag(item, t.clientX, t.clientY);
        }, { passive: true });
    });

    // Single document-level move/end listeners — no per-item duplication
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        moveDrag(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', endDrag);

    // Non-passive touchmove so we can call preventDefault and stop the page
    // from scrolling while the user is actively dragging a card on mobile
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Block page scroll during card drag
        const t = e.touches[0];
        moveDrag(t.clientX, t.clientY);
    }, { passive: false });

    document.addEventListener('touchend', endDrag, { passive: true });
    document.addEventListener('touchcancel', endDrag, { passive: true });
}

/* ============================================
   SERVICE BLOBS PARALLAX EFFECT
   Moves service blobs on scroll for dynamic feel
   ============================================ */
function initServiceBlobsParallax() {
    const servicesSection = document.querySelector('.services');
    const blueBlob = document.querySelector('.services__blob--blue');
    const yellowBlob = document.querySelector('.services__blob--yellow');

    if (!servicesSection || !blueBlob || !yellowBlob) return;

    // Set initial position for yellow blob
    yellowBlob.style.willChange = 'transform';
    blueBlob.style.willChange = 'transform';

    // Add smooth transition for movement
    // Using linear transition for direct scroll mapping can be jittery, 
    // but a small ease-out helps smooth out the rAF updates
    blueBlob.style.transition = 'transform 0.1s ease-out';
    yellowBlob.style.transition = 'transform 0.1s ease-out';

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const sectionTop = servicesSection.offsetTop;
                const sectionHeight = servicesSection.offsetHeight;

                // Only calculate if section is near viewport
                // Start a bit before it enters and end a bit after
                if (scrollY + windowHeight > sectionTop - 100 && scrollY < sectionTop + sectionHeight + 100) {

                    // Value from 0 to 1 as we scroll through the section
                    const start = sectionTop - windowHeight;
                    const end = sectionTop + sectionHeight;
                    const progress = (scrollY - start) / (end - start);

                    // Blue blob: moves slightly up/down and rotates
                    // Base position is center (-50%, -50%). We add offset.
                    // Moving up as we scroll down: negative Y
                    const blueMoveY = (progress - 0.5) * -200; // Increased from 100
                    const blueRotate = (progress - 0.5) * 10;

                    blueBlob.style.transform = `translate(calc(-50%), calc(-50% + ${blueMoveY}px)) rotate(${blueRotate}deg)`;

                    // Yellow blob: moves more dynamically
                    // Moves from bottom-right (base CSS) outwards or inwards
                    const yellowMoveY = (progress - 0.5) * -300; // Increased from 150
                    const yellowMoveX = (progress - 0.5) * 50;   // Moves right slightly

                    yellowBlob.style.transform = `translate(${yellowMoveX}px, ${yellowMoveY}px)`;
                }

                ticking = false;
            });

            ticking = true;
        }
    });
}

/* ============================================
   SERVICES PAGE — STACKED BLOBS PARALLAX
   ============================================ */
function initSvcsStackParallax() {
    const section = document.querySelector('.svcs-stack');
    const blob1 = document.querySelector('.svcs-stack__blob--1');
    const blob2 = document.querySelector('.svcs-stack__blob--2');
    const blob3 = document.querySelector('.svcs-stack__blob--3');

    if (!section || !blob1 || !blob2 || !blob3) return;

    [blob1, blob2, blob3].forEach(b => {
        b.style.willChange = 'transform';
        b.style.transition = 'transform 0.15s ease-out';
    });

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (scrollY + windowHeight > sectionTop - 200 && scrollY < sectionTop + sectionHeight + 200) {
                    const start = sectionTop - windowHeight;
                    const end = sectionTop + sectionHeight;
                    const progress = (scrollY - start) / (end - start);
                    const center = progress - 0.5;

                    blob1.style.transform = `translate(${center * 60}px, ${center * -80}px) rotate(${center * 5}deg)`;
                    blob2.style.transform = `translate(${center * -90}px, ${center * 140}px) rotate(${center * -12}deg)`;
                    blob3.style.transform = `translate(${center * 45}px, ${center * -200}px) rotate(${center * 15}deg)`;
                }

                ticking = false;
            });
            ticking = true;
        }
    });
}

/* ============================================
   CTA BLOB PARALLAX EFFECT
   ============================================ */
function initCtaBlobParallax() {
    const ctaSection = document.querySelector('.cta-section');
    const blob = document.querySelector('.cta-section__blob');

    if (!ctaSection || !blob) return;

    blob.style.willChange = 'transform';
    blob.style.transition = 'transform 0.15s ease-out';

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const sectionTop = ctaSection.offsetTop;
                const sectionHeight = ctaSection.offsetHeight;

                if (scrollY + windowHeight > sectionTop - 200 && scrollY < sectionTop + sectionHeight + 200) {
                    const start = sectionTop - windowHeight;
                    const end = sectionTop + sectionHeight;
                    const progress = (scrollY - start) / (end - start);
                    const center = progress - 0.5;

                    const moveY = center * -120;
                    const rotate = center * 8;

                    blob.style.transform = `translate(-50%, calc(-50% + ${moveY}px)) rotate(${rotate}deg)`;
                }

                ticking = false;
            });
            ticking = true;
        }
    });
}

/* ============================================
   CASE STUDY — FLOATING IMAGE GALLERY
   Random scatter layout + drag + click-to-lightbox
   ============================================ */
function initCsGallery() {
    const container = document.querySelector('.cs-gallery__blob');
    const items = document.querySelectorAll('.cs-gallery__item');
    if (!container || items.length === 0) return;

    const cW = container.offsetWidth;
    const cH = container.offsetHeight;
    const isMobile = window.innerWidth <= 768;
    const rotations = [-7, -4, -1, 1, 4, 7, -3, 3, -5];

    if (isMobile) {
        const itemSize = 240;
        const wideSize = 300;
        const bandHeight = cH / items.length;

        items.forEach((item, i) => {
            const isWide = item.classList.contains('cs-gallery__item--wide');
            const w = isWide ? wideSize : itemSize;
            const h = w * 0.7;

            const minX = -w * 0.1;
            const maxX = cW - w * 0.9;
            const x = minX + Math.random() * Math.max(0, maxX - minX);

            const bandTop = i * bandHeight;
            const maxY = Math.max(bandTop, bandTop + bandHeight - h);
            const y = bandTop + Math.random() * Math.max(0, maxY - bandTop);

            const rotation = rotations[i % rotations.length] + (Math.random() * 4 - 2);

            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
            item.style.width = `${w}px`;
            item.style.zIndex = Math.floor(Math.random() * 5) + 1;
            item.style.transform = `rotate(${rotation}deg)`;
            item.dataset.baseRotation = rotation;
        });
    } else {
        const itemSize = 400;
        const wideSize = 520;
        const padding = 40;
        const placed = [];

        function overlaps(x, y, w, h) {
            for (const r of placed) {
                if (x < r.x + r.w + padding && x + w + padding > r.x &&
                    y < r.y + r.h + padding && y + h + padding > r.y) {
                    return true;
                }
            }
            return false;
        }

        items.forEach((item, i) => {
            const isWide = item.classList.contains('cs-gallery__item--wide');
            const w = isWide ? wideSize : itemSize;
            const h = w * 0.65;

            let x, y, attempts = 0;
            const minX = -w * 0.15;
            const maxX = cW - w * 0.85;
            const minY = -h * 0.1;
            const maxY = cH - h * 0.4;

            do {
                x = minX + Math.random() * (maxX - minX);
                y = minY + Math.random() * (maxY - minY);
                attempts++;
            } while (overlaps(x, y, w, h) && attempts < 120);

            placed.push({ x, y, w, h });

            const rotation = rotations[i % rotations.length] + (Math.random() * 5 - 2.5);

            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
            item.style.width = `${w}px`;
            item.style.zIndex = Math.floor(Math.random() * 5) + 1;
            item.style.transform = `rotate(${rotation}deg)`;
            item.dataset.baseRotation = rotation;
        });
    }

    // Drag logic (same pattern as portfolio items)
    let topZ = 10;
    const DRAG_THRESHOLD = 5;
    let activeItem = null;
    let isDragging = false;
    let hasMoved = false;
    let startX = 0, startY = 0;
    let baseTranslateX = 0, baseTranslateY = 0, baseAngle = 0;

    function beginDrag(item, clientX, clientY) {
        activeItem = item;
        isDragging = true;
        hasMoved = false;
        startX = clientX;
        startY = clientY;
        topZ++;
        item.style.zIndex = topZ;

        const computed = getComputedStyle(item).transform;
        if (computed && computed !== 'none') {
            const m = new DOMMatrixReadOnly(computed);
            baseTranslateX = m.e;
            baseTranslateY = m.f;
            baseAngle = Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI);
        } else {
            baseTranslateX = 0;
            baseTranslateY = 0;
            baseAngle = 0;
        }
        item.classList.add('is-dragging');
    }

    function moveDrag(clientX, clientY) {
        if (!isDragging || !activeItem) return;
        const dx = clientX - startX;
        const dy = clientY - startY;
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
            hasMoved = true;
        }
        activeItem.style.transform = `translate3d(${baseTranslateX + dx}px, ${baseTranslateY + dy}px, 0) rotate(${baseAngle}deg)`;
    }

    function endDrag() {
        if (!isDragging || !activeItem) return;
        isDragging = false;
        activeItem.classList.remove('is-dragging');
        if (!hasMoved) {
            openLightbox(activeItem);
        }
        activeItem = null;
    }

    items.forEach(item => {
        item.setAttribute('draggable', 'false');

        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            beginDrag(item, e.clientX, e.clientY);
        });

        item.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            beginDrag(item, t.clientX, t.clientY);
        }, { passive: true });
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        moveDrag(e.clientX, e.clientY);
    });

    document.addEventListener('mouseup', endDrag);

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const t = e.touches[0];
        moveDrag(t.clientX, t.clientY);
    }, { passive: false });

    document.addEventListener('touchend', endDrag, { passive: true });
    document.addEventListener('touchcancel', endDrag, { passive: true });

    // Parallax on scroll
    const section = document.querySelector('.cs-gallery');
    if (!section) return;

    const speeds = Array.from(items).map(() => ({
        x: (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 140
    }));

    let pTicking = false;
    window.addEventListener('scroll', () => {
        if (!pTicking) {
            window.requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const windowHeight = window.innerHeight;
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;

                if (scrollY + windowHeight > sectionTop - 200 && scrollY < sectionTop + sectionHeight + 200) {
                    const start = sectionTop - windowHeight;
                    const end = sectionTop + sectionHeight;
                    const progress = (scrollY - start) / (end - start);
                    const centerProgress = progress - 0.5;

                    items.forEach((item, i) => {
                        if (item.classList.contains('is-dragging')) return;
                        const s = speeds[i];
                        const rotation = parseFloat(item.dataset.baseRotation) || 0;
                        const xMove = centerProgress * s.x;
                        const yMove = centerProgress * s.y;
                        item.style.transform = `translate3d(${xMove}px, ${yMove}px, 0) rotate(${rotation}deg)`;
                    });
                }
                pTicking = false;
            });
            pTicking = true;
        }
    });
}

/* ============================================
   LIGHTBOX — Full-screen image viewer
   ============================================ */
function openLightbox(imgEl) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    if (!lightbox || !lightboxImg || !imgEl) return;

    const galleryItems = Array.from(document.querySelectorAll('.cs-gallery__item'));
    lightbox._items = galleryItems;
    lightbox._currentIndex = galleryItems.indexOf(imgEl);

    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt;
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = lightbox.querySelector('.lightbox__close');
    const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    const nextBtn = lightbox.querySelector('.lightbox__nav--next');

    function close() {
        lightbox.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    function navigate(dir) {
        const items = lightbox._items;
        if (!items || !items.length) return;
        let idx = lightbox._currentIndex + dir;
        if (idx < 0) idx = items.length - 1;
        if (idx >= items.length) idx = 0;
        lightbox._currentIndex = idx;
        lightboxImg.src = items[idx].src;
        lightboxImg.alt = items[idx].alt;
    }

    closeBtn.addEventListener('click', close);
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) close();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });
}
