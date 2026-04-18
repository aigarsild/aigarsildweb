/* ============================================
   AIGAR SILD - PORTFOLIO WEBSITE
   JavaScript - Interactivity & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initColorflow();
    initPricingGradient();
    initFooterGradient();
    initHeroParallax();
    initSmoothScroll();
    initScrollAnimations();
});

/* ============================================
   COLORFLOW HERO BACKGROUND
   Canvas-rendered gradient at low vertical resolution
   with image-rendering: pixelated for scanline effect.
   ============================================ */
function initColorflow() {
    const display = document.getElementById('hero-canvas');
    if (!display) return;

    const dispCtx = display.getContext('2d');
    const BASE_BAND = 16;   // scanline band height (px)

    // Offscreen canvas at low vertical resolution for soft pixelation
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');

    // Static noise texture — generated once, composited each frame
    const noiseCanvas = document.createElement('canvas');
    const noiseCtx = noiseCanvas.getContext('2d');
    let noiseReady = false;

    function generateNoise(w, h) {
        noiseCanvas.width = w;
        noiseCanvas.height = h;
        const imgData = noiseCtx.createImageData(w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = Math.random() * 255;
            d[i] = d[i + 1] = d[i + 2] = v;
            d[i + 3] = 255;
        }
        noiseCtx.putImageData(imgData, 0, 0);
        noiseReady = true;
    }

    // Draw an elliptical radial gradient
    function ellipseGradient(c, cx, cy, rx, ry, stops) {
        const r = Math.max(rx, ry);
        const grad = c.createRadialGradient(cx, cy, 0, cx, cy, r);
        stops.forEach(s => grad.addColorStop(s[0], s[1]));
        c.save();
        c.translate(cx, cy);
        c.scale(rx / r, ry / r);
        c.translate(-cx, -cy);
        c.fillStyle = grad;
        c.fillRect(cx - r, cy - r, r * 2, r * 2);
        c.restore();
    }

    // Paint smooth gradient mesh per pixel-column (static, no animation).
    function paintScene(c, w, h) {
        c.fillStyle = 'rgb(10, 14, 26)';
        c.fillRect(0, 0, w, h);

        // Per-column vertical gradient — wide, gentle transitions
        for (let x = 0; x < w; x++) {
            const mid = 0.85;

            const grad = c.createLinearGradient(0, 0, 0, h);
            const fs = Math.max(0, Math.min(1, mid - 0.32));
            const fe = Math.max(0, Math.min(1, mid + 0.22));
            grad.addColorStop(0, 'rgba(10,14,26,1)');
            grad.addColorStop(fs, 'rgba(10,14,26,1)');
            grad.addColorStop(Math.min(1, fs + 0.08), 'rgba(18,22,40,1)');
            grad.addColorStop(Math.min(1, fs + 0.16), 'rgba(40,50,80,1)');
            grad.addColorStop(Math.min(1, mid - 0.06), 'rgba(90,105,145,1)');
            grad.addColorStop(Math.min(1, mid), 'rgba(145,158,190,1)');
            grad.addColorStop(Math.min(1, mid + 0.06), 'rgba(185,195,215,1)');
            grad.addColorStop(Math.min(1, fe - 0.06), 'rgba(210,216,230,1)');
            grad.addColorStop(Math.min(1, fe), 'rgba(220,224,236,1)');
            grad.addColorStop(1, 'rgba(225,228,238,1)');

            c.fillStyle = grad;
            c.fillRect(x, 0, 1, h);
        }

        // Dark gray wash on the right side
        const rightWash = c.createLinearGradient(w * 0.4, 0, w, 0);
        rightWash.addColorStop(0, 'rgba(10,14,26,0)');
        rightWash.addColorStop(0.3, 'rgba(15,18,30,0.3)');
        rightWash.addColorStop(0.6, 'rgba(20,24,38,0.55)');
        rightWash.addColorStop(1, 'rgba(25,30,45,0.7)');
        c.fillStyle = rightWash;
        c.fillRect(0, 0, w, h);

        // Subtle blue tint bottom-left
        ellipseGradient(c, w * -0.05, h * 0.92,
            w * 0.45, h * 0.45,
            [[0, 'rgba(40,90,255,0.5)'], [0.12, 'rgba(42,88,250,0.3)'],
             [0.28, 'rgba(35,70,210,0.12)'], [0.45, 'rgba(25,50,160,0.04)'],
             [0.65, 'rgba(18,35,110,0.01)'], [0.85, 'rgba(12,20,60,0)']]);
    }

    function draw() {
        const displayW = window.innerWidth;
        const displayH = window.innerHeight;
        const rows = Math.max(4, Math.ceil(displayH / BASE_BAND));

        // Resize offscreen buffer (full width, low vertical res — for horizontal pixel bands)
        if (offscreen.width !== displayW || offscreen.height !== rows) {
            offscreen.width = displayW;
            offscreen.height = rows;
        }

        // Resize display canvas
        if (display.width !== displayW || display.height !== displayH) {
            display.width = displayW;
            display.height = displayH;
            generateNoise(displayW, displayH);
        }

        // 1. Render gradient at low vertical resolution
        paintScene(offCtx, displayW, rows);

        // 2. Upscale with nearest-neighbor for soft pixelated bands
        dispCtx.imageSmoothingEnabled = false;
        dispCtx.clearRect(0, 0, displayW, displayH);
        dispCtx.drawImage(offscreen, 0, 0, displayW, displayH);

        // 3. Noise overlay — subtle grain texture
        if (noiseReady) {
            dispCtx.globalAlpha = 0.04;
            dispCtx.globalCompositeOperation = 'overlay';
            dispCtx.drawImage(noiseCanvas, 0, 0);
            dispCtx.globalAlpha = 1;
            dispCtx.globalCompositeOperation = 'source-over';
        }
    }

    draw();
    window.addEventListener('resize', draw);
}

