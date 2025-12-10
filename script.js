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
const serviceSelect = quoteForm?.querySelector('select[name="service"]');
const selectionTags = quoteForm?.querySelector('.selection-tags');
const selectionEmpty = quoteForm?.querySelector('.selection-empty');
const selectionsInput = quoteForm?.querySelector('input[name="selections"]');

const packageButtons = Array.from(document.querySelectorAll('.package-select'));
packageButtons.forEach((btn) => {
  if (!btn.dataset.defaultLabel) {
    btn.dataset.defaultLabel = btn.textContent?.trim() || 'Select';
  }
});

const selections = new Map();

const setStatus = (message, type = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
};

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const makeKey = (label, service) => `${slugify(service)}::${slugify(label)}`;

const syncServiceSelect = () => {
  if (!serviceSelect) return;
  const services = Array.from(new Set(Array.from(selections.values()).map((item) => item.service)));
  if (!services.length) return;

  if (services.length === 1) {
    serviceSelect.value = services[0];
  } else {
    serviceSelect.value = 'Multiple Services';
  }
};

const syncButtonsForKey = (key, selected) => {
  packageButtons.forEach((btn) => {
    const label = btn.dataset.package || btn.dataset.label || btn.textContent?.trim() || '';
    const service = btn.dataset.service || 'Service';
    const btnKey = makeKey(label, service);

    if (btnKey === key) {
      btn.classList.toggle('is-selected', selected);
      btn.textContent = selected ? 'Selected' : btn.dataset.defaultLabel || 'Select';
      btn.closest('.package-card')?.classList.toggle('is-selected', selected);
    }
  });
};

const renderSelections = () => {
  if (!selectionTags || !selectionEmpty || !selectionsInput) return;

  selectionTags.innerHTML = '';

  if (!selections.size) {
    selectionEmpty.hidden = false;
    selectionsInput.value = '';
    return;
  }

  selectionEmpty.hidden = true;

  selections.forEach((item, key) => {
    const tag = document.createElement('span');
    tag.className = 'selection-tag';
    tag.dataset.key = key;
    tag.innerHTML = `<span class="tag-label">${item.label}</span><span class="tag-service">${item.service}</span><button type="button" class="tag-remove" aria-label="Remove ${item.label}">×</button>`;
    selectionTags.appendChild(tag);
  });

  const summary = Array.from(selections.values()).map((item) => `${item.label} (${item.service})`).join('; ');
  selectionsInput.value = summary;
};

const toggleSelection = (button) => {
  const label = button.dataset.package || button.dataset.label || button.textContent?.trim() || '';
  const service = button.dataset.service || 'Service';
  const key = makeKey(label, service);

  if (!label) return;

  if (selections.has(key)) {
    selections.delete(key);
    syncButtonsForKey(key, false);
  } else {
    selections.set(key, { label, service });
    syncButtonsForKey(key, true);
  }

  renderSelections();
  syncServiceSelect();
};

packageButtons.forEach((button) => {
  button.addEventListener('click', () => toggleSelection(button));
});

selectionTags?.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.classList.contains('tag-remove')) {
    const parent = target.closest('.selection-tag');
    const key = parent?.dataset.key;
    if (!key) return;

    selections.delete(key);
    syncButtonsForKey(key, false);
    renderSelections();
    syncServiceSelect();
  }
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
