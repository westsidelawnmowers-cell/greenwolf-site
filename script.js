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

// Hide header on swipe / scroll for mobile breathing room
const header = document.querySelector('.site-header');
if (header) {
  let lastScrollY = window.scrollY;
  let touchStartY = null;

  const hideHeader = () => document.body.classList.add('nav-hidden');
  const showHeader = () => document.body.classList.remove('nav-hidden');

  window.addEventListener(
    'scroll',
    () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY + 12) {
        hideHeader();
      } else if (currentY < lastScrollY - 12) {
        showHeader();
      }
      lastScrollY = currentY;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchstart',
    (event) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    },
    { passive: true }
  );

  window.addEventListener(
    'touchmove',
    (event) => {
      if (touchStartY === null) return;
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = touchStartY - currentY;
      if (Math.abs(delta) > 24) {
        if (delta > 0) {
          hideHeader();
        } else {
          showHeader();
        }
        touchStartY = null;
      }
    },
    { passive: true }
  );
}

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

// Tier program toggles
const programContent = {
  lawn: {
    alpha: {
      label: 'Alpha Turf Program',
      tag: 'Alpha Turf Program (Top Tier)',
      title: 'Alpha Turf Program',
      description:
        'Weekly mowing, trimming, edging, and fertilizer with owner check-ins to keep the lawn in top shape.',
      price: '$119',
      term: '/ visit',
      frequency: 'Weekly',
      bonus: 'Kickoff bonus: first edge re-shape included.',
      pills: [],
      details: [
        {
          title: 'Front / Back options',
          text: 'Front only? Add the backyard or go full pass. Includes trimming and line edging along sidewalks and fences.',
        },
        {
          title: 'Detail finishes',
          text: 'Each visit includes trimming, edging, sweeping or blowing walkways, and fuel. Gate careful and tidy.',
        },
      ],
      options: [
        {
          title: 'Weekly or Bi-weekly',
          description: '',
          note: '',
          price: '',
          suboptions: [
            {
              label: 'Weekly service',
              note: 'Weekly trim + edge, owner check-in.',
              price: '$119 / visit',
            },
            {
              label: 'Bi-weekly service',
              note: 'Reliable upkeep with a little more breathing room.',
              price: '',
            },
          ],
        },
        {
          title: 'Front / Back options',
          description: 'Front only? Add the backyard or go full pass.',
          note: 'Includes trimming and line edging along sidewalks and fences.',
          price: '',
        },
        {
          title: 'Detail finishes',
          description: 'Each visit includes trimming, edging, sweeping or blowing walkways, and fuel.',
          note: 'Gate careful and tidy.',
          price: '',
        },
      ],
    },
    beta: {
      label: 'Beta Turf Program',
      tag: 'Beta • Balanced',
      title: 'Bi-weekly balance',
      description: 'Consistent mowing every other week with trimming and edging to keep curb appeal high without over-servicing.',
      price: '$95',
      term: '/ visit',
      frequency: 'Bi-weekly visits',
      bonus: 'Balanced upkeep with flexible scheduling.',
      pills: ['Bi-weekly mowing', 'Front + back attention', 'Edge + blow clean-up'],
      details: [
        { title: 'Visit cadence', text: 'Every other week with schedule flexibility around rain.' },
        { title: 'Coverage', text: 'Front and back yards kept tidy with crisp edging.' },
        { title: 'Finishing touches', text: 'Clippings cleared from hard surfaces after each visit.' },
      ],
      options: [
        {
          title: 'Bi-weekly core',
          description: 'Reliable every-other-week mowing with tidy edges.',
          note: 'Ideal for steady growth without over-servicing.',
          price: '$95 / visit',
        },
        {
          title: 'Switch-to-weekly',
          description: 'Move to weekly during peak growth when you need it.',
          note: 'We adapt around rain and heat stress.',
          price: '$115 / visit',
        },
        {
          title: 'Front-first plan',
          description: 'Front yard every visit, backyard as-needed add-on.',
          note: 'Keeps curb appeal high while managing budget.',
          price: 'Custom quote',
        },
      ],
    },
    delta: {
      label: 'Delta Turf Program',
      tag: 'Delta • Value',
      title: 'Front-yard essentials',
      description: 'Budget-friendly front-yard care and trims to maintain a neat street-facing presentation.',
      price: '$69',
      term: '/ visit',
      frequency: 'Front-yard focus',
      bonus: 'Simple curbside tidy that stays affordable.',
      pills: ['Front-yard focus', 'Edge + trim basics', 'Optional backyard add-on'],
      details: [
        { title: 'Visit cadence', text: 'Bi-weekly or as-needed visits to keep growth in check.' },
        { title: 'Coverage', text: 'Front yard as standard with backyard available on request.' },
        { title: 'Finishing touches', text: 'Edge refresh and a quick cleanup of sidewalks and driveways.' },
      ],
      options: [
        {
          title: 'Front entry tidy',
          description: 'Edge refresh and mow on street-facing areas.',
          note: 'Adds a quick sweep of sidewalks and driveway lips.',
          price: '$69 / visit',
        },
        {
          title: 'Add backyard',
          description: 'Extend the visit to fences and back gates when you need it.',
          note: 'Priced per visit based on size.',
          price: 'Custom quote',
        },
        {
          title: 'One-time spruce',
          description: 'Single visit to knock down growth before guests or photos.',
          note: 'Upgrade to ongoing care anytime.',
          price: '$89 / visit',
        },
      ],
    },
  },
  snow: {
    alpha: {
      label: 'Alpha Snow Program',
      tag: 'Alpha • Top tier',
      title: 'Full-season priority route',
      description:
        'Automatic clearing every snowfall with driveway, walk, and step coverage plus de-icing on request.',
      price: '$179',
      term: '/ month',
      frequency: 'Priority route',
      bonus: 'Photo updates available after each visit.',
      pills: ['Automatic dispatch', 'Driveway + walkways', 'Optional de-icing'],
      details: [
        { title: 'Response speed', text: 'First-wave clearing after snow stops with return sweeps for heavy events.' },
        { title: 'Coverage', text: 'Driveway, front walk, and entry steps hand-finished for traction.' },
        { title: 'Extras', text: 'De-icing product available and photo updates after service.' },
      ],
      options: [
        {
          title: 'Full-season plan',
          description: 'Automatic dispatch every snowfall with priority routing.',
          note: 'Best for dependable coverage all winter.',
          price: '$179 / month',
        },
        {
          title: 'Per-storm service',
          description: 'Book per event with driveway and walkway coverage.',
          note: 'Standard route timing after accumulation.',
          price: '$49 / visit',
        },
        {
          title: 'Sidewalk-only',
          description: 'Front walks and steps cleared for safe entry.',
          note: 'Add driveway anytime as needed.',
          price: '$29 / visit',
        },
      ],
    },
    beta: {
      label: 'Beta Snow Program',
      tag: 'Beta • Balanced',
      title: 'Reliable route service',
      description: 'Clearing each snowfall on our standard route with driveway and walkway coverage.',
      price: '$139',
      term: '/ month',
      frequency: 'Standard route',
      bonus: 'Standard route timing after accumulation hits trigger depth.',
      pills: ['Every snowfall', 'Driveway + walk', 'Shovel finish'],
      details: [
        { title: 'Response speed', text: 'Standard route timing after accumulation hits trigger depth.' },
        { title: 'Coverage', text: 'Driveway cleared with blower and walkways shoveled for safe access.' },
        { title: 'Extras', text: 'De-icing available as an add-on per visit.' },
      ],
      options: [
        {
          title: 'Seasonal route',
          description: 'Driveway and walkway service on each snowfall.',
          note: 'Standard timing after trigger depth.',
          price: '$139 / month',
        },
        {
          title: 'Per-storm with walkways',
          description: 'Schedule per event with shovel finish on steps.',
          note: 'Add de-icing if needed.',
          price: '$39 / visit',
        },
        {
          title: 'Driveway only',
          description: 'Budget-friendly clears without walkway add-ons.',
          note: 'Shovel finish optional.',
          price: '$29 / visit',
        },
      ],
    },
    delta: {
      label: 'Delta Snow Program',
      tag: 'Delta • Value',
      title: 'Budget-friendly pushes',
      description: 'As-available service for lighter storms or simple driveway clears when you just need a path out.',
      price: '$79',
      term: '/ visit',
      frequency: 'As-available',
      bonus: 'Driveway-first timing keeps costs lean.',
      pills: ['Driveway focus', 'As-available timing', 'Walkway optional'],
      details: [
        { title: 'Response speed', text: 'Scheduled after priority routes with flexible timing.' },
        { title: 'Coverage', text: 'Driveway push with walkway add-on if requested.' },
        { title: 'Extras', text: 'No-frills service to keep costs low while staying mobile.' },
      ],
      options: [
        {
          title: 'Driveway push',
          description: 'Keep a path open with a simple driveway clear.',
          note: 'Timing follows priority routes.',
          price: '$79 / visit',
        },
        {
          title: 'Add walkway',
          description: 'Include front walk and steps for safer footing.',
          note: 'Priced per visit when added.',
          price: '$15 add-on',
        },
        {
          title: 'On-call',
          description: 'Message us for flexible scheduling when storms are light.',
          note: 'Great for travel weeks or flexible needs.',
          price: 'Quote per request',
        },
      ],
    },
  },
  landscaping: {
    alpha: {
      label: 'Alpha Landscape Program',
      tag: 'Alpha • Top tier',
      title: 'Design-led build with finishing touches',
      description:
        'Concept-to-completion projects with lighting, stone accents, and planting plans that stay beautiful through the season.',
      price: 'From $349',
      term: '/ project phase',
      frequency: 'Design + build',
      bonus: 'Includes lighting, edging, and post-build clean-down.',
      pills: ['Design consult & plan', 'Stone + planting install', 'Lighting + cleanup'],
      details: [
        { title: 'Planning support', text: 'Full design consult with plant list, materials, and phased scheduling.' },
        { title: 'Build scope', text: 'Stone borders, beds, and lighting installed with tidy edges.' },
        { title: 'Aftercare', text: 'Post-install cleanup plus a follow-up maintenance visit option.' },
      ],
      options: [
        {
          title: 'Full design-build',
          description: 'Concept, materials, install, and finishing details handled end-to-end.',
          note: 'Great for new builds or complete transformations.',
          price: 'From $349 / phase',
        },
        {
          title: 'Refresh package',
          description: 'Bed reshaping, mulch or rock swaps, and select planting upgrades.',
          note: 'Perfect mid-season boost for curb appeal.',
          price: 'From $189 / visit',
        },
        {
          title: 'Maintenance day',
          description: 'Weeding, edging, and tidy-ups to keep existing beds looking sharp.',
          note: 'Add small plant swaps or top-up mulch as needed.',
          price: 'From $119 / visit',
        },
      ],
    },
    beta: {
      label: 'Beta Landscape Program',
      tag: 'Beta • Balanced',
      title: 'Focused refresh',
      description: 'Bed reshaping, rock or mulch upgrades, and select planting to refresh curb appeal.',
      price: 'From $189',
      term: '/ visit',
      frequency: 'Refresh projects',
      bonus: 'Mulch, rock, and selective planting upgrades.',
      pills: ['Bed reshaping', 'Rock or mulch upgrade', 'Selective planting'],
      details: [
        { title: 'Planning support', text: 'Layout touch-ups and plant recommendations without a full design package.' },
        { title: 'Build scope', text: 'Mulch or rock installs with crisp edging and weed barrier where needed.' },
        { title: 'Aftercare', text: 'Cleanup and watering guidance so new material settles in.' },
      ],
      options: [
        {
          title: 'Mulch or rock refresh',
          description: 'Swap tired material for clean, color-matched mulch or rock.',
          note: 'Includes weed barrier where needed.',
          price: 'From $189 / visit',
        },
        {
          title: 'Bed reshape + edge',
          description: 'Re-define bed lines and add crisp edging for a tidy outline.',
          note: 'Pair with selective planting for quick impact.',
          price: 'From $229 / visit',
        },
        {
          title: 'Accent planting',
          description: 'Add shrubs or perennials to refresh focal points.',
          note: 'Plant list recommendations included.',
          price: 'Custom quote',
        },
      ],
    },
    delta: {
      label: 'Delta Landscape Program',
      tag: 'Delta • Value',
      title: 'Essential upkeep',
      description: 'Quick cleanups and minor touch-ups to keep existing beds and borders in shape.',
      price: 'From $119',
      term: '/ visit',
      frequency: 'Essential upkeep',
      bonus: 'Bed tidy-ups and light planting care.',
      pills: ['Weeding + tidy', 'Edge refresh', 'Spot planting optional'],
      details: [
        { title: 'Planning support', text: 'Simple visit outline with no design deliverables required.' },
        { title: 'Build scope', text: 'Light material swaps and edging to neaten what you already have.' },
        { title: 'Aftercare', text: 'Debris removal and guidance on watering/maintenance.' },
      ],
      options: [
        {
          title: 'Bed tidy',
          description: 'Weeding, debris clear-out, and quick edge refresh.',
          note: 'Keeps existing layouts looking clean.',
          price: 'From $119 / visit',
        },
        {
          title: 'Top-up mulch',
          description: 'Add a light layer of mulch to freshen appearance.',
          note: 'Color matched where possible.',
          price: 'From $149 / visit',
        },
        {
          title: 'Spot planting assist',
          description: 'Add or swap a few plants to fill gaps and improve balance.',
          note: 'Simple recommendations included.',
          price: 'Custom quote',
        },
      ],
    },
  },
  cleanup: {
    alpha: {
      label: 'Alpha Cleanup Program',
      tag: 'Alpha • Top tier',
      title: 'Deep seasonal reset',
      description:
        'Full yard sweep with detailed bed work, shrub shaping, and hauling included so the property is spotless.',
      price: '$219',
      term: '/ visit',
      frequency: 'Deep seasonal',
      bonus: 'Hauling included with premium pruning add-ons available.',
      pills: ['Beds + edging detail', 'Debris + hauling', 'Light pruning'],
      details: [
        { title: 'Debris scope', text: 'Full leaf, branch, and winter debris removal with bagging and haul away.' },
        { title: 'Detailing', text: 'Bed clean-outs, edging refresh, and pathway sweeps for a tidy finish.' },
        { title: 'Optional extras', text: 'Light shrub trimming and fertilizer touch-up available on premium visits.' },
      ],
      options: [
        {
          title: 'Full property reset',
          description: 'Leaf, stick, and debris removal with bed detailing and haul-away.',
          note: 'Ideal for spring or fall transitions.',
          price: '$219 / visit',
        },
        {
          title: 'Standard cleanup',
          description: 'Leaf and debris clear-out with bagging for pickup or haul-away.',
          note: 'Add pruning or fertilizer as needed.',
          price: '$169 / visit',
        },
        {
          title: 'Front-yard focus',
          description: 'High-visibility tidy for entries and walks with optional backyard add-on.',
          note: 'Bagged for city pickup if preferred.',
          price: '$119 / visit',
        },
      ],
    },
    beta: {
      label: 'Beta Cleanup Program',
      tag: 'Beta • Balanced',
      title: 'Standard seasonal tidy',
      description: 'Leaf and debris removal with bed touch-ups and haul-away included.',
      price: '$169',
      term: '/ visit',
      frequency: 'Standard reset',
      bonus: 'Haul-away included with flexible add-ons.',
      pills: ['Leaf + debris clear', 'Bed touch-ups', 'Hauling included'],
      details: [
        { title: 'Debris scope', text: 'Leaf and stick cleanup with blowing and bagging included.' },
        { title: 'Detailing', text: 'Beds and edges tidied to reset the look for the season.' },
        { title: 'Optional extras', text: 'Hauling included; pruning or fertilizer available as add-ons.' },
      ],
      options: [
        {
          title: 'Seasonal tidy',
          description: 'Leaf and debris removal with bed touch-ups.',
          note: 'Hauling included on every visit.',
          price: '$169 / visit',
        },
        {
          title: 'Debris-only push',
          description: 'Quick blow-and-bag service for leaves and sticks.',
          note: 'Great before yard waste pickup.',
          price: '$139 / visit',
        },
        {
          title: 'Add pruning',
          description: 'Light shrub trims or fertilizer touch-ups added to cleanup.',
          note: 'Priced with your visit so you can tailor the scope.',
          price: 'Custom add-on',
        },
      ],
    },
    delta: {
      label: 'Delta Cleanup Program',
      tag: 'Delta • Value',
      title: 'Quick curbside sweep',
      description: 'A focused visit for leaves and debris in high-visibility areas at a budget rate.',
      price: '$119',
      term: '/ visit',
      frequency: 'Front-yard focus',
      bonus: 'Bagged for pickup with optional hauling.',
      pills: ['Front-yard focus', 'Leaf collection', 'Haul-away optional'],
      details: [
        { title: 'Debris scope', text: 'Front-yard leaves collected and bagged for curbside pickup.' },
        { title: 'Detailing', text: 'Walkways and entry tidied with light edging where needed.' },
        { title: 'Optional extras', text: 'Add backyard or hauling if you want everything gone in one trip.' },
      ],
      options: [
        {
          title: 'Front entry sweep',
          description: 'Front yard, entry, and walkways cleared and bagged.',
          note: 'Ideal ahead of guests or listings.',
          price: '$119 / visit',
        },
        {
          title: 'Bag and stack',
          description: 'Debris bagged for city pickup to keep costs low.',
          note: 'Add backyard coverage as needed.',
          price: '$99 / visit',
        },
        {
          title: 'Haul-away add',
          description: 'We take debris with us so nothing is left curbside.',
          note: 'Priced per load or visit.',
          price: 'Custom add-on',
        },
      ],
    },
  },
};