/* ============================================
   PRICING SECTION GRADIENT
   Same wavy pixelated mesh, rendered inside the
   pricing container card.
   ============================================ */
function initPricingGradient() {
    const canvas = document.getElementById('pricing-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const BASE_BAND = 16;

    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');

    // Static noise texture
    const noiseCanvas = document.createElement('canvas');
    const noiseCtx = noiseCanvas.getContext('2d');
    let noiseReady = false;

    function generateNoise(w, h) {
        noiseCanvas.width = w;
        noiseCanvas.height = h;
        const imgData = noiseCtx.createImageData(w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = Math.random() * 255;
            d[i] = d[i + 1] = d[i + 2] = v;
            d[i + 3] = 255;
        }
        noiseCtx.putImageData(imgData, 0, 0);
        noiseReady = true;
    }

    // Wave layers — more pronounced for visible undulation
    const waves = [
        { freq: 0.5,  amp: 0.07,  speed: 0.04, phase: 0.8 },
        { freq: 1.0,  amp: 0.05,  speed: 0.06, phase: 2.0 },
        { freq: 1.8,  amp: 0.035, speed: 0.08, phase: 3.5 },
        { freq: 2.8,  amp: 0.02,  speed: 0.05, phase: 5.0 },
        { freq: 0.3,  amp: 0.04,  speed: 0.03, phase: 1.3 },
    ];

    function paintScene(c, w, h, t) {
        c.fillStyle = 'rgb(10, 14, 26)';
        c.fillRect(0, 0, w, h);

        for (let x = 0; x < w; x++) {
            const nx = x / w;
            let waveOffset = 0;
            for (const wv of waves) {
                waveOffset += Math.sin(nx * Math.PI * 2 * wv.freq + t * wv.speed + wv.phase) * wv.amp;
            }

            // Gradient midpoint sits at ~70% down the card
            const mid = 0.70 + waveOffset;
            const grad = c.createLinearGradient(0, 0, 0, h);
            const fs = Math.max(0, Math.min(1, mid - 0.30));
            const fe = Math.max(0, Math.min(1, mid + 0.20));
            grad.addColorStop(0, 'rgba(10,14,26,1)');
            grad.addColorStop(fs, 'rgba(10,14,26,1)');
            grad.addColorStop(Math.min(1, fs + 0.08), 'rgba(18,22,40,1)');
            grad.addColorStop(Math.min(1, fs + 0.16), 'rgba(40,50,80,1)');
            grad.addColorStop(Math.min(1, mid - 0.06), 'rgba(90,105,145,1)');
            grad.addColorStop(Math.min(1, mid), 'rgba(145,158,190,1)');
            grad.addColorStop(Math.min(1, mid + 0.06), 'rgba(185,195,215,1)');
            grad.addColorStop(Math.min(1, fe - 0.06), 'rgba(210,216,230,1)');
            grad.addColorStop(Math.min(1, fe), 'rgba(220,224,236,1)');
            grad.addColorStop(1, 'rgba(225,228,238,1)');

            c.fillStyle = grad;
            c.fillRect(x, 0, 1, h);
        }
    }

    function draw(time) {
        const container = canvas.parentElement;
        const displayW = container.offsetWidth;
        const displayH = container.offsetHeight;
        const rows = Math.max(4, Math.ceil(displayH / BASE_BAND));

        if (offscreen.width !== displayW || offscreen.height !== rows) {
            offscreen.width = displayW;
            offscreen.height = rows;
        }

        if (canvas.width !== displayW || canvas.height !== displayH) {
            canvas.width = displayW;
            canvas.height = displayH;
            generateNoise(displayW, displayH);
        }

        const t = time * 0.001;
        paintScene(offCtx, displayW, rows, t);

        // Pixelated upscale
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, displayW, displayH);
        ctx.drawImage(offscreen, 0, 0, displayW, displayH);

        // Noise overlay
        if (noiseReady) {
            ctx.globalAlpha = 0.04;
            ctx.globalCompositeOperation = 'overlay';
            ctx.drawImage(noiseCanvas, 0, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}

/* ============================================
   FOOTER GRADIENT
   Wavy pixelated mesh inside the footer card.
   Gradient flows from right side, matching reference.
   ============================================ */
function initFooterGradient() {
    const canvas = document.getElementById('footer-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const BASE_BAND = 16;

    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');

    const noiseCanvas = document.createElement('canvas');
    const noiseCtx = noiseCanvas.getContext('2d');
    let noiseReady = false;

    function generateNoise(w, h) {
        noiseCanvas.width = w;
        noiseCanvas.height = h;
        const imgData = noiseCtx.createImageData(w, h);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = Math.random() * 255;
            d[i] = d[i + 1] = d[i + 2] = v;
            d[i + 3] = 255;
        }
        noiseCtx.putImageData(imgData, 0, 0);
        noiseReady = true;
    }

    // Wave layers for footer — horizontal waves along vertical axis
    const waves = [
        { freq: 0.6,  amp: 0.08,  speed: 0.04, phase: 1.5 },
        { freq: 1.2,  amp: 0.05,  speed: 0.06, phase: 3.0 },
        { freq: 2.0,  amp: 0.035, speed: 0.08, phase: 0.7 },
        { freq: 3.0,  amp: 0.02,  speed: 0.05, phase: 4.2 },
        { freq: 0.4,  amp: 0.05,  speed: 0.03, phase: 2.1 },
    ];

    function paintScene(c, w, h, t) {
        c.fillStyle = 'rgb(10, 14, 26)';
        c.fillRect(0, 0, w, h);

        // Per-row horizontal gradient with wavy displacement
        // Gradient goes from dark (left) to lighter (right)
        for (let y = 0; y < h; y++) {
            const ny = y / h;
            let waveOffset = 0;
            for (const wv of waves) {
                waveOffset += Math.sin(ny * Math.PI * 2 * wv.freq + t * wv.speed + wv.phase) * wv.amp;
            }

            // Midpoint — wave transition sits at ~55% from left
            const mid = 0.55 + waveOffset;
            const grad = c.createLinearGradient(0, 0, w, 0);
            const fs = Math.max(0, Math.min(1, mid - 0.30));
            const fe = Math.max(0, Math.min(1, mid + 0.25));
            grad.addColorStop(0, 'rgba(10,14,26,1)');
            grad.addColorStop(fs, 'rgba(10,14,26,1)');
            grad.addColorStop(Math.min(1, fs + 0.08), 'rgba(18,22,40,1)');
            grad.addColorStop(Math.min(1, fs + 0.16), 'rgba(35,42,65,1)');
            grad.addColorStop(Math.min(1, mid - 0.06), 'rgba(70,80,110,1)');
            grad.addColorStop(Math.min(1, mid), 'rgba(110,120,150,1)');
            grad.addColorStop(Math.min(1, mid + 0.06), 'rgba(140,150,175,1)');
            grad.addColorStop(Math.min(1, fe - 0.06), 'rgba(160,168,190,1)');
            grad.addColorStop(Math.min(1, fe), 'rgba(175,182,200,1)');
            grad.addColorStop(1, 'rgba(180,186,205,1)');

            c.fillStyle = grad;
            c.fillRect(0, y, w, 1);
        }
    }

    function draw(time) {
        const container = canvas.parentElement;
        const displayW = container.offsetWidth;
        const displayH = container.offsetHeight;
        // For horizontal gradient: low horizontal res, full vertical
        const cols = Math.max(4, Math.ceil(displayW / BASE_BAND));

        if (offscreen.width !== cols || offscreen.height !== displayH) {
            offscreen.width = cols;
            offscreen.height = displayH;
        }

        if (canvas.width !== displayW || canvas.height !== displayH) {
            canvas.width = displayW;
            canvas.height = displayH;
            generateNoise(displayW, displayH);
        }

        const t = time * 0.001;
        paintScene(offCtx, cols, displayH, t);

        // Pixelated upscale (horizontal bands)
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, displayW, displayH);
        ctx.drawImage(offscreen, 0, 0, displayW, displayH);

        // Noise overlay
        if (noiseReady) {
            ctx.globalAlpha = 0.04;
            ctx.globalCompositeOperation = 'overlay';
            ctx.drawImage(noiseCanvas, 0, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}

/* ============================================
   HERO PARALLAX SCROLL-OUT
   Each element scrolls at a different speed
   for a layered depth effect
   ============================================ */
function initHeroParallax() {
    const badge = document.querySelector('.hero__badge');
    const headline = document.querySelector('.hero__headline');
    const subtitle = document.querySelector('.hero__subtitle');
    const cta = document.querySelector('.hero__cta');

    if (!badge || !headline) return;

    // Speed multipliers: higher = scrolls away faster
    const layers = [
        { el: badge, speed: 1.8, fadeOut: 0.4 },
        { el: headline, speed: 1.0, fadeOut: Infinity },
        { el: subtitle, speed: 1.3, fadeOut: 0.5 },
        { el: cta, speed: 1.4, fadeOut: 0.5 },
    ];

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const vh = window.innerHeight;
                // Only animate within the hero scroll range
                const progress = Math.min(scrollY / vh, 1);

                layers.forEach(({ el, speed, fadeOut }) => {
                    if (!el) return;
                    const yOffset = scrollY * (speed - 1);
                    const opacity = Math.max(0, 1 - progress / fadeOut);
                    el.style.transform = `translateY(${-yOffset}px)`;
                    el.style.opacity = opacity;
                });

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

/* ============================================
   SMOOTH SCROLL
   Intercept anchor links and scroll smoothly
   ============================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
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
   SCROLL FADE-IN ANIMATIONS
   Elements start invisible and fade in when
   they enter the viewport
   ============================================ */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    // Select all elements that should animate on scroll
    const selectors = [
        '.timeline__card',
        '.timeline__callout',
        '.stories__card',
        '.offer-card',
        '.about__body p',
        '.testimonial',
        '.contact__option'
    ].join(', ');

    document.querySelectorAll(selectors).forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

