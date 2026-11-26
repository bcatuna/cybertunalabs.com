(function () {
  var header = document.querySelector(".site-header");
  if (header) {
    var mark = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    mark();
    window.addEventListener("scroll", mark, { passive: true });
  }

  var stage = document.getElementById("swarm-stage");
  var shot = document.getElementById("swarm-shot");
  var source = document.getElementById("swarm-source");
  var thumbs = Array.prototype.slice.call(document.querySelectorAll(".thumb"));
  var dialog = document.getElementById("lightbox");
  var lightImg = document.getElementById("lightbox-img");
  var lightCap = document.getElementById("lightbox-caption");
  var index = 0;

  function apply(i) {
    if (!thumbs.length || !shot) return;
    index = (i + thumbs.length) % thumbs.length;
    var button = thumbs[index];
    var alt = button.getAttribute("data-alt") || "";
    if (source) source.removeAttribute("srcset");
    shot.src = button.getAttribute("data-webp");
    shot.alt = alt;
    thumbs.forEach(function (thumb, n) {
      var on = n === index;
      thumb.classList.toggle("is-active", on);
      thumb.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function openLightbox() {
    var button = thumbs[index];
    if (!button || !dialog || !lightImg) return;
    lightImg.src = button.getAttribute("data-full") || button.getAttribute("data-webp");
    lightImg.alt = button.getAttribute("data-alt") || "";
    if (lightCap) lightCap.textContent = button.getAttribute("data-alt") || "";
    if (!dialog.open) dialog.showModal();
  }

  thumbs.forEach(function (button, i) {
    button.addEventListener("click", function () {
      apply(i);
    });
  });

  if (stage && dialog && lightImg) {
    stage.addEventListener("click", openLightbox);
    dialog.querySelector("[data-close]").addEventListener("click", function () {
      dialog.close();
    });
    dialog.querySelector("[data-prev]").addEventListener("click", function () {
      apply(index - 1);
      openLightbox();
    });
    dialog.querySelector("[data-next]").addEventListener("click", function () {
      apply(index + 1);
      openLightbox();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", function () {
      lightImg.removeAttribute("src");
    });
  }
})();
