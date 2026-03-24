document.addEventListener("DOMContentLoaded", () => {

    // ===== Subtle Animated Dot Grid Background =====
    const canvas = document.getElementById("grid-bg");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let w, h, dots = [];
        const spacing = 40;

        function initGrid() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            dots = [];
            for (let x = spacing; x < w; x += spacing) {
                for (let y = spacing; y < h; y += spacing) {
                    dots.push({ x, y, base: 0.12, glow: 0 });
                }
            }
        }
        initGrid();
        
        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initGrid, 100);
        });

        let mouse = { x: -999, y: -999 };
        // Throttle mousemove for performance
        let rafPending = false;
        document.addEventListener("mousemove", e => {
            if (!rafPending) {
                requestAnimationFrame(() => {
                    mouse.x = e.clientX;
                    mouse.y = e.clientY;
                    rafPending = false;
                });
                rafPending = true;
            }
        });

        function drawGrid() {
            ctx.clearRect(0, 0, w, h);
            dots.forEach(d => {
                const dx = mouse.x - d.x, dy = mouse.y - d.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const target = dist < 120 ? 0.5 : d.base;
                d.glow += (target - d.glow) * 0.08;
                ctx.beginPath();
                ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${d.glow})`;
                ctx.fill();
            });
            requestAnimationFrame(drawGrid);
        }
        drawGrid();
    }

    // ===== Mobile Menu =====
    const burger = document.getElementById("burger");
    const navLinks = document.getElementById("nav-links");
    if (burger && navLinks) {
        burger.addEventListener("click", () => {
            burger.classList.toggle("open");
            navLinks.classList.toggle("open");
        });
        document.querySelectorAll(".nav__a").forEach(a =>
            a.addEventListener("click", () => {
                burger.classList.remove("open");
                navLinks.classList.remove("open");
            })
        );
    }

    // ===== Scroll Reveal =====
    const animEls = document.querySelectorAll(".anim");
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add("show"); obs.unobserve(e.target); }
        });
    }, { threshold: 0.08 });
    animEls.forEach(el => obs.observe(el));

    // ===== Proficiency Bars Animation =====
    const barFills = document.querySelectorAll(".bar-fill");
    const barObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const f = e.target;
                f.style.setProperty("--w", f.dataset.width + "%");
                f.classList.add("animated");
                barObs.unobserve(f);
            }
        });
    }, { threshold: 0.2 });
    barFills.forEach(el => barObs.observe(el));

    // ===== Counter Animation =====
    const mVals = document.querySelectorAll(".metric-val");
    const cObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target;
                const target = +el.dataset.target;
                let cur = 0;
                const inc = Math.max(1, Math.ceil(target / 25));
                const t = setInterval(() => {
                    cur += inc;
                    if (cur >= target) { cur = target; clearInterval(t); }
                    el.textContent = cur;
                }, 60);
                cObs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    mVals.forEach(el => cObs.observe(el));

    // ===== Typing Effect =====
    const roles = [
        "Machine Learning Engineer",
        "Data Science Enthusiast",
        "Full-Stack Developer",
        "Python Developer",
        "Problem Solver"
    ];
    let ri = 0, ci = 0, del = false, spd = 80;
    const te = document.getElementById("type-text");
    if (te) {
        (function type() {
            const w = roles[ri];
            del ? (ci--, spd = 30) : (ci++, spd = 60);
            te.textContent = w.substring(0, ci);
            if (!del && ci === w.length) { del = true; spd = 2500; }
            else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; spd = 400; }
            setTimeout(type, spd);
        })();
    }

    // ===== Active Nav =====
    const secs = document.querySelectorAll("section[id]");
    const navAs = document.querySelectorAll(".nav__a:not(.nav-cta)");
    function activeNav() {
        const y = window.scrollY;
        secs.forEach(s => {
            const top = s.offsetTop - 120, h = s.clientHeight;
            if (y >= top && y < top + h) {
                navAs.forEach(a => {
                    a.classList.remove("active");
                    if (a.getAttribute("href") === `#${s.id}`) a.classList.add("active");
                });
            }
        });
    }

    // ===== Nav Background =====
    const nav = document.getElementById("nav");
    function navScroll() { nav.classList.toggle("scrolled", window.scrollY > 40); }

    // ===== Back to Top =====
    const btt = document.getElementById("btt");
    function bttVis() { btt && btt.classList.toggle("visible", window.scrollY > 400); }
    if (btt) btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    window.addEventListener("scroll", () => { activeNav(); navScroll(); bttVis(); });
    navScroll(); bttVis();

    // ===== Copy Email to Clipboard UX =====
    const emailCard = document.getElementById("email-card");
    const emailText = document.getElementById("email-text");
    if (emailCard && emailText) {
        emailCard.addEventListener("click", async (e) => {
            e.preventDefault();
            try {
                await navigator.clipboard.writeText(emailText.textContent);
                const iconContainer = emailCard.querySelector(".copy-icon");
                const originalSVG = iconContainer.outerHTML; // Backup original icon
                
                // Show Check Icon
                iconContainer.outerHTML = '<i data-lucide="check" class="cc-arrow copy-icon" style="color:var(--green)"></i>';
                lucide.createIcons();
                
                // Reset after 2s
                setTimeout(() => {
                    const newIcon = emailCard.querySelector(".copy-icon");
                    if(newIcon) {
                        newIcon.outerHTML = originalSVG;
                        lucide.createIcons();
                    }
                }, 2000);
            } catch (err) {
                console.error("Failed to copy text: ", err);
            }
        });
    }


    // ===== security: target _blank rel patch =====
    document.querySelectorAll('a[target="_blank"]').forEach(a => {
        if (!a.hasAttribute('rel') || !a.getAttribute('rel').includes('noopener')) {
            a.setAttribute('rel', 'noopener noreferrer');
        }
    });

    // ===== email-card keyboard access =====
    if (emailCard) {
        emailCard.addEventListener('keydown', async (evt) => {
            if (evt.key === 'Enter' || evt.key === ' ') {
                evt.preventDefault();
                emailCard.click();
            }
        });
    }


    // ===== Contact Form (FormSubmit) =====
    const form = document.getElementById("contact-form");
    const sbtn = document.getElementById("sbtn");
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            sbtn.disabled = true;
            const orig = sbtn.innerHTML;
            sbtn.innerHTML = '<span class="spin-anim">⟳</span> Sending...';

            try {
                const res = await fetch(form.action, {
                    method: "POST", body: new FormData(form),
                    headers: { Accept: "application/json" }
                });
                if (res.ok || res.status === 200 || res.status === 302) {
                    sbtn.innerHTML = '✓ Message Sent!';
                    sbtn.style.background = '#22c55e';
                    sbtn.style.boxShadow = '0 4px 16px rgba(34,197,94,.2)';
                    form.reset();
                } else throw 0;
            } catch {
                sbtn.innerHTML = '✗ Failed — Retry';
                sbtn.style.background = '#ef4444';
                sbtn.style.boxShadow = '0 4px 16px rgba(239,68,68,.2)';
            }
            setTimeout(() => {
                sbtn.disabled = false;
                sbtn.innerHTML = orig;
                sbtn.style.background = '';
                sbtn.style.boxShadow = '';
                lucide.createIcons();
            }, 3500);
        });
    }

    // ===== Smooth Anchor Scroll =====
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (href === "#") return;
            const el = document.querySelector(href);
            if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth" }); }
        });
    });

    // Spinner CSS
    const st = document.createElement("style");
    st.textContent = `.spin-anim{display:inline-block;animation:spinr .6s linear infinite}@keyframes spinr{to{transform:rotate(360deg)}}`;
    document.head.appendChild(st);
});
