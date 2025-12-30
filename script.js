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

/* ---------------------------
   Package + Options Selector
----------------------------*/

// NOTE: The old form submit (Formspree) is removed.
// You now embed Jobber's form, so customers stay on your site.

const statusEl = document.querySelector('.form-status');
const selectionBadges = document.querySelector('.selection-badges');
const clearSelectionsBtn = document.querySelector('.clear-selections');
const selectionText = document.querySelector('.selection-text');

const packageButtons = document.querySelectorAll('.package-select');
const optionButtons = document.querySelectorAll('.option-select');
const readMoreButtons = document.querySelectorAll('.read-more');

const selections = new Map();

const formatPrice = (value) => `$${Number(value).toFixed(0)}`;

const frequencyLabels = {
  weekly: 'Weekly',
  ten: 'Every 10 days',
  biweekly: 'Bi-weekly',
};

const renderPackagePrice = (card, frequency) => {
  const priceEl = card.querySelector('.package-price');
  if (!priceEl) return;

  const priceKey = `price${frequency.charAt(0).toUpperCase()}${frequency.slice(1)}`;
  const basePrice = Number(card.dataset[priceKey]);
  if (!basePrice) return;

  const discount = frequency === 'weekly' ? Number(card.dataset.discount || 0) : 0;
  const finalPrice = discount ? basePrice * (1 - discount / 100) : basePrice;
  const hasDiscount = discount > 0 && frequency === 'weekly';
  const freqLabel = frequencyLabels[frequency] || frequency;

  priceEl.innerHTML = hasDiscount
    ? `<div class="price-row"><span class="price-current">${formatPrice(finalPrice)}</span><span class="price-original">${formatPrice(basePrice)}</span></div><div class="price-frequency">per visit (${freqLabel})</div><div class="price-badge">${discount}% off weekly care</div>`
    : `<div class="price-row"><span class="price-current">${formatPrice(finalPrice)}</span></div><div class="price-frequency">per visit (${freqLabel})</div>`;

  card.dataset.selectedFrequency = frequency;
  card.classList.toggle('has-discount', hasDiscount);
};

const setupFrequencyToggles = () => {
  const packageCards = document.querySelectorAll('.package-card');

  packageCards.forEach((card) => {
    const frequencyButtons = card.querySelectorAll('.frequency-option');
    if (!frequencyButtons.length) return;

    const setFrequency = (freq) => {
      frequencyButtons.forEach((button) => {
        const isActive = button.dataset.frequency === freq;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive.toString());
      });

      renderPackagePrice(card, freq);
    };

    setFrequency('weekly');

    frequencyButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const nextFrequency = button.dataset.frequency || 'weekly';
        setFrequency(nextFrequency);
      });
    });
  });
};

setupFrequencyToggles();

const setStatus = (message, type = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
};

const renderSelections = () => {
  if (!selectionBadges) return;

  selectionBadges.innerHTML = '';

  if (!selections.size) {
    const empty = document.createElement('p');
    empty.className = 'selected-empty';
    empty.textContent =
      selectionBadges.dataset.emptyText || 'Tap select above to add items to your quote.';
    selectionBadges.appendChild(empty);
    if (selectionText) selectionText.value = '';
    setStatus('', 'info');
    return;
  }

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
          btn.closest('.package-card')?.classList.remove('is-selected');
          btn.textContent = 'Select package';
        });
      } else if (item.kind === 'option') {
        optionButtons.forEach((btn) => {
          if (btn.dataset.option === item.raw) setOptionButtonContent(btn, false);
        });
      }

      renderSelections();
    });

    selectionBadges.appendChild(chip);
  });

  const joined = Array.from(selections.values())
    .map((item) => item.label)
    .join(', ');

  if (selectionText) selectionText.value = joined;
  setStatus('Selections saved. Now complete the form below.', 'info');
};

const handlePackageSelect = (button) => {
  const pkg = button.dataset.package || '';
  const service = button.dataset.service || '';
  const label = service ? `${pkg} (${service})` : pkg;

  // UI highlight
  packageButtons.forEach((btn) => {
    const isActive = btn === button;
    btn.closest('.package-card')?.classList.toggle('is-selected', isActive);
    btn.textContent = isActive ? 'Selected' : 'Select package';
  });

  // Only allow ONE package at a time
  selections.forEach((item, key) => {
    if (item.kind === 'package') selections.delete(key);
  });

  selections.set(`package-${pkg}`, { label, kind: 'package', raw: pkg });
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

    if (alreadySelected) selections.delete(key);
    else selections.set(key, { label: option, kind: 'option', raw: option });

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
    selections.clear();

    packageButtons.forEach((btn) => {
      btn.closest('.package-card')?.classList.remove('is-selected');
      btn.textContent = 'Select package';
    });

    optionButtons.forEach((btn) => {
      setOptionButtonContent(btn, false);
    });

    renderSelections();
  });
}
