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

// Program selector for lawn packages
const programCards = document.querySelectorAll('.program-card');
const programTitle = document.getElementById('program-title');
const programTier = document.getElementById('program-tier');
const programDescription = document.getElementById('program-description');
const programFeatures = document.querySelectorAll('.program-feature');
const packageOptions = document.getElementById('package-options');
const priceAmount = document.getElementById('price-amount');
const priceNote = document.getElementById('price-note');
const offerSticker = document.getElementById('offer-sticker');
const packageSummaryField = document.getElementById('package-summary');
let selectedProgramKey = 'alpha';
let selectedPackageId = '';

const programs = {
  alpha: {
    name: 'Alpha Turf Program',
    tier: '(Top Tier)',
    description:
      'Weekly mowing, trimming, edging, and fertilizer with owner check-ins so the lawn always looks showcase ready.',
    offer: 'Kickoff bonus: first edge re-shape included',
    features: [
      {
        title: 'Weekly or Bi-weekly',
        text: 'Choose a steady weekly cadence for the sharpest finish, or bi-weekly for well-kept lines at a lighter pace.',
      },
      {
        title: 'Front / Back options',
        text: 'Customize the service area—front, back, or full property—so we focus exactly where you need.',
      },
      {
        title: 'Detail finishes',
        text: 'Deep edging, tight trimming around beds and fence lines, plus careful gate handling every single visit.',
      },
    ],
    packages: [
      {
        id: 'alpha-weekly',
        label: 'Weekly service',
        description: 'Show-home ready finish throughout the season.',
        price: '$119 / visit',
        frequency: 'Weekly',
      },
      {
        id: 'alpha-biweekly',
        label: 'Bi-weekly service',
        description: 'Reliable upkeep with a little more breathing room.',
        price: '$139 / visit',
        frequency: 'Bi-weekly',
      },
    ],
  },
  beta: {
    name: 'Beta Turf Program',
    tier: '(Balanced)',
    description:
      'Dependable mowing and edging for busy schedules—keeps your property neat without overthinking the upkeep.',
    offer: '',
    features: [
      {
        title: 'Balanced cadence',
        text: 'Pick weekly or bi-weekly visits based on how fast your grass grows and how manicured you want the finish.',
      },
      {
        title: 'Area coverage',
        text: 'Front, back, or full-yard coverage so you can match the service to your budget.',
      },
      {
        title: 'Cleanup included',
        text: 'Trim, edge, and blow down hard surfaces so everything is tidy before we leave.',
      },
    ],
    packages: [
      {
        id: 'beta-weekly',
        label: 'Weekly service',
        description: 'Steady visits for consistent curb appeal.',
        price: '$99 / visit',
        frequency: 'Weekly',
      },
      {
        id: 'beta-biweekly',
        label: 'Bi-weekly service',
        description: 'Budget-friendly cadence that keeps things trimmed back.',
        price: '$115 / visit',
        frequency: 'Bi-weekly',
      },
    ],
  },
  delta: {
    name: 'Delta Turf Program',
    tier: '(Value)',
    description: 'Essential mowing and tidy edges when you want things clean without extra frills.',
    offer: 'Seasonal saver available',
    features: [
      {
        title: 'Flexible visits',
        text: 'Stretch visits to match your budget or tighten the cadence during peak growth.',
      },
      {
        title: 'Just the areas you need',
        text: 'Dial in service to the front, back, or full yard depending on the week.',
      },
      {
        title: 'No-surprise pricing',
        text: 'Clear rates per visit so you always know what to expect on your invoice.',
      },
    ],
    packages: [
      {
        id: 'delta-weekly',
        label: 'Weekly service',
        description: 'Keeps fast-growing lawns under control.',
        price: '$89 / visit',
        frequency: 'Weekly',
      },
      {
        id: 'delta-biweekly',
        label: 'Bi-weekly service',
        description: 'Stretch the budget while staying tidy.',
        price: '$99 / visit',
        frequency: 'Bi-weekly',
      },
    ],
  },
};

const setPrice = (pkg) => {
  if (!priceAmount || !priceNote) return;
  priceAmount.textContent = pkg.price;
  priceNote.textContent = pkg.frequency;
};

const updateQuoteSummary = (programKey, pkg) => {
  const program = programs[programKey];
  if (!program || !pkg || !packageSummaryField) return;
  packageSummaryField.value = `${program.name} — ${pkg.label} (${pkg.price}, ${pkg.frequency})`;
};

const setSelection = (programKey, pkg) => {
  selectedProgramKey = programKey;
  selectedPackageId = pkg.id;
  setPrice(pkg);
  updateQuoteSummary(programKey, pkg);
};

const renderPackages = (programKey) => {
  if (!packageOptions) return;
  const program = programs[programKey];
  if (!program) return;
  packageOptions.innerHTML = '';

  program.packages.forEach((pkg, index) => {
    const option = document.createElement('label');
    option.className = 'package-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'package-choice';
    input.value = pkg.id;
    input.checked = index === 0;
    input.addEventListener('change', () => setSelection(programKey, pkg));

    const textBlock = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'package-name';
    title.textContent = pkg.label;

    const desc = document.createElement('div');
    desc.className = 'package-description';
    desc.textContent = pkg.description;

    textBlock.append(title, desc);

    const price = document.createElement('div');
    price.className = 'package-price';
    price.textContent = pkg.price;

    option.append(input, textBlock, price);
    packageOptions.append(option);

    if (index === 0) {
      setSelection(programKey, pkg);
    }
  });
};

const renderProgram = (key) => {
  const program = programs[key];
  if (!program) return;
  selectedProgramKey = key;

  programCards.forEach((card) => {
    card.classList.toggle('is-selected', card.dataset.program === key);
  });

  if (programTitle) programTitle.textContent = program.name;
  if (programTier) programTier.textContent = program.tier;
  if (programDescription) programDescription.textContent = program.description;

  program.features.forEach((feature, idx) => {
    const target = Array.from(programFeatures).find((card) => card.dataset.slot === idx.toString());
    if (!target) return;
    const title = target.querySelector('h3');
    const text = target.querySelector('p');
    if (title) title.textContent = feature.title;
    if (text) text.textContent = feature.text;
  });

  renderPackages(key);

  if (offerSticker) {
    if (program.offer) {
      offerSticker.textContent = program.offer;
      offerSticker.hidden = false;
    } else {
      offerSticker.hidden = true;
    }
  }
};

if (programCards.length && programFeatures.length && packageOptions) {
  programCards.forEach((card) => {
    card.addEventListener('click', () => renderProgram(card.dataset.program || ''));
  });
  renderProgram('alpha');
}

// Quote form validation + friendly feedback
const quoteForm = document.querySelector('.quote-form');
const statusEl = document.querySelector('.form-status');

const setStatus = (message, type = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
};

if (quoteForm) {
  quoteForm.addEventListener('submit', (event) => {
    const formData = new FormData(quoteForm);
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
}
