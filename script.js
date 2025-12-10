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
const packagesInput = quoteForm?.querySelector('input[name="packages"]');
const serviceSelect = quoteForm?.querySelector('select[name="service"]');
const selectedItemsContainer = quoteForm?.querySelector('.selected-items');

const packageButtons = document.querySelectorAll('.package-select');
const selectedItems = new Map();

const makeKey = (button) => {
  const pkg = (button.dataset.package || button.textContent || '').trim();
  const service = (button.dataset.service || '').trim() || (serviceSelect?.value || '').trim() || 'General';
  return `${service}::${pkg}`;
};

const renderSelections = () => {
  if (!selectedItemsContainer) return;

  selectedItemsContainer.innerHTML = '';

  if (!selectedItems.size) {
    const placeholder = document.createElement('p');
    placeholder.className = 'selected-placeholder';
    placeholder.textContent = 'Select packages or add-ons to attach them to your quote.';
    selectedItemsContainer.appendChild(placeholder);
  } else {
    selectedItems.forEach((item, key) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'selected-pill';
      pill.dataset.key = key;
      pill.innerHTML = `<span>${item.package}${item.service ? ` (${item.service})` : ''}</span><span aria-hidden="true">✕</span>`;
      pill.setAttribute('aria-label', `Remove ${item.package}`);
      selectedItemsContainer.appendChild(pill);
    });
  }

  if (packagesInput) {
    const summary = Array.from(selectedItems.values()).map((item) => `${item.package}${item.service ? ` (${item.service})` : ''}`);
    packagesInput.value = summary.join('; ');
  }
};

const updateButtonStates = () => {
  packageButtons.forEach((btn) => {
    const key = makeKey(btn);
    const defaultLabel = btn.dataset.defaultLabel || btn.dataset.package || btn.textContent.trim();
    const isSelected = selectedItems.has(key);
    btn.textContent = isSelected ? 'Selected' : defaultLabel;
    btn.classList.toggle('is-selected', isSelected);
    btn.closest('.package-card')?.classList.toggle('is-selected', isSelected);
  });
};

const toggleSelection = (button) => {
  const pkg = (button.dataset.package || button.textContent || '').trim();
  const service = (button.dataset.service || '').trim();
  const key = makeKey(button);

  if (selectedItems.has(key)) {
    selectedItems.delete(key);
  } else {
    selectedItems.set(key, { package: pkg, service });
    if (serviceSelect && service) {
      serviceSelect.value = service;
    }
  }

  renderSelections();
  updateButtonStates();
};

const setStatus = (message, type = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
};

packageButtons.forEach((button) => {
  button.addEventListener('click', () => toggleSelection(button));
});

if (selectedItemsContainer) {
  selectedItemsContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const pill = target.closest('.selected-pill');
    if (pill && pill.dataset.key) {
      selectedItems.delete(pill.dataset.key);
      renderSelections();
      updateButtonStates();
    }
  });
}

renderSelections();
updateButtonStates();

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
