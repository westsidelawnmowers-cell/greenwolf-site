const SITE_PHONE_URI = '+16395979351';

function getPageKey() {
  const path = window.location.pathname;
  const base = path.split('/').pop();
  return base ? base.toLowerCase() : 'index.html';
}

function getPrimaryCtaHref() {
  if (document.getElementById('quote')) return '#quote';
  return getPageKey() === 'index.html' ? '#services' : 'index.html#services';
}

function emitAnalyticsEvent(eventName, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

function setFooterYear() {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

function setupSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href')?.replace('#', '');
      if (!targetId) return;

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function setupClickFlash() {
  document.addEventListener('click', (event) => {
    const clickable = event.target.closest('a, button, .card, .pill');
    if (!clickable) return;

    clickable.classList.add('click-flash');
    window.setTimeout(() => clickable.classList.remove('click-flash'), 280);
  });
}

function setupRevealOnScroll() {
  const revealElements = document.querySelectorAll(
    'section, .card, .feature, .quote-block, .hero-media, .hero h2, .hero p, .hero-bullets li, .hero-actions, .site-header'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((element) => {
    element.classList.add('will-reveal');
    revealObserver.observe(element);
  });
}

function setupBackToTop() {
  const backToTop = document.querySelector('.back-to-top');
  if (!backToTop) return;

  const toggleBackToTop = () => {
    const show = window.scrollY > 380;
    backToTop.classList.toggle('is-active', show);
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    emitAnalyticsEvent('back_to_top_click', { page: getPageKey() });
  });

  document.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();
}

function setupHideHeaderOnScroll() {
  const siteHeader = document.querySelector('.site-header');
  if (!siteHeader) return;

  let lastScrollY = window.scrollY;
  let lastHideY = window.scrollY;
  let ticking = false;

  const updateHeaderVisibility = () => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    const isNearTop = currentY < 80;
    const headerIsHidden = siteHeader.classList.contains('is-hidden');

    if (isNearTop) {
      siteHeader.classList.remove('is-hidden');
    } else if (!headerIsHidden && delta > 6 && currentY > 120) {
      siteHeader.classList.add('is-hidden');
      lastHideY = currentY;
    } else if (headerIsHidden && (delta < -18 || lastHideY - currentY > 28)) {
      siteHeader.classList.remove('is-hidden');
    }

    lastScrollY = currentY;
    ticking = false;
  };

  document.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderVisibility);
        ticking = true;
      }
    },
    { passive: true }
  );
}

function setupMobileNav() {
  const siteHeader = document.querySelector('.site-header');
  const headerContent = document.querySelector('.header-content');
  const nav = document.querySelector('.main-nav');
  if (!siteHeader || !headerContent || !nav || headerContent.querySelector('.nav-toggle')) return;

  nav.id = nav.id || 'primary-nav';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'nav-toggle';
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.setAttribute('aria-controls', nav.id);
  toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
  toggleButton.innerHTML = '<span></span><span></span><span></span>';

  headerContent.insertBefore(toggleButton, nav);

  const closeNav = () => {
    nav.classList.remove('is-open');
    siteHeader.classList.remove('nav-open');
    toggleButton.setAttribute('aria-expanded', 'false');
  };

  toggleButton.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', willOpen);
    siteHeader.classList.toggle('nav-open', willOpen);
    toggleButton.setAttribute('aria-expanded', String(willOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (event) => {
    if (!siteHeader.classList.contains('nav-open')) return;
    if (!siteHeader.contains(event.target)) {
      closeNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      closeNav();
    }
  });
}

function setupMobileCtaBar() {
  if (document.querySelector('.mobile-cta-bar')) return;

  const hasQuoteSection = Boolean(document.getElementById('quote'));
  const primaryHref = getPrimaryCtaHref();
  const primaryLabel = hasQuoteSection ? 'Get Quote' : 'Services';
  const primaryTrack = hasQuoteSection ? 'quote_click' : 'services_click';

  const bar = document.createElement('div');
  bar.className = 'mobile-cta-bar';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Quick actions');
  bar.innerHTML = `
    <a class="mobile-cta-btn" href="tel:${SITE_PHONE_URI}" data-track="call_click">Call</a>
    <a class="mobile-cta-btn" href="sms:${SITE_PHONE_URI}" data-track="text_click">Text</a>
    <a class="mobile-cta-btn mobile-cta-btn--primary" href="${primaryHref}" data-track="${primaryTrack}">${primaryLabel}</a>
  `;

  document.body.appendChild(bar);
  document.body.classList.add('has-mobile-cta');
}

function setupTracking() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button');
    if (!target) return;

    const href = target.getAttribute('href') || '';
    const label = (target.textContent || '').trim().slice(0, 80);

    if (target.dataset.track) {
      emitAnalyticsEvent(target.dataset.track, { page: getPageKey(), label });
      return;
    }

    if (href.startsWith('tel:')) {
      emitAnalyticsEvent('call_click', { page: getPageKey(), label });
    } else if (href.startsWith('sms:')) {
      emitAnalyticsEvent('text_click', { page: getPageKey(), label });
    } else if (href.includes('clienthub.getjobber.com')) {
      emitAnalyticsEvent('client_portal_click', { page: getPageKey(), label });
    } else if (href.includes('#quote')) {
      emitAnalyticsEvent('quote_click', { page: getPageKey(), label });
    } else if (href.includes('#services')) {
      emitAnalyticsEvent('services_click', { page: getPageKey(), label });
    }
  });

  const quoteSection = document.getElementById('quote');
  if (quoteSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            emitAnalyticsEvent('quote_section_view', { page: getPageKey() });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(quoteSection);
  }
}

function optimizeMedia() {
  document.querySelectorAll('img').forEach((img) => {
    if (!img.closest('.hero')) {
      img.loading = img.loading || 'lazy';
      img.decoding = img.decoding || 'async';
    }
  });

  const pagePosterMap = {
    'index.html': 'images/1.jpeg',
    'snow.html': 'images/3001.jpeg',
    'lawn.html': 'images/9.jpeg',
    'landscaping.html': 'images/2001.jpg',
    'cleanup.html': 'images/2001.jpg',
    'gallery.html': 'images/3001.jpeg'
  };

  const poster = pagePosterMap[getPageKey()] || 'images/1.jpeg';
  document.querySelectorAll('video').forEach((video) => {
    if (!video.getAttribute('preload') || video.getAttribute('preload') === 'auto') {
      video.setAttribute('preload', 'metadata');
    }

    if (!video.getAttribute('poster')) {
      video.setAttribute('poster', poster);
    }
  });
}

function init() {
  setFooterYear();
  setupSmoothScrolling();
  setupClickFlash();
  setupRevealOnScroll();
  setupBackToTop();
  setupHideHeaderOnScroll();
  setupMobileNav();
  setupMobileCtaBar();
  optimizeMedia();
  setupTracking();
}

init();
