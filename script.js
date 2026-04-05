const SITE_PHONE_URI = '+16395979351';

function getPageKey() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/' || normalizedPath === '/index.html') {
    return 'home';
  }

  const base = normalizedPath.split('/').pop();
  return (base || 'home').toLowerCase().replace(/\.html$/, '');
}

function getPrimaryCtaHref() {
  if (document.getElementById('quote')) return '#quote';
  return getPageKey() === 'home' ? '#services' : '/#services';
}

function emitAnalyticsEvent(eventName, params = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

function setFooterYear() {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

function setupSmoothScrolling() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href')?.replace('#', '');
      if (!targetId) return;

      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        event.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function setupClickFlash() {
  document.addEventListener('click', (event) => {
    const clickable = event.target.closest('a, button, .card, .pill');
    if (!clickable) return;

    clickable.classList.add('click-flash');
    window.setTimeout(() => clickable.classList.remove('click-flash'), 280);
  });
}

function setupRevealOnScroll() {
  const revealElements = document.querySelectorAll(
    '.card, .feature, .quote-block, .hero-media, .hero h2, .hero p, .hero-bullets li, .hero-actions, .site-header'
  );

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
  );

  revealElements.forEach((element) => {
    element.classList.add('will-reveal');
    revealObserver.observe(element);
  });
}

function setupBackToTop() {
  const backToTop = document.querySelector('.back-to-top');
  if (!backToTop) return;

  const toggleBackToTop = () => {
    const show = window.scrollY > 380;
    backToTop.classList.toggle('is-active', show);
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    emitAnalyticsEvent('back_to_top_click', { page: getPageKey() });
  });

  document.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();
}

function setupHideHeaderOnScroll() {
  const siteHeader = document.querySelector('.site-header');
  if (!siteHeader) return;

  let lastScrollY = window.scrollY;
  let lastHideY = window.scrollY;
  let ticking = false;

  const updateHeaderVisibility = () => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;
    const isNearTop = currentY < 80;
    const headerIsHidden = siteHeader.classList.contains('is-hidden');
    const navIsOpen = siteHeader.classList.contains('nav-open');

    if (navIsOpen) {
      siteHeader.classList.remove('is-hidden');
      lastScrollY = currentY;
      lastHideY = currentY;
      ticking = false;
      return;
    }

    if (isNearTop) {
      siteHeader.classList.remove('is-hidden');
    } else if (!headerIsHidden && delta > 6 && currentY > 120) {
      siteHeader.classList.add('is-hidden');
      lastHideY = currentY;
    } else if (headerIsHidden && (delta < -18 || lastHideY - currentY > 28)) {
      siteHeader.classList.remove('is-hidden');
    }

    lastScrollY = currentY;
    ticking = false;
  };

  document.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeaderVisibility);
        ticking = true;
      }
    },
    { passive: true }
  );
}

