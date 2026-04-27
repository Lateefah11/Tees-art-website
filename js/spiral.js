/* ============================================================
   SPIRAL ANIMATION — Vanilla JS port of the React/TS component
   Tee's Art · "Silence has a face" · Intro Splash Screen
   ============================================================ */

(function () {
  'use strict';

  /* ── Vector helpers ─────────────────────────────────────── */
  class Vector2D {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    static random(min, max) {
      return min + Math.random() * (max - min);
    }
  }

  class Vector3D {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  /* ── Star ────────────────────────────────────────────────── */
  class Star {
    constructor(cameraZ, cameraTravelDistance) {
      this.angle              = Math.random() * Math.PI * 2;
      this.distance           = 30 * Math.random() + 15;
      this.rotationDirection  = Math.random() > 0.5 ? 1 : -1;
      this.expansionRate      = 1.2 + Math.random() * 0.8;
      this.finalScale         = 0.7 + Math.random() * 0.6;

      this.dx = this.distance * Math.cos(this.angle);
      this.dy = this.distance * Math.sin(this.angle);

      this.spiralLocation = (1 - Math.pow(1 - Math.random(), 3.0)) / 1.3;
      this.z = Vector2D.random(0.5 * cameraZ, cameraTravelDistance + cameraZ);

      // lerp toward midpoint based on spiral location
      this.z = this.z * (1 - 0.3 * this.spiralLocation) +
               (cameraTravelDistance / 2) * (0.3 * this.spiralLocation);

      this.strokeWeightFactor = Math.pow(Math.random(), 2.0);
    }

    render(p, ctrl) {
      const spiralPos = ctrl.spiralPath(this.spiralLocation);
      const q = p - this.spiralLocation;
      if (q <= 0) return;

      const dp = ctrl.constrain(4 * q, 0, 1);

      const linearEasing  = dp;
      const elasticEasing = ctrl.easeOutElastic(dp);
      const powerEasing   = Math.pow(dp, 2);

      let easing;
      if (dp < 0.3) {
        easing = ctrl.lerp(linearEasing, powerEasing, dp / 0.3);
      } else if (dp < 0.7) {
        const t = (dp - 0.3) / 0.4;
        easing = ctrl.lerp(powerEasing, elasticEasing, t);
      } else {
        easing = elasticEasing;
      }

      let sx, sy;

      if (dp < 0.3) {
        sx = ctrl.lerp(spiralPos.x, spiralPos.x + this.dx * 0.3, easing / 0.3);
        sy = ctrl.lerp(spiralPos.y, spiralPos.y + this.dy * 0.3, easing / 0.3);
      } else if (dp < 0.7) {
        const mp = (dp - 0.3) / 0.4;
        const cs = Math.sin(mp * Math.PI) * this.rotationDirection * 1.5;
        const bx = spiralPos.x + this.dx * 0.3;
        const by = spiralPos.y + this.dy * 0.3;
        const tx = spiralPos.x + this.dx * 0.7;
        const ty = spiralPos.y + this.dy * 0.7;
        const px = -this.dy * 0.4 * cs;
        const py =  this.dx * 0.4 * cs;
        sx = ctrl.lerp(bx, tx, mp) + px * mp;
        sy = ctrl.lerp(by, ty, mp) + py * mp;
      } else {
        const fp = (dp - 0.7) / 0.3;
        const bx = spiralPos.x + this.dx * 0.7;
        const by = spiralPos.y + this.dy * 0.7;
        const td = this.distance * this.expansionRate * 1.5;
        const sa = this.angle + 1.2 * this.rotationDirection * fp * Math.PI;
        const tx = spiralPos.x + td * Math.cos(sa);
        const ty = spiralPos.y + td * Math.sin(sa);
        sx = ctrl.lerp(bx, tx, fp);
        sy = ctrl.lerp(by, ty, fp);
      }

      const vx = (this.z - ctrl.cameraZ) * sx / ctrl.viewZoom;
      const vy = (this.z - ctrl.cameraZ) * sy / ctrl.viewZoom;
      const pos = new Vector3D(vx, vy, this.z);

      let sizeMul;
      if (dp < 0.6) {
        sizeMul = 1.0 + dp * 0.2;
      } else {
        const t = (dp - 0.6) / 0.4;
        sizeMul = 1.2 * (1 - t) + this.finalScale * t;
      }

      ctrl.showProjectedDot(pos, 8.5 * this.strokeWeightFactor * sizeMul);
    }
  }

  /* ── AnimationController ─────────────────────────────────── */
  class AnimationController {
    constructor(canvas, ctx, dpr, size) {
      this.canvas = canvas;
      this.ctx    = ctx;
      this.dpr    = dpr;
      this.size   = size;
      this.time   = 0;
      this.stars  = [];

      // Constants (need to be public for Star to access)
      this.changeEventTime      = 0.32;
      this.cameraZ              = -400;
      this.cameraTravelDistance = 3400;
      this.startDotYOffset      = 28;
      this.viewZoom             = 100;
      this.numberOfStars        = 5000;
      this.trailLength          = 80;

      this.timeline = gsap.timeline({ repeat: -1 });

      // Create seeded stars, then random stars (matches original TS behaviour)
      this._createSeededStars();
      this._createStars();
      this._setupTimeline();
    }

    _createSeededStars() {
      const origRandom = Math.random;
      let seed = 1234;
      Math.random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      this._createStars();
      Math.random = origRandom;
    }

    _createStars() {
      for (let i = 0; i < this.numberOfStars; i++) {
        this.stars.push(new Star(this.cameraZ, this.cameraTravelDistance));
      }
    }

    _setupTimeline() {
      this.timeline.to(this, {
        time:     1,
        duration: 15,
        repeat:   -1,
        ease:     'none',
        onUpdate: () => this.render()
      });
    }

    /* ── Math helpers ────────────────────────────────────── */
    ease(p, g) {
      return p < 0.5
        ? 0.5 * Math.pow(2 * p, g)
        : 1 - 0.5 * Math.pow(2 * (1 - p), g);
    }

    easeOutElastic(x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      const c4 = (2 * Math.PI) / 4.5;
      return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1;
    }

    map(value, s1, e1, s2, e2) {
      return s2 + (e2 - s2) * ((value - s1) / (e1 - s1));
    }

    constrain(v, min, max) {
      return Math.min(Math.max(v, min), max);
    }

    lerp(a, b, t) {
      return a * (1 - t) + b * t;
    }

    /* ── Spiral path ─────────────────────────────────────── */
    spiralPath(p) {
      p = this.constrain(1.2 * p, 0, 1);
      p = this.ease(p, 1.8);
      const turns = 6;
      const theta = 2 * Math.PI * turns * Math.sqrt(p);
      const r     = 170 * Math.sqrt(p);
      return new Vector2D(
        r * Math.cos(theta),
        r * Math.sin(theta) + this.startDotYOffset
      );
    }

    /* ── Rotate helper ───────────────────────────────────── */
    rotate(v1, v2, p, orientation) {
      const mx   = (v1.x + v2.x) / 2;
      const my   = (v1.y + v2.y) / 2;
      const dx   = v1.x - mx;
      const dy   = v1.y - my;
      const ang  = Math.atan2(dy, dx);
      const o    = orientation ? -1 : 1;
      const r    = Math.sqrt(dx * dx + dy * dy);
      const bnc  = Math.sin(p * Math.PI) * 0.05 * (1 - p);
      return new Vector2D(
        mx + r * (1 + bnc) * Math.cos(ang + o * Math.PI * this.easeOutElastic(p)),
        my + r * (1 + bnc) * Math.sin(ang + o * Math.PI * this.easeOutElastic(p))
      );
    }

    /* ── Project 3D → 2D and draw ────────────────────────── */
    showProjectedDot(pos, sizeFactor) {
      const t2      = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);
      const camZ    = this.cameraZ + this.ease(Math.pow(t2, 1.2), 1.8) * this.cameraTravelDistance;
      if (pos.z <= camZ) return;

      const depth = pos.z - camZ;
      const x     = this.viewZoom * pos.x / depth;
      const y     = this.viewZoom * pos.y / depth;
      const sw    = 400 * sizeFactor / depth;

      this.ctx.lineWidth = sw;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    /* ── Draw trail ──────────────────────────────────────── */
    _drawTrail(t1) {
      for (let i = 0; i < this.trailLength; i++) {
        const f        = this.map(i, 0, this.trailLength, 1.1, 0.1);
        const sw       = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f;
        const pathTime = t1 - 0.00015 * i;
        const pos      = this.spiralPath(pathTime);

        this.ctx.fillStyle  = 'white';
        this.ctx.lineWidth  = sw;

        const offset  = new Vector2D(pos.x + 5, pos.y + 5);
        const rotated = this.rotate(
          pos, offset,
          Math.sin(this.time * Math.PI * 2) * 0.5 + 0.5,
          i % 2 === 0
        );

        this.ctx.beginPath();
        this.ctx.arc(rotated.x, rotated.y, sw / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    /* ── Draw starting dot ───────────────────────────────── */
    _drawStartDot() {
      if (this.time <= this.changeEventTime) return;
      const dy  = this.cameraZ * this.startDotYOffset / this.viewZoom;
      const pos = new Vector3D(0, dy, this.cameraTravelDistance);
      this.showProjectedDot(pos, 2.5);
    }

    /* ── Main render ─────────────────────────────────────── */
    render() {
      const ctx = this.ctx;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, this.size, this.size);

      ctx.save();
      ctx.translate(this.size / 2, this.size / 2);

      const t1 = this.constrain(this.map(this.time, 0, this.changeEventTime + 0.25, 0, 1), 0, 1);
      const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);

      ctx.rotate(-Math.PI * this.ease(t2, 2.7));
      this._drawTrail(t1);

      ctx.fillStyle = 'white';
      for (const star of this.stars) {
        star.render(t1, this);
      }

      this._drawStartDot();
      ctx.restore();
    }

    pause()   { this.timeline.pause(); }
    resume()  { this.timeline.play(); }
    destroy() { this.timeline.kill(); }
  }

  /* ── Splash Orchestration ────────────────────────────────── */
  function initSpiralSplash() {
    const splash     = document.getElementById('spiral-splash');
    const canvas     = document.getElementById('spiral-canvas');
    const enterWrap  = document.getElementById('spiral-enter-wrap');
    const enterBtn   = document.getElementById('spiral-enter');

    if (!splash || !canvas || !enterBtn) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* ── Size canvas ── */
    const dpr    = window.devicePixelRatio || 1;
    let w        = window.innerWidth;
    let h        = window.innerHeight;
    let size     = Math.max(w, h);

    function sizeCanvas() {
      w    = window.innerWidth;
      h    = window.innerHeight;
      size = Math.max(w, h);

      canvas.width         = size * dpr;
      canvas.height        = size * dpr;
      canvas.style.width   = w + 'px';
      canvas.style.height  = h + 'px';
      ctx.scale(dpr, dpr);
    }

    sizeCanvas();

    /* ── Create controller ── */
    const controller = new AnimationController(canvas, ctx, dpr, size);

    /* ── Handle window resize ── */
    const onResize = () => {
      sizeCanvas();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener('resize', onResize);

    /* ── Shared exit function ── */
    let exiting = false;
    function exitSplash() {
      if (exiting) return;
      exiting = true;

      enterBtn.disabled = true;

      if (enterWrap) {
        gsap.to(enterWrap, { opacity: 0, duration: 0.5, ease: 'power2.in' });
      }

      gsap.to(canvas, {
        scale:    1.08,
        duration: 1.4,
        ease:     'power2.inOut'
      });

      gsap.to(splash, {
        opacity:  0,
        duration: 1.5,
        delay:    0.15,
        ease:     'power2.inOut',
        onComplete: () => {
          controller.destroy();
          window.removeEventListener('resize', onResize);
          splash.style.display = 'none';
        }
      });
    }

    /* ── Show "Feel something" after 2.5s ── */
    setTimeout(() => {
      if (enterWrap) enterWrap.classList.add('visible');
    }, 2500);

    /* ── Auto-exit after one full animation cycle (15s) ── */
    setTimeout(exitSplash, 15000);

    /* ── Manual click also exits early ── */
    enterBtn.addEventListener('click', exitSplash);
  }

  /* ── Boot ────────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpiralSplash);
  } else {
    initSpiralSplash();
  }

})();
