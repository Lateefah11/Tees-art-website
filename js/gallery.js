/* ============================================================
   EDITORIAL GALLERY  —  gallery.js  v6
   Tee's Art · "Where Silence Speaks"

   Layout
   ──────
   Open    → 9 tiny thumbnails (filmstrip) centred on cream bg
   Scroll  → thumbnails scale up into full editorial layout
   Scroll  → horizontal track reveals all 9 artworks

   Editorial layout (desktop ≥ 1024px)
   ──────────────────────────────────
   Pattern per group of 3: Portrait | Landscape | Portrait
   P + L + P = 28% + 44% + 28% = 100% VW  →  3 images per screen
   No gaps, no padding — images are flush edge-to-edge.
   9 artworks = 3 screens of horizontal scroll.
   ============================================================ */
(function () {
  'use strict';

  /* ─── Artwork data ─────────────────────────────────────── */
  const ARTWORKS = [
    { num:'01', css:'piece-01',
      title:'The Weight of a Held Breath',
      year:'2025', medium:'Mixed media on canvas', size:'90 × 120 cm',
      price:{ original:'$2,800', print:'$750' },
      story:[
        'There is a moment before exhaling when the body holds everything — grief, desire, resolve. This piece was born inside that pause.',
        'The layered surface mimics the compression of emotion under restraint. Every mark is a word left unsaid, pressed into the material rather than released into air.',
        'To hold one\'s breath is to exist in a liminal space between what is felt and what is shown. This work invites the viewer to sit in that tension.',
      ]},
    { num:'02', css:'piece-02',
      title:'Unnamed Grief',
      year:'2025', medium:'Acrylic on linen', size:'80 × 100 cm',
      price:{ original:'$2,200', print:'$600' },
      story:[
        'Not all grief has a name. Some loss arrives without ceremony — a slow erosion rather than a sudden break.',
        'The composition resists clarity. Forms dissolve before fully materialising, the way memory can make mourning feel shapeless.',
        'This work was made during a period of quiet devastation. It does not ask to be understood — only witnessed.',
      ]},
    { num:'03', css:'piece-03',
      title:'Portrait of Stillness',
      year:'2024', medium:'Oil on canvas', size:'100 × 100 cm',
      price:{ original:'$3,200', print:'$850' },
      story:[
        'Stillness is rarely passive. It takes effort — the effort of not moving, not speaking, not breaking under the weight of what is present.',
        'The square format was chosen deliberately: no hierarchy of height over width. Everything held at equal tension.',
        'Oil allows time to be embedded in the surface. Each layer dried before the next was applied — patience made visible.',
      ]},
    { num:'04', css:'piece-04',
      title:'Where Language Fails',
      year:'2025', medium:'Watercolour & ink', size:'70 × 90 cm',
      price:{ original:'$1,800', print:'$500' },
      story:[
        'There are experiences for which no word has been coined. This piece lives in those gaps — in the space after a sentence trails off.',
        'Watercolour was chosen for its resistance to control. Ink bleeds. Edges are lost. The image arrives only partly as intended.',
        'What remains is not what was planned, but what was true.',
      ]},
    { num:'05', css:'piece-05',
      title:'The Quietest Scream',
      year:'2025', medium:'Acrylic on panel', size:'120 × 150 cm',
      price:{ original:'$3,800', print:'$950' },
      story:[
        'The loudest feelings are often the ones no one hears. Anguish that is swallowed whole. Rage that is swallowed whole.',
        'The scale of this piece is intentional — it demands more of the viewer\'s body than their eye alone. You must step back to take it all in.',
        'The silence in the image is not absence. It is a sound at a frequency others cannot register.',
      ]},
    { num:'06', css:'piece-06',
      title:'Residue',
      year:'2024', medium:'Mixed media on paper', size:'60 × 80 cm',
      price:{ original:'$1,600', print:'$450' },
      story:[
        'After a feeling passes, something always remains. A stain. A texture. An echo of the body\'s chemistry.',
        'This work was built up from materials that carry history — papers, pigments, fragments layered until the surface holds its own weight.',
        'Residue is not failure. It is proof that something happened here.',
      ]},
    { num:'07', css:'piece-07',
      title:'I Know This Feeling',
      year:'2025', medium:'Oil on canvas', size:'80 × 120 cm',
      price:{ original:'$2,600', print:'$700' },
      story:[
        'Recognition is its own kind of intimacy. To see a feeling rendered and know immediately — that is mine, I have been there.',
        'This piece was made as a gesture of solidarity. A signal sent across the distance between people who will never meet.',
        'The title is a statement, not a question. There is no ambiguity in recognition.',
      ]},
    { num:'08', css:'piece-08',
      title:'Dissolve',
      year:'2025', medium:'Acrylic & resin', size:'100 × 130 cm',
      price:{ original:'$3,400', print:'$900' },
      story:[
        'To dissolve is not to disappear — it is to become uncontained. To lose the edges that once defined you.',
        'Resin was poured in layers, each one capturing the movement of the one beneath. Time is sealed inside the surface.',
        'There is something clarifying about dissolution. What remains when form is released is only what was always essential.',
      ]},
    { num:'09', css:'piece-09',
      title:'After All of It',
      year:'2025', medium:'Mixed media on canvas', size:'90 × 120 cm',
      price:{ original:'$2,800', print:'$750' },
      story:[
        'This is the last piece in the exhibition — and the quietest. After everything that preceded it, it asks only for presence.',
        'The title holds a kind of relief. After all of it. The weight has been carried; now it can be set down.',
        '"Silence has a face." This work is that face. Not absence, but arrival.',
      ]},
  ];

  /* ─── Pattern helper ────────────────────────────────────
     Builds the P / L / P repeating layout array.
     pW / lW   = pixel widths already computed from VW
     pHF / pTF = portrait height & top fractions of VH
     lHF / lTF = landscape height & top fractions of VH
  ────────────────────────────────────────────────────────── */
  const TYPES = ['P','L','P','L','P','L','P','L','P'];

  function buildPattern(pW, lW) {
    return TYPES.map(t => t === 'P'
      ? { w: pW, hF: 0.76, tF: 0.12 }   // 12% top = 12% bottom (equal)
      : { w: lW, hF: 0.72, tF: 0.14 }); // landscape slightly more inset
  }

  /* ─── Responsive config ─────────────────────────────────
     Returns layout + filmstrip + spacing for each breakpoint.

     Desktop  ≥ 1024px : P(28%) + L(44%) + P(28%) = 100% VW
     Tablet   600–1023 : P(31%) + L(38%) + P(31%) = 100% VW
     Mobile   < 600px  : portrait 65% VW, landscape 82% VW
                         (~1.5 images visible — peek effect)
  ────────────────────────────────────────────────────────── */
  function getConfig(VW) {
    if (VW < 600) {
      // Mobile: every image fills the full viewport width — one per scroll
      return {
        layout:   buildPattern(VW, VW),
        filmW:    20, filmH: 28, filmGap: 3,
        itemGap:  0, padL: 0, padR: 0,
        phase1VH: 1.8,
      };
    }
    if (VW < 1024) {
      const pW = Math.round(VW * 0.31);
      const lW = VW - 2 * pW; // exact remainder → flush seam
      return {
        layout:   buildPattern(pW, lW),
        filmW:    28, filmH: 40, filmGap: 5,
        itemGap:  0, padL: 0, padR: 0,
        phase1VH: 2.2,
      };
    }
    // Desktop ≥ 1024px
    const pW = Math.round(VW * 0.28);
    const lW = VW - 2 * pW; // exact remainder → flush seam
    return {
      layout:   buildPattern(pW, lW),
      filmW:    34, filmH: 48, filmGap: 5,
      itemGap:  0, padL: 0, padR: 0,
      phase1VH: 2.5,
    };
  }

  /* ─── State ─────────────────────────────────────────────── */
  let isOpen   = false;
  let overlay, track, scrollSpace, label, scrollHint, endHint;
  let phase1Tl = null, phase2Tl = null, st = null;
  let items    = [];
  let lastCfg  = null;
  let adTl = null, adSt = null, adScrollerListener = null;

  /* ═══════════════════════════════════════════════════════════
     BUILD HTML
  ═══════════════════════════════════════════════════════════ */
  function buildOverlay() {
    if (document.getElementById('gallery-overlay')) return;

    const itemsHTML = ARTWORKS.map((a, i) => `
      <div class="ge-item" data-i="${i}">
        <div class="ge-art artwork__placeholder ${a.css}"
             role="img" aria-label="${a.title}"></div>
        <div class="ge-meta">
          <span class="ge-num">${a.num}</span>
          <span class="ge-title-label">${a.title}</span>
        </div>
        <div class="ge-hover-cta" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
               stroke="currentColor" stroke-width="1.4"
               stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="1" width="13" height="13" rx="1"/>
          </svg>
          <span>Open art</span>
        </div>
      </div>`).join('');

    document.body.insertAdjacentHTML('beforeend', `
      <div id="gallery-overlay" class="gallery-overlay">

        <div class="gallery-sticky" id="gallerySticky">
          <div class="gallery-track" id="galleryTrack">
            ${itemsHTML}
          </div>
        </div>

        <div class="gallery-scroll-space" id="galleryScrollSpace"></div>

        <div class="gallery-hud" aria-hidden="true">
          <button class="gallery-close-btn" id="galleryCloseBtn"
                  aria-label="Back to exhibition" aria-hidden="false">
            <span class="gallery-close-btn__icon">&#x2190;</span>
            <span>Back</span>
          </button>
          <div class="gallery-label" id="galleryLabel"></div>
          <div class="gallery-scroll-hint" id="galleryScrollHint">
            <span class="gallery-scroll-hint__text">Scroll</span>
            <svg class="gallery-scroll-hint__chevrons" width="18" height="26"
                 viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline class="gsh-chev gsh-chev--1" points="2,2 9,8 16,2"  stroke="currentColor" stroke-width="1.6"/>
              <polyline class="gsh-chev gsh-chev--2" points="2,10 9,16 16,10" stroke="currentColor" stroke-width="1.6"/>
              <polyline class="gsh-chev gsh-chev--3" points="2,18 9,24 16,18" stroke="currentColor" stroke-width="1.6"/>
            </svg>
          </div>
          <div class="gallery-end-hint" id="galleryEndHint" aria-live="polite">
            <div class="gallery-end-hint__pulse"></div>
            <p class="gallery-end-hint__line1">You've seen all 9 works</p>
            <p class="gallery-end-hint__line2">Click any artwork to view in full detail</p>
          </div>

          <!-- Spotify ambient player -->
          <div class="gallery-music" id="galleryMusic">
            <button class="gallery-music__toggle" id="galleryMusicToggle"
                    aria-label="Toggle music player" aria-expanded="false">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3v12.26A4 4 0 1 0 11 19V8h5V3H9z"/>
              </svg>
            </button>
            <div class="gallery-music__player" id="galleryMusicPlayer" aria-hidden="true">
              <iframe
                id="spotifyFrame"
                src="https://open.spotify.com/embed/track/0E4hFnEC0U8t4gxEAX8X3Y?utm_source=generator&theme=0"
                width="100%" height="80"
                frameborder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy">
              </iframe>
            </div>
          </div>
        </div>

      </div>`);
  }

  /* ═══════════════════════════════════════════════════════════
     SETUP
  ═══════════════════════════════════════════════════════════ */
  function setup() {
    overlay     = document.getElementById('gallery-overlay');
    track       = document.getElementById('galleryTrack');
    scrollSpace = document.getElementById('galleryScrollSpace');
    label       = document.getElementById('galleryLabel');
    scrollHint  = document.getElementById('galleryScrollHint');
    endHint     = document.getElementById('galleryEndHint');
    items       = Array.from(track.querySelectorAll('.ge-item'));

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.scrollerProxy(overlay, {
      scrollTop(v) {
        if (arguments.length) overlay.scrollTop = v;
        return overlay.scrollTop;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      }
    });
    overlay.addEventListener('scroll', ScrollTrigger.update, { passive: true });

    buildPositions();
  }

  /* ─── Build / rebuild positions and timelines ───────────── */
  function buildPositions() {
    if (st)       { st.kill();       st = null; }
    if (phase1Tl) { phase1Tl.kill(); phase1Tl = null; }
    if (phase2Tl) { phase2Tl.kill(); phase2Tl = null; }

    const VW  = window.innerWidth;
    const VH  = window.innerHeight;
    const cfg = getConfig(VW);
    lastCfg   = cfg;

    const { layout, filmW, filmH, filmGap, itemGap, padL, padR, phase1VH } = cfg;

    /* ── Editorial positions (flush, no gap) ───────────────── */
    let xCursor = padL;
    const editPos = layout.map(l => {
      const pos = {
        x: xCursor,
        y: Math.round(VH * l.tF),
        w: l.w,
        h: Math.round(VH * l.hF),
      };
      xCursor += l.w + itemGap;
      return pos;
    });
    // Total content width = 3 × VW (exact), hScrollDist = 2 × VW
    const trackContentW = xCursor - itemGap + padR;
    const hScrollDist   = Math.max(0, trackContentW - VW);

    /* ── Filmstrip starting positions ──────────────── */
    const totalFilmW = ARTWORKS.length * filmW + (ARTWORKS.length - 1) * filmGap;
    const filmStartX = (VW - totalFilmW) / 2;
    const filmY      = (VH - filmH) / 2;

    items.forEach((item, i) => {
      gsap.set(item, {
        x: filmStartX + i * (filmW + filmGap),
        y: filmY,
        width:  filmW,
        height: filmH,
      });
    });
    gsap.set(track, { x: 0 });
    gsap.set('.ge-meta', { opacity: 0 });

    /* ── Phase 1: filmstrip → editorial ────────────── */
    phase1Tl = gsap.timeline({ paused: true });
    items.forEach((item, i) => {
      phase1Tl.to(item, {
        x: editPos[i].x, y: editPos[i].y,
        width: editPos[i].w, height: editPos[i].h,
        ease: 'power3.inOut', duration: 1,
      }, 0);
    });
    phase1Tl.to('.ge-meta', { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.70);

    /* ── Phase 2: horizontal scroll ────────────────── */
    phase2Tl = gsap.timeline({ paused: true });
    if (hScrollDist > 0) {
      phase2Tl.to(track, { x: -hScrollDist, ease: 'none', duration: 1 });
    }

    /* ── Scroll space + trigger ────────────────────── */
    const phase1H     = VH * phase1VH;
    const totalScroll = phase1H + hScrollDist + VH * 0.20;
    scrollSpace.style.height = totalScroll + 'px';

    const p1Frac = phase1H / totalScroll;

    st = ScrollTrigger.create({
      scroller: overlay,
      trigger:  '#gallerySticky',
      start:    'top top',
      end:      `+=${totalScroll}`,
      scrub:    1.5,
      onUpdate(self) {
        const p   = self.progress;
        const p1p = Math.min(1, p / p1Frac);
        const p2p = p1Frac < 1
          ? Math.max(0, (p - p1Frac) / (1 - p1Frac))
          : 0;
        phase1Tl.progress(p1p);
        if (hScrollDist > 0) phase2Tl.progress(p2p);
        updateHUD(p, p1p, p2p);
      }
    });
  }

  /* ─── HUD ────────────────────────────────────────────────── */
  function updateHUD(p, p1p, p2p) {
    const atEnd = p2p > 0.92;
    // Scroll hint visible during scrolling; swaps out at the end
    if (scrollHint) scrollHint.classList.toggle('hidden', p > 0.97 || atEnd);
    // End hint fades in when all works have been seen
    if (endHint) endHint.classList.toggle('visible', atEnd && p1p >= 1);
    if (label) {
      if (p1p < 0.95) {
        label.textContent = '';
      } else {
        const idx = Math.min(ARTWORKS.length - 1, Math.floor(p2p * ARTWORKS.length));
        label.textContent = `${ARTWORKS[idx].num}  —  ${ARTWORKS[idx].title}`;
      }
    }
  }

  /* ═══════════════════════════════════════════════════════════
     OPEN / CLOSE
  ═══════════════════════════════════════════════════════════ */
  function openGallery() {
    if (isOpen) return;
    isOpen = true;
    document.body.style.overflow = 'hidden';
    overlay.scrollTop = 0;

    if (phase1Tl) phase1Tl.progress(0);
    if (phase2Tl) phase2Tl.progress(0);
    gsap.set(track, { x: 0 });
    gsap.set('.ge-meta', { opacity: 0 });
    if (endHint) endHint.classList.remove('visible');

    overlay.classList.add('active');

    gsap.fromTo(items,
      { opacity: 0, y: '+=6' },
      { opacity: 1, y: '-=6', duration: 0.5, ease: 'power2.out', stagger: 0.04,
        onComplete() { ScrollTrigger.refresh(); updateHUD(0, 0, 0); } }
    );
  }

  function closeGallery() {
    if (!isOpen) return;
    isOpen = false;

    gsap.to(overlay, {
      opacity: 0, duration: 0.4, ease: 'power2.in',
      onComplete() {
        overlay.classList.remove('active');
        overlay.style.opacity = '';
        overlay.scrollTop = 0;
        if (phase1Tl) phase1Tl.progress(0);
        if (phase2Tl) phase2Tl.progress(0);

        const VW  = window.innerWidth;
        const VH  = window.innerHeight;
        const cfg = lastCfg || getConfig(VW);
        const { filmW, filmH, filmGap } = cfg;
        const totalFilmW = ARTWORKS.length * filmW + (ARTWORKS.length - 1) * filmGap;
        items.forEach((item, i) => {
          gsap.set(item, {
            x: (VW - totalFilmW) / 2 + i * (filmW + filmGap),
            y: (VH - filmH) / 2,
            width: filmW, height: filmH,
          });
        });
        gsap.set(track, { x: 0 });
        gsap.set('.ge-meta', { opacity: 0 });
        document.body.style.overflow = '';
        ScrollTrigger.refresh();
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     ARTWORK DETAIL VIEW
  ═══════════════════════════════════════════════════════════ */
  function buildArtworkDetail() {
    if (document.getElementById('artworkDetail')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div id="artworkDetail" class="ad-overlay">
        <button class="ad-close" id="adClose" aria-label="Back to gallery">
          <span class="ad-close__icon">&#x2190;</span>
          <span>Back</span>
        </button>

        <!-- THE single artwork image — GSAP moves this from hero → sidebar -->
        <div class="ad-img artwork__placeholder" id="adImg" role="img" aria-label=""></div>

        <!-- Hero text: number + title + scroll cue (fades out on scroll) -->
        <div class="ad-hero-text" id="adHeroText">
          <p class="ad-hero-num" id="adNum"></p>
          <h1 class="ad-hero-title" id="adTitle"></h1>
          <p class="ad-scroll-cue">Scroll to explore</p>
        </div>

        <!-- Sidebar text: number + title (fades in as image arrives at sidebar) -->
        <div class="ad-sidebar-text" id="adSidebarText">
          <p class="ad-st-num" id="adStNum"></p>
          <h2 class="ad-st-title" id="adStTitle"></h2>
        </div>

        <!-- Scroll container — sits under the floating layers -->
        <div class="ad-scroller" id="adScroller">
          <!-- Empty zone whose scroll height drives the image animation -->
          <div class="ad-hero-zone" id="adHeroZone"></div>
          <!-- Right-side body content (padding-left set by JS) -->
          <div class="ad-body" id="adBody"></div>
        </div>

        <!-- Image zoom modal -->
        <div id="adZoomModal" class="ad-zoom-modal" aria-hidden="true">
          <button class="ad-zoom-close" id="adZoomClose" aria-label="Close zoom">&#x2715;</button>
          <div class="ad-zoom-stage" id="adZoomStage">
            <div class="ad-zoom-img artwork__placeholder" id="adZoomImg"></div>
          </div>
          <p class="ad-zoom-hint" id="adZoomHint">Scroll to zoom &nbsp;&middot;&nbsp; Drag to pan &nbsp;&middot;&nbsp; Double-click to reset</p>
        </div>
      </div>`);
  }

  function buildAdBody(art, currentIdx) {
    const specs = [
      ['Year', art.year], ['Medium', art.medium],
      ['Size', art.size], ['Shipping', 'Worldwide shipping available'],
    ].map(([k, v]) => `
      <div class="ad-spec">
        <span class="ad-spec__key">${k}</span>
        <span class="ad-spec__val">${v}</span>
      </div>`).join('');

    const exploreCards = ARTWORKS
      .map((a, i) => ({ a, i }))
      .filter(({ i }) => i !== currentIdx)
      .map(({ a, i }) => `
        <div class="ad-explore-card" data-explore-idx="${i}"
             tabindex="0" role="button" aria-label="View ${a.title}">
          <div class="ad-explore-thumb artwork__placeholder ${a.css}"></div>
          <div class="ad-explore-info">
            <span class="ad-explore-num">${a.num}</span>
            <span class="ad-explore-title">${a.title}</span>
          </div>
          <div class="ad-explore-hover" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
                 stroke="currentColor" stroke-width="1.4"
                 stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="1" width="13" height="13" rx="1"/>
            </svg>
            <span>Open</span>
          </div>
        </div>`).join('');

    return `
      <h2 class="ad-body-heading">${art.title}</h2>
      <div class="ad-specs">${specs}</div>
      <div class="ad-pricing">
        <div class="ad-spec">
          <span class="ad-spec__key">Original copy</span>
          <span class="ad-spec__val ad-spec__val--price">${art.price.original}</span>
        </div>
        <div class="ad-spec ad-spec--last">
          <span class="ad-spec__key">Limited prints <em>(10 copies)</em></span>
          <span class="ad-spec__val ad-spec__val--price">${art.price.print}</span>
        </div>
      </div>
      <button class="ad-acquire">Acquire this piece</button>
      <p class="ad-acquire-note">Comes with a signed certificate of authenticity.</p>
      <div class="ad-story">
        <h3 class="ad-section-title">The Story Behind the Piece</h3>
        ${art.story.map(p => `<p class="ad-story__para">${p}</p>`).join('')}
      </div>
      <div class="ad-collectors">
        <h3 class="ad-section-title">For collectors</h3>
        <p class="ad-collectors__intro">Each artwork in this exhibition is an original. When you acquire this work, you receive:</p>
        <ul class="ad-list">
          <li>The original artwork</li>
          <li>A signed certificate of authenticity</li>
          <li>Secure international shipping</li>
          <li>Protective packaging suitable for collectors</li>
        </ul>
      </div>
      <div class="ad-explore">
        <p class="ad-explore__label">Continue Exploring</p>
        <div class="ad-explore-track" id="adExploreTrack">
          ${exploreCards}
        </div>
      </div>`;
  }

  function openArtworkDetail(idx) {
    const art           = ARTWORKS[idx];
    const detEl         = document.getElementById('artworkDetail');
    const adImg         = document.getElementById('adImg');
    const adHeroText    = document.getElementById('adHeroText');
    const adSidebarText = document.getElementById('adSidebarText');
    const adScroller    = document.getElementById('adScroller');
    const adBody        = document.getElementById('adBody');
    const adHeroZone    = document.getElementById('adHeroZone');

    /* Kill any previous triggers / timeline */
    if (adSt) { adSt.kill(); adSt = null; }
    if (adTl) { adTl.kill(); adTl = null; }
    if (adScrollerListener && adScroller) {
      adScroller.removeEventListener('scroll', adScrollerListener);
      adScrollerListener = null;
    }

    /* Populate content */
    adImg.className = `ad-img artwork__placeholder ${art.css}`;
    adImg.setAttribute('aria-label', art.title);
    document.getElementById('adNum').textContent     = art.num;
    document.getElementById('adTitle').textContent   = art.title;
    document.getElementById('adStNum').textContent   = art.num;
    document.getElementById('adStTitle').textContent = art.title;
    adBody.innerHTML = buildAdBody(art, idx);

    const VW = window.innerWidth;
    const VH = window.innerHeight;

    adScroller.scrollTop = 0;
    detEl.classList.remove('ad-mobile');

    if (VW < 600) {
      /* ── Mobile: static layout, no animation ── */
      detEl.classList.add('ad-mobile');
      gsap.set([adImg, adHeroText, adSidebarText], { clearProps: 'all' });
      adBody.style.paddingLeft = '';

    } else {
      /* ── Desktop: hero centre → sidebar top-left ── */

      // Hero image: cap height so it fits even on short/landscape screens
      let heroW = Math.min(VW * 0.38, 360);
      let heroH = heroW * 1.5;
      const maxHeroH = VH * 0.72;
      if (heroH > maxHeroH) { heroH = maxHeroH; heroW = Math.round(heroH / 1.5); }
      const heroLeft = Math.round((VW - heroW) / 2);
      const heroTop  = Math.round(VH * 0.10);

      // Sidebar image — 40% of viewport width, height capped to fit screen
      const sideLeft  = 36;
      const sideTop   = 40;
      const sideW     = Math.round(VW * 0.40);
      const maxSideH  = VH - sideTop - 40;
      const sideH     = Math.min(Math.round(sideW * 1.5), maxSideH);

      const htTop    = heroTop + heroH + 24;          // hero text below image
      const stTop    = sideTop + sideH + 16;          // sidebar text below image
      const bodyPadL = sideLeft + sideW + 52;         // body clears sidebar

      adHeroZone.style.height  = VH + 'px';
      adBody.style.paddingLeft = bodyPadL + 'px';

      // Clear any previous inline styles from GSAP before setting fresh ones
      gsap.set([adImg, adHeroText, adSidebarText], { clearProps: 'all' });
      gsap.set(adImg,         { left: heroLeft, top: heroTop, width: heroW, height: heroH });
      gsap.set(adHeroText,    { left: '50%',    top: htTop,   xPercent: -50, opacity: 1 });
      gsap.set(adSidebarText, { left: sideLeft, top: stTop,   width: sideW,  opacity: 0 });

      // Paused timeline — scrubbed by ScrollTrigger below
      adTl = gsap.timeline({ paused: true });
      adTl
        .to(adImg, {
          left: sideLeft, top: sideTop, width: sideW, height: sideH,
          ease: 'power2.inOut', duration: 1,
        }, 0)
        .to(adHeroText,    { opacity: 0, duration: 0.35, ease: 'power2.in'  }, 0)
        .to(adSidebarText, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.65);

      // ScrollTrigger — scrubs the timeline as #adScroller scrolls
      ScrollTrigger.scrollerProxy(adScroller, {
        scrollTop(v) {
          if (arguments.length) adScroller.scrollTop = v;
          return adScroller.scrollTop;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        }
      });
      adScrollerListener = () => ScrollTrigger.update();
      adScroller.addEventListener('scroll', adScrollerListener, { passive: true });

      adSt = ScrollTrigger.create({
        scroller: adScroller,
        trigger:  adHeroZone,
        start:    'top top',
        end:      `+=${VH}`,
        scrub:    1,
        onUpdate(self) { adTl.progress(self.progress); }
      });

      ScrollTrigger.refresh();
    }

    detEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeArtworkDetail() {
    const detEl      = document.getElementById('artworkDetail');
    const adScroller = document.getElementById('adScroller');
    if (!detEl || !detEl.classList.contains('active')) return;

    if (adSt) { adSt.kill(); adSt = null; }
    if (adTl) { adTl.kill(); adTl = null; }
    if (adScrollerListener && adScroller) {
      adScroller.removeEventListener('scroll', adScrollerListener);
      adScrollerListener = null;
    }

    gsap.to(detEl, {
      opacity: 0, duration: 0.35, ease: 'power2.in',
      onComplete() {
        detEl.classList.remove('active');
        detEl.classList.remove('ad-mobile');
        detEl.style.opacity = '';
      }
    });
  }

  /* ── Music player toggle ────────────────────────────────── */
  function initMusicPlayer() {
    const toggle = document.getElementById('galleryMusicToggle');
    const player = document.getElementById('galleryMusicPlayer');
    if (!toggle || !player) return;

    toggle.addEventListener('click', () => {
      const open = player.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.classList.toggle('active', open);
      player.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
  }

  /* ═══════════════════════════════════════════════════════════
     ZOOM MODAL
  ═══════════════════════════════════════════════════════════ */
  function initZoomModal() {
    const modal    = document.getElementById('adZoomModal');
    const stage    = document.getElementById('adZoomStage');
    const zoomImg  = document.getElementById('adZoomImg');
    const closeBtn = document.getElementById('adZoomClose');
    const hint     = document.getElementById('adZoomHint');
    if (!modal) return;

    let scale = 1, panX = 0, panY = 0;
    const MIN = 1, MAX = 5;

    function applyTransform(animate) {
      zoomImg.style.transition = animate ? 'transform 0.3s ease' : 'none';
      zoomImg.style.transform  = `translate(${panX}px,${panY}px) scale(${scale})`;
      stage.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
    }

    function clampPan() {
      const hw = (zoomImg.offsetWidth  * (scale - 1)) / 2;
      const hh = (zoomImg.offsetHeight * (scale - 1)) / 2;
      panX = Math.max(-hw, Math.min(hw, panX));
      panY = Math.max(-hh, Math.min(hh, panY));
    }

    function openZoom() {
      const adImg = document.getElementById('adImg');
      if (!adImg) return;
      const pieceClass = [...adImg.classList].find(c => c.startsWith('piece-')) || '';
      scale = 1; panX = 0; panY = 0;
      zoomImg.className = `ad-zoom-img artwork__placeholder ${pieceClass}`;
      applyTransform(false);
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      if (hint) { hint.style.opacity = '1'; }
    }

    function closeZoom() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }

    /* Open on ad-img click — forward scroll to scroller so it still works */
    const adImg = document.getElementById('adImg');
    if (adImg) {
      adImg.style.pointerEvents = 'auto';
      adImg.style.cursor = 'zoom-in';
      adImg.addEventListener('click', openZoom);
      adImg.addEventListener('wheel', e => {
        const scroller = document.getElementById('adScroller');
        if (scroller) scroller.scrollTop += e.deltaY;
      }, { passive: true });
    }

    closeBtn?.addEventListener('click', e => { e.stopPropagation(); closeZoom(); });
    modal.addEventListener('click', e => {
      if (e.target === modal) closeZoom();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeZoom();
    });

    /* Scroll-to-zoom */
    stage.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      scale = Math.max(MIN, Math.min(MAX, scale * factor));
      if (scale === MIN) { panX = 0; panY = 0; }
      else clampPan();
      applyTransform(false);
      if (hint) { hint.style.opacity = '0'; }
    }, { passive: false });

    /* Double-click: toggle 2.5× / reset */
    stage.addEventListener('dblclick', () => {
      scale = scale > 1.2 ? 1 : 2.5;
      panX = 0; panY = 0;
      applyTransform(true);
    });

    /* Drag-to-pan */
    let dragging = false, dx0 = 0, dy0 = 0, px0 = 0, py0 = 0;
    stage.addEventListener('mousedown', e => {
      if (scale <= 1) return;
      dragging = true;
      dx0 = e.clientX; dy0 = e.clientY;
      px0 = panX;      py0 = panY;
      stage.style.cursor = 'grabbing';
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      panX = px0 + (e.clientX - dx0);
      panY = py0 + (e.clientY - dy0);
      clampPan();
      applyTransform(false);
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      stage.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
    });

    /* Pinch-to-zoom (touch) */
    let lastPinchDist = 0;
    stage.addEventListener('touchstart', e => {
      if (e.touches.length === 2) {
        lastPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });
    stage.addEventListener('touchmove', e => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale = Math.max(MIN, Math.min(MAX, scale * (dist / lastPinchDist)));
      lastPinchDist = dist;
      clampPan();
      applyTransform(false);
    }, { passive: false });
  }

  /* ═══════════════════════════════════════════════════════════
     EVENTS
  ═══════════════════════════════════════════════════════════ */
  function wireEvents() {
    const cta = document.getElementById('ctaBtn');
    if (cta) cta.addEventListener('click', e => { e.preventDefault(); openGallery(); });

    document.getElementById('galleryCloseBtn')
      ?.addEventListener('click', closeGallery);

    /* Artwork detail — open on item click */
    overlay.addEventListener('click', e => {
      const item = e.target.closest('.ge-item');
      if (!item) return;
      const idx = parseInt(item.dataset.i, 10);
      if (!isNaN(idx)) openArtworkDetail(idx);
    });

    /* Artwork detail — close button */
    document.addEventListener('click', e => {
      if (e.target.closest('#adClose')) closeArtworkDetail();
    });

    /* Continue Exploring — open another artwork (skip if track was dragged) */
    document.addEventListener('click', e => {
      const card = e.target.closest('.ad-explore-card');
      if (!card) return;
      const track = card.closest('#adExploreTrack');
      if (track && track.dataset.dragging) { delete track.dataset.dragging; return; }
      const eIdx = parseInt(card.dataset.exploreIdx, 10);
      if (!isNaN(eIdx)) openArtworkDetail(eIdx);
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const card = e.target.closest('.ad-explore-card');
      if (!card) return;
      const eIdx = parseInt(card.dataset.exploreIdx, 10);
      if (!isNaN(eIdx)) openArtworkDetail(eIdx);
    });

    /* Continue Exploring — horizontal drag-to-scroll */
    document.addEventListener('mousedown', e => {
      const track = e.target.closest('#adExploreTrack');
      if (!track) return;
      let startX = e.pageX;
      let scrollL = track.scrollLeft;
      let dragging = false;
      const onMove = mv => {
        const dx = mv.pageX - startX;
        if (!dragging && Math.abs(dx) > 4) dragging = true;
        if (dragging) { track.scrollLeft = scrollL - dx; mv.preventDefault(); }
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (dragging) track.dataset.dragging = '1';
        else delete track.dataset.dragging;
      };
      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('mouseup', onUp);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const det = document.getElementById('artworkDetail');
        if (det?.classList.contains('active')) { closeArtworkDetail(); return; }
        if (isOpen) closeGallery();
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      if (!isOpen) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(buildPositions, 150);
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     BOOT
  ═══════════════════════════════════════════════════════════ */
  function init() {
    if (typeof gsap === 'undefined') {
      console.warn('Gallery: GSAP not loaded'); return;
    }
    buildOverlay();
    buildArtworkDetail();
    setup();
    wireEvents();
    initMusicPlayer();
    initZoomModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
