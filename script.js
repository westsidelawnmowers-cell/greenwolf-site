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

// Program selectors for every service page
const servicePrograms = {
  lawn: {
    defaultProgram: 'alpha',
    programs: {
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
    },
  },
  snow: {
    defaultProgram: 'route',
    programs: {
      route: {
        name: 'Route Priority Plan',
        tier: '(Fastest response)',
        description: 'Dedicated route timing with driveway and walk clearing after each snowfall so you can move right away.',
        offer: 'Early-bird discounts available',
        features: [
          { title: 'Driveway + walks', text: 'Snowblower plus shovel finish for clean edges and clear entries.' },
          {
            title: 'Storm updates',
            text: 'Text updates after each visit so you know when we’ve finished your property.',
          },
          { title: 'Season-ready', text: 'Priority coverage for the full season with consistent arrival windows.' },
        ],
        packages: [
          {
            id: 'route-full',
            label: 'Full-season coverage',
            description: 'All storms with route-priority timing.',
            price: '$219 / month',
            frequency: 'Seasonal plan',
          },
          {
            id: 'route-monthly',
            label: 'Monthly coverage',
            description: 'Month-to-month with priority on your route.',
            price: '$189 / month',
            frequency: 'Monthly',
          },
        ],
      },
      flex: {
        name: 'Flexible Per-Push',
        tier: '(On-demand)',
        description: 'Book per storm with clear pricing that includes steps and sidewalk finishing.',
        offer: '',
        features: [
          { title: 'Pay per visit', text: 'Straightforward rate each time it snows.' },
          {
            title: 'Walkway care',
            text: 'Steps, walks, and approaches cleaned with shovel and blower finish.',
          },
          { title: 'Add de-icing', text: 'Optional ice melt for concrete and paving stone when requested.' },
        ],
        packages: [
          {
            id: 'flex-per-push',
            label: 'Per-push service',
            description: 'Request clearing per snowfall.',
            price: '$65 / visit',
            frequency: 'Per visit',
          },
          {
            id: 'flex-bundle',
            label: '5-visit bundle',
            description: 'Prepay for faster scheduling.',
            price: '$299 bundle',
            frequency: 'Bundle',
          },
        ],
      },
      walk: {
        name: 'Walk & Entry Focus',
        tier: '(Light coverage)',
        description: 'Keep entries, front walks, and steps safe with tidy finishes and optional de-icing.',
        offer: 'Starter walk-only rate',
        features: [
          { title: 'Entry-first', text: 'Front steps, porch, and main walk cleared quickly.' },
          { title: 'Add driveway', text: 'Upgrade any visit to include the driveway as needed.' },
          { title: 'Slip prevention', text: 'Optional de-icer on request for trouble spots.' },
        ],
        packages: [
          {
            id: 'walk-season',
            label: 'Seasonal walk focus',
            description: 'Steps and entry cleared all winter.',
            price: '$129 / month',
            frequency: 'Seasonal',
          },
          {
            id: 'walk-per-visit',
            label: 'Per-visit entry care',
            description: 'Call us in for icy days or after big storms.',
            price: '$45 / visit',
            frequency: 'Per visit',
          },
        ],
      },
    },
  },
  landscaping: {
    defaultProgram: 'signature',
    programs: {
      signature: {
        name: 'Signature Build',
        tier: '(Design + install)',
        description: 'Concept-to-completion builds with planting, stone, and lighting that feel cohesive and lasting.',
        offer: 'Includes concept sketch',
        features: [
          { title: 'Design first', text: 'Material palettes, planting plans, and layout to match your home.' },
          { title: 'Built to last', text: 'Proper bases, edging, and drainage with a clean finish.' },
          { title: 'Lighting ready', text: 'Low-voltage lighting options to highlight the new space.' },
        ],
        packages: [
          {
            id: 'signature-full',
            label: 'Full design + build',
            description: 'Complete plan with plants, stone, and lighting.',
            price: 'Custom quote',
            frequency: 'Project',
          },
          {
            id: 'signature-phase',
            label: 'Phased build',
            description: 'Break the project into stages to match budget and timing.',
            price: 'Phased pricing',
            frequency: 'Per phase',
          },
        ],
      },
      refresh: {
        name: 'Garden Refresh',
        tier: '(Beds & borders)',
        description: 'Mulch, rock, and new plantings to revive tired beds with tidy edges and weed control.',
        offer: '',
        features: [
          { title: 'Clean edges', text: 'Cut edges and tidy borders for a crisp look.' },
          { title: 'New material', text: 'Rock or mulch top-ups with fabric and prep as needed.' },
          { title: 'Seasonal color', text: 'Plant selections suited to light, soil, and Saskatoon seasons.' },
        ],
        packages: [
          {
            id: 'refresh-full',
            label: 'Full bed refresh',
            description: 'Edge shaping, mulch/rock, and planting.',
            price: '$1,200+',
            frequency: 'Per project',
          },
          {
            id: 'refresh-touchup',
            label: 'Touch-up package',
            description: 'Light reshaping with small plant updates.',
            price: '$750+',
            frequency: 'Per project',
          },
        ],
      },
      maintain: {
        name: 'Maintenance Plan',
        tier: '(Ongoing care)',
        description: 'Scheduled pruning, weeding, and tidy-ups to keep the landscape sharp after install.',
        offer: 'Add spring + fall visits',
        features: [
          { title: 'Seasonal visits', text: 'Spring prep, mid-season tidy, and fall close-out.' },
          { title: 'Bed care', text: 'Weeding, redefining edges, and refreshing mulch levels.' },
          { title: 'Optional mowing', text: 'Pair with lawn visits for full-property upkeep.' },
        ],
        packages: [
          {
            id: 'maint-3visit',
            label: '3-visit plan',
            description: 'Spring, summer, and fall tune-ups.',
            price: '$349 / visit',
            frequency: 'Per visit',
          },
          {
            id: 'maint-monthly',
            label: 'Monthly care',
            description: 'Recurring visits through the growing season.',
            price: '$279 / visit',
            frequency: 'Monthly',
          },
        ],
      },
    },
  },
  cleanup: {
    defaultProgram: 'spring',
    programs: {
      spring: {
        name: 'Spring Reset',
        tier: '(Fresh start)',
        description: 'Debris removal, first edging, and prep so the lawn and beds start the season clean.',
        offer: 'Bagging included',
        features: [
          { title: 'Leaf + debris clear', text: 'Remove winter debris from turf and beds.' },
          { title: 'Edge + trim', text: 'First cut, edging, and bed touch-ups.' },
          { title: 'Hauling ready', text: 'Optional haul-away for branches and bags.' },
        ],
        packages: [
          {
            id: 'spring-standard',
            label: 'Standard spring reset',
            description: 'Debris removal, first mow, and edging.',
            price: '$249+',
            frequency: 'Per cleanup',
          },
          {
            id: 'spring-plus',
            label: 'Spring reset + haul',
            description: 'Includes branch and bag hauling.',
            price: '$299+',
            frequency: 'Per cleanup',
          },
        ],
      },
      fall: {
        name: 'Fall Clean Sweep',
        tier: '(Pre-winter)',
        description: 'Leaf removal, final trim, and bed tidy before freeze-up so nothing is left to rot.',
        offer: '',
        features: [
          { title: 'Leaf control', text: 'Gather and bag leaves across turf and beds.' },
          { title: 'Final trims', text: 'Last mow and tidy edges before snow.' },
          { title: 'Optional haul', text: 'Add hauling for branches and heavy debris.' },
        ],
        packages: [
          {
            id: 'fall-standard',
            label: 'Standard fall sweep',
            description: 'Leaf collection and final mow.',
            price: '$229+',
            frequency: 'Per cleanup',
          },
          {
            id: 'fall-haul',
            label: 'Fall sweep + haul',
            description: 'Includes debris hauling and disposal.',
            price: '$279+',
            frequency: 'Per cleanup',
          },
        ],
      },
      tidy: {
        name: 'Tidy Touch-ups',
        tier: '(Light service)',
        description: 'Quick spruce-ups between seasons for beds, walkways, and small debris piles.',
        offer: 'Weekday specials',
        features: [
          { title: 'Fast visits', text: 'Short visits to keep things neat between full cleanups.' },
          { title: 'Bed detail', text: 'Weeding, edging touch-ups, and light pruning.' },
          { title: 'Flexible hauling', text: 'Add bag pickup when you need it gone.' },
        ],
        packages: [
          {
            id: 'tidy-hourly',
            label: 'Hourly tidy',
            description: 'Small jobs and quick refreshes.',
            price: '$95 / hour',
            frequency: 'Hourly',
          },
          {
            id: 'tidy-visit',
            label: 'Single visit',
            description: 'Flat-rate quick spruce-up.',
            price: '$149 / visit',
            frequency: 'Per visit',
          },
        ],
      },
    },
  },
};

