// Utility helpers
const selectAll = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const select = (selector, scope = document) => scope.querySelector(selector);

const setFooterYear = () => {
  const yearSpan = select('#year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
};

const enableSmoothScrolling = () => {
  const anchorLinks = selectAll('a[href^="#"]');
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
};

const addClickFlash = () => {
  const clickables = selectAll('a, button, .card, .pill');
  clickables.forEach((element) => {
    element.addEventListener('click', () => {
      element.classList.add('click-flash');
      setTimeout(() => element.classList.remove('click-flash'), 280);
    });
  });
};

const setupRevealOnScroll = () => {
  const revealElements = selectAll(
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
};

const setupBackToTop = () => {
  const backToTop = select('.back-to-top');
  if (!backToTop) return;

  const toggleBackToTop = () => {
    const show = window.scrollY > 380;
    backToTop.classList.toggle('is-active', show);
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();
};

const setupQuoteForm = () => {
  const quoteForm = select('.quote-form');
  const statusEl = select('.form-status');

  const setStatus = (message, type = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.type = type;
  };

  if (!quoteForm) return;

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
};

const initSiteEnhancements = () => {
  setFooterYear();
  enableSmoothScrolling();
  addClickFlash();
  setupRevealOnScroll();
  setupBackToTop();
  setupQuoteForm();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSiteEnhancements);
} else {
  initSiteEnhancements();
}
