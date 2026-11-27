(function () {
  var reduceMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = reduceMedia.matches;
  var coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  var spotlightMedia = window.matchMedia("(pointer: coarse), (hover: none), (max-width: 980px)");
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".scroll-progress");
  var hero = document.querySelector(".hero");
  var driftFar = document.querySelector(".hero-drift-far");
  var driftNear = document.querySelector(".hero-drift-near");
  var emblem = document.querySelector(".emblem-motion");
  var tagline = document.querySelector(".tagline-motion");
  var weave = document.querySelector("#cosmic-weave");
  var floatNodes = document.querySelectorAll(".device-float");
  var swarm = document.querySelector("#swarm-genesis");
  var floats = [];
  var rims = [];
  var gameLights = [];
  var spotlightOn = spotlightMedia.matches;
  var scrollQueued = false;
  var needsMeasure = true;
  var lastY = -1;
  var viewH = window.innerHeight || 1;
  var heroTop = 0;
  var heroHeight = 1;

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function docTop(el) {
    var top = 0;
    var node = el;
    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    return top;
  }

  function writeTransform(el, value) {
    if (!el || el._tf === value) return;
    el._tf = value;
    el.style.transform = value;
  }

  function writeOpacity(el, value) {
    if (!el || el._op === value) return;
    el._op = value;
    el.style.opacity = value;
  }

  function clearMotion() {
    writeTransform(driftFar, "");
    writeTransform(driftNear, "");
    writeTransform(emblem, "");
    writeOpacity(emblem, "");
    writeTransform(tagline, "");
    writeOpacity(tagline, "");
    floats.forEach(function (item) { writeTransform(item.el, ""); });
    rims.forEach(function (rim) {
      writeTransform(rim.spin, "");
      writeOpacity(rim.shell, "");
    });
    gameLights.forEach(function (game) {
      game.lit = false;
      if (game.host) game.host.classList.remove("is-lit");
    });
  }

  function measure() {
    viewH = window.innerHeight || 1;
    if (hero) {
      heroTop = docTop(hero);
      heroHeight = hero.offsetHeight || 1;
    }
    floats = Array.prototype.map.call(floatNodes, function (el) {
      return { el: el, top: docTop(el), height: el.offsetHeight || 1 };
    });
    rims = Array.prototype.map.call(document.querySelectorAll(".card-rim"), function (shell) {
      var host = shell.parentElement;
      return {
        shell: shell,
        spin: shell.querySelector(".card-rim-spin"),
        host: host,
        top: host ? docTop(host) : 0,
        height: host ? (host.offsetHeight || 1) : 1
      };
    });
    gameLights = [swarm, weave].filter(Boolean).map(function (host) {
      var prev = null;
      for (var i = 0; i < gameLights.length; i++) {
        if (gameLights[i].host === host) prev = gameLights[i];
      }
      return {
        host: host,
        top: docTop(host),
        height: host.offsetHeight || 1,
        lit: prev ? prev.lit : host.classList.contains("is-lit")
      };
    });
  }

  function paintMotion(y) {
    if (reduceMotion) return;
    var vh = viewH || 1;

    if (hero && hero._near !== false && driftFar && driftNear && emblem && tagline) {
      var into = y - heroTop;
      if (into <= 0) {
        writeTransform(driftFar, "");
        writeTransform(driftNear, "");
        writeTransform(emblem, "");
        writeOpacity(emblem, "");
        writeTransform(tagline, "");
        writeOpacity(tagline, "");
      } else {
        var progressIn = clamp(into / heroHeight, 0, 1);
        var fade = progressIn * progressIn;
        var drift = Math.min(heroHeight * 0.08, into * 0.2);
        writeTransform(driftFar, "translate3d(0," + (drift * 0.62).toFixed(2) + "px,0)");
        writeTransform(driftNear, "translate3d(0," + drift.toFixed(2) + "px,0)");
        writeTransform(
          emblem,
          "translate3d(0," + Math.min(32, into * 0.07).toFixed(2) + "px,0) scale(" + (1 - fade * 0.055).toFixed(4) + ")"
        );
        writeOpacity(emblem, (1 - fade * 0.38).toFixed(3));
        writeTransform(
          tagline,
          "translate3d(0," + Math.min(16, into * 0.045).toFixed(2) + "px,0) scale(" + (1 - fade * 0.04).toFixed(4) + ")"
        );
        writeOpacity(tagline, (1 - fade * 0.48).toFixed(3));
      }
    }

    var viewMid = y + vh * 0.5;
    for (var i = 0; i < floats.length; i++) {
      var item = floats[i];
      var rel = (item.top + item.height * 0.5 - viewMid) / vh;
      var shift = clamp(rel * 22, -14, 14);
      writeTransform(item.el, "translate3d(0," + shift.toFixed(2) + "px,0)");
    }

    var sweetLine = y + vh * 0.4;
    for (var r = 0; r < rims.length; r++) {
      var rim = rims[r];
      var rimTravel = clamp((sweetLine - rim.top) / Math.max(rim.height, 1), 0, 1);
      var rimAngle = -28 + rimTravel * 210;
      var rimDist = Math.abs((rim.top + rim.height * 0.42) - sweetLine);
      var rimBloom = clamp(1 - rimDist / (vh * 0.72), 0, 1);
      if (rim.spin) writeTransform(rim.spin, "translate(-50%, -50%) rotate(" + rimAngle.toFixed(2) + "deg)");
      writeOpacity(rim.shell, (0.42 + rimBloom * 0.5).toFixed(3));
    }
    for (var g = 0; g < gameLights.length; g++) {
      var game = gameLights[g];
      var lit = false;
      if (spotlightOn && game.host._near !== false) {
        var overlaps = game.top <= sweetLine && game.top + game.height >= sweetLine;
        var edge = Math.min(Math.abs(game.top - sweetLine), Math.abs(game.top + game.height - sweetLine));
        lit = overlaps || edge < vh * 0.2;
      }
      if (game.lit !== lit) {
        game.lit = lit;
        game.host.classList.toggle("is-lit", lit);
      }
    }
  }

  function paintScroll() {
    scrollQueued = false;
    var y = window.scrollY || window.pageYOffset || 0;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      var bar = "scaleX(" + ratio.toFixed(4) + ")";
      if (progress._tf !== bar) {
        progress._tf = bar;
        progress.style.transform = bar;
      }
    }
    if (needsMeasure) {
      needsMeasure = false;
      measure();
    }
    if (y !== lastY) {
      lastY = y;
      paintMotion(y);
    }
  }

  function queueScroll() {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(paintScroll);
  }

  function queueMeasure() {
    needsMeasure = true;
    lastY = -1;
    queueScroll();
  }

  if (!reduceMotion) {
    document.documentElement.classList.add("js-motion");
    if ("IntersectionObserver" in window) {
      var liveObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target._near = entry.isIntersecting;
        });
        lastY = -1;
        queueScroll();
      }, { rootMargin: "20% 0px 20% 0px", threshold: 0 });
      if (hero) liveObserver.observe(hero);
      if (weave) liveObserver.observe(weave);
      if (swarm) liveObserver.observe(swarm);

      var groups = [
        "#games > .wrap > .kicker, #games > .wrap > h2, #games > .wrap > .lede",
        "#swarm-genesis, #cosmic-weave",
        "#studio > .wrap > .kicker, #studio > .wrap > h2, #studio > .wrap > .lede",
        "#studio .pillar",
        "#studio .idea-band",
        "#press > .wrap > .kicker, #press > .wrap > h2, #press > .wrap > .lede, #press .press-rule",
        "#press .card, #press .launch"
      ];
      var revealObserver = new IntersectionObserver(function (entries) {
        var incoming = [];
        entries.forEach(function (entry) {
          if (entry.isIntersecting) incoming.push(entry);
        });
        incoming.sort(function (a, b) {
          var boxA = a.target.getBoundingClientRect();
          var boxB = b.target.getBoundingClientRect();
          return (boxA.top - boxB.top) || (boxA.left - boxB.left);
        });
        incoming.forEach(function (entry, index) {
          var el = entry.target;
          var delay = index * 90;
          var settle = 760;
          if (el.classList.contains("reveal-card")) settle = 980;
          else if (el.classList.contains("motion-pillar")) settle = 920;
          else if (el.classList.contains("motion-idea")) settle = 1200;
          else if (el.classList.contains("press-rule")) settle = 1100;
          el.style.setProperty("--d", delay + "ms");
          el.classList.add("is-in");
          revealObserver.unobserve(el);
          window.setTimeout(function () {
            el.classList.add("is-settled");
          }, delay + settle);
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });

      groups.forEach(function (selector) {
        Array.prototype.forEach.call(document.querySelectorAll(selector), function (el) {
          el.classList.add("reveal");
          if (el.id === "swarm-genesis" || el.id === "cosmic-weave") el.classList.add("reveal-card");
          else if (el.classList.contains("pillar")) el.classList.add("motion-pillar");
          else if (el.classList.contains("idea-band")) el.classList.add("motion-idea");
          else if (el.classList.contains("card") || el.classList.contains("launch")) el.classList.add("motion-press");
          else if (!el.classList.contains("press-rule")) el.classList.add("reveal-quiet");
          revealObserver.observe(el);
        });
      });
    }
  }

  if (reduceMedia.addEventListener) {
    reduceMedia.addEventListener("change", function () {
      reduceMotion = reduceMedia.matches;
      if (reduceMotion) {
        document.documentElement.classList.remove("js-motion");
        clearMotion();
      } else {
        document.documentElement.classList.add("js-motion");
      }
      queueMeasure();
    });
  }

  if (spotlightMedia.addEventListener) {
    spotlightMedia.addEventListener("change", function () {
      spotlightOn = spotlightMedia.matches;
      if (!spotlightOn) {
        gameLights.forEach(function (game) {
          game.lit = false;
          game.host.classList.remove("is-lit");
        });
      }
      queueMeasure();
    });
  }

  queueMeasure();
  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueMeasure, { passive: true });
  window.addEventListener("load", queueMeasure);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", function () {
      viewH = window.innerHeight || 1;
      lastY = -1;
      queueScroll();
    }, { passive: true });
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
