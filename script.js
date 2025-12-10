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

// Package picker -> quote form sync (keeps UI + hidden field aligned)
const packageOptions = Array.from(document.querySelectorAll('.package-option'));
const packageTitle = document.getElementById('packageTitle');
const packageDescription = document.getElementById('packageDescription');
const packageFeatureList = document.getElementById('packageFeatureList');
const togglePackageBtn = document.getElementById('togglePackageBtn');
const selectedTags = document.getElementById('selectedTags');
const selectedPackagesInput = document.getElementById('selectedPackagesInput');

if (packageOptions.length && packageTitle && packageDescription && packageFeatureList && togglePackageBtn && selectedTags && selectedPackagesInput) {
  // Preserve any prefilled packages (e.g., if the form is saved in the browser)
  const selectedPackages = new Set(selectedPackagesInput.value.split(',').map((pkg) => pkg.trim()).filter(Boolean));
  let activePackage = packageOptions[0];

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

    selectedPackagesInput.value = Array.from(selectedPackages).join(', ');
    packageOptions.forEach((option) => {
      const isSelected = selectedPackages.has(option.dataset.package);
      option.classList.toggle('is-selected', isSelected);
      option.setAttribute('aria-pressed', isSelected.toString());
    });
    const activeName = activePackage.dataset.package;
    togglePackageBtn.textContent = selectedPackages.has(activeName)
      ? 'Remove package'
      : 'Add package to quote';
  };

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

  packageOptions.forEach((option) => {
    option.addEventListener('click', () => setActivePackage(option));
    option.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActivePackage(option);
      }
    });
  });

  setActivePackage(activePackage);
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
