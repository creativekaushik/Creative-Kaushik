/* =========================================================
   CREATIVE KAUSHIK — VIDEO EDITOR & COLORIST PORTFOLIO
   script.js
   ========================================================= */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. UTILITIES ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---------- 2. PAGE LOADER (FOOLPROOF & FAILSAFE) ---------- */
  var pageLoader = $("#pageLoader");
  var loaderCount = $("#loaderCount");

  function dismissLoader() {
    if (pageLoader && !pageLoader.classList.contains("is-hidden")) {
      pageLoader.classList.add("is-hidden");
      document.body.style.overflow = "";
      if (typeof checkReveal === "function") checkReveal();
    }
  }

  if (pageLoader) {
    if (prefersReducedMotion) {
      dismissLoader();
    } else {
      document.body.style.overflow = "hidden";
      var loaderStart = null;
      var loaderDuration = 1200;

      function loaderStep(ts) {
        if (!loaderStart) loaderStart = ts;
        var p = clamp((ts - loaderStart) / loaderDuration, 0, 1);
        var eased = p < 1 ? 1 - Math.pow(1 - p, 2) : 1;
        if (loaderCount) loaderCount.textContent = Math.round(eased * 100);

        if (p < 1) {
          requestAnimationFrame(loaderStep);
        } else {
          setTimeout(dismissLoader, 150);
        }
      }
      requestAnimationFrame(loaderStep);

      // Failsafe: guarantee loader dismisses even on slow devices/tabs
      setTimeout(dismissLoader, 2000);
    }
  }

  /* ---------- 3. NAVBAR ---------- */
  var navbar = $("#navbar");
  var navToggle = $("#navToggle");
  var navMobile = $("#navMobile");

  function onScrollNav() {
    if (!navbar) return;
    if (window.scrollY > 20) navbar.classList.add("is-scrolled");
    else navbar.classList.remove("is-scrolled");

    var sections = $all("section[id]");
    var scrollPos = window.scrollY + 160;
    var currentSection = "";
    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) {
        currentSection = sec.getAttribute("id");
      }
    });
    $all(".nav-links a").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === "#" + currentSection) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMobile.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      if (window.innerWidth <= 720) {
        document.body.style.overflow = isOpen ? "hidden" : "";
      }
    });

    $all("a", navMobile).forEach(function (link) {
      link.addEventListener("click", function () {
        navMobile.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        document.body.style.overflow = "";
      });
    });

    document.addEventListener("click", function (e) {
      if (navMobile.classList.contains("is-open") && !navMobile.contains(e.target) && !navToggle.contains(e.target)) {
        navMobile.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        document.body.style.overflow = "";
      }
    });
  }

  /* ---------- 4. SCROLL REVEAL & STAT COUNT-UP ---------- */
  var revealEls = $all("[data-reveal]");
  revealEls.forEach(function (el) {
    var delay = el.getAttribute("data-delay");
    if (delay) el.style.setProperty("--stagger", delay);
  });

  var statEls = $all(".stat-num");
  var approachTimelineEl = $("#approachTimeline");
  var approachFill = $("#approachFill");
  var aiStepsEl = $("#aiSteps");
  var aiStepsFill = $("#aiStepsFill");
  var aiStepsFilled = false;

  function runCountUp(el) {
    var raw = el.getAttribute("data-count") || "0";
    var target = parseFloat(raw) || 0;
    var decimals = raw.indexOf(".") > -1 ? raw.split(".")[1].length : 0;
    if (prefersReducedMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    var duration = 1300;
    var startT = null;

    function step(ts) {
      if (!startT) startT = ts;
      var p = clamp((ts - startT) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = lerp(0, target, eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function checkReveal() {
    var vh = window.innerHeight;

    revealEls.forEach(function (el) {
      if (el.classList.contains("is-visible")) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.92) {
        el.classList.add("is-visible");
      }
    });

    statEls.forEach(function (el) {
      if (el.classList.contains("has-counted")) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.92) {
        el.classList.add("has-counted");
        runCountUp(el);
      }
    });

    if (approachTimelineEl && approachFill) {
      var arect = approachTimelineEl.getBoundingClientRect();
      var scrolled = clamp(vh * 0.8 - arect.top, 0, arect.height);
      var pct = arect.height > 0 ? (scrolled / arect.height) * 100 : 0;
      approachFill.style.height = pct + "%";
    }

    if (!aiStepsFilled && aiStepsEl && aiStepsFill) {
      var aiRect = aiStepsEl.getBoundingClientRect();
      if (aiRect.top < vh * 0.85) {
        aiStepsFill.style.width = "100%";
        aiStepsFilled = true;
      }
    }
  }

  if (prefersReducedMotion) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    statEls.forEach(function (el) {
      el.textContent = el.getAttribute("data-count") || "0";
      el.classList.add("has-counted");
    });
    if (approachFill) approachFill.style.height = "100%";
    if (aiStepsFill) aiStepsFill.style.width = "100%";
  } else {
    checkReveal();
    var revealTicking = false;
    function onRevealScroll() {
      if (revealTicking) return;
      revealTicking = true;
      requestAnimationFrame(function () {
        checkReveal();
        revealTicking = false;
      });
    }
    window.addEventListener("scroll", onRevealScroll, { passive: true });
    window.addEventListener("resize", onRevealScroll);

    setTimeout(checkReveal, 400);
    setTimeout(checkReveal, 1200);
  }

  /* ---------- 5. HERO PARALLAX ---------- */
  var hero = $(".hero");
  var glassObject = $("#glassObject");
  var glassStage = $("#glassStage");
  var heroLines = $all(".ht-line");

  var targetRX = 8, targetRY = -14, curRX = 8, curRY = -14;
  var baseRX = 8, baseRY = -14;

  if (glassStage && glassObject && !prefersReducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    glassStage.addEventListener("pointermove", function (e) {
      var rect = glassStage.getBoundingClientRect();
      var nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      var ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRY = baseRY + clamp(nx, -1, 1) * 10;
      targetRX = baseRX - clamp(ny, -1, 1) * 8;
    });
    glassStage.addEventListener("pointerleave", function () {
      targetRX = baseRX;
      targetRY = baseRY;
    });
    (function tick() {
      curRX = lerp(curRX, targetRX, 0.06);
      curRY = lerp(curRY, targetRY, 0.06);
      glassObject.style.transform = "rotateX(" + curRX.toFixed(2) + "deg) rotateY(" + curRY.toFixed(2) + "deg)";
      requestAnimationFrame(tick);
    })();
    glassObject.style.animation = "none";
  }

  if (heroLines.length && hero && !prefersReducedMotion) {
    window.addEventListener("scroll", function () {
      var rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var progress = clamp(1 - rect.bottom / (window.innerHeight + rect.height), 0, 1);
      heroLines.forEach(function (line) {
        var speed = parseFloat(line.getAttribute("data-parallax")) || 0.2;
        line.style.transform = "translateY(" + (progress * -40 * speed).toFixed(2) + "px)";
      });
    }, { passive: true });
  }

  /* ---------- 6. AMBIENT CURSOR GLOW ---------- */
  var cursorGlow = $("#cursorGlow");
  if (cursorGlow && !prefersReducedMotion) {
    var gx = window.innerWidth / 2, gy = window.innerHeight * 0.3;
    var tgx = gx, tgy = gy;
    window.addEventListener("pointermove", function (e) {
      tgx = e.clientX;
      tgy = e.clientY;
    }, { passive: true });

    (function glowTick() {
      gx = lerp(gx, tgx, 0.08);
      gy = lerp(gy, tgy, 0.08);
      document.documentElement.style.setProperty("--mx", gx + "px");
      document.documentElement.style.setProperty("--my", gy + "px");
      requestAnimationFrame(glowTick);
    })();
  }

  /* ---------- 7. WAVEFORM BARS ---------- */
  var waveRow = $("#waveRow");
  if (waveRow) {
    var heights = [40, 70, 100, 55, 85, 35, 65, 95, 45, 75, 30, 60, 90, 50, 80, 40, 68, 100, 42, 72];
    heights.forEach(function (h, i) {
      var bar = document.createElement("span");
      bar.style.height = h + "%";
      bar.style.animationDelay = (i * 0.08) + "s";
      waveRow.appendChild(bar);
    });
  }

  /* ---------- 8. LIVE TIMECODE CLOCKS ---------- */
  var navTimecode = $("#navTimecode");
  var scrollTimecode = $("#scrollTimecode");
  var startTime = performance.now();
  var FPS = 24;

  function formatTimecode(ms) {
    var totalFrames = Math.floor((ms / 1000) * FPS);
    var frames = totalFrames % FPS;
    var totalSeconds = Math.floor(totalFrames / FPS);
    var seconds = totalSeconds % 60;
    var totalMinutes = Math.floor(totalSeconds / 60);
    var minutes = totalMinutes % 60;
    var hours = Math.floor(totalMinutes / 60);

    function pad(n) { return String(n).padStart(2, "0"); }
    return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds) + ":" + pad(frames);
  }

  if (navTimecode && !prefersReducedMotion) {
    setInterval(function () {
      navTimecode.textContent = formatTimecode(performance.now() - startTime);
    }, 1000 / 24);
  }

  if (scrollTimecode) {
    window.addEventListener("scroll", function () {
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      var pct = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      var totalSeconds = Math.round(pct * 599);
      var m = Math.floor(totalSeconds / 60);
      var s = totalSeconds % 60;
      scrollTimecode.textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }, { passive: true });
  }

  var footerClock = $("#footerClock");
  function updateFooterClock() {
    if (!footerClock) return;
    var now = new Date();
    var h = String(now.getHours()).padStart(2, "0");
    var m = String(now.getMinutes()).padStart(2, "0");
    footerClock.textContent = "LOCAL " + h + ":" + m;
  }
  updateFooterClock();
  setInterval(updateFooterClock, 30000);

  /* ---------- 9. SERVICES ACCORDION ---------- */
  var serviceRows = $all(".service-row");
  serviceRows.forEach(function (row) {
    var top = row.querySelector(".service-row-top");
    if (!top) return;

    top.addEventListener("click", function () {
      var wasOpen = row.classList.contains("is-open");
      serviceRows.forEach(function (r) {
        r.classList.remove("is-open");
        var btn = r.querySelector(".service-row-top");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        row.classList.add("is-open");
        top.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- 10. PORTFOLIO FILTERS ---------- */
  var filterBtns = $all(".filter-btn");
  var portfolioGridEl = $("#portfolioGrid");
  var projectCards = portfolioGridEl ? $all(".project-card", portfolioGridEl) : [];
  var portfolioEmpty = $("#portfolioEmpty");
  var isFiltering = false;

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active") || isFiltering) return;
      isFiltering = true;

      filterBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      var filter = btn.getAttribute("data-filter");
      var visibleCount = 0;
      var visibleIndex = 0;

      projectCards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        if (match) {
          card.classList.remove("is-hidden");
          card.classList.add("is-filter-pre");
          card.style.setProperty("--stagger", visibleIndex);
          visibleIndex++;
          visibleCount++;
        } else {
          card.classList.add("is-hidden");
          card.classList.remove("is-filter-pre");
        }
      });

      if (portfolioEmpty) portfolioEmpty.hidden = visibleCount !== 0;

      if (prefersReducedMotion) {
        projectCards.forEach(function (card) { card.classList.remove("is-filter-pre"); });
        isFiltering = false;
        return;
      }

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          projectCards.forEach(function (card) { card.classList.remove("is-filter-pre"); });
          setTimeout(function () { isFiltering = false; }, visibleIndex * 70 + 500);
        });
      });
    });
  });

  /* ---------- 11. GRAPHIC DESIGN LOAD MORE / SHOW LESS ---------- */
  var loadMoreBtn = $("#loadMoreBtn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      var isExpanded = loadMoreBtn.classList.contains("is-expanded");
      var btnText = loadMoreBtn.querySelector(".load-more-text");

      if (!isExpanded) {
        var hiddenExtras = $all(".graphic-card.is-hidden-extra");
        hiddenExtras.forEach(function (card, i) {
          card.classList.remove("is-hidden-extra");
          card.classList.add("is-extra-revealed");
          card.style.setProperty("--stagger", i);
          card.classList.add("is-visible");
        });
        loadMoreBtn.classList.add("is-expanded");
        loadMoreBtn.setAttribute("aria-expanded", "true");
        if (btnText) btnText.textContent = "Show Less";

        if (typeof checkReveal === "function") {
          requestAnimationFrame(checkReveal);
        }
      } else {
        var extraCards = $all(".graphic-card.is-extra-revealed");
        extraCards.forEach(function (card) {
          card.classList.remove("is-extra-revealed", "is-visible");
          card.classList.add("is-hidden-extra");
        });
        loadMoreBtn.classList.remove("is-expanded");
        loadMoreBtn.setAttribute("aria-expanded", "false");
        if (btnText) btnText.textContent = "Load More";

        var graphicSection = $("#graphic-work");
        if (graphicSection) {
          graphicSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        }
      }
    });
  }

  /* ---------- 12. VIDEO PREVIEW MODAL ---------- */
  var videoModal = $("#videoModal");
  var videoModalBackdrop = $("#videoModalBackdrop");
  var videoModalClose = $("#videoModalClose");
  var videoModalFrame = $("#videoModalFrame");
  var videoModalPanel = videoModal ? videoModal.querySelector(".video-modal-panel") : null;
  var lastFocusedBeforeModal = null;

  function openVideoModal(youtubeId, isVertical) {
    if (!videoModal || !videoModalFrame || !youtubeId) return;
    lastFocusedBeforeModal = document.activeElement;

    if (videoModalPanel) videoModalPanel.classList.toggle("is-vertical", !!isVertical);

    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(youtubeId) + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
    iframe.title = "Video preview";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    videoModalFrame.innerHTML = "";
    videoModalFrame.appendChild(iframe);

    videoModal.classList.add("is-open");
    videoModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (videoModalClose) videoModalClose.focus();
  }

  function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.remove("is-open");
    videoModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (videoModalFrame) videoModalFrame.innerHTML = "";
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === "function") {
      lastFocusedBeforeModal.focus();
    }
  }

  if (videoModalBackdrop) videoModalBackdrop.addEventListener("click", closeVideoModal);
  if (videoModalClose) videoModalClose.addEventListener("click", closeVideoModal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (videoModal && videoModal.classList.contains("is-open")) closeVideoModal();
    }
  });

  $all(".project-card:not(.graphic-card), .reel-card").forEach(function (card) {
    var thumb = card.querySelector(".project-thumb, .reel-thumb");
    if (!thumb) return;
    var youtubeId = thumb.getAttribute("data-youtube");
    if (!youtubeId) return;
    var isVertical = card.classList.contains("reel-card");

    thumb.addEventListener("click", function () {
      openVideoModal(youtubeId, isVertical);
    });

    var playBtn = card.querySelector(".project-play, .reel-play");
    if (playBtn) {
      playBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openVideoModal(youtubeId, isVertical);
      });
    }
  });

  var heroShowreelBtn = $("#heroShowreelBtn");
  if (heroShowreelBtn) {
    heroShowreelBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var ytId = heroShowreelBtn.getAttribute("data-youtube") || "YE7VzlLtp-4";
      openVideoModal(ytId, false);
    });
  }

  /* ---------- 14. REELS CAROUSEL CONTROLS ---------- */
  var reelsTrack = $("#reelsTrack");
  var reelPrev = $("#reelPrev");
  var reelNext = $("#reelNext");

  function reelStep() {
    var card = $(".reel-card", reelsTrack);
    return card ? card.getBoundingClientRect().width + 24 : 260;
  }

  if (reelsTrack && reelPrev && reelNext) {
    reelPrev.addEventListener("click", function () {
      reelsTrack.scrollBy({ left: -reelStep(), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
    reelNext.addEventListener("click", function () {
      reelsTrack.scrollBy({ left: reelStep(), behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- 15. CONTACT FORM ---------- */
  var contactForm = $("#contactForm");
  var formNote = $("#formNote");

  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameEl = $("#cfName");
      var emailEl = $("#cfEmail");
      var typeEl = $("#cfType");
      var timelineEl = $("#cfTimeline");
      var messageEl = $("#cfMessage");

      var name = nameEl ? nameEl.value.trim() : "";
      var email = emailEl ? emailEl.value.trim() : "";
      var type = typeEl ? typeEl.value : "";
      var timeline = timelineEl ? timelineEl.value : "";
      var message = messageEl ? messageEl.value.trim() : "";

      if (!name || !email || !message) {
        contactForm.reportValidity();
        return;
      }

      var subject = "New project inquiry from " + name;
      var body = "Name: " + name + "\n" +
                 "Email: " + email + "\n" +
                 "Project type: " + type + "\n" +
                 "Timeline: " + timeline + "\n\n" +
                 "Project Details:\n" + message;

      var mailto = "mailto:koushikhazra9014@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailto;

      if (formNote) {
        var original = formNote.textContent;
        formNote.textContent = "Opening your email app now...";
        setTimeout(function () { formNote.textContent = original; }, 4000);
      }
    });
  }

  /* ---------- 16. BULLETPROOF IMAGE FALLBACK PROTECTION ---------- */
  var reliableFallbacks = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80"
  ];

  // SVG placeholder data-URI for offline or unavailable connections
  var svgFallback = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1130' viewBox='0 0 800 1130'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%232a1050'/><stop offset='50%' stop-color='%23130722'/><stop offset='100%' stop-color='%23090311'/></linearGradient></defs><rect width='800' height='1130' fill='url(%23g)'/><circle cx='400' cy='565' r='260' fill='none' stroke='%23a855f7' stroke-width='1.5' stroke-dasharray='8 8' opacity='0.4'/><circle cx='400' cy='565' r='120' fill='%23a855f7' opacity='0.15'/><text x='400' y='550' fill='%23d8b4fe' font-family='sans-serif' font-size='26' font-weight='600' text-anchor='middle'>PORTFOLIO SHOWCASE</text><text x='400' y='590' fill='%23beb0d8' font-family='monospace' font-size='15' text-anchor='middle'>CREATIVE KAUSHIK</text></svg>";

  document.addEventListener("error", function (e) {
    if (e.target && e.target.tagName === "IMG") {
      var img = e.target;
      var failCount = parseInt(img.getAttribute("data-fail-count") || "0", 10);
      if (failCount === 0) {
        img.setAttribute("data-fail-count", "1");
        var nextSrc = reliableFallbacks[Math.floor(Math.random() * reliableFallbacks.length)];
        img.src = nextSrc;
      } else if (failCount === 1) {
        img.setAttribute("data-fail-count", "2");
        img.src = svgFallback;
      }
    }
  }, true);

  /* ---------- 17. BACK TO TOP ---------- */
  var backToTop = $("#backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }
})();
