/* Renata Tim — HGS Dev */
(() => {
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = typeof window.gsap !== 'undefined';
  const WA = '5519997932589';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- conte o prato ---------- */
  /* gramas de carboidrato por porção, aproximados pela TACO (Unicamp) */
  const FOODS = [
    ['Arroz branco cozido', '1 colher de servir (45 g)', 13],
    ['Feijão carioca', '1 concha (90 g)', 12],
    ['Macarrão cozido', '1 pegador (110 g)', 33],
    ['Batata cozida', '1 unidade média (130 g)', 15],
    ['Pão francês', '1 unidade (50 g)', 29],
    ['Banana prata', '1 unidade (70 g)', 18],
    ['Maçã', '1 unidade média (130 g)', 20],
    ['Suco de laranja', '1 copo (200 ml)', 15],
    ['Leite integral', '1 copo (200 ml)', 9],
    ['Brigadeiro', '1 unidade (20 g)', 12],
    ['Frango grelhado', '1 filé (100 g)', 0],
    ['Salada de folhas', 'à vontade', 2]
  ];
  const list = $('[data-foods]');
  const qty = FOODS.map(() => 0);
  qty[0] = 2; qty[1] = 1; qty[10] = 1; qty[11] = 1; /* um prato do dia a dia para começar */
  list.innerHTML = FOODS.map(([n, p, g], i) => `
    <li class="food" data-i="${i}">
      <span class="food-name">${n}<small>${p}</small></span>
      <span class="food-g">${g} g cada</span>
      <span class="step" role="group" aria-label="Quantidade de ${n}">
        <button type="button" data-d="-1" aria-label="Tirar uma porção de ${n}">&minus;</button>
        <output aria-live="off">0</output>
        <button type="button" data-d="1" aria-label="Pôr uma porção de ${n}">+</button>
      </span>
    </li>`).join('');

  const totalEl = $('[data-total]'), subEl = $('[data-sub]'), barEl = $('[data-bar]');
  let shown = 0;
  const render = () => {
    let t = 0;
    $$('.food', list).forEach((li, i) => {
      t += qty[i] * FOODS[i][2];
      li.querySelector('output').textContent = qty[i];
      li.querySelector('[data-d="-1"]').disabled = qty[i] === 0;
      li.classList.toggle('has', qty[i] > 0);
    });
    const porcoes = (t / 15).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    subEl.textContent = t === 0
      ? 'Prato vazio. Use o + para pôr alimentos.'
      : `Cerca de ${porcoes} porções de 15 g. Frango e salada quase não contam: quem pesa na conta é o carboidrato.`;
    barEl.style.width = Math.min(100, t / 120 * 100) + '%';
    if (hasG && !reduce) {
      const o = { v: shown };
      gsap.to(o, { v: t, duration: .5, ease: 'power3.out', onUpdate: () => (totalEl.textContent = Math.round(o.v)) });
    } else totalEl.textContent = t;
    shown = t;
  };
  list.addEventListener('click', e => {
    const b = e.target.closest('button[data-d]'); if (!b) return;
    const i = +b.closest('.food').dataset.i;
    qty[i] = Math.max(0, Math.min(9, qty[i] + +b.dataset.d));
    render();
  });
  $('[data-reset]').addEventListener('click', () => { qty.fill(0); render(); });
  render();

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
