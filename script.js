"use strict";

/* ─────────────────────────────
   NAV
───────────────────────────── */
(function initNav() {
  var hamburger = document.getElementById("hamburger");
  var nav = document.getElementById("main-nav");
  var navClose = document.getElementById("nav-close");
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

  if (hamburger) {
    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      nav.classList.contains("open") ? closeNav() : openNav();
    });
  }

  if (navClose) navClose.addEventListener("click", closeNav);

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", function (e) {
    if (!nav.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
      closeNav();
    }
  });
})();

/* ─────────────────────────────
   HERO AUTO-FLIP
───────────────────────────── */
(function initHeroFlip() {
  var hero = document.querySelector(".hero");
  if (!hero) return;

  var dotsWrap = document.createElement("div");
  dotsWrap.className = "hero-dots";
  dotsWrap.innerHTML =
    '<button class="hero-dot active" aria-label="Show image"></button>' +
    '<button class="hero-dot" aria-label="Show text"></button>';
  hero.appendChild(dotsWrap);

  var dots = dotsWrap.querySelectorAll(".hero-dot");
  var current = 0;
  var timer = null;

  function goTo(index) {
    current = index;
    if (current === 1) {
      hero.classList.add("hero-flipped");
    } else {
      hero.classList.remove("hero-flipped");
    }
    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === current);
    });
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

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
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

/* ─────────────────────────────
   SMOOTH SCROLL HELPER
───────────────────────────── */
function smoothScrollTo(el) {
  var headerH = (document.querySelector("header") || {}).offsetHeight || 68;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - headerH - 12,
    behavior: "smooth",
  });
}

/* ─────────────────────────────
   BOOK NOW BUTTONS
   Capture phase fires BEFORE card click handler
───────────────────────────── */
document
  .querySelectorAll(".svc-book-btn, .svc-book-btn-back")
  .forEach(function (btn) {
    btn.addEventListener(
      "click",
      function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        var target = document.getElementById("request-form");
        if (!target) return;
        var headerH =
          (document.querySelector("header") || {}).offsetHeight || 68;
        window.scrollTo({
          top:
            target.getBoundingClientRect().top + window.scrollY - headerH - 12,
          behavior: "smooth",
        });
      },
      true,
    );
  });

/* ─────────────────────────────
   ALL OTHER ANCHOR LINKS
───────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  if (
    anchor.classList.contains("svc-book-btn") ||
    anchor.classList.contains("svc-book-btn-back")
  )
    return;

  anchor.addEventListener("click", function (e) {
    var target = document.querySelector(this.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    smoothScrollTo(target);
  });
});

/* ─────────────────────────────
   TOAST
───────────────────────────── */
function showToast(message) {
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(function () {
    toast.classList.remove("show");
  }, 5000);
}

