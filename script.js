
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
const tallyFormUrl = document.body.dataset.tallyFormUrl || 'https://tally.so/r/w2xMe1';
const statusEl = quoteForm?.querySelector('.form-status');
const packageInput = quoteForm?.querySelector('input[name="package"]');
const selectionsInput = quoteForm?.querySelector('input[name="selections"]');
const selectionBadges = quoteForm?.querySelector('.selection-badges');
const clearSelectionsBtn = quoteForm?.querySelector('.clear-selections');
const serviceSelect = quoteForm?.querySelector('select[name="service"]');
const defaultService = quoteForm?.dataset.defaultService;

const packageButtons = document.querySelectorAll('.package-select');
const optionButtons = document.querySelectorAll('.option-select');
const readMoreButtons = document.querySelectorAll('.read-more');

const selections = new Map();

const setStatus = (message, type = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
};

const renderSelections = () => {
  if (!selectionBadges || !selectionsInput) return;

  selectionBadges.innerHTML = '';

  if (!selections.size) {
    const empty = document.createElement('p');
    empty.className = 'selected-empty';
    empty.textContent = selectionBadges.dataset.emptyText || 'Tap select above to add items to your quote.';
    selectionBadges.appendChild(empty);
  } else {
    selections.forEach((item, key) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'selection-chip';
      chip.dataset.key = key;
      chip.innerHTML = `<span>${item.label}</span><span aria-hidden="true">×</span>`;
      chip.setAttribute('aria-label', `Remove ${item.label} from quote`);
      chip.addEventListener('click', () => {
        selections.delete(key);
        if (item.kind === 'package') {
          packageButtons.forEach((btn) => {
            const isMatch = btn.dataset.package === item.raw;
            btn.closest('.package-card')?.classList.toggle('is-selected', false);
            btn.textContent = isMatch ? 'Select package' : btn.textContent;
          });
          if (packageInput) packageInput.value = '';
        } else if (item.kind === 'option') {
          optionButtons.forEach((btn) => {
            if (btn.dataset.option === item.raw) {
              setOptionButtonContent(btn, false);
            }
          });
        }
        renderSelections();
      });
      selectionBadges.appendChild(chip);
    });
  }

  const joined = Array.from(selections.values())
    .map((item) => item.label)
    .join(', ');

  selectionsInput.value = joined;
};

const resetSelections = () => {
  selections.clear();
  packageButtons.forEach((btn) => {
    btn.closest('.package-card')?.classList.remove('is-selected');
    btn.textContent = 'Select package';
  });
  optionButtons.forEach((btn) => {
    setOptionButtonContent(btn, false);
  });
  if (packageInput) packageInput.value = '';
  if (serviceSelect) {
    serviceSelect.value = defaultService || '';
  }
  renderSelections();
};

const handlePackageSelect = (button) => {
  const pkg = button.dataset.package || '';
  const service = button.dataset.service || '';
  const label = service ? `${pkg} (${service})` : pkg;

  packageButtons.forEach((btn) => {
    const isActive = btn === button;
    btn.closest('.package-card')?.classList.toggle('is-selected', isActive);
    btn.textContent = isActive ? 'Selected' : 'Select package';
  });

  selections.forEach((item, key) => {
    if (item.kind === 'package') selections.delete(key);
  });

  selections.set(`package-${pkg}`, { label, kind: 'package', raw: pkg });

  if (packageInput) packageInput.value = pkg;
  if (serviceSelect && service) serviceSelect.value = service;
  renderSelections();
};

packageButtons.forEach((button) => {
  button.addEventListener('click', () => handlePackageSelect(button));
});

const setOptionButtonContent = (button, isSelected) => {
  const optionLabel = button.dataset.option || button.textContent || '';
  button.innerHTML = `<span class="option-label">${optionLabel}</span><span class="option-status">${isSelected ? 'Selected' : 'Select'}</span>`;
  button.classList.toggle('is-selected', isSelected);
};

optionButtons.forEach((button) => {
  setOptionButtonContent(button, false);

  button.addEventListener('click', () => {
    const option = button.dataset.option || button.textContent || '';
    const key = `option-${option}`;
    const alreadySelected = selections.has(key);

    setOptionButtonContent(button, !alreadySelected);

    if (alreadySelected) {
      selections.delete(key);
    } else {
      selections.set(key, { label: option, kind: 'option', raw: option });
    }

    renderSelections();
  });
});

readMoreButtons.forEach((button) => {
  const descId = button.getAttribute('aria-controls');
  const desc = descId ? document.getElementById(descId) : null;

  if (!desc) return;

  desc.hidden = true;

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    const nextState = !expanded;

    button.setAttribute('aria-expanded', nextState.toString());
    button.textContent = nextState ? 'Hide details' : 'Read more';
    desc.hidden = !nextState;
    desc.classList.toggle('is-open', nextState);
  });
});

renderSelections();

if (clearSelectionsBtn) {
  clearSelectionsBtn.addEventListener('click', () => {
    resetSelections();
  });
}

if (quoteForm && serviceSelect && defaultService) {
  serviceSelect.value = defaultService;
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

    event.preventDefault();

    const url = new URL(tallyFormUrl);
    url.searchParams.set('Name', name);
    url.searchParams.set('Phone', phone);
    url.searchParams.set('Address / Area', area);
    url.searchParams.set('Service needed', (formData.get('service') || '').toString());
    url.searchParams.set('Selected items', (formData.get('selections') || '').toString());
    url.searchParams.set('Package choice', (formData.get('package') || '').toString());
    url.searchParams.set('Details', (formData.get('details') || '').toString());

    const tallyWindow = window.open(url.toString(), '_blank', 'noopener');
    if (!tallyWindow) {
      window.location.href = url.toString();
    }

    quoteForm.reset();
    resetSelections();
    setStatus('Opening Tally to finish your quote…', 'success');
  });
}
