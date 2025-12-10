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
const statusEl = quoteForm?.querySelector('.form-status');
const selectedPackageEl = quoteForm?.querySelector('.selected-package');
const packageInput = quoteForm?.querySelector('input[name="package"]');
const serviceSelect = quoteForm?.querySelector('select[name="service"]');

const packageButtons = document.querySelectorAll('.package-select');

const setStatus = (message, type = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
};

const updatePackage = (button) => {
  const pkg = button.dataset.package || '';
  const service = button.dataset.service || '';

  packageButtons.forEach((btn) => btn.closest('.package-card')?.classList.remove('is-selected'));
  button.closest('.package-card')?.classList.add('is-selected');

  if (packageInput) packageInput.value = pkg;
  if (serviceSelect && service) serviceSelect.value = service;
  if (selectedPackageEl) {
    selectedPackageEl.textContent = pkg ? `${pkg}${service ? ` (${service})` : ''}` : 'Tap a package above to attach it automatically.';
    selectedPackageEl.classList.toggle('is-empty', !pkg);
  }
};

packageButtons.forEach((button) => {
  button.addEventListener('click', () => updatePackage(button));
});

if (quoteForm && serviceSelect) {
  const defaultService = quoteForm.dataset.defaultService;
  if (defaultService) {
    serviceSelect.value = defaultService;
  }
}

if (quoteForm) {
  quoteForm.addEventListener('submit', (event) => {
    const formData = new FormData(quoteForm);
    const name = (formData.get('name') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();
    const area = (formData.get('address') || '').toString().trim();

    const errors = [];
    if (!name) errors.push('Please include your name.');
    if (!phone.match(/^[+\d][\d\s()-]{6,}$/)) {
      errors.push('Add a reachable phone number (digits only is fine).');
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
