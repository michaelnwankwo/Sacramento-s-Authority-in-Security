/* ═══════════════════════════════════════════════════════
   PROFESSIONAL SECURITY GUARD INC. — SACRAMENTO BRANCH
   Main JavaScript
   ═══════════════════════════════════════════════════════ */

"use strict";

/* ──────────────────────────────────────
   1. MOBILE NAVIGATION
   ────────────────────────────────────── */

(function initNav() {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("main-nav");
  if (!hamburger || !nav) return;

  hamburger.addEventListener("click", function (e) {
    e.stopPropagation();
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove("open");
    }
  });
})();

/* ──────────────────────────────────────
   2. FLIP CARDS — TAP TOGGLE (MOBILE)
      Hover handles desktop via CSS.
      JS handles tap for touch devices.
   ────────────────────────────────────── */
(function initFlipCards() {
  const cards = document.querySelectorAll(".flip-card");

  cards.forEach((card) => {
    // TAP: toggle the .flipped class
    card.addEventListener("click", () => {
      // If another card is flipped, unflip it first
      cards.forEach((other) => {
        if (other !== card) other.classList.remove("flipped");
      });
      card.classList.toggle("flipped");
    });

    // KEYBOARD: Enter or Space triggers flip
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
      // Escape closes
      if (e.key === "Escape") {
        card.classList.remove("flipped");
      }
    });

    // On desktop hover exit, remove flipped so CSS hover takes back over cleanly
    card.addEventListener("mouseleave", () => {
      card.classList.remove("flipped");
    });
  });

  // Close all on outside tap
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".flip-card")) {
      cards.forEach((c) => c.classList.remove("flipped"));
    }
  });
})();

/* ──────────────────────────────────────
   3. SERVICE SELECTOR — LIVE SUMMARY
   ────────────────────────────────────── */
