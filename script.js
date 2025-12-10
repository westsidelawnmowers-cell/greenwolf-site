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
const quoteForms = document.querySelectorAll('.quote-form');

quoteForms.forEach((form) => {
  const statusEl = form.querySelector('.form-status');

  const setStatus = (message, type = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.type = type;
  };

  form.addEventListener('submit', (event) => {
    const formData = new FormData(form);
    const name = (formData.get('name') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const area = (formData.get('address') || '').toString().trim();
    const service = (formData.get('service') || '').toString().trim();

    const errors = [];
    if (!name) errors.push('Please include your name.');
    if (!phone.match(/^[+\d][\d\s()-]{6,}$/)) {
      errors.push('Add a reachable phone number (digits only is fine).');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('That email doesn’t look quite right.');
    }
    if (!area) errors.push('Share your area or address so we can quote quickly.');
    if (!service) errors.push('Pick a service so we route your request correctly.');

    if (errors.length) {
      event.preventDefault();
      setStatus(errors[0], 'error');
      return;
    }

    setStatus('Sending your request…', 'info');
  });
});

// Package selection -> quote form sync
const packageCards = document.querySelectorAll('.package-card');
const serviceField = document.querySelector('select[name="service"]');
const packageField = document.querySelector('input[name="package"]');
const selectionNote = document.querySelector('.package-selection-note');

packageCards.forEach((card) => {
  card.addEventListener('click', () => {
    const selectedPackage = card.dataset.package;
    const selectedService = card.dataset.service;

    packageCards.forEach((item) => {
      item.classList.toggle('is-selected', item === card);
    });

    if (serviceField) {
      const option = Array.from(serviceField.options).find(
        (opt) => opt.value === selectedService
      );
      if (option) {
        serviceField.value = selectedService;
      }
    }

    if (packageField) {
      packageField.value = `${selectedService}: ${selectedPackage}`;
    }

    if (selectionNote) {
      selectionNote.textContent = `${selectedPackage} added to your quote.`;
      selectionNote.dataset.state = 'active';
    }
  });
});
