// Footer year
const yearSpan = document.getElementById('year');
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Smooth scrolling for on-page anchors
const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href')?.replace('#', '');
    if (!targetId) return;
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      event.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Hide header on swipe / scroll for mobile breathing room
const header = document.querySelector('.site-header');
if (header) {
  let lastScrollY = window.scrollY;
  let touchStartY = null;

  const hideHeader = () => document.body.classList.add('nav-hidden');
  const showHeader = () => document.body.classList.remove('nav-hidden');

  window.addEventListener(
    'scroll',
    () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY + 12) {
        hideHeader();
      } else if (currentY < lastScrollY - 12) {
        showHeader();
      }
      lastScrollY = currentY;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchstart',
    (event) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (event) => {
      if (touchStartY === null) return;
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = touchStartY - currentY;
      if (Math.abs(delta) > 24) {
        if (delta > 0) {
          hideHeader();
        } else {
          showHeader();
        }
        touchStartY = null;
      }
    },
    { passive: true }
  );
}

// Click highlight for interactive elements
const clickables = document.querySelectorAll('a, button, .card, .pill');
clickables.forEach((el) => {
  el.addEventListener('click', () => {
    el.classList.add('click-flash');
    setTimeout(() => el.classList.remove('click-flash'), 280);
  });
});

// Reveal on scroll
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
  { threshold: 0.18 }
);

revealElements.forEach((element) => {
  element.classList.add('will-reveal');
  revealObserver.observe(element);
});

// Back to top button
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  const toggleBackToTop = () => {
    const show = window.scrollY > 380;
    backToTop.classList.toggle('is-active', show);
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();
}

// Quote form validation + friendly feedback
const quoteForm = document.querySelector('.quote-form');
const statusEl = document.querySelector('.form-status');

const setStatus = (message, type = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
};

if (quoteForm) {
  quoteForm.addEventListener('submit', (event) => {
    const formData = new FormData(quoteForm);
    const name = (formData.get('name') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const area = (formData.get('address') || '').toString().trim();

    const errors = [];
    if (!name) errors.push('Please include your name.');
    if (!phone.match(/^[+\d][\d\s()-]{6,}$/)) {
      errors.push('Add a reachable phone number (digits only is fine).');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('That email doesn’t look quite right.');
    }
    if (!area) errors.push('Let us know your neighborhood so we can quote quickly.');

    if (errors.length) {
      event.preventDefault();
      setStatus(errors[0], 'error');
      return;
    }

    setStatus('Sending your request…', 'info');
  });
}

// Tier program toggles
const programSections = document.querySelectorAll('.programs');

programSections.forEach((section) => {
  const service = section.dataset.service;
  const cards = Array.from(section.querySelectorAll('.program-card'));
  const form = service ? document.querySelector(`form[data-service-form="${service}"]`) : null;
  const tierSelect = form?.querySelector('select[name="tier"]');

  const setActive = (card) => {
    cards.forEach((c) => c.classList.toggle('is-active', c === card));
    const label = (card.dataset.programLabel || card.querySelector('h3')?.textContent || '').trim();
    if (tierSelect && label) {
      tierSelect.value = label;
    }
  };

  cards.forEach((card, index) => {
    card.addEventListener('click', () => setActive(card));
    if (index === 0) setActive(card);
  });
});

