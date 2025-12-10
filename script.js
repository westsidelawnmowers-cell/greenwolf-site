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

// Quote form validation + friendly feedback (works for all forms)
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
});

// Package selection → quote form auto-fill
const packageGrids = document.querySelectorAll('.package-grid');

packageGrids.forEach((grid) => {
  const targetFormId = grid.dataset.form;
  const radios = grid.querySelectorAll('input[type="radio"]');

  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      const packageLabel = radio.dataset.package || radio.value;
      const form =
        (targetFormId && document.getElementById(targetFormId)) ||
        grid.closest('section')?.querySelector('.quote-form') ||
        document.querySelector('.quote-form');

      // Toggle selected style
      radios.forEach((other) => other.closest('.package-card')?.classList.remove('is-selected'));
      radio.closest('.package-card')?.classList.add('is-selected');

      if (!form) return;
      const selectedField = form.querySelector('.selected-package');
      const detailsField = form.querySelector('textarea[name="details"]');

      if (selectedField) {
        selectedField.value = packageLabel;
      }
      if (detailsField && !detailsField.value.trim()) {
        detailsField.value = `Package: ${packageLabel}\nNotes: `;
      }
    });
  });
});
