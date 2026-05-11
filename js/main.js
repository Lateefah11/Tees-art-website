/* ============================================================
   TEE'S ART — "Where Silence Speaks"
   main.js · All interactive behaviour
   ============================================================ */

(function () {
  'use strict';

  /* ── Utilities ──────────────────────────────────────────── */
  const qs  = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  /* ── 1. Preloader ───────────────────────────────────────── */
  function initPreloader() {
    const preloader = qs('#preloader');
    if (!preloader) return;

    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.classList.remove('loading');
      setTimeout(() => { triggerHeroReveals(); }, 400);
    }, 1900);
  }

  function triggerHeroReveals() {
    qsa('#hero .reveal').forEach((el, i) => {
      setTimeout(() => { el.classList.add('visible'); }, i * 80);
    });
  }

  /* ── 2. Custom Cursor ───────────────────────────────────── */
  function initCursor() {
    const cursor   = qs('#cursor');
    const follower = qs('#cursorFollower');
    if (!cursor || !follower) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    });

    (function animateFollower() {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      follower.style.transform = `translate(calc(${followerX}px - 50%), calc(${followerY}px - 50%))`;
      requestAnimationFrame(animateFollower);
    })();

    const hoverEls = qsa('a, button, .tour__frame, .btn-outline, .tour__btn-view, input, textarea');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      follower.style.opacity = '1';
    });
  }

  /* ── 3. Navbar Scroll Behaviour ─────────────────────────── */
  function initNavbar() {
    const nav = qs('#mainNav');
    if (!nav) return;
    const THRESHOLD = 80;
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > THRESHOLD);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 4. Mobile Menu ─────────────────────────────────────── */
  function initMobileMenu() {
    const hamburger   = qs('#hamburger');
    const mobileMenu  = qs('#mobileMenu');
    const mobileClose = qs('#mobileClose');
    if (!hamburger || !mobileMenu) return;

    function openMenu() {
      mobileMenu.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    }
    function closeMenu() {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    }

    hamburger.addEventListener('click', () =>
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu()
    );
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    qsa('.mobile-menu__link').forEach(l => l.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
    });
  }

  /* ── 5. Scroll Reveal (non-hero elements) ───────────────── */
  function initScrollReveal() {
    const revealEls = qsa('.reveal').filter(el => !el.closest('#hero'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  /* ── 6. Gallery Tour (horizontal scroll-jack) ───────────── */
  function initGalleryTour() {
    const tour      = qs('#exhibition');
    const track     = qs('#tourTrack');
    const counterEl = qs('#tourCounterNum');
    const fillEl    = qs('#tourProgressFill');

    if (!tour || !track) return;

    // Disable on mobile (CSS removes sticky, track uses flex-col)
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const panels     = qsa('.tour__panel', tour);
    const panelCount = panels.length; // 9

    function updateTour() {
      const tourTop   = tour.offsetTop;
      const scrolled  = window.scrollY - tourTop;
      const maxScroll = tour.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const progress   = Math.max(0, Math.min(1, scrolled / maxScroll));
      const translateX = -(progress * window.innerWidth * (panelCount - 1));

      track.style.transform = `translateX(${translateX}px)`;

      // Update counter
      const idx = Math.round(progress * (panelCount - 1));
      if (counterEl) counterEl.textContent = String(idx + 1).padStart(2, '0');

      // Update progress fill
      if (fillEl) fillEl.style.width = (progress * 100) + '%';
    }

    window.addEventListener('scroll', updateTour, { passive: true });
    window.addEventListener('resize', updateTour);
    updateTour();
  }

  /* ── 7. Lightbox ────────────────────────────────────────── */
  function initLightbox() {
    const lightbox         = qs('#lightbox');
    const lightboxClose    = qs('#lightboxClose');
    const lightboxBackdrop = qs('#lightboxBackdrop');
    const lightboxArtWrap  = qs('#lightboxArtWrap');
    const lightboxNumber   = qs('#lightboxNumber');
    const lightboxTitle    = qs('#lightboxTitle');
    const lightboxMeta     = qs('#lightboxMeta');
    const lightboxDesc     = qs('#lightboxDesc');
    if (!lightbox) return;

    const placeholderClass = {
      '01': 'piece-01', '02': 'piece-02', '03': 'piece-03',
      '04': 'piece-04', '05': 'piece-05', '06': 'piece-06',
      '07': 'piece-07', '08': 'piece-08', '09': 'piece-09'
    };

    function openLightbox(panel) {
      const idx    = panel.dataset.index;
      const title  = panel.dataset.title;
      const medium = panel.dataset.medium;
      const size   = panel.dataset.size;
      const year   = panel.dataset.year;
      const desc   = panel.dataset.desc;

      lightboxArtWrap.innerHTML = '';
      const artDiv = document.createElement('div');
      artDiv.classList.add('artwork__placeholder', placeholderClass[idx] || '');
      artDiv.setAttribute('role', 'img');
      artDiv.setAttribute('aria-label', title);
      lightboxArtWrap.appendChild(artDiv);

      lightboxNumber.textContent = `${idx} / 09`;
      lightboxTitle.textContent  = title;
      lightboxMeta.innerHTML = `<div>${medium}</div><div>${size}</div><div>${year}</div>`;
      lightboxDesc.textContent = desc;

      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { lightboxArtWrap.innerHTML = ''; }, 500);
    }

    // Open from "View Work" buttons inside tour panels
    qsa('.tour__btn-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.closest('.tour__panel');
        if (panel) openLightbox(panel);
      });
    });

    // Open from clicking the frame/artwork directly
    qsa('.tour__frame').forEach(frame => {
      frame.addEventListener('click', () => {
        const panel = frame.closest('.tour__panel');
        if (panel) openLightbox(panel);
      });
    });

    if (lightboxClose)    lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  /* ── 8. Contact Form ────────────────────────────────────── */
  function initContactForm() {
    const form   = qs('#contactForm');
    const noteEl = qs('#formNote');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name    = form.name.value.trim();
      const email   = form.email.value.trim();
      const message = form.message.value.trim();

      if (!name || !email || !message) {
        if (noteEl) { noteEl.textContent = 'Please fill in all fields.'; noteEl.style.color = '#8B3248'; }
        return;
      }

      const submitBtn = form.querySelector('.contact__submit');
      if (submitBtn) {
        submitBtn.style.opacity = '0.6';
        submitBtn.disabled = true;
        qs('.contact__submit-text', submitBtn).textContent = 'Sending…';
      }

      setTimeout(() => {
        form.reset();
        if (submitBtn) {
          submitBtn.style.opacity = '1';
          submitBtn.disabled = false;
          qs('.contact__submit-text', submitBtn).textContent = 'Send Message';
        }
        if (noteEl) {
          noteEl.textContent = 'Thank you — your message has been received.';
          noteEl.style.color = '#111111';
          setTimeout(() => { noteEl.textContent = ''; }, 4000);
        }
      }, 1200);
    });
  }

  /* ── 9. Smooth Scroll for Nav Links ─────────────────────── */
  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = qs(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navHeight = qs('#mainNav')?.offsetHeight || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ── 10. Subtle parallax on hero hills ──────────────────── */
  function initParallax() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const canvas = qs('#hills-canvas');
    if (!canvas) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          canvas.style.transform = `translateY(${scrollY * 0.25}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── Init All ────────────────────────────────────────────── */
  /* ── About Artist Overlay ───────────────────────────────── */
  function initAbout() {
    const overlay    = qs('#aboutOverlay');
    const navLink    = qs('#aboutNavLink');
    const mobileLink = qs('#aboutMobileLink');
    const nav        = qs('#mainNav');
    if (!overlay) return;

    function openAbout(e) {
      if (e) e.preventDefault();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      nav?.classList.add('about-active');
      // close mobile menu if open
      qs('#mobileMenu')?.classList.remove('open');
      qs('#hamburger')?.classList.remove('open');
      document.body.classList.remove('menu-open');
    }

    function closeAbout() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      nav?.classList.remove('about-active');
    }

    if (navLink)    navLink.addEventListener('click', openAbout);
    if (mobileLink) mobileLink.addEventListener('click', openAbout);

    // Close when any other nav link is clicked
    qsa('.nav__link, .mobile-menu__link').forEach(link => {
      if (link !== navLink && link !== mobileLink) {
        link.addEventListener('click', () => {
          if (overlay.classList.contains('open')) closeAbout();
        });
      }
    });

    // Close on logo click
    qs('.nav__logo a')?.addEventListener('click', () => {
      if (overlay.classList.contains('open')) closeAbout();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeAbout();
    });
  }

  /* ── Contact Overlay ────────────────────────────────────── */
  function initContact() {
    const overlay    = qs('#contactOverlay');
    const navLink    = qs('#contactNavLink');
    const mobileLink = qs('#contactMobileLink');
    const nav        = qs('#mainNav');
    if (!overlay) return;

    function openContact(e) {
      if (e) e.preventDefault();
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      nav?.classList.add('contact-active');
      qs('#mobileMenu')?.classList.remove('open');
      qs('#hamburger')?.classList.remove('open');
      document.body.classList.remove('menu-open');
    }

    function closeContact() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      nav?.classList.remove('contact-active');
    }

    if (navLink)    navLink.addEventListener('click', openContact);
    if (mobileLink) mobileLink.addEventListener('click', openContact);

    qsa('.nav__link, .mobile-menu__link').forEach(link => {
      if (link !== navLink && link !== mobileLink) {
        link.addEventListener('click', () => {
          if (overlay.classList.contains('open')) closeContact();
        });
      }
    });

    qs('.nav__logo a')?.addEventListener('click', () => {
      if (overlay.classList.contains('open')) closeContact();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) closeContact();
    });
  }

  function init() {
    initPreloader();
    initCursor();
    initNavbar();
    initMobileMenu();
    initScrollReveal();
    initGalleryTour();
    initLightbox();
    initContactForm();
    initSmoothScroll();
    initParallax();
    initAbout();
    initContact();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
