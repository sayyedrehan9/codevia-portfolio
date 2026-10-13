document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    // Mobile navigation
    const menu = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav-links");

    if (menu && nav) {
        menu.addEventListener("click", () => {
            const open = nav.classList.toggle("open");
            menu.setAttribute("aria-expanded", String(open));
            menu.textContent = open ? "✕" : "☰";
        });

        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("open");
                menu.setAttribute("aria-expanded", "false");
                menu.textContent = "☰";
            });
        });
    }

    // Footer year
    const year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();

    const reveals = document.querySelectorAll(
        ".section-heading, .service-card, .project-card, " +
        ".about-content, .about-label, .process-card, .contact-box"
    );

    if (!reduceMotion && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("cinematic-visible");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14 });

        reveals.forEach(el => {
            el.classList.add("cinematic-reveal");
            observer.observe(el);
        });
    }

    // Scroll-linked image parallax and scale
    const photos = document.querySelectorAll(".project-visual img");
    let frame = 0;

    function updatePhotos() {
        frame = 0;
        const height = window.innerHeight;

        photos.forEach(photo => {
            const card = photo.closest(".project-visual");
            if (!card) return;

            const rect = card.getBoundingClientRect();

            if (rect.bottom < 0 || rect.top > height) return;

            const progress = (height - rect.top) /
                (height + rect.height);

            const bounded = Math.max(0, Math.min(1, progress));
            const movement = (0.5 - bounded) * 65;
            const scale = 1.12 - bounded * 0.08;

            photo.style.transform =
                `translate3d(0, ${movement}px, 0) scale(${scale})`;
        });
    }

    function requestUpdate() {
        if (frame) return;
        frame = requestAnimationFrame(updatePhotos);
    }

    if (!reduceMotion) {
        window.addEventListener("scroll", requestUpdate, {
            passive: true
        });
        window.addEventListener("resize", requestUpdate);
        updatePhotos();
    }

    // Subtle pointer-based project tilt on desktop
    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll(".project-card").forEach(card => {
            card.addEventListener("pointermove", event => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;

                card.style.transform =
                    `perspective(1000px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg)`;
            });

            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        });
    }

    console.log("Codevia editorial experience ready.");
});
// CODEVIA — SCROLL-CONTROLLED HORIZONTAL GALLERY
(() => {
    const setupGallery = () => {
        const section = document.querySelector(".work");
        const grid = section?.querySelector(".project-grid");

        if (!section || !grid) return;

        let distance = 0;
        let start = 0;
        let end = 0;
        let frame = null;

        const desktop = window.matchMedia("(min-width: 901px)");

        function measure() {
            grid.style.transform = "translate3d(0,0,0)";

            if (!desktop.matches) {
                section.style.minHeight = "";
                distance = 0;
                return;
            }

            distance = Math.max(0, grid.scrollWidth - window.innerWidth * 0.82);

            const heading = section.querySelector(".section-heading");
            const headingHeight = heading ? heading.offsetHeight : 0;

            section.style.minHeight =
                (headingHeight + distance + window.innerHeight * 0.8 + 180) + "px";

            start = section.offsetTop + headingHeight + 70;
            end = start + distance;
            update();
        }

        function update() {
            frame = null;

            if (!desktop.matches || distance <= 0) {
                grid.style.transform = "";
                return;
            }

            const progress = Math.max(
                0,
                Math.min(1, (window.scrollY - start) / (end - start || 1))
            );

            grid.style.transform =
                `translate3d(${-distance * progress}px, 0, 0)`;
        }

        function requestUpdate() {
            if (frame === null) {
                frame = requestAnimationFrame(update);
            }
        }

        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", measure);

        measure();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupGallery);
    } else {
        setupGallery();
    }
})();
// CINEMATIC FEATURE — SCROLL PROGRESS
(() => {
    const feature = document.querySelector(".cinematic-feature");
    if (!feature) return;

    const image = feature.querySelector(".cinematic-image");
    const photo = feature.querySelector(".cinematic-image img");
    const copy = feature.querySelector(".cinematic-copy");

    let frame = null;

    function updateFeature() {
        frame = null;

        const rect = feature.getBoundingClientRect();
        const travel = feature.offsetHeight - window.innerHeight;

        const progress = Math.max(
            0,
            Math.min(1, -rect.top / (travel || 1))
        );

        const reveal = Math.max(
            0,
            Math.min(1, (progress - 0.12) / 0.3)
        );

        const exit = Math.max(
            0,
            Math.min(1, (progress - 0.72) / 0.2)
        );

        const inset = 13 - reveal * 13;

        image.style.clipPath =
            `inset(${inset}% ${inset * 0.92}% ${inset}% ${inset * 0.92}% round 4px)`;

        photo.style.transform =
            `scale(${1.3 - reveal * 0.3 + progress * 0.08})`;

        copy.style.opacity = String(reveal * (1 - exit));
        copy.style.transform =
            `translateY(${45 * (1 - reveal) - exit * 35}px)`;
    }

    function requestUpdate() {
        if (frame === null) {
            frame = requestAnimationFrame(updateFeature);
        }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    updateFeature();
})();
// PREMIUM SERVICE CARD MOTION
(() => {
    const cards = document.querySelectorAll(".service-card");

    cards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 70}ms`;

        if (window.matchMedia(
            "(pointer: fine) and (prefers-reduced-motion: no-preference)"
        ).matches) {
            card.addEventListener("pointermove", event => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;

                card.style.transform =
                    `perspective(900px) rotateX(${(0.5-y)*5}deg) rotateY(${(x-0.5)*5}deg)`;
            });

            card.addEventListener("pointerleave", () => {
                card.style.transform = "";
            });
        }
    });
})();