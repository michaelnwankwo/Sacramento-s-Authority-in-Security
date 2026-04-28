"use strict";

/* ── NAV ── */
(function initNav() {
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("main-nav");
  const navClose = document.getElementById("nav-close");
  if (!nav) return;

  function openNav() {
    nav.classList.add("open");
    if (hamburger) hamburger.classList.add("active");
    document.body.classList.add("nav-open");
  }

  function closeNav() {
    nav.classList.remove("open");
    if (hamburger) hamburger.classList.remove("active");
    document.body.classList.remove("nav-open");
  }

  if (hamburger)
    hamburger.addEventListener("click", () => {
      nav.classList.contains("open") ? closeNav() : openNav();
    });

  if (navClose) navClose.addEventListener("click", closeNav);

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
})();

/* ── HERO AUTO-FLIP ── */
(function initHeroFlip() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const dotsWrap = document.createElement("div");
  dotsWrap.className = "hero-dots";
  dotsWrap.innerHTML = `
    <button class="hero-dot active" data-face="0" aria-label="Show image"></button>
    <button class="hero-dot"        data-face="1" aria-label="Show text"></button>
  `;
  hero.appendChild(dotsWrap);

  const dots = dotsWrap.querySelectorAll(".hero-dot");
  let current = 0;
  let timer = null;

  function goTo(index) {
    current = index;
    current === 1
      ? hero.classList.add("hero-flipped")
      : hero.classList.remove("hero-flipped");
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
  }

  function next() {
    goTo(current === 0 ? 1 : 0);
  }

  function startTimer() {
    timer = setInterval(next, 3000);
  }
  function stopTimer() {
    clearInterval(timer);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      stopTimer();
      goTo(i);
      startTimer();
    });
  });

  hero.addEventListener("mouseenter", stopTimer);
  hero.addEventListener("mouseleave", startTimer);
  hero.addEventListener("touchstart", stopTimer, { passive: true });
  hero.addEventListener("touchend", startTimer, { passive: true });

  startTimer();
})();

