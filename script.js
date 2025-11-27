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
    event.preventDefault();
    const formData = new FormData(quoteForm);
    const name = (formData.get('name') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const area = (formData.get('address') || '').toString().trim();
    const service = (formData.get('service') || '').toString();
    const frequency = (formData.get('frequency') || '').toString();
    const details = (formData.get('details') || '').toString().trim();

    const errors = [];
    if (!name) errors.push('Please include your name.');
    if (!phone.match(/^[+\d][\d\s()-]{6,}$/)) {
      errors.push('Add a reachable phone number (digits only is fine).');
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('That email doesn’t look quite right.');
    }
    if (!area) errors.push('Let us know your neighborhood so we can quote quickly.');
    if (service === 'Lawn Mowing' && !frequency) {
      errors.push('Pick a mowing cadence so we can price it.');
    }

    if (errors.length) {
      setStatus(errors[0], 'error');
      return;
    }

    const subject = encodeURIComponent('New lawn quote request');
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nAddress: ${area}\nService: ${service}\nMowing frequency: ${frequency || 'Not specified'}\nDetails: ${details || 'None provided'}`
    );

    const mailtoLink = `mailto:info@greenwolf.work?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    setStatus('Opening your email app with your request. Please press send to finish.', 'info');
  });
}

// Service prefill and scroll
const serviceCards = document.querySelectorAll('.service-card');
const serviceSelect = document.querySelector('select[name="service"]');
const frequencySelect = document.querySelector('select[name="frequency"]');
const quoteSection = document.getElementById('quote');

const scrollToQuote = () => {
  if (!quoteSection) return;
  quoteSection.scrollIntoView({ behavior: 'smooth' });
};

const setService = (service) => {
  if (serviceSelect) {
    serviceSelect.value = service;
  }

  serviceCards.forEach((card) => {
    const isMatch = card.dataset.service === service;
    card.classList.toggle('is-active', isMatch);
  });
};

serviceCards.forEach((card) => {
  card.addEventListener('click', () => {
    const service = card.dataset.service;
    if (!service) return;
    setService(service);

    if (service !== 'Lawn Mowing' && frequencySelect) {
      frequencySelect.value = '';
      setStatus(`Prefilled your request for ${service}. Add notes and submit.`, 'info');
    } else {
      setStatus('Mowing selected. Pick your visit cadence in the form and submit.', 'info');
    }

    scrollToQuote();
  });
});
