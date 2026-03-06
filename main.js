/* =========================================
   M'PALATH — DESIGNER STUDIO  |  main.js
   ========================================= */

/* ── Custom Cursor ── */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.15;
  followerY += (mouseY - followerY) * 0.15;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

/* ── Loader Animation ── */
const LOADER_DURATION = 1800;

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

window.startLoader = () => {
  const reveal = document.getElementById('wordmark-reveal');
  const needleWrap = document.getElementById('needle-wrapper');
  const needle = document.getElementById('needle-svg');
  // Use the wordmark-base element width for needle tracking
  // (logo image is absolutely positioned; base gives us a stable reference width)
  const base = document.querySelector('.wordmark-base');
  const trackWidth = (base ? base.offsetWidth : reveal.offsetWidth) || 340;
  let startTime = null;

  needleWrap.style.opacity = '1';

  function animate(time) {
    if (!startTime) startTime = time;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal.style.clipPath = 'inset(0 0% 0 0)';
      needleWrap.style.opacity = '0';
      setTimeout(hideLoader, 600);
      return;
    }

    let progress = (time - startTime) / LOADER_DURATION;
    if (progress > 1) progress = 1;

    const eased = easeInOutCubic(progress);
    const insetRight = 100 - (eased * 100);
    reveal.style.clipPath = `inset(0 ${insetRight}% 0 0)`;

    const currentX = eased * trackWidth;
    const bobY = Math.sin(progress * Math.PI * 40) * 8;
    const angle = Math.cos(progress * Math.PI * 40) * 15;
    needle.style.transform = `translate(${currentX}px, ${bobY}px) rotate(${angle}deg)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      needleWrap.style.opacity = '0';
      setTimeout(hideLoader, 800);
    }
  }

  requestAnimationFrame(animate);
};

window.hideLoader = () => {
  const overlay = document.getElementById('loader-overlay');
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.style.visibility = 'hidden';
    document.body.style.overflow = 'auto';
    initSite();
  }, 400);
};

/* ── Site Initialization (runs after loader hides) ── */
function initSite() {
  initNav();
  revealHero();
  initScrollReveal();
  initServiceHovers();
  initMenuOverlay();
}

/* ── Navigation scroll state ── */
function initNav() {
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ── Hero reveal on load ── */
function revealHero() {
  document.getElementById('hero').classList.add('hero-visible');
}

/* ── Scroll-triggered reveal ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ── Service item hover interactions ── */
function initServiceHovers() {
  const items = document.querySelectorAll('.service-item');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      items.forEach(i => {
        if (i !== item) i.style.opacity = '0.45';
      });
    });
    item.addEventListener('mouseleave', () => {
      items.forEach(i => i.style.opacity = '1');
    });
  });
}

/* ── Menu Overlay ── */
function initMenuOverlay() {
  const menuBtn = document.getElementById('menu-btn');
  const overlay = document.getElementById('nav-overlay');
  const closeBtn = document.getElementById('overlay-close');
  const navLinks = overlay.querySelectorAll('.overlay-nav-links a');

  menuBtn.addEventListener('click', () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  function closeMenu() {
    overlay.classList.remove('open');
    document.body.style.overflow = 'auto';
  }

  closeBtn.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ── Ticker: duplicate items for seamless loop ── */
function initTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  track.innerHTML += track.innerHTML;
}

/* ── Smooth scroll for anchor links ── */
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  e.preventDefault();
  const target = document.querySelector(anchor.getAttribute('href'));
  if (target) {
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
});

/* ── Collection Gallery Modal ── */
function initGalleryModal() {
  const cards = document.querySelectorAll('.collection-card');
  const modal = document.getElementById('gallery-modal');
  const overlay = document.getElementById('gallery-modal-overlay');
  const closeBtn = document.getElementById('gallery-close');
  const track = document.getElementById('gallery-track');

  if (!modal || !track) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const imagesStr = card.getAttribute('data-images');
      if (!imagesStr) return;

      // prevent background scrolling
      document.body.style.overflow = 'hidden';

      const images = imagesStr.split(',');
      track.innerHTML = ''; // Clear previous

      images.forEach(src => {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = src.trim();
        img.loading = 'lazy';

        item.appendChild(img);
        track.appendChild(item);
      });

      // Show modal
      modal.classList.add('active');
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => { track.innerHTML = ''; }, 400); // clear after fade out
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ── Hero Image Slideshow ── */
function initHeroSlideshow() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 4000);
}

/* ── Boot ── */
window.addEventListener('DOMContentLoaded', () => {
  initTicker();
  initGalleryModal();
  initHeroSlideshow();
  setTimeout(window.startLoader, 200);
});
