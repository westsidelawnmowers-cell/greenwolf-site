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

// Dynamic gallery loader
const galleryRoot = document.querySelector('[data-gallery-root]');

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];

const buildImageCard = (src) => {
  const card = document.createElement('article');
  card.className = 'gallery-card';

  const figure = document.createElement('div');
  figure.className = 'frame live-image';

  const img = document.createElement('img');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = src;
  img.alt = 'Project photo from the Green Wolf gallery';

  figure.appendChild(img);
  card.appendChild(figure);
  return card;
};

const renderGallery = (container, images) => {
  container.innerHTML = '';

  if (!images.length) {
    const empty = document.createElement('article');
    empty.className = 'gallery-card';
    empty.innerHTML = `
      <h3>No images found yet</h3>
      <p class="small-text">Drop photos into the <code>images</code> folder and refresh to see them appear here automatically.</p>
    `;
    container.appendChild(empty);
    return;
  }

  images.forEach((src) => container.appendChild(buildImageCard(src)));
};

const parseDirectoryListing = (markup, folder) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, 'text/html');
  const anchors = Array.from(doc.querySelectorAll('a'));
  const files = anchors
    .map((a) => decodeURIComponent(a.getAttribute('href') || ''))
    .filter((href) => imageExtensions.some((ext) => href.toLowerCase().endsWith(ext)))
    .map((href) => {
      const cleanHref = href.startsWith('http') ? href : `${folder.replace(/\/$/, '')}/${href.replace(/^\//, '')}`;
      return cleanHref;
    });

  return Array.from(new Set(files));
};

const fetchImageList = async (folder) => {
  // 1) Try manifest file if present
  try {
    const manifestResponse = await fetch(`${folder}/manifest.json`, { cache: 'no-store' });
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      if (Array.isArray(manifest)) {
        return manifest
          .map((src) => src.toString())
          .filter((src) => imageExtensions.some((ext) => src.toLowerCase().endsWith(ext)));
      }
    }
  } catch (error) {
    console.warn('Gallery manifest not found; falling back to directory listing.', error);
  }

  // 2) Fallback: attempt to parse directory listing (works when the server exposes the folder)
  try {
    const listingResponse = await fetch(`${folder}/`, { cache: 'no-store' });
    if (listingResponse.ok) {
      const markup = await listingResponse.text();
      return parseDirectoryListing(markup, folder);
    }
  } catch (error) {
    console.warn('Gallery listing unavailable.', error);
  }

  return [];
};

const initDynamicGallery = async () => {
  if (!galleryRoot) return;

  const folder = galleryRoot.dataset.galleryFolder || 'images';
  const images = await fetchImageList(folder);
  renderGallery(galleryRoot, images);
};

initDynamicGallery();
