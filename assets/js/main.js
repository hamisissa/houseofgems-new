// House of Gems Tanzania — site interactions
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header ---------- */
  const header = $('#header');
  const burger = $('#burger');
  const nav = $('#nav');
  const setNavTop = () => {
    const r = header.getBoundingClientRect();
    document.documentElement.style.setProperty('--nav-top', Math.max(r.bottom, 0) + 'px');
  };
  const onScroll = () => { header.classList.toggle('is-scrolled', window.scrollY > 40); setNavTop(); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', setNavTop);
  onScroll();

  const closeMenu = () => { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    setNavTop();
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- Counters ---------- */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, target = +el.dataset.count, t0 = performance.now(), dur = 1600;
      const tick = now => {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      reduceMotion ? (el.textContent = target) : requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(c => cio.observe(c));

  /* ---------- Hero slider ---------- */
  const slider = $('.slider');
  if (slider) {
    const slides = $$('.slide', slider);
    const dotsWrap = $('.slider__dots', slider);
    const count = $('.slider__count', slider);
    const DUR = 6000;
    slider.style.setProperty('--dur', DUR + 'ms');
    let i = 0, timer = null, paused = false;

    slides.forEach((s, n) => {
      const b = document.createElement('button');
      b.className = 'slider__dot';
      b.setAttribute('aria-label', `Go to slide ${n + 1}`);
      b.innerHTML = '<span></span>';
      b.addEventListener('click', () => go(n, true));
      dotsWrap.appendChild(b);
    });
    const dots = $$('.slider__dot', slider);

    function go(n, user) {
      slides[i].classList.remove('is-active');
      slides[i].setAttribute('aria-hidden', 'true');
      dots[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      slides[i].removeAttribute('aria-hidden');
      void dots[i].offsetWidth; // restart progress animation
      dots[i].classList.add('is-active');
      slider.classList.toggle('on-light', slides[i].classList.contains('slide--light'));
      count.textContent = `0${i + 1} / 0${slides.length}`;
      if (user) restart();
    }
    function restart() {
      clearTimeout(timer);
      if (!paused && !reduceMotion) timer = setTimeout(() => go(i + 1), DUR);
    }
    const pause = () => { paused = true; slider.classList.add('is-paused'); clearTimeout(timer); };
    const resume = () => { paused = false; slider.classList.remove('is-paused'); restart(); };

    $('.slider__arrow--prev', slider).addEventListener('click', () => go(i - 1, true));
    $('.slider__arrow--next', slider).addEventListener('click', () => go(i + 1, true));
    slider.addEventListener('mouseenter', pause);
    slider.addEventListener('mouseleave', resume);
    slider.addEventListener('focusin', pause);
    slider.addEventListener('focusout', resume);
    document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());
    slider.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') go(i - 1, true);
      if (e.key === 'ArrowRight') go(i + 1, true);
    });
    let x0 = null;
    slider.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1), true);
      x0 = null;
    });

    slides.forEach((s, n) => n && s.setAttribute('aria-hidden', 'true'));
    go(0);
    restart();
  }

  /* ---------- Enquiry form → WhatsApp ---------- */
  const form = $('#enquiryForm');
  if (form) {
    const note = $('#formNote');
    const want = new URLSearchParams(location.search).get('interest');
    if (want) {
      const sel = form.elements.interest;
      const opt = [...sel.options].find(o => o.value.toLowerCase() === want.toLowerCase());
      if (opt) sel.value = opt.value;
    }
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      $$('[required]', form).forEach(f => {
        const v = f.value.trim() && (f.type !== 'email' || /^\S+@\S+\.\S+$/.test(f.value));
        f.classList.toggle('is-invalid', !v);
        if (!v) ok = false;
      });
      if (!ok) { note.textContent = 'Please complete the highlighted fields.'; return; }
      const d = Object.fromEntries(new FormData(form));
      const msg = `Hello House of Gems,\n\nName: ${d.name}\nEmail: ${d.email}\nCountry: ${d.country || '-'}\nInterested in: ${d.interest}\n\n${d.message}`;
      window.open('https://wa.me/255758857000?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      note.textContent = 'Thank you — WhatsApp is opening with your enquiry.';
      form.reset();
    });
  }

  $$('.js-year').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
