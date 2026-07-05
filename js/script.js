/* Penta Tech — shared interactions
   1. Mobile hamburger menu
   2. Contact page India/UAE tabs
   3. Home testimonial slider dots
   4. Home "Our Services" card slider
   5. Dark services bar: hover highlight + prev/next navigation
      (used on both the Home banner and the Service Details bar)
   6. Testimonial quote text: scrollable overflow, synced to the bar thumb
   7. Side floating "Share" button
   8. Lead-capture forms: submit via fetch to /api/leads (see server/)
   9. Phone country-code dropdown (Service Details enquiry banner)
*/
(function () {
  /* ---------- 1. hamburger ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.classList.toggle('is-active');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.classList.remove('is-active');
      });
    });
  }

  /* ---------- 2. contact country tabs ---------- */
  var tabs = document.querySelectorAll('[data-country-tab]');
  var panels = document.querySelectorAll('[data-country-panel]');
  var tabHalves = document.querySelectorAll('[data-country-half]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.getAttribute('data-country-tab');
      tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
      panels.forEach(function (p) {
        p.classList.toggle('is-active', p.getAttribute('data-country-panel') === key);
      });
      tabHalves.forEach(function (h) {
        h.classList.toggle('is-active', h.getAttribute('data-country-half') === key);
      });
    });
  });

  /* ---------- 3. testimonial slider (real slide swap, 4 pairs of reviews) ---------- */
  var slider = document.querySelector('.tst-slider');
  var dotsWrap = document.querySelector('.tst-dots');
  if (slider && dotsWrap) {
    var tstSlides = slider.querySelectorAll('.tst-slide');
    var dots = dotsWrap.querySelectorAll('.dot');
    var index = 0;
    var timer = setInterval(next, 6000);

    function setActive(i) {
      index = i;
      tstSlides.forEach(function (s, j) { s.classList.toggle('is-active', j === i); });
      dots.forEach(function (d, j) {
        d.classList.toggle('dot--active', j === i);
        d.classList.toggle('dot--white', j === i);
      });
    }
    function next() { setActive((index + 1) % tstSlides.length); }

    dots.forEach(function (d, i) {
      d.style.cursor = 'pointer';
      d.addEventListener('click', function () {
        clearInterval(timer);
        setActive(i);
        timer = setInterval(next, 6000);
      });
    });
  }

  /* ---------- 4. Home "Our Services" card slider ---------- */
  var hsCards = document.querySelector('.hs-cards');
  if (hsCards) {
    var hsSlides = hsCards.querySelectorAll('.hs-slide');
    var hsDots = hsCards.querySelectorAll('.hs-dots .dot');
    var hsIndex = 0;
    var hsTimer = setInterval(hsNext, 5000);

    function hsSetActive(i) {
      hsIndex = i;
      hsSlides.forEach(function (slide, j) {
        slide.classList.toggle('is-active', j === i);
      });
      hsDots.forEach(function (d, j) {
        d.classList.toggle('dot--active', j === i);
      });
    }
    function hsNext() { hsSetActive((hsIndex + 1) % hsSlides.length); }

    hsDots.forEach(function (d, i) {
      d.style.cursor = 'pointer';
      d.addEventListener('click', function () {
        clearInterval(hsTimer);
        hsSetActive(i);
        hsTimer = setInterval(hsNext, 5000);
      });
    });
  }

  /* ---------- 4b. Home About feature slider ---------- */
  var haFeatureSlider = document.querySelector('.ha-feature-slider');
  if (haFeatureSlider) {
    var haFeatureTrack = haFeatureSlider.querySelector('.ha-feature-track');
    var haFeatureCards = haFeatureSlider.querySelectorAll('.ha-feature');
    var haFeatureDots = haFeatureSlider.querySelectorAll('.ha-feature-dot');

    function setFeatureDot(index) {
      haFeatureDots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    haFeatureDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (!haFeatureTrack || !haFeatureCards[i]) return;
        haFeatureTrack.scrollTo({
          left: haFeatureCards[i].offsetLeft - haFeatureTrack.offsetLeft,
          behavior: 'smooth'
        });
        setFeatureDot(i);
      });
    });

    if (haFeatureTrack) {
      haFeatureTrack.addEventListener('scroll', function () {
        var nearestIndex = 0;
        var nearestDistance = Infinity;
        haFeatureCards.forEach(function (card, i) {
          var targetLeft = card.offsetLeft - haFeatureTrack.offsetLeft;
          var distance = Math.abs(haFeatureTrack.scrollLeft - targetLeft);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = i;
          }
        });
        setFeatureDot(nearestIndex);
      });
    }
  }

  /* ---------- 5. dark services bar: hover highlight + prev/next navigation ---------- */
  function initServiceBar(barSelector) {
    var bar = document.querySelector(barSelector);
    if (!bar) return;
    var items = Array.prototype.slice.call(bar.querySelectorAll('.bs-item'));
    if (!items.length) return;

    var current = items.findIndex(function (it) { return it.classList.contains('is-highlight'); });
    if (current < 0) current = 0;

    function show(index) {
      current = (index + items.length) % items.length;
      items.forEach(function (it, i) { it.classList.toggle('is-highlight', i === current); });
    }

    items.forEach(function (it, i) {
      it.addEventListener('mouseenter', function () {
        items.forEach(function (other, j) { other.classList.toggle('is-highlight', j === i); });
      });
    });
    /* leaving the bar settles back on whichever item prev/next last selected */
    bar.addEventListener('mouseleave', function () { show(current); });

    var prevBtn = bar.querySelector('.sd-bar__arrow--prev');
    var nextBtn = bar.querySelector('.sd-bar__arrow--next');
    if (prevBtn) prevBtn.addEventListener('click', function () { show(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { show(current + 1); });
  }
  initServiceBar('.banner-services');
  initServiceBar('.sd-bar');

  /* ---------- 6. testimonial quote text scroll (drives the decorative bar) ---------- */
  document.querySelectorAll('.tst-card__bar').forEach(function (bar) {
    var card = bar.closest('.tst-card');
    var text = card && card.querySelector('.tst-card__quote-text');
    var thumb = bar.querySelector('span');
    if (!text || !thumb) return;

    function syncThumb() {
      var scrollable = text.scrollHeight - text.clientHeight;
      if (scrollable <= 1) return;   /* content fits — leave the default resting position */
      var maxTravel = bar.clientHeight - thumb.offsetHeight;
      var progress = text.scrollTop / scrollable;
      thumb.style.bottom = 'auto';
      thumb.style.top = (maxTravel * progress) + 'px';
    }

    text.addEventListener('scroll', syncThumb);
    window.addEventListener('resize', syncThumb);
    syncThumb();
  });

  /* ---------- 7. side-float share button ---------- */
  var shareBtn = document.querySelector('.side-float__btn[aria-label="Share"]');
  if (shareBtn) {
    shareBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var shareData = { title: document.title, url: window.location.href };
      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareData.url).then(function () {
          alert('Link copied to clipboard');
        });
      } else {
        window.open('https://wa.me/?text=' + encodeURIComponent(shareData.url), '_blank');
      }
    });
  }

  /* ---------- 8. lead-capture forms ---------- */
  document.querySelectorAll('[data-lead-form]').forEach(function (form) {
    var feedback = form.querySelector('.form-feedback');
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var data = Object.fromEntries(new FormData(form).entries());
      data.formId = form.dataset.formId || '';
      data.sourcePage = window.location.href; // full page link, sent silently — not shown in the form UI

      var codeEl = form.querySelector('.f-phone__code-value');
      if (codeEl && data.phone) { data.phone = codeEl.textContent.trim() + ' ' + data.phone; }

      if (submitBtn) submitBtn.disabled = true;
      if (feedback) { feedback.textContent = 'Sending…'; feedback.removeAttribute('data-state'); }

      var apiBase = window.PENTACODES_API_BASE || '';
      fetch(apiBase + '/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (res) { return res.json().then(function (body) { return { ok: res.ok, body: body }; }); })
        .then(function (result) {
          if (result.ok && result.body.ok) {
            if (feedback) { feedback.textContent = "Thanks! We'll be in touch shortly."; feedback.setAttribute('data-state', 'success'); }
            form.reset();
          } else {
            if (feedback) { feedback.textContent = (result.body && result.body.error) || 'Something went wrong. Please try again.'; feedback.setAttribute('data-state', 'error'); }
          }
        })
        .catch(function () {
          if (feedback) { feedback.textContent = 'Could not reach the server. Please try again in a moment.'; feedback.setAttribute('data-state', 'error'); }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  });

  /* ---------- 9. phone country-code dropdown ---------- */
  document.querySelectorAll('.f-phone__select').forEach(function (wrap) {
    var toggle = wrap.querySelector('.f-phone__code');
    var valueEl = wrap.querySelector('.f-phone__code-value');
    var list = wrap.querySelector('.f-phone__list');
    if (!toggle || !list) return;

    function close() {
      list.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
    function open() {
      list.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (list.hidden) open(); else close();
    });

    list.querySelectorAll('li').forEach(function (option) {
      option.addEventListener('click', function () {
        list.querySelectorAll('li').forEach(function (o) { o.removeAttribute('aria-selected'); });
        option.setAttribute('aria-selected', 'true');
        if (valueEl) valueEl.textContent = option.dataset.code;
        close();
      });
    });

    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  });
})();