(function initBooking() {
  const checkboxes = document.querySelectorAll(
    '#service-grid input[type="checkbox"]',
  );
  const selectedList = document.getElementById("selected-list");
  const bookBtn = document.getElementById("book-btn");
  const formSuccess = document.getElementById("form-success");

  if (!checkboxes.length) return;

  function updateSummary() {
    const checked = [...checkboxes].filter((cb) => cb.checked);

    if (checked.length === 0) {
      selectedList.innerHTML =
        '<p class="no-sel">Select services from the grid →</p>';
    } else {
      selectedList.innerHTML = checked
        .map((cb) => `<div class="sel-item">${cb.value}</div>`)
        .join("");
    }
  }

  checkboxes.forEach((cb) => cb.addEventListener("change", updateSummary));

  /* ── SUBMIT ── */
  bookBtn.addEventListener("click", handleSubmit);

  function handleSubmit() {
    const name = document.getElementById("f-name").value.trim();
    const phone = document.getElementById("f-phone").value.trim();
    const email = document.getElementById("f-email").value.trim();
    const location = document.getElementById("f-location").value.trim();
    const notes = document.getElementById("f-notes").value.trim();
    const selected = [...checkboxes]
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    // Validate
    if (!name || !phone || !email) {
      shakeBtn();
      alert("Please fill in your name, phone number, and email to continue.");
      return;
    }

    if (selected.length === 0) {
      shakeBtn();
      alert("Please select at least one service.");
      return;
    }

    // Disable button / loading state
    bookBtn.disabled = true;
    bookBtn.textContent = "Submitting…";

    /* ─── EmailJS Integration ───────────────────────
       Replace the three placeholder strings below with
       your real EmailJS credentials from emailjs.com.

       1. Sign up at https://emailjs.com (free tier works)
       2. Create an Email Service (Gmail, Outlook, etc.)
       3. Create an Email Template — use these variables:
            {{name}}     {{phone}}    {{email}}
            {{location}} {{services}} {{notes}}
       4. Paste your IDs below and uncomment the block.
    ──────────────────────────────────────────────── */

    const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID"; // ← replace
    const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID"; // ← replace
    const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY"; // ← replace

    const templateParams = {
      name,
      phone,
      email,
      location: location || "Not specified",
      services: selected.join(", "),
      notes: notes || "None",
      timestamp: new Date().toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
      }),
      license: "PPO120130",
    };

    /* ── EmailJS send (uncomment when credentials are set) ──
    if (typeof emailjs !== 'undefined') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then(() => onSuccess())
        .catch(err => {
          console.error('EmailJS error:', err);
          // Fallback to mailto
          sendMailtoFallback(templateParams);
          onSuccess();
        });
    } else {
      sendMailtoFallback(templateParams);
      onSuccess();
    }
    */

    // ── CURRENT MODE: mailto fallback (works right now, no setup needed)
    sendMailtoFallback(templateParams);
    setTimeout(onSuccess, 900);
  }

  function sendMailtoFallback(p) {
    const subject = encodeURIComponent(
      `New PSG Sacramento Lead — ${p.services}`,
    );
    const body = encodeURIComponent(
      `NEW SERVICE REQUEST — PSG SACRAMENTO\n` +
        `=====================================\n\n` +
        `Name:      ${p.name}\n` +
        `Phone:     ${p.phone}\n` +
        `Email:     ${p.email}\n` +
        `Location:  ${p.location}\n` +
        `Services:  ${p.services}\n` +
        `Notes:     ${p.notes}\n\n` +
        `Submitted: ${p.timestamp}\n` +
        `License:   ${p.license} · Branch: Sacramento`,
    );
    window.open(
      `mailto:sacramento@profsecurity.com?subject=${subject}&body=${body}`,
      "_blank",
    );
  }

  function onSuccess() {
    // Hide form elements
    document.querySelector(".form-fields").style.display = "none";
    bookBtn.style.display = "none";
    document.querySelector(".lic-note").style.display = "none";
    selectedList.style.display = "none";
    document.querySelector(".summary-box h3").style.display = "none";

    // Show success state
    formSuccess.style.display = "block";

    // Reset checkboxes visually
    checkboxes.forEach((cb) => {
      cb.checked = false;
    });

    // Show toast
    showToast("✅ Request sent! We'll call you within 30 min.");
  }

  function shakeBtn() {
    bookBtn.style.animation = "shake 0.4s ease";
    bookBtn.addEventListener(
      "animationend",
      () => {
        bookBtn.style.animation = "";
      },
      { once: true },
    );
  }
})();

/* ──────────────────────────────────────
   4. TOAST NOTIFICATION
   ────────────────────────────────────── */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 5000);
}

/* ──────────────────────────────────────
   5. SCROLL REVEAL
   ────────────────────────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  targets.forEach((el) => obs.observe(el));
})();

/* ──────────────────────────────────────
   6. SMOOTH ANCHOR OFFSET
      Accounts for sticky header height
   ────────────────────────────────────── */
(function initAnchorOffset() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();

      const headerH = document.querySelector("header")?.offsetHeight || 68;
      const y =
        target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
})();

/* ──────────────────────────────────────
   7. SHAKE KEYFRAME (injected)
   ────────────────────────────────────── */
(function injectShakeAnim() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes shake {
      0%,100%{ transform: translateX(0); }
      20%    { transform: translateX(-6px); }
      40%    { transform: translateX(6px); }
      60%    { transform: translateX(-4px); }
      80%    { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();

/* ──────────────────────────────────────
   8. EMAILJS LOADER (optional)
      Uncomment when you have credentials
   ────────────────────────────────────── */
/*
(function loadEmailJS() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  script.async = true;
  document.head.appendChild(script);
})();
*/

/* ──────────────────────────────────────
   EQUIPMENT CAROUSEL — INFINITE CLONE
   ────────────────────────────────────── */
(function initCarousel() {
  const track = document.getElementById("carousel-track");
  if (!track) return;

  // Clone all original cards and append for seamless loop
  const originals = [...track.children];
  originals.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
})();