/* ── UNIFIED SELECTION LOGIC ── */
(function initSelectionLogic() {
  const selectedServices = new Set();
  let selectedArea = null;

  const svcCards = document.querySelectorAll(".svc-flip-card");
  const fcItems = document.querySelectorAll(".fc-item");
  const areaCities = document.querySelectorAll(".flip-card");
  const selectedList = document.getElementById("selected-list");

  function updateSummary() {
    if (!selectedList) return;
    const allSelected = [...selectedServices];
    if (allSelected.length === 0 && !selectedArea) {
      selectedList.innerHTML = '<p class="no-sel">Select services above →</p>';
      return;
    }
    let html = "";
    allSelected.forEach((svc) => {
      html += `<div class="sel-item">${svc}</div>`;
    });
    if (selectedArea) {
      html += `<div class="sel-item sel-area">📍 ${selectedArea}</div>`;
    }
    selectedList.innerHTML = html;
  }

  function syncCardToChecklist(name, state) {
    fcItems.forEach((item) => {
      if (item.dataset.service === name)
        item.classList.toggle("fc-checked", state);
    });
  }

  function syncChecklistToCard(name, state) {
    svcCards.forEach((card) => {
      const n = card.querySelector(".svc-flip-name")?.textContent?.trim();
      if (n === name) card.classList.toggle("selected", state);
    });
  }

  /* Service cards */
  svcCards.forEach((card) => {
    card.addEventListener("click", function (e) {
      if (
        e.target.closest(".svc-book-btn") ||
        e.target.closest(".svc-book-btn-back")
      )
        return;

      const name = card.querySelector(".svc-flip-name")?.textContent?.trim();
      if (!name) return;

      card.classList.toggle("flipped");

      if (selectedServices.has(name)) {
        selectedServices.delete(name);
        card.classList.remove("selected");
        syncCardToChecklist(name, false);
      } else {
        selectedServices.add(name);
        card.classList.add("selected");
        syncCardToChecklist(name, true);
      }
      updateSummary();
    });

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
      if (e.key === "Escape") card.classList.remove("flipped");
    });
  });

  /* Compact checklist */
  fcItems.forEach((item) => {
    item.addEventListener("click", function () {
      const name = this.dataset.service;
      if (!name) return;
      if (selectedServices.has(name)) {
        selectedServices.delete(name);
        this.classList.remove("fc-checked");
        syncChecklistToCard(name, false);
      } else {
        selectedServices.add(name);
        this.classList.add("fc-checked");
        syncChecklistToCard(name, true);
      }
      updateSummary();
    });
  });

  /* City cards */
  areaCities.forEach((card) => {
    card.addEventListener("click", function () {
      const cityName = this.querySelector(".city-name")?.textContent?.trim();
      if (!cityName) return;

      areaCities.forEach((c) => c.classList.remove("area-selected"));
      areaCities.forEach((other) => {
        if (other !== card) other.classList.remove("flipped");
      });
      card.classList.toggle("flipped");

      if (selectedArea === cityName) {
        selectedArea = null;
      } else {
        selectedArea = cityName;
        this.classList.add("area-selected");
      }
      updateSummary();
    });

    card.addEventListener("mouseleave", () => card.classList.remove("flipped"));
  });

  /* Form submit */
  const bookBtn = document.getElementById("book-btn");
  if (bookBtn) {
    bookBtn.addEventListener("click", function () {
      const name = document.getElementById("f-name")?.value.trim();
      const phone = document.getElementById("f-phone")?.value.trim();
      const email = document.getElementById("f-email")?.value.trim();
      const location = document.getElementById("f-location")?.value.trim();
      const notes = document.getElementById("f-notes")?.value.trim();
      const services = [...selectedServices];

      if (!name || !phone || !email) {
        alert("Please fill in your name, phone number, and email.");
        return;
      }
      if (services.length === 0) {
        alert("Please select at least one service.");
        return;
      }

      bookBtn.disabled = true;
      bookBtn.textContent = "Submitting…";

      const subject = encodeURIComponent(
        "New PSG Sacramento Request — " + services.join(", "),
      );
      const body = encodeURIComponent(
        "NEW SERVICE REQUEST — PSG SACRAMENTO\n" +
          "=====================================\n\n" +
          "Name:         " +
          name +
          "\n" +
          "Phone:        " +
          phone +
          "\n" +
          "Email:        " +
          email +
          "\n" +
          "Location:     " +
          (location || "Not specified") +
          "\n" +
          "Service Area: " +
          (selectedArea || "Not specified") +
          "\n" +
          "Services:     " +
          services.join(", ") +
          "\n" +
          "Notes:        " +
          (notes || "None") +
          "\n\n" +
          "License: PPO120130 · Branch: Sacramento\n" +
          "Submitted: " +
          new Date().toLocaleString("en-US", {
            timeZone: "America/Los_Angeles",
          }),
      );

      window.open(
        "mailto:sacramento@profsecurity.com?subject=" +
          subject +
          "&body=" +
          body,
        "_blank",
      );

      setTimeout(function () {
        const ff = document.querySelector(".form-fields");
        const cl = document.querySelector(".form-checklist");
        const ln = document.querySelector(".lic-note");
        const st = document.querySelector(".summary-box h3");
        const fs = document.getElementById("form-success");
        if (ff) ff.style.display = "none";
        if (cl) cl.style.display = "none";
        if (ln) ln.style.display = "none";
        if (st) st.style.display = "none";
        if (selectedList) selectedList.style.display = "none";
        bookBtn.style.display = "none";
        if (fs) fs.style.display = "block";
        showToast("✅ Request sent! We'll call you within 30 min.");
      }, 900);
    });
  }
})();

/* ── TOAST ── */
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 5000);
}

/* ── CAROUSEL ── */
(function initCarousel() {
  const track = document.getElementById("carousel-track");
  if (!track) return;
  const originals = [...track.children];
  originals.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
})();

/* ── SCROLL REVEAL ── */
(function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  targets.forEach((el) => obs.observe(el));
})();

/* ── SMOOTH SCROLL + BOOK NOW BUTTONS ── */
(function initScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const headerH = document.querySelector("header")?.offsetHeight || 68;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - headerH - 12,
        behavior: "smooth",
      });
    });
  });

  document
    .querySelectorAll(".svc-book-btn, .svc-book-btn-back")
    .forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const target = document.getElementById("request-form");
        if (!target) return;
        const headerH = document.querySelector("header")?.offsetHeight || 68;
        window.scrollTo({
          top:
            target.getBoundingClientRect().top + window.scrollY - headerH - 12,
          behavior: "smooth",
        });
      });
    });
})();
