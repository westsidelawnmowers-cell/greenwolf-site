// --- Basic page polish & helpers ----------------------------------------------------
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

// Soft reveal on scroll to make the page feel alive
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

// --- Package picker syncing into the quote form ------------------------------------
const packageOptions = Array.from(document.querySelectorAll('.package-option'));
const packageTitle = document.getElementById('packageTitle');
const packageDescription = document.getElementById('packageDescription');
const packageFeatureList = document.getElementById('packageFeatureList');
const togglePackageBtn = document.getElementById('togglePackageBtn');
const selectedTags = document.getElementById('selectedTags');
const selectedPackagesInput = document.getElementById('selectedPackagesInput');

if (
  packageOptions.length &&
  packageTitle &&
  packageDescription &&
  packageFeatureList &&
  togglePackageBtn &&
  selectedTags &&
  selectedPackagesInput
) {
  // Start with whatever is already in the hidden input (usually empty) to keep server submissions consistent.
  const selectedPackages = new Set([selectedPackagesInput.value].filter(Boolean));
  let activePackage = packageOptions[0];

  // Helper: redraws the tags, hidden input, and button label so everything stays in sync.
  const updateSelectedTags = () => {
    selectedTags.innerHTML = '';
    if (!selectedPackages.size) {
      const emptyTag = document.createElement('span');
      emptyTag.className = 'tag';
      emptyTag.textContent = 'No packages selected yet';
      selectedTags.append(emptyTag);
    } else {
      selectedPackages.forEach((pkg) => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = pkg;
        selectedTags.append(tag);
      });
    }

    // Keep the hidden field updated for the form post
    selectedPackagesInput.value = Array.from(selectedPackages).join(', ');

    // Highlight active selections in the list
    packageOptions.forEach((option) => {
      option.classList.toggle('is-selected', selectedPackages.has(option.dataset.package));
    });

    // Make the toggle button copy match the current state
    const activeName = activePackage.dataset.package;
    togglePackageBtn.textContent = selectedPackages.has(activeName)
      ? 'Remove package'
      : 'Add package to quote';
  };

  // Helper: when you click a package, populate the detail panel and prep the toggle button
  const setActivePackage = (option) => {
    activePackage.classList.remove('is-active');
    activePackage = option;
    activePackage.classList.add('is-active');

    packageTitle.textContent = option.dataset.package;
    packageDescription.textContent = option.dataset.description;

    packageFeatureList.innerHTML = '';
    const features = (option.dataset.features || '').split('|').filter(Boolean);
    features.forEach((feature) => {
      const li = document.createElement('li');
      li.textContent = feature;
      packageFeatureList.append(li);
    });

    togglePackageBtn.dataset.packageKey = option.dataset.package;
    updateSelectedTags();
  };

  // Let users toggle directly from the main button
  togglePackageBtn.addEventListener('click', () => {
    const pkg = togglePackageBtn.dataset.packageKey;
    if (!pkg) return;
    if (selectedPackages.has(pkg)) {
      selectedPackages.delete(pkg);
    } else {
      selectedPackages.add(pkg);
    }
    updateSelectedTags();
  });

  // Make package list items update the panel and also toggle on double-click for speed.
  packageOptions.forEach((option) => {
    option.addEventListener('click', () => setActivePackage(option));
    option.addEventListener('dblclick', () => {
      const pkgName = option.dataset.package;
      if (!pkgName) return;
      if (selectedPackages.has(pkgName)) {
        selectedPackages.delete(pkgName);
      } else {
        selectedPackages.add(pkgName);
      }
      setActivePackage(option);
    });
  });

  setActivePackage(activePackage);
}

// --- Quote form validation + friendly feedback -------------------------------------
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