function setupMobileNav() {
  const siteHeader = document.querySelector('.site-header');
  const headerContent = document.querySelector('.header-content');
  const nav = document.querySelector('.main-nav');
  if (!siteHeader || !headerContent || !nav || headerContent.querySelector('.nav-toggle')) return;

  nav.id = nav.id || 'primary-nav';

  const toggleButton = document.createElement('button');
  toggleButton.type = 'button';
  toggleButton.className = 'nav-toggle';
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.setAttribute('aria-controls', nav.id);
  toggleButton.setAttribute('aria-label', 'Toggle navigation menu');
  toggleButton.innerHTML = '<span></span><span></span><span></span>';

  headerContent.insertBefore(toggleButton, nav);

  const closeNav = () => {
    nav.classList.remove('is-open');
    siteHeader.classList.remove('nav-open');
    toggleButton.setAttribute('aria-expanded', 'false');
  };

  toggleButton.addEventListener('click', () => {
    const willOpen = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', willOpen);
    siteHeader.classList.toggle('nav-open', willOpen);
    toggleButton.setAttribute('aria-expanded', String(willOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (event) => {
    if (!siteHeader.classList.contains('nav-open')) return;
    if (!siteHeader.contains(event.target)) {
      closeNav();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      closeNav();
    }
  });
}

function setupMobileCtaBar() {
  if (document.querySelector('.mobile-cta-bar')) return;

  const hasQuoteSection = Boolean(document.getElementById('quote'));
  const primaryHref = getPrimaryCtaHref();
  const primaryLabel = hasQuoteSection ? 'Get Quote' : 'Services';
  const primaryTrack = hasQuoteSection ? 'quote_click' : 'services_click';

  const bar = document.createElement('div');
  bar.className = 'mobile-cta-bar';
  bar.setAttribute('role', 'navigation');
  bar.setAttribute('aria-label', 'Quick actions');
  bar.innerHTML = `
    <a class="mobile-cta-btn" href="tel:${SITE_PHONE_URI}" data-track="call_click">Call</a>
    <a class="mobile-cta-btn" href="sms:${SITE_PHONE_URI}" data-track="text_click">Text</a>
    <a class="mobile-cta-btn mobile-cta-btn--primary" href="${primaryHref}" data-track="${primaryTrack}">${primaryLabel}</a>
  `;

  document.body.appendChild(bar);
  document.body.classList.add('has-mobile-cta');
}

function setupTracking() {
  document.addEventListener('click', (event) => {
    const target = event.target.closest('a, button');
    if (!target) return;

    const href = target.getAttribute('href') || '';
    const label = (target.textContent || '').trim().slice(0, 80);

    if (target.dataset.track) {
      emitAnalyticsEvent(target.dataset.track, { page: getPageKey(), label });
      return;
    }

    if (href.startsWith('tel:')) {
      emitAnalyticsEvent('call_click', { page: getPageKey(), label });
    } else if (href.startsWith('sms:')) {
      emitAnalyticsEvent('text_click', { page: getPageKey(), label });
    } else if (href.includes('clienthub.getjobber.com')) {
      emitAnalyticsEvent('client_portal_click', { page: getPageKey(), label });
    } else if (href.includes('#quote')) {
      emitAnalyticsEvent('quote_click', { page: getPageKey(), label });
    } else if (href.includes('#services')) {
      emitAnalyticsEvent('services_click', { page: getPageKey(), label });
    }
  });

  const quoteSection = document.getElementById('quote');
  if (quoteSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            emitAnalyticsEvent('quote_section_view', { page: getPageKey() });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(quoteSection);
  }
}

function parseQuoteResultMessage(data) {
  if (!data) return null;

  let payload = data;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (error) {
      return null;
    }
  }

  if (!payload || payload.type !== 'greenwolf_quote_result') {
    return null;
  }

  return payload;
}

function isTrustedQuoteOrigin(origin) {
  return origin.includes('script.google.com') || origin.includes('script.googleusercontent.com');
}

function setupSnowQuoteForm() {
  const form = document.getElementById('snow-quote-form');
  if (!form) return;

  const packageCards = Array.from(document.querySelectorAll('[data-snow-package-card]'));
  const packageButtons = Array.from(document.querySelectorAll('[data-select-snow-package]'));
  const addonPanel = form.querySelector('[data-snow-addon-panel]');
  const selectionSummary = form.querySelector('[data-snow-selection-summary]');
  const selectionText = form.querySelector('[data-selected-package-text]');
  const selectionState = form.querySelector('[data-selected-package-state]');
  const selectionNote = form.querySelector('[data-selected-package-note]');
  const status = form.querySelector('[data-form-status]');
  const submitButton = form.querySelector('button[type="submit"]');
  const endpoint = form.dataset.formEndpoint || '';
  const formKey = form.dataset.formKey || 'snow';
  const iframeTarget = 'snow-quote-submit-frame';
  const iframe = document.querySelector(`iframe[name="${iframeTarget}"]`);
  let selectedPackage = null;
  let awaitingResult = false;
  let resultTimer = null;

  const setStatus = (message, state = '') => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status${state ? ` is-${state}` : ''}`;
  };

  const resetSubmissionState = () => {
    awaitingResult = false;
    if (resultTimer) {
      window.clearTimeout(resultTimer);
      resultTimer = null;
    }
    form.classList.remove('is-submitting');
    submitButton.disabled = false;
  };

  const handleResultMessage = (success, message) => {
    resetSubmissionState();

    if (success) {
      setStatus(message || 'Your request was sent. Green Wolf will follow up shortly.', 'success');
      window.setTimeout(() => {
        window.location.href = '/thank-you';
      }, 250);
      return;
    }

    setStatus(message || 'The form could not be confirmed. Please try again or call/text us.', 'error');
  };

  const splitName = (fullName) => {
    const normalized = fullName.trim().replace(/\s+/g, ' ');
    if (!normalized) return { firstName: '', lastName: '' };

    const parts = normalized.split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ')
    };
  };

  const selectSnowPackage = (card) => {
    if (!card) return;

    selectedPackage = {
      name: card.dataset.packageName || '',
      frequency: card.dataset.packageFrequency || ''
    };

    packageCards.forEach((item) => item.classList.toggle('is-selected', item === card));
    packageButtons.forEach((button) => {
      const parentCard = button.closest('[data-snow-package-card]');
      button.textContent = parentCard === card ? 'Selected' : 'Select this plan';
    });

    if (selectionText) {
      selectionText.textContent = `${selectedPackage.name} | ${selectedPackage.frequency}`;
    }

    if (selectionState) {
      selectionState.textContent = 'Locked in';
    }

    if (selectionNote) {
      selectionNote.textContent = 'This package will be included in your quote unless you change it above.';
    }

    if (selectionSummary) {
      selectionSummary.classList.add('is-active');
    }

    if (addonPanel) {
      addonPanel.hidden = false;
    }

    const top = form.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top, behavior: 'smooth' });
    emitAnalyticsEvent('snow_package_select', {
      page: getPageKey(),
      package_name: selectedPackage.name,
      package_frequency: selectedPackage.frequency
    });
  };

  packageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('[data-snow-package-card]');
      selectSnowPackage(card);
    });
  });

  window.addEventListener('message', (event) => {
    if (!awaitingResult || !isTrustedQuoteOrigin(event.origin)) return;

    const payload = parseQuoteResultMessage(event.data);
    if (!payload || payload.formKey !== formKey) return;

    handleResultMessage(Boolean(payload.success), payload.message || payload.error);
  });

  iframe?.addEventListener('load', () => {
    if (!awaitingResult) return;

    if (resultTimer) {
      window.clearTimeout(resultTimer);
    }

    resultTimer = window.setTimeout(() => {
      if (!awaitingResult) return;
      handleResultMessage(true, 'Your request was sent. Green Wolf will follow up shortly.');
    }, 700);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setStatus('Please fill out all required fields before sending.', 'error');
      return;
    }

    if (!selectedPackage) {
      setStatus('Select a snow package first so the quote includes the right plan.', 'error');
      const top = document.getElementById('details')?.getBoundingClientRect().top + window.scrollY - 110;
      if (typeof top === 'number' && !Number.isNaN(top)) {
        window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }

    const payload = new URLSearchParams(new FormData(form));
    const honeypot = payload.get('company');
    if (honeypot) return;

    if (!endpoint || endpoint.includes('REPLACE_WITH_YOUR_DEPLOYMENT_ID')) {
      setStatus('This snow form is not connected yet. Add your Google Apps Script web app URL first.', 'error');
      return;
    }

    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const emailInput = form.querySelector('[name="email"]');
    const addressInput = form.querySelector('[name="address"]');
    const notesInput = form.querySelector('[name="notes"]');
    const messageInput = form.querySelector('[name="message"]');
    const frequencyInput = form.querySelector('[name="frequency"]');
    const packageNameInput = form.querySelector('[name="packageName"]');
    const addOnsInput = form.querySelector('[name="addOns"]');
    const aliasFullName = form.querySelector('[name="fullName"]');
    const aliasFirstName = form.querySelector('[name="firstName"]');
    const aliasLastName = form.querySelector('[name="lastName"]');
    const aliasPhone = form.querySelector('[name="phoneNumber"]');
    const aliasEmail = form.querySelector('[name="emailAddress"]');
    const aliasAddress = form.querySelector('[name="streetAddress"]');
    const sourceInput = form.querySelector('[name="source"]');
    const pageInput = form.querySelector('[name="page"]');

    const nameParts = splitName(nameInput?.value || '');
    const selectedAddOns = Array.from(form.querySelectorAll('input[name="snowAddOn"]:checked'))
      .map((input) => input.value)
      .filter(Boolean);
    const compiledMessageParts = [
      `Selected package: ${selectedPackage.name}`,
      `Plan type: ${selectedPackage.frequency}`,
      selectedAddOns.length ? `Add-ons: ${selectedAddOns.join(', ')}` : '',
      notesInput?.value ? `Customer notes: ${notesInput.value.trim()}` : ''
    ].filter(Boolean);

    if (aliasFullName) aliasFullName.value = nameInput?.value || '';
    if (aliasFirstName) aliasFirstName.value = nameParts.firstName;
    if (aliasLastName) aliasLastName.value = nameParts.lastName;
    if (aliasPhone) aliasPhone.value = phoneInput?.value || '';
    if (aliasEmail) aliasEmail.value = emailInput?.value || '';
    if (aliasAddress) aliasAddress.value = addressInput?.value || '';
    if (frequencyInput) frequencyInput.value = selectedPackage.frequency;
    if (packageNameInput) packageNameInput.value = selectedPackage.name;
    if (addOnsInput) addOnsInput.value = selectedAddOns.join(', ');
    if (messageInput) messageInput.value = compiledMessageParts.join(' | ');
    if (sourceInput && !sourceInput.value) sourceInput.value = 'Snow Service Website Form';
    if (pageInput) pageInput.value = window.location.href;

    form.action = endpoint;
    form.target = iframeTarget;

    awaitingResult = true;
    form.classList.add('is-submitting');
    submitButton.disabled = true;
    setStatus('Sending your quote request...', 'pending');
    resultTimer = window.setTimeout(() => {
      if (!awaitingResult) return;
      handleResultMessage(false, 'No response came back from the quote handler. Please try again.');
    }, 12000);

    window.setTimeout(() => {
      form.submit();
      emitAnalyticsEvent('snow_quote_submit', { page: getPageKey() });
    }, 50);
  });
}

function setupLawnQuoteForm() {
  const form = document.getElementById('lawn-quote-form');
  if (!form) return;

  const packageCards = Array.from(document.querySelectorAll('[data-lawn-package-card]'));
  const packageButtons = Array.from(document.querySelectorAll('[data-select-lawn-package]'));
  const addonPanel = form.querySelector('[data-lawn-addon-panel]');
  const selectionSummary = form.querySelector('[data-lawn-selection-summary]');
  const selectionText = form.querySelector('[data-selected-lawn-package-text]');
  const selectionState = form.querySelector('[data-selected-lawn-package-state]');
  const selectionNote = form.querySelector('[data-selected-lawn-package-note]');
  const status = form.querySelector('[data-form-status]');
  const submitButton = form.querySelector('button[type="submit"]');
  const endpoint = form.dataset.formEndpoint || '';
  const formKey = form.dataset.formKey || 'lawn';
  const iframeTarget = 'lawn-quote-submit-frame';
  const iframe = document.querySelector(`iframe[name="${iframeTarget}"]`);
  let selectedPackage = null;
  let awaitingResult = false;
  let resultTimer = null;

  const setStatus = (message, state = '') => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status${state ? ` is-${state}` : ''}`;
  };

  const resetSubmissionState = () => {
    awaitingResult = false;
    if (resultTimer) {
      window.clearTimeout(resultTimer);
      resultTimer = null;
    }
    form.classList.remove('is-submitting');
    submitButton.disabled = false;
  };

  const handleResultMessage = (success, message) => {
    resetSubmissionState();

    if (success) {
      setStatus(message || 'Your request was sent. Green Wolf will follow up shortly.', 'success');
      window.setTimeout(() => {
        window.location.href = '/thank-you';
      }, 250);
      return;
    }

    setStatus(message || 'The form could not be confirmed. Please try again or call/text us.', 'error');
  };

  const splitName = (fullName) => {
    const normalized = fullName.trim().replace(/\s+/g, ' ');
    if (!normalized) return { firstName: '', lastName: '' };

    const parts = normalized.split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ')
    };
  };

  const selectLawnPackage = (card) => {
    if (!card) return;

    selectedPackage = {
      name: card.dataset.packageName || '',
      frequency: card.dataset.packageFrequency || ''
    };

    packageCards.forEach((item) => item.classList.toggle('is-selected', item === card));
    packageButtons.forEach((button) => {
      const parentCard = button.closest('[data-lawn-package-card]');
      button.textContent = parentCard === card ? 'Selected' : 'Select this plan';
    });

    if (selectionText) {
      selectionText.textContent = `${selectedPackage.name} | ${selectedPackage.frequency}`;
    }

    if (selectionState) {
      selectionState.textContent = 'Locked in';
    }

    if (selectionNote) {
      selectionNote.textContent = 'This lawn package will be included in your quote unless you change it above.';
    }

    if (selectionSummary) {
      selectionSummary.classList.add('is-active');
    }

    if (addonPanel) {
      addonPanel.hidden = false;
    }

    const top = form.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top, behavior: 'smooth' });
    emitAnalyticsEvent('lawn_package_select', {
      page: getPageKey(),
      package_name: selectedPackage.name,
      package_frequency: selectedPackage.frequency
    });
  };

  packageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('[data-lawn-package-card]');
      selectLawnPackage(card);
    });
  });

  window.addEventListener('message', (event) => {
    if (!awaitingResult || !isTrustedQuoteOrigin(event.origin)) return;

    const payload = parseQuoteResultMessage(event.data);
    if (!payload || payload.formKey !== formKey) return;

    handleResultMessage(Boolean(payload.success), payload.message || payload.error);
  });

  iframe?.addEventListener('load', () => {
    if (!awaitingResult) return;

    if (resultTimer) {
      window.clearTimeout(resultTimer);
    }

    resultTimer = window.setTimeout(() => {
      if (!awaitingResult) return;
      handleResultMessage(true, 'Your request was sent. Green Wolf will follow up shortly.');
    }, 700);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setStatus('Please fill out all required fields before sending.', 'error');
      return;
    }

    if (!selectedPackage) {
      setStatus('Select a lawn package first so the quote includes the right plan.', 'error');
      const top = document.getElementById('details')?.getBoundingClientRect().top + window.scrollY - 110;
      if (typeof top === 'number' && !Number.isNaN(top)) {
        window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }

    const payload = new URLSearchParams(new FormData(form));
    const honeypot = payload.get('company');
    if (honeypot) return;

    if (!endpoint || endpoint.includes('REPLACE_WITH_YOUR_DEPLOYMENT_ID')) {
      setStatus('This lawn form is not connected yet. Add your Google Apps Script web app URL first.', 'error');
      return;
    }

    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const emailInput = form.querySelector('[name="email"]');
    const addressInput = form.querySelector('[name="address"]');
    const lawnSizeInput = form.querySelector('[name="lawnSize"]');
    const notesInput = form.querySelector('[name="notes"]');
    const messageInput = form.querySelector('[name="message"]');
    const frequencyInput = form.querySelector('[name="frequency"]');
    const packageNameInput = form.querySelector('[name="packageName"]');
    const addOnsInput = form.querySelector('[name="addOns"]');
    const aliasFullName = form.querySelector('[name="fullName"]');
    const aliasFirstName = form.querySelector('[name="firstName"]');
    const aliasLastName = form.querySelector('[name="lastName"]');
    const aliasPhone = form.querySelector('[name="phoneNumber"]');
    const aliasEmail = form.querySelector('[name="emailAddress"]');
    const aliasAddress = form.querySelector('[name="streetAddress"]');
    const sourceInput = form.querySelector('[name="source"]');
    const pageInput = form.querySelector('[name="page"]');

    const nameParts = splitName(nameInput?.value || '');
    const selectedAddOns = Array.from(form.querySelectorAll('input[name="lawnAddOn"]:checked'))
      .map((input) => input.value)
      .filter(Boolean);
    const compiledMessageParts = [
      `Selected package: ${selectedPackage.name}`,
      `Plan frequency: ${selectedPackage.frequency}`,
      lawnSizeInput?.value ? `Approx lawn size: ${lawnSizeInput.value}` : '',
      selectedAddOns.length ? `Add-ons: ${selectedAddOns.join(', ')}` : '',
      notesInput?.value ? `Customer notes: ${notesInput.value.trim()}` : ''
    ].filter(Boolean);

    if (aliasFullName) aliasFullName.value = nameInput?.value || '';
    if (aliasFirstName) aliasFirstName.value = nameParts.firstName;
    if (aliasLastName) aliasLastName.value = nameParts.lastName;
    if (aliasPhone) aliasPhone.value = phoneInput?.value || '';
    if (aliasEmail) aliasEmail.value = emailInput?.value || '';
    if (aliasAddress) aliasAddress.value = addressInput?.value || '';
    if (frequencyInput) frequencyInput.value = selectedPackage.frequency;
    if (packageNameInput) packageNameInput.value = selectedPackage.name;
    if (addOnsInput) addOnsInput.value = selectedAddOns.join(', ');
    if (messageInput) messageInput.value = compiledMessageParts.join(' | ');
    if (sourceInput && !sourceInput.value) sourceInput.value = 'Lawn Service Website Form';
    if (pageInput) pageInput.value = window.location.href;

    form.action = endpoint;
    form.target = iframeTarget;

    awaitingResult = true;
    form.classList.add('is-submitting');
    submitButton.disabled = true;
    setStatus('Sending your quote request...', 'pending');
    resultTimer = window.setTimeout(() => {
      if (!awaitingResult) return;
      handleResultMessage(false, 'No response came back from the quote handler. Please try again.');
    }, 12000);

    window.setTimeout(() => {
      form.submit();
      emitAnalyticsEvent('lawn_quote_submit', { page: getPageKey() });
    }, 50);
  });
}