/* ─────────────────────────────
   UNIFIED SELECTION LOGIC
───────────────────────────── */
(function initSelectionLogic() {
  var selectedServices = new Set();
  var selectedArea = null;

  var svcCards = document.querySelectorAll(".svc-flip-card");
  var fcItems = document.querySelectorAll(".fc-item");
  var areaCities = document.querySelectorAll(".flip-card");
  var selectedList = document.getElementById("selected-list");
  var bookBtn = document.getElementById("book-btn");

  /* ── Update summary panel ── */
  function updateSummary() {
    if (!selectedList) return;
    var all = Array.from(selectedServices);
    if (all.length === 0 && !selectedArea) {
      selectedList.innerHTML = '<p class="no-sel">Select services above →</p>';
      return;
    }
    var html = "";
    all.forEach(function (svc) {
      html += '<div class="sel-item">' + svc + "</div>";
    });
    if (selectedArea) {
      html += '<div class="sel-item sel-area">📍 ' + selectedArea + "</div>";
    }
    selectedList.innerHTML = html;
  }

  /* ── Sync card → checklist ── */
  function syncCardToChecklist(name, state) {
    fcItems.forEach(function (item) {
      if (item.dataset.service === name)
        item.classList.toggle("fc-checked", state);
    });
  }

  /* ── Sync checklist → card ── */
  function syncChecklistToCard(name, state) {
    svcCards.forEach(function (card) {
      var el = card.querySelector(".svc-flip-name");
      if (el && el.textContent.trim() === name) {
        card.classList.toggle("selected", state);
      }
    });
  }

  /* ── Service cards ── */
  svcCards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (
        e.target.closest(".svc-book-btn") ||
        e.target.closest(".svc-book-btn-back")
      )
        return;

      var el = card.querySelector(".svc-flip-name");
      if (!el) return;
      var name = el.textContent.trim();

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

  /* ── Compact checklist ── */
  fcItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var name = this.dataset.service;
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

  /* ── City cards ── */
  areaCities.forEach(function (card) {
    card.addEventListener("click", function () {
      var el = this.querySelector(".city-name");
      if (!el) return;
      var cityName = el.textContent.trim();

      areaCities.forEach(function (c) {
        c.classList.remove("area-selected");
        if (c !== card) c.classList.remove("flipped");
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

    card.addEventListener("mouseleave", function () {
      card.classList.remove("flipped");
    });
  });

  /* ── Success state ── */
  function onSuccess() {
    setTimeout(function () {
      var ff = document.querySelector(".form-fields");
      var cl = document.querySelector(".form-checklist");
      var ln = document.querySelector(".lic-note");
      var st = document.querySelector(".summary-box h3");
      var fs = document.getElementById("form-success");
      if (ff) ff.style.display = "none";
      if (cl) cl.style.display = "none";
      if (ln) ln.style.display = "none";
      if (st) st.style.display = "none";
      if (selectedList) selectedList.style.display = "none";
      if (bookBtn) bookBtn.style.display = "none";
      if (fs) fs.style.display = "block";
      showToast("✅ Request sent! We'll call you within 30 min.");
    }, 900);
  }

  /* ── Form submit ── */
  if (bookBtn) {
    bookBtn.addEventListener("click", function () {
      var name = document.getElementById("f-name").value.trim();
      var phone = document.getElementById("f-phone").value.trim();
      var email = document.getElementById("f-email").value.trim();
      var location = document.getElementById("f-location").value.trim();
      var notes = document.getElementById("f-notes").value.trim();
      var services = Array.from(selectedServices);

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

      /* ── EmailJS credentials ── */
      var SERVICE_ID = "service_b786eyn"; /* ← replace */
      var TEMPLATE_ID = "template_tjq0rp7"; /* ← replace */
      var PUBLIC_KEY = "wlLD-b1nzgPAws_Qj"; /* ← replace */

      var templateParams = {
        name: name,
        phone: phone,
        client_email: email,
        location: location || "Not specified",
        area: selectedArea || "Not specified",
        services: services.join(", "),
        notes: notes || "None",
        submitted: new Date().toLocaleString("en-US", {
          timeZone: "America/Los_Angeles",
        }),
      };

      emailjs.init(PUBLIC_KEY);
      emailjs
        .send(SERVICE_ID, TEMPLATE_ID, templateParams)
        .then(function () {
          /* SMS via AT&T email-to-text gateway */
          emailjs.send(SERVICE_ID, TEMPLATE_ID, {
            name: name,
            phone: phone,
            client_email: "2792299001@txt.att.net",
            location: "",
            area: selectedArea || "Not specified",
            services: services.join(", "),
            notes: "",
            submitted: new Date().toLocaleString("en-US", {
              timeZone: "America/Los_Angeles",
            }),
          });
          onSuccess();
        })
        .catch(function (err) {
          console.error("EmailJS error:", err);
          /* Fallback to mailto if EmailJS fails */
          var subject = encodeURIComponent(
            "New PSG Sacramento Request — " + services.join(", "),
          );
          var body = encodeURIComponent(
            "Name:         " +
              name +
              "\nPhone:        " +
              phone +
              "\nEmail:        " +
              email +
              "\nLocation:     " +
              (location || "Not specified") +
              "\nService Area: " +
              (selectedArea || "Not specified") +
              "\nServices:     " +
              services.join(", ") +
              "\nNotes:        " +
              (notes || "None"),
          );
          window.open(
            "mailto:sacramento@profsecurity.com?subject=" +
              subject +
              "&body=" +
              body,
            "_blank",
          );
          onSuccess();
        });
    });
  }
})();

/* ─────────────────────────────
   CAROUSEL
───────────────────────────── */
(function initCarousel() {
  var track = document.getElementById("carousel-track");
  if (!track) return;
  Array.from(track.children).forEach(function (card) {
    var clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
})();

/* ─────────────────────────────
   SCROLL REVEAL
───────────────────────────── */
(function initReveal() {
  var targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;
  var obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  targets.forEach(function (el) {
    obs.observe(el);
  });
})();