const setupProgramModule = (serviceKey, config) => {
  const module = document.querySelector(`[data-program-module="${serviceKey}"]`);
  if (!module) return;

  const programCards = module.querySelectorAll('.program-card');
  const programTitle = module.querySelector('[data-program-title]');
  const programTier = module.querySelector('[data-program-tier]');
  const programDescription = module.querySelector('[data-program-description]');
  const programFeatures = module.querySelectorAll('.program-feature');
  const packageOptions = module.querySelector('[data-package-options]');
  const priceAmount = module.querySelector('[data-price-amount]');
  const priceNote = module.querySelector('[data-price-note]');
  const offerSticker = module.querySelector('[data-offer-sticker]');
  const selectPackageButton = module.querySelector('[data-select-package]');
  const summaryFieldId = module.dataset.summaryTarget;
  const summaryField = summaryFieldId ? document.getElementById(summaryFieldId) : null;
  const quoteTargetId = module.dataset.quoteTarget || 'quote';

  let selectedProgramKey = config.defaultProgram || Object.keys(config.programs)[0];
  let selectedPackageId = '';

  const setPrice = (pkg) => {
    if (!priceAmount || !priceNote) return;
    priceAmount.textContent = pkg.price;
    priceNote.textContent = pkg.frequency;
  };

  const updateQuoteSummary = (programKey, pkg) => {
    const program = config.programs[programKey];
    if (!program || !pkg || !summaryField) return;
    summaryField.value = `${program.name} — ${pkg.label} (${pkg.price}, ${pkg.frequency})`;
  };

  const setSelection = (programKey, pkg) => {
    selectedProgramKey = programKey;
    selectedPackageId = pkg.id;
    setPrice(pkg);
    updateQuoteSummary(programKey, pkg);
  };

  const getPackageById = (programKey, packageId) => {
    const program = config.programs[programKey];
    if (!program) return undefined;
    return program.packages.find((pkg) => pkg.id === packageId);
  };

  const renderPackages = (programKey) => {
    if (!packageOptions) return;
    const program = config.programs[programKey];
    if (!program) return;
    packageOptions.innerHTML = '';

    program.packages.forEach((pkg, index) => {
      const option = document.createElement('label');
      option.className = 'package-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `${serviceKey}-package-choice`;
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
    const program = config.programs[key];
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
    renderProgram(selectedProgramKey);
  }

  if (selectPackageButton) {
    selectPackageButton.addEventListener('click', () => {
      const currentProgram = config.programs[selectedProgramKey];
      if (!currentProgram) return;

      const checkedPackage = module.querySelector(`input[name="${serviceKey}-package-choice"]:checked`);
      const resolvedPackage =
        getPackageById(selectedProgramKey, checkedPackage?.value || selectedPackageId) || currentProgram.packages[0];

      if (resolvedPackage) {
        setSelection(selectedProgramKey, resolvedPackage);
      }

      const quoteSection = document.getElementById(quoteTargetId);
      if (quoteSection) {
        quoteSection.scrollIntoView({ behavior: 'smooth' });
        const firstField = quoteSection.querySelector('input, textarea, select');
        if (firstField) {
          firstField.focus({ preventScroll: true });
        }
      }
    });
  }
};

Object.entries(servicePrograms).forEach(([serviceKey, config]) => {
  setupProgramModule(serviceKey, config);
});

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