const syncFormTier = (service, value) => {
  const form = document.querySelector(`form[data-service-form="${service}"]`);
  if (!form) return;
  const tierSelect = form.querySelector('select[name="tier"]');
  if (tierSelect) {
    tierSelect.value = value || '';
  }
};

const programSections = document.querySelectorAll('.programs');

programSections.forEach((section) => {
  const service = section.dataset.service;
  const serviceContent = programContent[service];
  if (!service || !serviceContent) return;

  const programCards = Array.from(section.querySelectorAll('.program-card'));
  if (!programCards.length) return;

  const renderTier = (tierKey) => {
    const tier = serviceContent[tierKey];
    if (!tier) return;

    programCards.forEach((card) => {
      const cardKey = card.dataset.program;
      const cardTier = serviceContent[cardKey];
      const isActive = cardKey === tierKey;
      card.classList.toggle('is-active', isActive);
      card.setAttribute('aria-pressed', isActive.toString());

      if (cardTier) {
        const cardPrice = card.querySelector('.program-price');
        const cardFrequency = card.querySelector('.program-frequency');
        const cardBonus = card.querySelector('.program-bonus');
        const priceText = [cardTier.price, cardTier.term].filter(Boolean).join(' ');
        if (cardPrice) cardPrice.textContent = priceText;
        if (cardFrequency) cardFrequency.textContent = cardTier.frequency || '';
        if (cardBonus) cardBonus.textContent = cardTier.bonus || '';
      }
    });

    syncFormTier(service, tier.label);
  };

  programCards.forEach((card) => {
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.addEventListener('click', () => {
      renderTier(card.dataset.program || 'alpha');
    });
  });

  renderTier('alpha');
});
