/* Renata Tim — HGS Dev */
(() => {
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = typeof window.gsap !== 'undefined';
  const WA = '5519997932589';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- conte o prato: tocar põe ou tira ---------- */
  const chips = $$('.chip'), totalEl = $('[data-total]');
  let shown = +totalEl.textContent;
  const render = () => {
    const t = chips.reduce((s, c) => s + (c.getAttribute('aria-pressed') === 'true' ? +c.dataset.g : 0), 0);
    if (hasG && !reduce) {
      const o = { v: shown };
      gsap.to(o, { v: t, duration: .45, ease: 'power3.out', onUpdate: () => (totalEl.textContent = Math.round(o.v)) });
    } else totalEl.textContent = t;
    shown = t;
  };
  chips.forEach(c => c.addEventListener('click', () => {
    c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
    render();
  }));

  /* tabela no celular: cada resposta leva o nome da coluna */
  const cols = $$('.cmp-row--head .cmp-c').map(c => c.textContent.trim());
  $$('.cmp-row:not(.cmp-row--head)').forEach(r => $$('.cmp-c', r).forEach((c, i) => (c.dataset.col = cols[i])));

  /* ---------- telefone do rodapé ocupa a largura ---------- */
  const phone = $('.rod-phone');
  const fit = () => {
    phone.style.fontSize = '100px';
    const avail = phone.parentElement.clientWidth - parseFloat(getComputedStyle(phone.parentElement).paddingLeft) * 2;
    phone.style.fontSize = Math.min(220, 100 * avail / phone.scrollWidth * 0.98) + 'px';
  };
  fit(); addEventListener('resize', fit);
  document.fonts && document.fonts.ready.then(fit);

  /* ---------- barra ---------- */
  const bar = $('.bar'); let lastY = 0;
  const onScroll = () => {
    const y = scrollY, heroH = $('.hero-field').offsetHeight - 60;
    bar.classList.toggle('is-solid', y > heroH);
    bar.classList.toggle('is-hidden', y > 500 && y > lastY);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- vídeos só tocam quando aparecem ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduce) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); }
    else v.pause();
  }), { threshold: .15 });
  $$('video').forEach(v => vio.observe(v));

  /* ---------- cartão → WhatsApp ---------- */
  $('.card').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const msg = [`Olá, Renata! Meu nome é ${f.get('nome') || ''}.`, 'Quero agendar uma consulta.', `Tipo de diabetes: ${f.get('tipo')}.`, `Atendimento: ${f.get('onde')}.`].join('\n');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  /* ---------- entradas por rolagem ---------- */
  let pending = $$('[data-rise]').filter(el => !el.closest('.hero'));
  const reveal = () => {
    if (!pending.length) return;
    const lim = innerHeight * 0.94; let n = 0;
    pending = pending.filter(el => {
      const r = el.getBoundingClientRect();
      if (r.top < lim && r.bottom > -innerHeight) { el.style.setProperty('--d', (n++ * 70) + 'ms'); el.classList.add('is-in'); return false; }
      return true;
    });
  };
  addEventListener('scroll', reveal, { passive: true });
  addEventListener('resize', reveal);
  setInterval(reveal, 300);

  const intro = $('.intro');
  const showHero = () => {
    $$('.hero [data-rise]').forEach(el => el.classList.add('is-in'));
    $('.shutter').style.clipPath = 'none'; $('.shutter img').style.transform = 'none';
  };
  if (!hasG || reduce) { intro.classList.add('is-gone'); showHero(); reveal(); return; }

  /* trava de segurança */
  setTimeout(() => { if (!intro.classList.contains('is-gone')) { intro.classList.add('is-gone'); showHero(); } }, 2500);

  /* ---------- abertura: o leitor liga e lê 112 ---------- */
  const num = $('[data-intro-num]'), o = { v: 40 };
  const tl = gsap.timeline();
  tl.to('.intro-ring circle', { strokeDashoffset: 0, duration: .6, ease: 'power2.inOut' })
    .to(o, { v: 112, duration: .6, ease: 'power2.out', onUpdate: () => (num.textContent = Math.round(o.v)) }, 0)
    .to('.intro-name', { opacity: 1, duration: .2 }, .35)
    .to('.intro', { yPercent: -100, duration: .4, ease: 'power3.inOut' }, '+=.05')
    .add(() => intro.classList.add('is-gone'))
    .add(heroIn, '-=.3');

  /* ---------- hero: a curva corre, a foto abre ---------- */
  const line = $('.trace-line');
  let len = 0; try { len = line.getTotalLength(); } catch (e) { len = 0; }
  if (len) { line.style.strokeDasharray = len; line.style.strokeDashoffset = len; }
  function heroIn() {
    if (len) gsap.to(line, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' });
    gsap.fromTo('.hero [data-rise]', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .8, stagger: .1, ease: 'power3.out', onComplete: () => $$('.hero [data-rise]').forEach(el => el.classList.add('is-in')) });
    gsap.to('.shutter', { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'power3.inOut', delay: .15 });
    gsap.to('.shutter img', { scale: 1, duration: 1.4, ease: 'power3.out', delay: .15 });
  }
  reveal();
})();
