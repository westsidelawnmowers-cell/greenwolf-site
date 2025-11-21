// Footer year
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Smooth scrolling for anchor links
const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    if (!targetId) return;

    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      event.preventDefault();
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Reveal on scroll
const revealElements = document.querySelectorAll(
  "section, .card, .hero-card, .hero h2, .hero p, .hero-bullets li, .hero-cta, .site-header"
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealElements.forEach((element) => {
  element.classList.add("will-reveal");
  revealObserver.observe(element);
});

// Back to top button
const backToTop = document.querySelector(".back-to-top");
if (backToTop) {
  const toggleBackToTop = () => {
    const show = window.scrollY > 420;
    backToTop.classList.toggle("is-active", show);
  };

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.addEventListener("scroll", toggleBackToTop, { passive: true });
  toggleBackToTop();
}

// Quote form validation + friendly feedback
const quoteForm = document.querySelector(".quote-form");
const statusEl = document.querySelector(".form-status");

const setStatus = (message, type = "info") => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.type = type;
};

if (quoteForm) {
  quoteForm.addEventListener("submit", (event) => {
    const formData = new FormData(quoteForm);
    const name = (formData.get("name") || "").toString().trim();
    const phone = (formData.get("phone") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const area = (formData.get("address") || "").toString().trim();

    const errors = [];
    if (!name) errors.push("Please include your name.");
    if (!phone.match(/^[+\d][\d\s()-]{6,}$/)) {
      errors.push("Add a reachable phone number (digits only is fine).");
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("That email doesn’t look quite right.");
    }
    if (!area) errors.push("Let us know your neighborhood so we can quote quickly.");

    if (errors.length) {
      event.preventDefault();
      setStatus(errors[0], "error");
      return;
    }

    setStatus("Sending your request…", "info");
  });
}
