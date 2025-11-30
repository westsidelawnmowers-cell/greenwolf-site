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
      tag: 'Alpha • Top tier',
      title: 'Premium weekly polish',
      description:
        'Our highest-attention visits keep front and back yards immaculate with fertilizer touch-ups and careful edging every week.',
      pills: ['Weekly mowing & trim', 'Front + back coverage', 'Fertilizer touch-ups'],
      details: [
        { title: 'Visit cadence', text: 'Weekly mowing and trimming for the tightest appearance.' },
        { title: 'Coverage', text: 'Front, back, and fence lines with careful gate handling.' },
        { title: 'Finishing touches', text: 'Edging, sweep/blow clean-up, and seasonal fertilizer boosts.' },
      ],
    },
    beta: {
      label: 'Beta Turf Program',
      tag: 'Beta • Balanced',
      title: 'Bi-weekly balance',
      description: 'Consistent mowing every other week with trimming and edging to keep curb appeal high without over-servicing.',
      pills: ['Bi-weekly mowing', 'Front + back attention', 'Edge + blow clean-up'],
      details: [
        { title: 'Visit cadence', text: 'Every other week with schedule flexibility around rain.' },
        { title: 'Coverage', text: 'Front and back yards kept tidy with crisp edging.' },
        { title: 'Finishing touches', text: 'Clippings cleared from hard surfaces after each visit.' },
      ],
    },
    delta: {
      label: 'Delta Turf Program',
      tag: 'Delta • Value',
      title: 'Front-yard essentials',
      description: 'Budget-friendly front-yard care and trims to maintain a neat street-facing presentation.',
      pills: ['Front-yard focus', 'Edge + trim basics', 'Optional backyard add-on'],
      details: [
        { title: 'Visit cadence', text: 'Bi-weekly or as-needed visits to keep growth in check.' },
        { title: 'Coverage', text: 'Front yard as standard with backyard available on request.' },
        { title: 'Finishing touches', text: 'Edge refresh and a quick cleanup of sidewalks and driveways.' },
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
      pills: ['Automatic dispatch', 'Driveway + walkways', 'Optional de-icing'],
      details: [
        { title: 'Response speed', text: 'First-wave clearing after snow stops with return sweeps for heavy events.' },
        { title: 'Coverage', text: 'Driveway, front walk, and entry steps hand-finished for traction.' },
        { title: 'Extras', text: 'De-icing product available and photo updates after service.' },
      ],
    },
    beta: {
      label: 'Beta Snow Program',
      tag: 'Beta • Balanced',
      title: 'Reliable route service',
      description: 'Clearing each snowfall on our standard route with driveway and walkway coverage.',
      pills: ['Every snowfall', 'Driveway + walk', 'Shovel finish'],
      details: [
        { title: 'Response speed', text: 'Standard route timing after accumulation hits trigger depth.' },
        { title: 'Coverage', text: 'Driveway cleared with blower and walkways shoveled for safe access.' },
        { title: 'Extras', text: 'De-icing available as an add-on per visit.' },
      ],
    },
    delta: {
      label: 'Delta Snow Program',
      tag: 'Delta • Value',
      title: 'Budget-friendly pushes',
      description: 'As-available service for lighter storms or simple driveway clears when you just need a path out.',
      pills: ['Driveway focus', 'As-available timing', 'Walkway optional'],
      details: [
        { title: 'Response speed', text: 'Scheduled after priority routes with flexible timing.' },
        { title: 'Coverage', text: 'Driveway push with walkway add-on if requested.' },
        { title: 'Extras', text: 'No-frills service to keep costs low while staying mobile.' },
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
      pills: ['Design consult & plan', 'Stone + planting install', 'Lighting + cleanup'],
      details: [
        { title: 'Planning support', text: 'Full design consult with plant list, materials, and phased scheduling.' },
        { title: 'Build scope', text: 'Stone borders, beds, and lighting installed with tidy edges.' },
        { title: 'Aftercare', text: 'Post-install cleanup plus a follow-up maintenance visit option.' },
      ],
    },
    beta: {
      label: 'Beta Landscape Program',
      tag: 'Beta • Balanced',
      title: 'Focused refresh',
      description: 'Bed reshaping, rock or mulch upgrades, and select planting to refresh curb appeal.',
      pills: ['Bed reshaping', 'Rock or mulch upgrade', 'Selective planting'],
      details: [
        { title: 'Planning support', text: 'Layout touch-ups and plant recommendations without a full design package.' },
        { title: 'Build scope', text: 'Mulch or rock installs with crisp edging and weed barrier where needed.' },
        { title: 'Aftercare', text: 'Cleanup and watering guidance so new material settles in.' },
      ],
    },
    delta: {
      label: 'Delta Landscape Program',
      tag: 'Delta • Value',
      title: 'Essential upkeep',
      description: 'Quick cleanups and minor touch-ups to keep existing beds and borders in shape.',
      pills: ['Weeding + tidy', 'Edge refresh', 'Spot planting optional'],
      details: [
        { title: 'Planning support', text: 'Simple visit outline with no design deliverables required.' },
        { title: 'Build scope', text: 'Light material swaps and edging to neaten what you already have.' },
        { title: 'Aftercare', text: 'Debris removal and guidance on watering/maintenance.' },
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
      pills: ['Beds + edging detail', 'Debris + hauling', 'Light pruning'],
      details: [
        { title: 'Debris scope', text: 'Full leaf, branch, and winter debris removal with bagging and haul away.' },
        { title: 'Detailing', text: 'Bed clean-outs, edging refresh, and pathway sweeps for a tidy finish.' },
        { title: 'Optional extras', text: 'Light shrub trimming and fertilizer touch-up available on premium visits.' },
      ],
    },
    beta: {
      label: 'Beta Cleanup Program',
      tag: 'Beta • Balanced',
      title: 'Standard seasonal tidy',
      description: 'Leaf and debris removal with bed touch-ups and haul-away included.',
      pills: ['Leaf + debris clear', 'Bed touch-ups', 'Hauling included'],
      details: [
        { title: 'Debris scope', text: 'Leaf and stick cleanup with blowing and bagging included.' },
        { title: 'Detailing', text: 'Beds and edges tidied to reset the look for the season.' },
        { title: 'Optional extras', text: 'Hauling included; pruning or fertilizer available as add-ons.' },
      ],
    },
    delta: {
      label: 'Delta Cleanup Program',
      tag: 'Delta • Value',
      title: 'Quick curbside sweep',
      description: 'A focused visit for leaves and debris in high-visibility areas at a budget rate.',
      pills: ['Front-yard focus', 'Leaf collection', 'Haul-away optional'],
      details: [
        { title: 'Debris scope', text: 'Front-yard leaves collected and bagged for curbside pickup.' },
        { title: 'Detailing', text: 'Walkways and entry tidied with light edging where needed.' },
        { title: 'Optional extras', text: 'Add backyard or hauling if you want everything gone in one trip.' },
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

  const tagEl = section.querySelector('.tier-tag');
  const titleEl = section.querySelector('.program-title');
  const descEl = section.querySelector('.program-description');
  const pillList = section.querySelector('.tier-pills');
  const detailCards = Array.from(section.querySelectorAll('.tier-differences [data-detail]'));
  const programCards = Array.from(section.querySelectorAll('.program-card'));

  const renderTier = (tierKey) => {
    const tier = serviceContent[tierKey];
    if (!tier) return;

    programCards.forEach((card) => {
      card.classList.toggle('is-active', card.dataset.program === tierKey);
    });

    if (tagEl) tagEl.textContent = tier.tag;
    if (titleEl) titleEl.textContent = tier.title;
    if (descEl) descEl.textContent = tier.description;

    if (pillList) {
      pillList.innerHTML = '';
      tier.pills.forEach((pill) => {
        const li = document.createElement('li');
        li.className = 'pill';
        li.textContent = pill;
        pillList.appendChild(li);
      });
    }

    detailCards.forEach((card, index) => {
      const detail = tier.details[index];
      if (!detail) return;
      const heading = card.querySelector('h3');
      const paragraph = card.querySelector('p');
      if (heading) heading.textContent = detail.title;
      if (paragraph) paragraph.textContent = detail.text;
    });

    syncFormTier(service, tier.label);
  };

  programCards.forEach((card) => {
    card.addEventListener('click', () => {
      renderTier(card.dataset.program || 'alpha');
    });
  });

  renderTier('alpha');
});
