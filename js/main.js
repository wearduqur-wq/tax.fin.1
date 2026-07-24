(function () {
  "use strict";

  var CONTACT = {
    phoneDisplay: "+41 79 155 77 22",
    phoneIntl: "+41791557722",
    whatsappDigits: "41791557722",
    email: "Taxi.mysavior@bluewin.ch",
    telegram: "https://t.me/+41791557722"
  };

  var SUPPORTED_LANGS = Object.keys(window.TRANSLATIONS || {});

  /* ---------------- i18n ---------------- */

  function detectInitialLang() {
    var saved = localStorage.getItem("ms_lang");
    if (saved && SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    return window.DEFAULT_LANG || "de";
  }

  function applyLang(lang) {
    var dict = window.TRANSLATIONS[lang] || window.TRANSLATIONS[window.DEFAULT_LANG];
    document.documentElement.setAttribute("lang", lang);
    document.title = dict.meta_title;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (dict[key] !== undefined) el.setAttribute("placeholder", dict[key]);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (dict[key] !== undefined) el.setAttribute("aria-label", dict[key]);
    });

    document.querySelectorAll(".lang-menu button").forEach(function (btn) {
      var isCurrent = btn.getAttribute("data-lang") === lang;
      btn.setAttribute("aria-current", isCurrent ? "true" : "false");
    });

    var currentLabel = document.getElementById("current-lang-label");
    if (currentLabel && window.LANG_META[lang]) currentLabel.textContent = window.LANG_META[lang].short;

    localStorage.setItem("ms_lang", lang);
    window.__currentLang = lang;
  }

  function buildLangMenu() {
    var menu = document.getElementById("lang-menu");
    if (!menu) return;
    menu.innerHTML = "";
    SUPPORTED_LANGS.forEach(function (code) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-lang", code);
      btn.textContent = window.LANG_META[code].label;
      btn.addEventListener("click", function () {
        applyLang(code);
        menu.classList.remove("open");
      });
      menu.appendChild(btn);
    });
  }

  /* ---------------- Header / nav ---------------- */

  function initHeaderScroll() {
    var header = document.getElementById("site-header");
    if (!header) return;
    function update() {
      if (window.scrollY > 24) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initLangDropdown() {
    var btn = document.getElementById("lang-toggle");
    var menu = document.getElementById("lang-menu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
    document.addEventListener("click", function () {
      menu.classList.remove("open");
    });
    menu.addEventListener("click", function (e) { e.stopPropagation(); });
  }

  function initMobileNav() {
    var toggle = document.getElementById("menu-toggle");
    var closeBtn = document.getElementById("mobile-nav-close");
    var nav = document.getElementById("mobile-nav");
    if (!toggle || !nav) return;
    function open() { nav.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { nav.classList.remove("open"); document.body.style.overflow = ""; }
    toggle.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  /* ---------------- Scroll reveal ---------------- */

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- Hero video / reduced motion ---------------- */

  function initHeroVideo() {
    var video = document.getElementById("hero-video");
    var endBg = document.getElementById("hero-end");
    if (!video) return;

    function settleOnEnd() {
      video.classList.add("faded");
      if (endBg) endBg.classList.add("visible");
    }

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      video.removeAttribute("autoplay");
      video.pause();
      settleOnEnd();
      return;
    }
    video.addEventListener("ended", settleOnEnd);
    video.addEventListener("error", settleOnEnd);
    video.play().catch(settleOnEnd);
  }

  /* ---------------- Booking form ---------------- */

  function fieldValue(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : "";
  }

  function buildBookingMessage(form, dict) {
    var pickup = fieldValue(form, "pickup");
    var dropoff = fieldValue(form, "dropoff");
    var date = fieldValue(form, "date");
    var time = fieldValue(form, "time");
    var passengers = fieldValue(form, "passengers");
    var vehicleEl = form.querySelector('[name="vehicle"]');
    var vehicle = vehicleEl ? vehicleEl.options[vehicleEl.selectedIndex].text : "";
    var children = fieldValue(form, "children");
    var childrenAges = fieldValue(form, "childrenAges");
    var name = fieldValue(form, "name");
    var phone = fieldValue(form, "phone");
    var notes = fieldValue(form, "notes");

    var lines = [
      "My Savior — " + dict.booking_title,
      "",
      dict.label_pickup + ": " + pickup,
      dict.label_dropoff + ": " + dropoff,
      dict.label_date + ": " + date,
      dict.label_time + ": " + time,
      dict.label_passengers + ": " + passengers,
      dict.label_vehicle + ": " + vehicle,
      dict.label_name + ": " + name,
      dict.label_phone + ": " + phone
    ];
    if (children && children !== "0") {
      lines.push(dict.label_children + ": " + children);
      if (childrenAges) lines.push(dict.label_children_ages + ": " + childrenAges);
    }
    if (notes) lines.push(dict.label_notes + ": " + notes);
    return lines.join("\n");
  }

  function initBookingForm() {
    var form = document.getElementById("booking-form");
    if (!form) return;
    var successEl = document.getElementById("booking-success");
    var whatsappBtn = document.getElementById("submit-whatsapp");
    var emailBtn = document.getElementById("submit-email");

    function handleSubmit(mode) {
      if (!form.reportValidity()) return;
      var dict = window.TRANSLATIONS[window.__currentLang] || window.TRANSLATIONS[window.DEFAULT_LANG];
      var message = buildBookingMessage(form, dict);

      if (mode === "whatsapp") {
        var waUrl = "https://wa.me/" + CONTACT.whatsappDigits + "?text=" + encodeURIComponent(message);
        window.open(waUrl, "_blank", "noopener");
      } else {
        var subject = encodeURIComponent("My Savior — " + dict.booking_title);
        var body = encodeURIComponent(message);
        window.location.href = "mailto:" + CONTACT.email + "?subject=" + subject + "&body=" + body;
      }

      if (successEl) {
        successEl.textContent = dict.booking_success;
        successEl.classList.add("visible");
      }
    }

    if (whatsappBtn) whatsappBtn.addEventListener("click", function (e) { e.preventDefault(); handleSubmit("whatsapp"); });
    if (emailBtn) emailBtn.addEventListener("click", function (e) { e.preventDefault(); handleSubmit("email"); });

    var dateInput = form.querySelector('[name="date"]');
    if (dateInput) {
      var today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }
  }

  /* ---------------- Contact links ---------------- */

  function initContactLinks() {
    document.querySelectorAll("[data-contact]").forEach(function (el) {
      var type = el.getAttribute("data-contact");
      if (type === "phone") { el.href = "tel:" + CONTACT.phoneIntl; el.querySelector(".value") && (el.querySelector(".value").textContent = CONTACT.phoneDisplay); }
      if (type === "whatsapp") { el.href = "https://wa.me/" + CONTACT.whatsappDigits; el.querySelector(".value") && (el.querySelector(".value").textContent = CONTACT.phoneDisplay); }
      if (type === "telegram") { el.href = CONTACT.telegram; el.querySelector(".value") && (el.querySelector(".value").textContent = CONTACT.phoneDisplay); }
      if (type === "email") { el.href = "mailto:" + CONTACT.email; el.querySelector(".value") && (el.querySelector(".value").textContent = CONTACT.email); }
    });

    document.querySelectorAll("[data-cta]").forEach(function (el) {
      var type = el.getAttribute("data-cta");
      if (type === "whatsapp") el.href = "https://wa.me/" + CONTACT.whatsappDigits;
      if (type === "call") el.href = "tel:" + CONTACT.phoneIntl;
    });
  }

  /* ---------------- Footer year ---------------- */

  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------------- Init ---------------- */

  document.addEventListener("DOMContentLoaded", function () {
    buildLangMenu();
    applyLang(detectInitialLang());
    initHeaderScroll();
    initLangDropdown();
    initMobileNav();
    initReveal();
    initHeroVideo();
    initBookingForm();
    initContactLinks();
    initFooterYear();
  });
})();
