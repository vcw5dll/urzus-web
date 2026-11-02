/* URZUS Snap R — без зависимостей и без сборки */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeInOut = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  /* ---------- Данные ---------- */
  var specs = [
    ['Формат', '98 клавиш · 1800'], ['Переключатели', 'Red · линейные'],
    ['Точка срабатывания', '2 мм'], ['Полный ход', '4 мм'],
    ['Сила срабатывания', '45 г*'], ['Hot-Swap', '3-pin'],
    ['Подсветка', 'RGB · 12 режимов'], ['Подключение', 'Проводное USB'],
    ['Разъём', 'Съёмный USB-C'], ['Длина кабеля', '1,5 м'],
    ['Материал корпуса', 'Пластик'], ['Цвет', 'Белый / зелёный'],
    ['Размеры', '385 × 135 × 35,5 мм'], ['Вес', '615 г'],
    ['Anti-Ghosting', 'Все клавиши']
  ];

  /* ys — высота слоя на исходной картинке, yc — в собранном виде, ye — в разобранном,
     l/r — левая и правая граница видимой части слоя на картинке (в пикселях исходника) */
  var layers = [
    { id: 'keycaps', side: 'R', short: 'Кейкапы', name: 'Кейкапы', en: 'KEYCAPS', ys: 158, yc: 430, ye: 150, l: 98, r: 1574,
      title: 'Комфорт начинается с поверхности',
      text: 'Съёмные колпачки формируют тактильный контакт с клавиатурой. Контрастная русско-английская маркировка помогает быстро ориентироваться, а профиль клавиш создаёт привычную посадку пальцев при наборе текста.' },
    { id: 'switches', side: 'L', short: 'Переключатели', name: 'Механические переключатели Red', en: 'LINEAR RED SWITCHES', ys: 312, yc: 510, ye: 325, l: 98, r: 1573,
      title: 'Ровный линейный ход',
      text: 'Линейный механизм движется без выраженного тактильного выступа и громкого щелчка. Заявленная точка срабатывания — 2 мм, полный ход — 4 мм. Конкретные ощущения зависят от состояния и партии переключателей.' },
    { id: 'plate', side: 'R', short: 'Пластина', name: 'Монтажная пластина', en: 'MOUNTING PLATE', ys: 442, yc: 565, ye: 495, l: 104, r: 1567,
      title: 'Основа фиксации переключателей',
      text: 'Пластина удерживает переключатели в единой геометрии и помогает сохранять стабильность клавишного поля. Она распределяет нагрузку при нажатиях и служит промежуточным конструктивным уровнем между переключателями и платой.' },
    { id: 'pcb', side: 'L', short: 'Плата', name: 'Печатная плата', en: 'PRINTED CIRCUIT BOARD', ys: 542, yc: 590, ye: 640, l: 105, r: 1566,
      title: 'Электронная основа клавиатуры',
      text: 'PCB принимает сигналы от переключателей и передаёт их управляющей электронике. На плате расположены контактные площадки и электрические цепи, обеспечивающие регистрацию нажатий и работу клавиатурных функций.' },
    { id: 'foam', side: 'R', short: 'Шумоизоляция', name: 'Шумоизоляционный слой', en: 'ACOUSTIC FOAM', ys: 628, yc: 612, ye: 780, l: 105, r: 1567,
      title: 'Внутренний акустический барьер',
      text: 'Внутренний демпфирующий материал может уменьшать резонанс пустот корпуса и смягчать отражённый звук. На визуализации слой показан отдельно для объяснения общей конструкции; точный состав и толщина требуют подтверждения документацией производителя.' },
    { id: 'case', side: 'L', short: 'Корпус', name: 'Нижний корпус', en: 'LOWER HOUSING', ys: 762, yc: 640, ye: 955, l: 62, r: 1609,
      title: 'Защитная оболочка и основание',
      text: 'Нижняя часть корпуса формирует внешний контур клавиатуры, закрывает внутренние компоненты и служит опорой на рабочей поверхности. В ней размещаются внутренние крепления и посадочные элементы конструкции.' }
  ];
  /* высота подписей в собранном состоянии (разнесены, чтобы не слипались) */
  var tagYc = [330, 410, 490, 570, 650, 730];
  var HS_D = 1080, HS_M = 1850, IMG_W = 1672, HS = HS_D, VK = 1;

  /* ---------- Характеристики ---------- */
  var tbl = $('#specTable');
  tbl.innerHTML = specs.map(function (s) {
    return '<div class="spec-row"><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>';
  }).join('');

  /* ---------- Навигация ---------- */
  var nav = $('#nav'), burger = $('#burger'), pbar = $('#pbar');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('#menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { burger.click(); burger.focus(); }
  });

  var links = $$('#menu a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['design', 'inside', 'switches', 'specs', 'box'].forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });

    /* появление блоков + счётчики */
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in'); io.unobserve(en.target);
        $$('[data-count]', en.target).forEach(countUp);
      });
    }, { threshold: .15 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
  function countUp(el) {
    var to = +el.getAttribute('data-count');
    if (reduce || !to) return;
    var t0 = performance.now(), dur = 1100;
    (function tick(t) {
      var k = clamp((t - t0) / dur, 0, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- Лёгкий наклон клавиатуры в hero ---------- */
  var hv = $('#heroVisual'), himg = $('#heroImg');
  if (hv && !reduce && window.matchMedia('(hover:hover)').matches) {
    hv.addEventListener('pointermove', function (e) {
      var r = hv.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      himg.style.transform = 'rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 5) + 'deg) translateZ(0)';
    });
    hv.addEventListener('pointerleave', function () { himg.style.transform = ''; });
  }

  /* ---------- Разборка ---------- */
  var section = $('#inside'), stack = $('#stack'), svg = $('#leaders'), tagsBox = $('#tags');
  var imgs = {};
  $$('.layer', stack).forEach(function (im) { imgs[im.getAttribute('data-id')] = im; });
  var zOrder = ['case', 'foam', 'pcb', 'plate', 'switches', 'keycaps']; // нижний → верхний (как в HTML)

  var stepsEl = $('#steps'), dEl = $('#detail');
  var dIndex = $('#dIndex'), dName = $('#dName'), dTitle = $('#dTitle'), dText = $('#dText'), hint = $('#hint');
  var intro = { idx: '00 / 06 · СОБРАННАЯ МОДЕЛЬ', name: dName.textContent, title: dTitle.textContent, text: dText.textContent };

  var tagEls = [], stepEls = [], leaderEls = [];
  layers.forEach(function (L, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'tag-btn';
    b.innerHTML = '<b>' + String(i + 1).padStart(2, '0') + '</b><span>' + L.short + '</span>';
    b.setAttribute('aria-label', 'Слой ' + (i + 1) + ': ' + L.name);
    b.addEventListener('click', function () { goStep(i); });
    tagsBox.appendChild(b); tagEls.push(b);

    var li = document.createElement('li');
    var sb = document.createElement('button');
    sb.type = 'button'; sb.textContent = String(i + 1).padStart(2, '0');
    sb.setAttribute('aria-label', L.name);
    sb.addEventListener('click', function () { goStep(i); });
    li.appendChild(sb); stepsEl.appendChild(li); stepEls.push(sb);

    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.innerHTML = '<path d=""/><circle r="4.5" cx="0" cy="0"/>';
    svg.appendChild(g); leaderEls.push(g);
  });

  var geo = { W: 2072, G: 200, s: 1, w: 800, h: 440 };
  function measure() {
    var mobile = window.innerWidth <= 820;
    geo.G = mobile ? 130 : 200;
    geo.W = IMG_W + geo.G * 2;
    /* на телефоне слои раздвигаем сильнее по вертикали, чтобы клавиатура была крупнее */
    HS = mobile ? HS_M : HS_D; VK = mobile ? 1.9 : 1;
    var off = mobile ? HS_M / 2 - 543 : 0;
    layers.forEach(function (L, i) {
      L.Yc = L.yc + off;
      L.Ye = 150 + (L.ye - 150) * VK;
      L.Tc = mobile ? HS_M / 2 + (tagYc[i] - 530) * 2 : tagYc[i];
    });
    stack.style.setProperty('--ar', (geo.W / HS).toFixed(4));
    stack.style.setProperty('--gx', (geo.G / geo.W * 100).toFixed(3) + '%');
    stack.style.setProperty('--lw', (IMG_W / geo.W * 100).toFixed(3) + '%');
    var r = stack.getBoundingClientRect();
    geo.w = r.width; geo.h = r.height; geo.s = r.width / geo.W;
    svg.setAttribute('viewBox', '0 0 ' + geo.w.toFixed(1) + ' ' + geo.h.toFixed(1));
    dirty = true;
  }

  var target = 0, cur = 0, active = -2, dirty = true, running = false, lastT = 0;

  function stageOf(p) {            // p 0..1 → { e: разборка 0..1, act: активный слой }
    var e = clamp((p - .04) / .44, 0, 1);
    var act = p < .5 ? -1 : clamp(Math.floor((p - .5) / .5 * 6), 0, 5);
    return { e: e, act: act };
  }

  function render(p, act) {
    var s = geo.s, e = stageOf(p).e;
    layers.forEach(function (L, i) {
      var t = easeInOut(clamp((e - i * .09) / .55, 0, 1));
      var dyc = L.Yc - L.ys, dye = L.Ye - L.ys;
      var dy = lerp(dyc, dye, t);
      var el = imgs[L.id];
      el.style.transform = 'translate3d(0,' + (dy * s).toFixed(2) + 'px,0)';
      var focus = act >= 0;
      el.style.opacity = focus ? (i === act ? 1 : .3) : 1;

      /* подпись и линия-указатель */
      var ty = lerp(L.Tc, L.Ye, t) * s;
      var ay = (L.ys + dy) * s;
      var left = L.side === 'L';
      var tagW = window.innerWidth <= 820 ? 28 : 46;
      var tx = left ? tagW : geo.w - tagW;
      var ex = (geo.G + (left ? L.l + 26 : L.r - 26)) * s;
      var tb = tagEls[i];
      tb.style.left = tx.toFixed(1) + 'px'; tb.style.top = ty.toFixed(1) + 'px';
      var g = leaderEls[i];
      var x0 = tx + (left ? 17 : -17);
      g.firstChild.setAttribute('d', 'M' + x0.toFixed(1) + ' ' + ty.toFixed(1) + ' L' + ex.toFixed(1) + ' ' + ay.toFixed(1));
      g.lastChild.setAttribute('cx', ex.toFixed(1)); g.lastChild.setAttribute('cy', ay.toFixed(1));
      g.style.opacity = clamp(t * 1.6, 0, 1).toFixed(2);
    });
  }

  function setActive(a) {
    if (a === active) return;
    active = a;
    layers.forEach(function (L, i) {
      var on = i === a;
      imgs[L.id].classList.toggle('on', on);
      tagEls[i].classList.toggle('on', on);
      leaderEls[i].classList.toggle('on', on);
      if (on) stepEls[i].setAttribute('aria-current', 'true'); else stepEls[i].removeAttribute('aria-current');
    });
    var d = a >= 0 ? layers[a] : null;
    dIndex.textContent = d ? String(a + 1).padStart(2, '0') + ' / 06 · ' + d.en : intro.idx;
    dName.textContent = d ? d.name : intro.name;
    dTitle.textContent = d ? d.title : intro.title;
    dText.textContent = d ? d.text : intro.text;
    dEl.classList.remove('swap'); void dEl.offsetWidth; dEl.classList.add('swap');
  }

  function frame(t) {
    var dt = Math.min(64, t - lastT || 16); lastT = t;
    var k = reduce ? 1 : 1 - Math.pow(1 - .13, dt / 16.67);
    cur += (target - cur) * k;
    if (Math.abs(target - cur) < .0004) cur = target;
    render(cur, stageOf(target).act);
    setActive(stageOf(target).act);
    dirty = false;
    if (cur !== target) { requestAnimationFrame(frame); return; }
    running = false;
  }
  function kick() { if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(frame); } }

  function sectionProgress() {
    var r = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    return clamp(-r.top / Math.max(1, total), 0, 1);
  }
  function goStep(i) {
    var r = section.getBoundingClientRect();
    var total = section.offsetHeight - window.innerHeight;
    var y = window.scrollY + r.top + (.5 + (i + .5) / 12) * total;
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  }

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    pbar.style.transform = 'scaleX(' + (max > 0 ? clamp(window.scrollY / max, 0, 1) : 0) + ')';
    nav.classList.toggle('scrolled', window.scrollY > 24);
    var p = sectionProgress();
    target = p;
    hint.classList.toggle('gone', p > .03);
    kick();
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', function () { measure(); onScroll(); });

  measure();
  cur = target = sectionProgress();
  render(cur, stageOf(target).act);
  setActive(stageOf(target).act);
  onScroll();

  /* подгрузить слои заранее, чтобы не «выскакивали» при прокрутке */
  var preload = function () { $$('.layer', stack).forEach(function (im) { im.loading = 'eager'; }); };
  if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 2500 }); else setTimeout(preload, 1200);
})();