function setupCleanupQuoteForm() {
  const form = document.getElementById('cleanup-quote-form');
  if (!form) return;

  const packageCards = Array.from(document.querySelectorAll('[data-cleanup-package-card]'));
  const packageButtons = Array.from(document.querySelectorAll('[data-select-cleanup-package]'));
  const addonPanel = form.querySelector('[data-cleanup-addon-panel]');
  const selectionSummary = form.querySelector('[data-cleanup-selection-summary]');
  const selectionText = form.querySelector('[data-selected-cleanup-package-text]');
  const selectionState = form.querySelector('[data-selected-cleanup-package-state]');
  const selectionNote = form.querySelector('[data-selected-cleanup-package-note]');
  const status = form.querySelector('[data-form-status]');
  const submitButton = form.querySelector('button[type="submit"]');
  const endpoint = form.dataset.formEndpoint || '';
  const formKey = form.dataset.formKey || 'cleanup';
  const iframeTarget = 'cleanup-quote-submit-frame';
  const iframe = document.querySelector(`iframe[name="${iframeTarget}"]`);
  let selectedPackage = null;
  let awaitingResult = false;
  let resultTimer = null;

  const setStatus = (message, state = '') => {
    if (!status) return;
    status.textContent = message;
    status.className = `form-status${state ? ` is-${state}` : ''}`;
  };

  const resetSubmissionState = () => {
    awaitingResult = false;
    if (resultTimer) {
      window.clearTimeout(resultTimer);
      resultTimer = null;
    }
    form.classList.remove('is-submitting');
    submitButton.disabled = false;
  };

  const handleResultMessage = (success, message) => {
    resetSubmissionState();

    if (success) {
      setStatus(message || 'Your request was sent. Green Wolf will follow up shortly.', 'success');
      window.setTimeout(() => {
        window.location.href = '/thank-you';
      }, 250);
      return;
    }

    setStatus(message || 'The form could not be confirmed. Please try again or call/text us.', 'error');
  };

  const splitName = (fullName) => {
    const normalized = fullName.trim().replace(/\s+/g, ' ');
    if (!normalized) return { firstName: '', lastName: '' };

    const parts = normalized.split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ')
    };
  };

  const selectCleanupPackage = (card) => {
    if (!card) return;

    selectedPackage = {
      name: card.dataset.packageName || '',
      frequency: card.dataset.packageFrequency || ''
    };

    packageCards.forEach((item) => item.classList.toggle('is-selected', item === card));
    packageButtons.forEach((button) => {
      const parentCard = button.closest('[data-cleanup-package-card]');
      button.textContent = parentCard === card ? 'Selected' : 'Select this plan';
    });

    if (selectionText) {
      selectionText.textContent = `${selectedPackage.name} | ${selectedPackage.frequency}`;
    }

    if (selectionState) {
      selectionState.textContent = 'Locked in';
    }

    if (selectionNote) {
      selectionNote.textContent = 'This bin cleaning package will be included in your quote unless you change it above.';
    }

    if (selectionSummary) {
      selectionSummary.classList.add('is-active');
    }

    if (addonPanel) {
      addonPanel.hidden = false;
    }

    const top = form.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top, behavior: 'smooth' });
    emitAnalyticsEvent('cleanup_package_select', {
      page: getPageKey(),
      package_name: selectedPackage.name,
      package_frequency: selectedPackage.frequency
    });
  };

  packageButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('[data-cleanup-package-card]');
      selectCleanupPackage(card);
    });
  });

  window.addEventListener('message', (event) => {
    if (!awaitingResult || !isTrustedQuoteOrigin(event.origin)) return;

    const payload = parseQuoteResultMessage(event.data);
    if (!payload || payload.formKey !== formKey) return;

    handleResultMessage(Boolean(payload.success), payload.message || payload.error);
  });

  iframe?.addEventListener('load', () => {
    if (!awaitingResult) return;

    if (resultTimer) {
      window.clearTimeout(resultTimer);
    }

    resultTimer = window.setTimeout(() => {
      if (!awaitingResult) return;
      handleResultMessage(true, 'Your request was sent. Green Wolf will follow up shortly.');
    }, 700);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setStatus('Please fill out all required fields before sending.', 'error');
      return;
    }

    if (!selectedPackage) {
      setStatus('Select a bin cleaning package first so the quote includes the right plan.', 'error');
      const top = document.getElementById('details')?.getBoundingClientRect().top + window.scrollY - 110;
      if (typeof top === 'number' && !Number.isNaN(top)) {
        window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }

    const payload = new URLSearchParams(new FormData(form));
    const honeypot = payload.get('company');
    if (honeypot) return;

    if (!endpoint || endpoint.includes('REPLACE_WITH_YOUR_DEPLOYMENT_ID')) {
      setStatus('This bin cleaning form is not connected yet. Add your Google Apps Script web app URL first.', 'error');
      return;
    }

    const nameInput = form.querySelector('[name="name"]');
    const phoneInput = form.querySelector('[name="phone"]');
    const emailInput = form.querySelector('[name="email"]');
    const addressInput = form.querySelector('[name="address"]');
    const binCountInput = form.querySelector('[name="binCount"]');
    const sizeInput = form.querySelector('[name="size"]');
    const notesInput = form.querySelector('[name="notes"]');
    const messageInput = form.querySelector('[name="message"]');
    const frequencyInput = form.querySelector('[name="frequency"]');
    const packageNameInput = form.querySelector('[name="packageName"]');
    const addOnsInput = form.querySelector('[name="addOns"]');
    const aliasFullName = form.querySelector('[name="fullName"]');
    const aliasFirstName = form.querySelector('[name="firstName"]');
    const aliasLastName = form.querySelector('[name="lastName"]');
    const aliasPhone = form.querySelector('[name="phoneNumber"]');
    const aliasEmail = form.querySelector('[name="emailAddress"]');
    const aliasAddress = form.querySelector('[name="streetAddress"]');
    const sourceInput = form.querySelector('[name="source"]');
    const pageInput = form.querySelector('[name="page"]');

    const nameParts = splitName(nameInput?.value || '');
    const selectedAddOns = Array.from(form.querySelectorAll('input[name="cleanupAddOn"]:checked'))
      .map((input) => input.value)
      .filter(Boolean);
    const compiledMessageParts = [
      `Selected package: ${selectedPackage.name}`,
      `Plan frequency: ${selectedPackage.frequency}`,
      binCountInput?.value ? `Bin count: ${binCountInput.value}` : '',
      selectedAddOns.length ? `Add-ons: ${selectedAddOns.join(', ')}` : '',
      notesInput?.value ? `Customer notes: ${notesInput.value.trim()}` : ''
    ].filter(Boolean);

    if (aliasFullName) aliasFullName.value = nameInput?.value || '';
    if (aliasFirstName) aliasFirstName.value = nameParts.firstName;
    if (aliasLastName) aliasLastName.value = nameParts.lastName;
    if (aliasPhone) aliasPhone.value = phoneInput?.value || '';
    if (aliasEmail) aliasEmail.value = emailInput?.value || '';
    if (aliasAddress) aliasAddress.value = addressInput?.value || '';
    if (sizeInput) sizeInput.value = binCountInput?.value || '';
    if (frequencyInput) frequencyInput.value = selectedPackage.frequency;
    if (packageNameInput) packageNameInput.value = selectedPackage.name;
    if (addOnsInput) addOnsInput.value = selectedAddOns.join(', ');
    if (messageInput) messageInput.value = compiledMessageParts.join(' | ');
    if (sourceInput && !sourceInput.value) sourceInput.value = 'Bin Cleaning Website Form';
    if (pageInput) pageInput.value = window.location.href;

    form.action = endpoint;
    form.target = iframeTarget;

    awaitingResult = true;
    form.classList.add('is-submitting');
    submitButton.disabled = true;
    setStatus('Sending your quote request...', 'pending');
    resultTimer = window.setTimeout(() => {
      if (!awaitingResult) return;
      handleResultMessage(false, 'No response came back from the quote handler. Please try again.');
    }, 12000);

    window.setTimeout(() => {
      form.submit();
      emitAnalyticsEvent('cleanup_quote_submit', { page: getPageKey() });
    }, 50);
  });
}

