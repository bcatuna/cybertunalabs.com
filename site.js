(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var scrollQueued = false;

  function paintScroll() {
    scrollQueued = false;
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (!progress) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
  }

  function queueScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(paintScroll);
  }

  paintScroll();
  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll, { passive: true });

  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-motion");
    var groups = [
      { selector: "#games > .wrap > .kicker, #games > .wrap > h2, #games > .wrap > .lede", step: 80 },
      { selector: "#games .feature", step: 80 },
      { selector: "#studio > .wrap > .kicker, #studio > .wrap > h2, #studio > .wrap > .lede", step: 80 },
      { selector: "#studio .pillar", step: 80 },
      { selector: "#studio .idea-band", step: 80 },
      { selector: "#press > .wrap > .kicker, #press > .wrap > h2, #press > .wrap > .lede", step: 80 },
      { selector: "#press .card, #press .launch", step: 80 }
    ];
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-in");
        revealObserver.unobserve(el);
        var delay = parseFloat(el.style.getPropertyValue("--d")) || 0;
        window.setTimeout(function () {
          el.classList.add("is-settled");
        }, delay + 900);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });

    groups.forEach(function (group) {
      Array.prototype.forEach.call(document.querySelectorAll(group.selector), function (el, index) {
        el.classList.add("reveal");
        el.style.setProperty("--d", (index * group.step) + "ms");
        revealObserver.observe(el);
      });
    });
  }

  if (!coarsePointer) {
    var glowCards = document.querySelectorAll(".feature, .pillar, .idea-band");
    var glowQueue = [];
    var glowFrame = 0;

    function flushGlow() {
      glowFrame = 0;
      for (var i = 0; i < glowQueue.length; i++) {
        var card = glowQueue[i];
        var rect = card.getBoundingClientRect();
        var x = rect.width ? ((card._px - rect.left) / rect.width) * 100 : 50;
        var y = rect.height ? ((card._py - rect.top) / rect.height) * 100 : 50;
        card.style.setProperty("--mx", x.toFixed(2) + "%");
        card.style.setProperty("--my", y.toFixed(2) + "%");
        card._queued = false;
      }
      glowQueue.length = 0;
    }

    Array.prototype.forEach.call(glowCards, function (card) {
      card.addEventListener("pointermove", function (event) {
        if (event.pointerType && event.pointerType !== "mouse") return;
        card._px = event.clientX;
        card._py = event.clientY;
        if (!card._queued) {
          card._queued = true;
          glowQueue.push(card);
        }
        if (!glowFrame) glowFrame = requestAnimationFrame(flushGlow);
      });
    });
  }

  var galleries = Array.prototype.slice.call(document.querySelectorAll("[data-gallery]"));
  var dialog = document.getElementById("lightbox");
  var lightImg = document.getElementById("lightbox-img");
  var lightCap = document.getElementById("lightbox-caption");
  var active = null;

  function thumbsOf(gallery) {
    return Array.prototype.slice.call(gallery.querySelectorAll(".thumb"));
  }

  function apply(gallery, i) {
    var thumbs = thumbsOf(gallery);
    if (!thumbs.length) return;
    var index = (i + thumbs.length) % thumbs.length;
    var button = thumbs[index];
    var shot = gallery.querySelector(".device-hit img");
    var source = gallery.querySelector(".device-hit source");
    var alt = button.getAttribute("data-alt") || "";
    if (source) source.removeAttribute("srcset");
    if (shot) {
      shot.src = button.getAttribute("data-webp");
      shot.alt = alt;
    }
    thumbs.forEach(function (thumb, n) {
      var on = n === index;
      thumb.classList.toggle("is-active", on);
      thumb.setAttribute("aria-pressed", on ? "true" : "false");
    });
    gallery.dataset.index = String(index);
  }

  function openLightbox(gallery) {
    if (!dialog || !lightImg) return;
    var thumbs = thumbsOf(gallery);
    var index = parseInt(gallery.dataset.index || "0", 10) || 0;
    var button = thumbs[index];
    if (!button) return;
    active = gallery;
    lightImg.src = button.getAttribute("data-full") || button.getAttribute("data-webp");
    lightImg.alt = button.getAttribute("data-alt") || "";
    if (lightCap) lightCap.textContent = button.getAttribute("data-alt") || "";
    if (!dialog.open) dialog.showModal();
  }

  galleries.forEach(function (gallery) {
    gallery.dataset.index = "0";
    thumbsOf(gallery).forEach(function (button, i) {
      button.addEventListener("click", function () {
        apply(gallery, i);
      });
    });
    var stage = gallery.querySelector(".device-hit");
    if (stage) {
      stage.addEventListener("click", function () {
        openLightbox(gallery);
      });
    }
  });

  if (dialog && lightImg && galleries.length) {
    dialog.querySelector("[data-close]").addEventListener("click", function () {
      dialog.close();
    });
    dialog.querySelector("[data-prev]").addEventListener("click", function () {
      if (!active) return;
      apply(active, (parseInt(active.dataset.index || "0", 10) || 0) - 1);
      openLightbox(active);
    });
    dialog.querySelector("[data-next]").addEventListener("click", function () {
      if (!active) return;
      apply(active, (parseInt(active.dataset.index || "0", 10) || 0) + 1);
      openLightbox(active);
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      lightImg.removeAttribute("src");
    });
  }
})();
