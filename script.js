const SITE_PHONE_DISPLAY = '639-597-9351';
const SITE_PHONE_URI = '+16395979351';

function getPageKey() {
  const path = window.location.pathname;
  const base = path.split('/').pop();
  return base ? base.toLowerCase() : 'index.html';
}

function getQuoteHref() {
  return document.getElementById('quote') ? '#quote' : 'index.html#quote';
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

function injectHowItWorks() {
  const quoteSection = document.getElementById('quote');
  if (!quoteSection || document.getElementById('how-it-works')) return;

  const section = document.createElement('section');
  section.className = 'section alt-section';
  section.id = 'how-it-works';
  section.innerHTML = `
    <div class="container">
      <h2>How It Works</h2>
      <p class="section-lead">Fast process, clear communication, and no pressure.</p>
      <div class="how-it-works-grid">
        <article class="how-step">
          <span class="how-step-num">1</span>
          <h3>Request Quote</h3>
          <p>Choose your service and share your address in under 2 minutes.</p>
        </article>
        <article class="how-step">
          <span class="how-step-num">2</span>
          <h3>Confirm Plan</h3>
          <p>We confirm timing, pricing, and service details with no hidden fees.</p>
        </article>
        <article class="how-step">
          <span class="how-step-num">3</span>
          <h3>Service Day</h3>
          <p>Our crew completes the work and keeps you updated throughout.</p>
        </article>
      </div>
    </div>
  `;

  quoteSection.parentNode.insertBefore(section, quoteSection);
}

function injectTrustStrip() {
  const quoteSection = document.getElementById('quote');
  if (!quoteSection) return;

  const container = quoteSection.querySelector('.container');
  if (!container || container.querySelector('.trust-strip')) return;

  const strip = document.createElement('div');
  strip.className = 'trust-strip';
  strip.innerHTML = `
    <span class="trust-pill">Owner-Operated</span>
    <span class="trust-pill">Fully Insured</span>
    <span class="trust-pill">5-Star Local Reputation</span>
    <span class="trust-pill">Same-Day Reply (When Possible)</span>
  `;

  container.insertBefore(strip, container.firstChild);
}

function injectServiceAreaCard() {
  const quoteSection = document.getElementById('quote');
  if (!quoteSection) return;

  const leftColumn = quoteSection.querySelector('.split-grid > div:first-child');
  if (!leftColumn || leftColumn.querySelector('.service-area-card')) return;

  const areaCard = document.createElement('div');
  areaCard.className = 'service-area-card';
  areaCard.innerHTML = `
    <h3>Service Area & Response Time</h3>
    <p><strong>Primary area:</strong> Saskatoon</p>
    <p><strong>Response:</strong> Same-day replies when possible.</p>
    <p><strong>Contact:</strong> <a href="tel:${SITE_PHONE_URI}" data-track="call_click">${SITE_PHONE_DISPLAY}</a> or <a href="mailto:info@greenwolf.work" data-track="email_click">info@greenwolf.work</a></p>
  `;

  leftColumn.appendChild(areaCard);
}

function injectPreQualificationCard() {
  const quoteSection = document.getElementById('quote');
  if (!quoteSection) return;

  const leftColumn = quoteSection.querySelector('.split-grid > div:first-child');
  if (!leftColumn || leftColumn.querySelector('.prequal-card')) return;

  const card = document.createElement('form');
  card.className = 'prequal-card';
  card.id = 'prequal-form';
  card.innerHTML = `
    <h3>Quick Pre-Qualification</h3>
    <p class="small-text">Share a few details so your quote is faster and more accurate.</p>
    <label>Service
      <select name="service" required>
        <option value="">Select...</option>
        <option>Lawn care</option>
        <option>Weed control</option>
        <option>Fertilization</option>
        <option>Snow removal</option>
        <option>Landscaping</option>
        <option>Seasonal cleanup</option>
      </select>
    </label>
    <label>Property type
      <select name="property" required>
        <option value="">Select...</option>
        <option>Residential</option>
        <option>Commercial</option>
      </select>
    </label>
    <label>Property size
      <select name="size" required>
        <option value="">Select...</option>
        <option>Small lot</option>
        <option>Medium lot</option>
        <option>Large lot</option>
      </select>
    </label>
    <label>Preferred start
      <select name="start" required>
        <option value="">Select...</option>
        <option>ASAP</option>
        <option>Within 1 week</option>
        <option>Within 2-4 weeks</option>
      </select>
    </label>
    <button class="btn btn-primary" type="submit">Save details and continue</button>
    <p class="small-text" id="prequal-status" aria-live="polite"></p>
  `;

  card.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(card);
    const summary = `Service: ${formData.get('service')} | Property: ${formData.get('property')} | Size: ${formData.get('size')} | Start: ${formData.get('start')}`;
    const status = card.querySelector('#prequal-status');

    window.localStorage.setItem('greenwolf_prequal', summary);
    if (status) {
      status.textContent = `Saved: ${summary}. Add this in the quote notes.`;
    }

    emitAnalyticsEvent('prequal_submit', {
      page: getPageKey(),
      service: String(formData.get('service') || ''),
      property: String(formData.get('property') || '')
    });

    const quoteForm = quoteSection.querySelector('.quote-form');
    if (quoteForm) {
      quoteForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  leftColumn.appendChild(card);
}

function injectFaqSection() {
  if (document.getElementById('faq')) return;

  const page = getPageKey();
  const faqByPage = {
    'index.html': {
      title: 'Frequently Asked Questions',
      items: [
        ['Do you offer lawn care, weed control, and fertilization in Saskatoon?', 'Yes. We provide lawn mowing, weed control treatments, and fertilization plans in Saskatoon.'],
        ['How quickly do you respond to new quote requests?', 'We aim to reply the same day when possible, especially during peak lawn season.'],
        ['Do you service residential and commercial properties?', 'Yes. We work with both homeowners and commercial properties.'],
        ['Do you have contracts?', 'We offer both recurring plans and one-time services depending on your needs.']
      ]
    },
    'lawn.html': {
      title: 'Lawn, Weed Control & Fertilization FAQs',
      items: [
        ['What lawn services are included?', 'We offer mowing, trimming, edging, weed control, and fertilization options.'],
        ['How often should fertilizer be applied?', 'Most properties benefit from scheduled seasonal applications. We recommend a plan after reviewing your lawn condition.'],
        ['Do weed control treatments harm healthy grass?', 'When applied properly, treatments target weeds while protecting healthy turf.'],
        ['Can I book weed control without mowing?', 'Yes. Weed control and fertilization can be booked as standalone services.']
      ]
    }
  };

  const fallback = {
    title: 'Frequently Asked Questions',
    items: [
      ['How do I request a quote?', 'Use the quote form on this page and include your service type and address.'],
      ['How fast do you reply?', 'We reply as quickly as possible, often same-day during normal business hours.'],
      ['Do you provide one-time and recurring service?', 'Yes. We offer both one-time jobs and recurring seasonal plans.']
    ]
  };

  const faqContent = faqByPage[page] || fallback;
  const reviewsSection = document.getElementById('reviews');
  const footer = document.querySelector('footer.footer');
  const anchor = reviewsSection || footer;
  if (!anchor || !anchor.parentNode) return;

  const section = document.createElement('section');
  section.className = 'section alt-section';
  section.id = 'faq';

  const itemsHtml = faqContent.items
    .map(
      ([question, answer]) => `
        <details class="faq-item">
          <summary>${question}</summary>
          <p>${answer}</p>
        </details>
      `
    )
    .join('');

  section.innerHTML = `
    <div class="container">
      <h2>${faqContent.title}</h2>
      <p class="section-lead">Quick answers to common questions before you book.</p>
      <div class="faq-grid">${itemsHtml}</div>
    </div>
  `;

  anchor.parentNode.insertBefore(section, anchor);
}

function setupMobileCtaBar() {
  if (document.querySelector('.mobile-cta-bar')) return;

  const bar = document.createElement('div');
  bar.className = 'mobile-cta-bar';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Quick actions');
  bar.innerHTML = `
    <a class="mobile-cta-btn" href="tel:${SITE_PHONE_URI}" data-track="call_click">Call</a>
    <a class="mobile-cta-btn" href="sms:${SITE_PHONE_URI}" data-track="text_click">Text</a>
    <a class="mobile-cta-btn mobile-cta-btn--primary" href="${getQuoteHref()}" data-track="quote_click">Get Quote</a>
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

  const page = getPageKey();
  if (page === 'index.html') {
    injectHowItWorks();
    injectFaqSection();
  }

  setupMobileCtaBar();

  optimizeMedia();
  setupTracking();
}

init();






