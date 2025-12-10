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

quoteForms.forEach((quoteForm) => {
  const statusEl = quoteForm.querySelector('.form-status');

  const setStatus = (message, type = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.type = type;
  };

  quoteForm.addEventListener('submit', (event) => {
    const formData = new FormData(quoteForm);
    const name = (formData.get('name') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();
    const service = (formData.get('service') || '').toString().trim();

    const errors = [];
    if (!name) errors.push('Please include your name.');
    if (!phone.match(/^[+\d][\d\s()-]{6,}$/)) {
      errors.push('Add a reachable phone number (digits only is fine).');
    }
    if (!service) errors.push('Select the service you want quoted.');

    if (errors.length) {
      event.preventDefault();
      setStatus(errors[0], 'error');
      return;
    }

    setStatus('Sending your request…', 'info');
  });
});

// Package selection -> quote form helper
const packageButtons = document.querySelectorAll('.add-package');

packageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const { packageName, packageDetails, service, targetForm } = button.dataset;
    const target = (targetForm && document.getElementById(targetForm)) || document.querySelector('.quote-form');
    if (!target) return;

    const serviceSelect = target.querySelector('select[name="service"]');
    const packageInput = target.querySelector('input[name="package"]');
    const detailsField = target.querySelector('textarea[name="details"]');
    const statusEl = target.querySelector('.form-status');

    if (serviceSelect && service) {
      const option = Array.from(serviceSelect.options).find((opt) => opt.value === service);
      if (option) serviceSelect.value = service;
    }

    if (packageInput && packageName) {
      packageInput.value = packageName;
    }

    if (detailsField && packageDetails) {
      const current = detailsField.value.trim();
      const detailLine = `${packageName} — ${packageDetails}`;
      detailsField.value = current ? `${current}\n${detailLine}` : detailLine;
    }

    if (statusEl && packageName) {
      statusEl.textContent = `${packageName} added to your quote.`;
      statusEl.dataset.type = 'info';
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