function setupDetailsAccordion() {
  const accordionGroups = document.querySelectorAll('[data-accordion="true"]');
  accordionGroups.forEach((group) => {
    const items = Array.from(group.querySelectorAll('details'));
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) {
            other.open = false;
          }
        });
      });
    });
  });
}
function optimizeMedia() {
  document.querySelectorAll('img').forEach((img) => {
    if (!img.closest('.hero')) {
      img.loading = img.loading || 'lazy';
      img.decoding = img.decoding || 'async';
    }
  });

  const pagePosterMap = {
    home: 'images/1.jpeg',
    'about-us': 'images/2008.jpeg',
    'specialty-lawn-treatments': 'images/S1.png',
    snow: 'images/3001.jpeg',
    lawn: 'images/9.jpeg',
    landscaping: 'images/2001.jpg',
    cleanup: 'images/2001.jpg',
    gallery: 'images/3001.jpeg',
    learning: 'images/2006.jpg',
    'green-wolf-blogs': 'images/3008.jpeg',
    library: 'images/2008.jpeg'
  };

  const poster = pagePosterMap[getPageKey()] || 'images/1.jpeg';
  document.querySelectorAll('video').forEach((video) => {
    if (!video.getAttribute('preload') || video.getAttribute('preload') === 'auto') {
      video.setAttribute('preload', 'metadata');
    }

    if (!video.getAttribute('poster')) {
      video.setAttribute('poster', poster);
    }
  });
}

function init() {
  setFooterYear();
  setupSmoothScrolling();
  setupClickFlash();
  setupRevealOnScroll();
  setupBackToTop();
  setupHideHeaderOnScroll();
  setupMobileNav();
  setupMobileCtaBar();
  setupSnowQuoteForm();
  setupLawnQuoteForm();
  setupCleanupQuoteForm();
  setupDetailsAccordion();
  optimizeMedia();
  setupTracking();
}

init();

