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

// Hide header on scroll down with a small tolerance to prevent jitter
const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  let lastScrollY = window.scrollY;
  let lastToggleY = window.scrollY;
  let ticking = false;
  const hideOffset = 120;
  const revealTolerance = 14;

  const updateHeaderVisibility = () => {
    const currentY = window.scrollY;
    const scrollingDown = currentY > lastScrollY;
    const scrollingUp = currentY < lastScrollY;

    const shouldHide = scrollingDown && currentY > hideOffset;
    const shouldShow =
      (scrollingUp && lastToggleY - currentY > revealTolerance) || currentY <= hideOffset;

    if (shouldHide) {
      siteHeader.classList.add('is-hidden');
      lastToggleY = currentY;
    } else if (shouldShow) {
      siteHeader.classList.remove('is-hidden');
      lastToggleY = currentY;
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

// Jobber embeds handle form submission; no extra JS needed for selections
