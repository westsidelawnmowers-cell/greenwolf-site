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

const optionButtons = document.querySelectorAll('.option-select');
const readMoreButtons = document.querySelectorAll('.read-more');

const selections = new Map();

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

      if (item.kind === 'option') {
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

    optionButtons.forEach((btn) => {
      setOptionButtonContent(btn, false);
    });

    renderSelections();
  });
}
