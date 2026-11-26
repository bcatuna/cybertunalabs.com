(function () {
  var header = document.querySelector(".site-header");
  if (header) {
    var mark = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    mark();
    window.addEventListener("scroll", mark, { passive: true });
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
