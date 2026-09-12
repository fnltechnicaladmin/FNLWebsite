/* =========================================================================
   La Familia New Life — Shared Site Script (Phase 1)
   Linked from every page via <script src="script.js"></script> near the end
   of <body>. This is the ONE file to edit for menu/lang-toggle/media-banner
   behavior — no more copy-pasting this logic per page.
 
   NOTE: the tiny flash-prevention snippet (sets data-lang-mode on <html>
   before paint, per Section 5.4) is NOT in here — it has to run inline,
   synchronously, at the very top of each page's <head>, before this file
   or anything else loads. That one small snippet is still copy-pasted
   per page; everything else lives here now.
   ========================================================================= */
(function () {
 
  // -------------------------------------------------------------------
  // Site-wide config — single source of truth for values reused across
  // the site. Edit here once; applied everywhere via data-* attributes.
  // -------------------------------------------------------------------
  var CHURCH_MAPS_URL = "https://www.google.com/maps/place/La+Molina+Christian+Schools/@-12.0865607,-76.9053944,17z/data=!3m1!4b1!4m6!3m5!1s0x9105c0da13cbefa1:0x8f2c78e5ae9227d!8m2!3d-12.0865607!4d-76.9053944!16s%2Fg%2F11c3thztg_?entry=ttu&g_ep=EgoyMDI2MDkwOC4wIKXMDSoASAFQAw%3D%3D"; // real link from your edit — confirm this pin is right; it currently resolves to "La Molina Christian Schools," not obviously the church itself
 
  document.querySelectorAll('[data-directions-link]').forEach(function (el) {
    el.href = CHURCH_MAPS_URL;
  });
 
  // -------------------------------------------------------------------
  // Mobile menu toggle
  // -------------------------------------------------------------------
  var menuBtn = document.getElementById('menu-toggle');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var isOpen = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!isOpen));
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
    });
  }
 
  // -------------------------------------------------------------------
  // Language toggle (two-state: es / en, synced across nav + footer)
  // -------------------------------------------------------------------
  var STORAGE_KEY = 'fnl-lang-mode';
 
  function setLangMode(mode) {
    document.documentElement.setAttribute('data-lang-mode', mode);
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
    document.querySelectorAll('[data-lang-toggle] .lang-toggle__btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.getAttribute('data-lang-set') === mode));
    });
  }
 
  document.querySelectorAll('[data-lang-toggle] .lang-toggle__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLangMode(btn.getAttribute('data-lang-set'));
    });
  });
 
  // Sync toggle button states to whatever the inline flash-prevention
  // script already set on <html> before this file loaded.
  var currentLangMode = document.documentElement.getAttribute('data-lang-mode') || 'es';
  setLangMode(currentLangMode);
 
  // -------------------------------------------------------------------
  // Media banner backgrounds (image / slideshow / video)
  // Mode is read from a modifier class; source(s) come from a matching
  // data-* attribute. Switching a banner's mode = change the class + the
  // data-* value on that <section> in the HTML. Nothing in this file
  // needs editing when a page's banners change. See Section 4.2.
  // -------------------------------------------------------------------
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  document.querySelectorAll('.media-banner').forEach(function (banner) {
    var bg = document.createElement('div');
    bg.className = 'media-banner__bg';
    bg.setAttribute('aria-hidden', 'true');
 
    if (banner.classList.contains('media-banner--bg-slideshow')) {
      var urls = (banner.getAttribute('data-bg-slides') || '')
        .split(',').map(function (s) { return s.trim(); }).filter(Boolean);
 
      urls.forEach(function (url, i) {
        var slide = document.createElement('div');
        slide.className = 'media-banner__bg-slide' + (i === 0 ? ' media-banner__bg-slide--active' : '');
        slide.style.backgroundImage = "url('" + url + "')";
        bg.appendChild(slide);
      });
 
      if (urls.length > 1 && !reduceMotion) {
        var slides = Array.prototype.slice.call(bg.children);
        var idx = 0;
        setInterval(function () {
          slides[idx].classList.remove('media-banner__bg-slide--active');
          idx = (idx + 1) % slides.length;
          slides[idx].classList.add('media-banner__bg-slide--active');
        }, 6000);
      }
 
    } else if (banner.classList.contains('media-banner--bg-video')) {
      var videoUrl = banner.getAttribute('data-bg-video');
      var poster = banner.getAttribute('data-bg-poster');
      if (videoUrl) {
        var video = document.createElement('video');
        video.className = 'media-banner__bg-video';
        video.muted = true;
        video.loop = true;
        video.setAttribute('playsinline', '');
        if (poster) video.poster = poster;
        var source = document.createElement('source');
        source.src = videoUrl;
        source.type = 'video/mp4';
        video.appendChild(source);
        bg.appendChild(video);
        if (!reduceMotion) {
          video.autoplay = true;
          video.play().catch(function () {}); // autoplay can be blocked by the browser; fail silently
        }
        // If reduced motion is preferred, the video stays paused on its poster/first frame.
      }
 
    } else if (banner.classList.contains('media-banner--bg-image')) {
      var imgUrl = banner.getAttribute('data-bg-image');
      if (imgUrl) {
        var layer = document.createElement('div');
        layer.className = 'media-banner__bg-image';
        layer.style.backgroundImage = "url('" + imgUrl + "')";
        bg.appendChild(layer);
      }
    }
 
    if (bg.children.length) {
      banner.insertBefore(bg, banner.firstChild);
      var overlay = document.createElement('div');
      overlay.className = 'media-banner__overlay';
      overlay.setAttribute('aria-hidden', 'true');
      banner.insertBefore(overlay, bg.nextSibling);
    }
  });
 
})();