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

// Quote form validation + friendly feedback + package syncing
const quoteForms = document.querySelectorAll('.quote-form');
const packageButtons = document.querySelectorAll('.package-select');
const selectionState = new Map();

const refreshButtonState = (button) => {
  const key = button.dataset.key;
  const isActive = key ? selectionState.has(key) : false;
  const defaultText = button.dataset.defaultText || button.textContent.trim();

  button.dataset.defaultText = defaultText;
  button.textContent = isActive ? 'Selected' : defaultText;
  button.closest('.package-card')?.classList.toggle('is-selected', isActive);
};

const syncSelectedLists = () => {
  const labels = Array.from(selectionState.values());
  const keys = Array.from(selectionState.keys());

  quoteForms.forEach((form) => {
    const hiddenInput = form.querySelector('input[name="packages"]');
    const tagList = form.querySelector('.selected-tags');
    const placeholder = form.querySelector('.selected-placeholder');

    if (hiddenInput) {
      hiddenInput.value = labels.join(', ');
    }

    if (placeholder) {
      placeholder.classList.toggle('is-hidden', labels.length > 0);
    }

    if (tagList) {
      tagList.innerHTML = '';
      labels.forEach((label, index) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = 'selected-tag';
        pill.dataset.removeKey = keys[index];
        pill.innerHTML = `<span>${label}</span><span aria-hidden="true">×</span>`;
        pill.setAttribute('aria-label', `Remove ${label} from quote`);
        tagList.appendChild(pill);
      });
    }
  });

  packageButtons.forEach(refreshButtonState);
};

packageButtons.forEach((button) => {
  const pkg = button.dataset.package || button.textContent.trim();
  const service = button.dataset.service || '';
  const key = button.dataset.key || `${service}:${pkg}`;
  button.dataset.key = key;
  button.dataset.defaultText = button.dataset.defaultText || button.textContent.trim();

  button.addEventListener('click', () => {
    const label = service ? `${pkg} (${service})` : pkg;
    if (selectionState.has(key)) {
      selectionState.delete(key);
    } else {
      selectionState.set(key, label);

      // If only one service is chosen, gently set it on the form dropdowns
      if (service) {
        quoteForms.forEach((form) => {
          const select = form.querySelector('select[name="service"]');
          if (select && (!select.value || select.dataset.auto === 'true')) {
            select.value = service;
            select.dataset.auto = 'true';
          }
        });
      }
    }

    syncSelectedLists();
  });
});

document.addEventListener('click', (event) => {
  const removeBtn = event.target.closest('.selected-tag');
  if (!removeBtn?.dataset.removeKey) return;

  selectionState.delete(removeBtn.dataset.removeKey);
  syncSelectedLists();
});

quoteForms.forEach((form) => {
  const statusEl = form.querySelector('.form-status');
  const setStatus = (message, type = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.type = type;
  };

  const defaultService = form.dataset.defaultService;
  const serviceSelect = form.querySelector('select[name="service"]');
  if (defaultService && serviceSelect) {
    serviceSelect.value = defaultService;
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', () => {
      serviceSelect.dataset.auto = 'false';
    });
  }

  form.addEventListener('submit', (event) => {
    const formData = new FormData(form);
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
});

syncSelectedLists();
