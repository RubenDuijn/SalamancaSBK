const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');
const pageLang = (document.documentElement.lang || 'en').toLowerCase();
const isSpanishPage = pageLang.startsWith('es');

function normalizePath(pathname) {
  return pathname
    .replace(/index\.html$/, '')
    .replace(/\/+$/, '') || '/';
}

const langLinks = document.querySelectorAll('.nav-lang');
if (langLinks.length) {
  langLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('/es')) {
        localStorage.setItem('sbk_lang', 'es');
      } else if (href === '/' || href.startsWith('/members')) {
        localStorage.setItem('sbk_lang', 'en');
      }
    });
  });

  const currentPath = normalizePath(window.location.pathname);
  const preferredLang = localStorage.getItem('sbk_lang');
  const enToEsRoutes = {
    '/': '/es/',
    '/members': '/es/members/',
  };
  const esToEnRoutes = {
    '/es': '/',
    '/es/members': '/members/',
  };

  if (preferredLang === 'es' && enToEsRoutes[currentPath]) {
    window.location.replace(enToEsRoutes[currentPath]);
  }

  if (preferredLang === 'en' && esToEnRoutes[currentPath]) {
    window.location.replace(esToEnRoutes[currentPath]);
  }
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

function setupScrollReveals() {
  const selectors = [
    '.hero-copy',
    '.hero-card',
    '.proof-item',
    '.section-heading',
    '.quote-card',
    '.vibe-feature',
    '.class-card',
    '.feature-card',
    '.schedule-poster',
    '.about-grid > div',
    '.pricing-card',
    '.cta-card',
    '.shop-card',
    '.center-action',
    '.footer-grid > div'
  ];
  const items = Array.from(
    new Set(selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector))))
  );

  if (!items.length) {
    return;
  }

  items.forEach((item, index) => {
    item.classList.add('reveal-item');
    item.style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
    items.forEach((item) => item.classList.add('is-visible'));
    document.documentElement.classList.add('reveal-ready');
    return;
  }

  const viewportHeight = window.innerHeight || 0;
  items.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top <= viewportHeight * 0.9) {
      item.classList.add('is-visible');
    }
  });

  document.documentElement.classList.add('reveal-ready');

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  items.forEach((item) => observer.observe(item));
}

setupScrollReveals();

const dayTabsEl = document.getElementById('schedule-day-tabs');
const dayPanelEl = document.getElementById('schedule-day-panel');

const scheduleDataEn = [
  {
    day: 'Monday',
    focus: 'Sol Room / Sombra Room',
    classes: [
      { title: 'Open Level Floor (Free Slot)', time: '16:00' },
      { title: 'Bachata Fusion Level 1-2', time: '17:00' },
      { title: 'Salsa Cubana Level 0', time: '20:00' },
      { title: 'Bachata Fusion Flow Level 1-2', time: '21:00' },
      { title: 'Salsa en Linea On1 Level 1-2 · Sol Room', time: '22:00' },
      { title: 'Rueda Casino Level 1-2 · Sombra Room', time: '22:00' },
    ],
  },
  {
    day: 'Tuesday',
    focus: 'Sol Room / Sombra Room',
    classes: [
      { title: 'Bachata Moderna Level 0-1', time: '16:00' },
      { title: 'Bachata Moderna Level 1', time: '17:00' },
      { title: 'Bachata Moderna Level 0-1 (Samaná)', time: '18:00' },
      { title: 'Salsa Cubana Level 0', time: '20:00' },
      { title: 'Bachata Moderna Level 0 (El Rincón)', time: '21:00' },
      { title: 'Salsa en Linea On1 Level 1', time: '22:00' },
    ],
  },
  {
    day: 'Wednesday',
    focus: 'Sol Room / Sombra Room',
    classes: [
      { title: 'Zouk Foundations (Free Slot)', time: '17:00' },
      { title: 'Salsa Cubana Level 1 · Sol Room', time: '20:00' },
      { title: 'Rueda Casino Level 1 · Sombra Room', time: '20:00' },
      { title: 'Salsa en Linea On1 · Sol Room', time: '21:00' },
      { title: 'Shines On2 · Sombra Room', time: '21:00' },
      { title: 'Salsa Cubana Level 1-2 · Sol Room', time: '22:00' },
      { title: 'Rueda Casino Level 1-2 · Sombra Room', time: '22:00' },
    ],
  },
  {
    day: 'Thursday',
    focus: 'Sol Room / Sombra Room',
    classes: [
      { title: 'Salsa Cubana Level 0-1', time: '16:00' },
      { title: 'Salsa Cubana Level 1 · Sol Room', time: '17:00' },
      { title: 'Rueda Casino Level 1 · Sombra Room', time: '17:00' },
      { title: 'Tango Argentino Level 0-1', time: '18:00' },
      { title: 'Bachata Moderna Level 0-1', time: '20:00' },
      { title: 'Kizomba Level 1-2 · Sol Room', time: '21:00' },
      { title: 'Bachata Dominicana Level 1-2 · Sombra Room', time: '21:00' },
      { title: 'Kizomba Flow Fusion Level 1-2', time: '22:00' },
    ],
  },
  {
    day: 'Friday',
    focus: 'Sol Room / Sombra Room',
    classes: [
      { title: 'Bachata Moderna Level 0', time: '18:00' },
      { title: 'Bachata Dominicana Level 1 · Sol Room', time: '20:00' },
      { title: 'Rueda Casino Level 1 · Sombra Room', time: '20:00' },
      { title: 'Bachata Moderna Level 0-1', time: '21:00' },
      { title: 'Forro Starter Session (Free Slot)', time: '22:00' },
    ],
  },
  {
    day: 'Saturday',
    focus: 'Sol Room / Sombra Room',
    classes: [
      { title: 'Pre-Social Workshop', time: '19:00' },
      { title: 'SBK Social Lab', time: '20:00' },
      { title: 'Guided Partner Practice', time: '21:00' },
      { title: 'SBK Social Night', time: '22:00' },
    ],
  },
  {
    day: 'Sunday',
    focus: 'Sol Room / Sombra Room',
    classes: [
      { title: 'Open Technique Lab', time: '19:00' },
      { title: 'Musicality + Styling Session', time: '20:00' },
      { title: 'Guided Social Practica', time: '21:00' },
    ],
  },
];

const scheduleDataEs = [
  {
    day: 'Lunes',
    focus: 'Sala Sol / Sala Sombra',
    classes: [
      { title: 'Pista Open Level (Hueco libre)', time: '16:00' },
      { title: 'Bachata Fusion Nivel 1-2', time: '17:00' },
      { title: 'Salsa Cubana Nivel 0', time: '20:00' },
      { title: 'Bachata Fusion Flow Nivel 1-2', time: '21:00' },
      { title: 'Salsa en Linea On1 Nivel 1-2 · Sala Sol', time: '22:00' },
      { title: 'Rueda Casino Nivel 1-2 · Sala Sombra', time: '22:00' },
    ],
  },
  {
    day: 'Martes',
    focus: 'Sala Sol / Sala Sombra',
    classes: [
      { title: 'Bachata Moderna Nivel 0-1', time: '16:00' },
      { title: 'Bachata Moderna Nivel 1', time: '17:00' },
      { title: 'Bachata Moderna Nivel 0-1 (Samaná)', time: '18:00' },
      { title: 'Salsa Cubana Nivel 0', time: '20:00' },
      { title: 'Bachata Moderna Nivel 0 (El Rincón)', time: '21:00' },
      { title: 'Salsa en Linea On1 Nivel 1', time: '22:00' },
    ],
  },
  {
    day: 'Miercoles',
    focus: 'Sala Sol / Sala Sombra',
    classes: [
      { title: 'Zouk Foundations (Hueco libre)', time: '17:00' },
      { title: 'Salsa Cubana Nivel 1 · Sala Sol', time: '20:00' },
      { title: 'Rueda Casino Nivel 1 · Sala Sombra', time: '20:00' },
      { title: 'Salsa en Linea On1 · Sala Sol', time: '21:00' },
      { title: 'Shines On2 · Sala Sombra', time: '21:00' },
      { title: 'Salsa Cubana Nivel 1-2 · Sala Sol', time: '22:00' },
      { title: 'Rueda Casino Nivel 1-2 · Sala Sombra', time: '22:00' },
    ],
  },
  {
    day: 'Jueves',
    focus: 'Sala Sol / Sala Sombra',
    classes: [
      { title: 'Salsa Cubana Nivel 0-1', time: '16:00' },
      { title: 'Salsa Cubana Nivel 1 · Sala Sol', time: '17:00' },
      { title: 'Rueda Casino Nivel 1 · Sala Sombra', time: '17:00' },
      { title: 'Tango Argentino Nivel 0-1', time: '18:00' },
      { title: 'Bachata Moderna Nivel 0-1', time: '20:00' },
      { title: 'Kizomba Nivel 1-2 · Sala Sol', time: '21:00' },
      { title: 'Bachata Dominicana Nivel 1-2 · Sala Sombra', time: '21:00' },
      { title: 'Kizomba Flow Fusion Nivel 1-2', time: '22:00' },
    ],
  },
  {
    day: 'Viernes',
    focus: 'Sala Sol / Sala Sombra',
    classes: [
      { title: 'Bachata Moderna Nivel 0', time: '18:00' },
      { title: 'Bachata Dominicana Nivel 1 · Sala Sol', time: '20:00' },
      { title: 'Rueda Casino Nivel 1 · Sala Sombra', time: '20:00' },
      { title: 'Bachata Moderna Nivel 0-1', time: '21:00' },
      { title: 'Forro Starter Session (Hueco libre)', time: '22:00' },
    ],
  },
  {
    day: 'Sabado',
    focus: 'Sala Sol / Sala Sombra',
    classes: [
      { title: 'Taller pre-social', time: '19:00' },
      { title: 'Laboratorio social SBK', time: '20:00' },
      { title: 'Practica guiada en pareja', time: '21:00' },
      { title: 'Noche Social SBK', time: '22:00' },
    ],
  },
  {
    day: 'Domingo',
    focus: 'Sala Sol / Sala Sombra',
    classes: [
      { title: 'Laboratorio tecnico abierto', time: '19:00' },
      { title: 'Sesion de musicalidad + estilo', time: '20:00' },
      { title: 'Practica social guiada', time: '21:00' },
    ],
  },
];

const scheduleData = isSpanishPage ? scheduleDataEs : scheduleDataEn;
const scheduleMemberText = isSpanishPage ? 'Reserva tu plaza →' : 'Reserve Your Spot →';
const scheduleMemberHref = isSpanishPage ? '/es/members/' : '/members/';
const scheduleNewbieText = isSpanishPage ? '¿Nuevo aqui? Reserva tu primera clase →' : 'New here? Book your first class →';
const scheduleNewbieHref = isSpanishPage
  ? 'https://wa.me/34659376099?text=Hola%20Salamanca%20SBK%2C%20quiero%20reservar%20mi%20primera%20clase.'
  : 'https://wa.me/34659376099?text=Hi%20Salamanca%20SBK%2C%20I%20want%20to%20book%20my%20first%20class.';

function cleanScheduleTitle(title) {
  return String(title || '')
    .replace(/\s*·\s*Sol Room$/i, '')
    .replace(/\s*·\s*Sombra Room$/i, '')
    .replace(/\s*·\s*Sala Sol$/i, '')
    .replace(/\s*·\s*Sala Sombra$/i, '')
    .trim();
}

function roomLabelForParallelIndex(index) {
  if (isSpanishPage) {
    return index === 0 ? 'SALA SOL' : 'SALA SOMBRA';
  }
  return index === 0 ? 'ROOM SOL' : 'ROOM SOMBRA';
}

function groupScheduleEntriesByTime(classes) {
  const grouped = [];

  classes.forEach((entry) => {
    const time = String(entry.time || '').trim();
    const normalizedTitle = cleanScheduleTitle(entry.title);

    let group = grouped.find((item) => item.time === time);
    if (!group) {
      group = { time, entries: [] };
      grouped.push(group);
    }

    group.entries.push({ ...entry, title: normalizedTitle });
  });

  return grouped;
}

function renderScheduleCards(dayData) {
  if (!dayPanelEl) return;
  dayPanelEl.innerHTML = '';

  const groupedEntries = groupScheduleEntriesByTime(dayData.classes || []);

  groupedEntries.forEach((group, index) => {
    const card = document.createElement('details');
    card.className = 'schedule-card';
    if (index === 0) {
      card.open = true;
    }

    const courseLinesHtml = group.entries.map((entry, courseIndex) => {
      const roomLabel = roomLabelForParallelIndex(courseIndex);
      const plusHtml = courseIndex < group.entries.length - 1
        ? '<div class="schedule-room-separator" aria-hidden="true">+</div>'
        : '';

      return `
        <div class="schedule-course-line">
          <p class="schedule-name">${entry.title}</p>
          <small class="schedule-room">${roomLabel}</small>
          ${plusHtml}
        </div>
      `;
    }).join('');

    const isFirstOpen = index === 0;
    card.innerHTML = `
      <summary>
        <div>
          <span class="schedule-time">${group.time}</span>
          <div class="schedule-course-stack">${courseLinesHtml}</div>
          <small class="schedule-focus">${dayData.focus}</small>
        </div>
        <span class="schedule-expand">${isFirstOpen ? '−' : '+'}</span>
      </summary>
      <div class="schedule-card-body">
        <div class="schedule-card-actions">
          <a class="button schedule-member-button" href="${scheduleMemberHref}">${scheduleMemberText}</a>
          <a class="button schedule-newbie-button" href="${scheduleNewbieHref}" target="_blank" rel="noopener noreferrer">${scheduleNewbieText}</a>
        </div>
      </div>
    `;

    card.addEventListener('toggle', () => {
      card.querySelector('.schedule-expand').textContent = card.open ? '−' : '+';
    });

    dayPanelEl.appendChild(card);
  });
}

function renderScheduleTabs(activeDay) {
  if (!dayTabsEl) return;
  dayTabsEl.innerHTML = '';

  scheduleData.forEach((day) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = `schedule-day-tab${day.day === activeDay ? ' is-active' : ''}`;
    tab.textContent = day.day;
    tab.addEventListener('click', () => {
      renderScheduleTabs(day.day);
      renderScheduleCards(day);
    });
    dayTabsEl.appendChild(tab);
  });
}

if (dayTabsEl && dayPanelEl) {
  const dayNames = isSpanishPage
    ? ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = dayNames[new Date().getDay()];
  const todayData = scheduleData.find(d => d.day === todayName) || scheduleData[0];
  renderScheduleTabs(todayData.day);
  renderScheduleCards(todayData);
}

const SHOP_WHATSAPP_NUMBER = '34659376099';
const shopCards = document.querySelectorAll('.shop-card');
let shopCustomerProfilePromise = null;

function getKnownSupabaseClient() {
  return window.supabaseClient || window.sbClient || window.membersSupabaseClient || null;
}

async function getShopCustomerProfile() {
  if (shopCustomerProfilePromise) {
    return shopCustomerProfilePromise;
  }

  shopCustomerProfilePromise = (async () => {
    try {
      const cachedProfile = sessionStorage.getItem('sbk_profile');
      if (cachedProfile) {
        const parsed = JSON.parse(cachedProfile);
        if (parsed?.name) {
          return parsed;
        }
      }
    } catch (error) {
      // Ignore cache parsing issues and continue with runtime lookup.
    }

    const client = getKnownSupabaseClient();
    if (!client || typeof client.auth?.getSession !== 'function') {
      return null;
    }

    try {
      const { data: sessionData, error: sessionError } = await client.auth.getSession();
      if (sessionError || !sessionData?.session?.user?.id) {
        return null;
      }

      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('full_name, level')
        .eq('id', sessionData.session.user.id)
        .single();

      if (profileError || !profile?.full_name) {
        return null;
      }

      const resolvedProfile = { name: profile.full_name, level: profile.level };
      sessionStorage.setItem('sbk_profile', JSON.stringify(resolvedProfile));
      return resolvedProfile;
    } catch (error) {
      return null;
    }
  })();

  return shopCustomerProfilePromise;
}

function getSelectedColour(card) {
  return card.querySelector('.swatch.is-selected')?.dataset.colour || '';
}

function setSelectedColour(card, swatch) {
  card.querySelectorAll('.swatch').forEach((button) => {
    const selected = button === swatch;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}

function getQuantity(card) {
  return Number(card.querySelector('.qty-value')?.textContent || '1');
}

function setQuantity(card, quantity) {
  const value = Math.max(1, quantity);
  const qtyValue = card.querySelector('.qty-value');
  if (qtyValue) {
    qtyValue.textContent = String(value);
  }
}

function buildShopMessage({ productName, size, colour, quantity, customerName }) {
  if (isSpanishPage) {
    return [
      'Hola, me gustaria hacer un pedido en Salamanca SBK Shop:',
      `Producto: ${productName}`,
      `Talla: ${size}`,
      `Color: ${colour}`,
      `Cantidad: ${quantity}`,
      `Nombre: ${customerName}`,
    ].join('\n');
  }

  return [
    "Hi, I'd like to order from Salamanca SBK Shop:",
    `Product: ${productName}`,
    `Size: ${size}`,
    `Colour: ${colour}`,
    `Quantity: ${quantity}`,
    `Name: ${customerName}`,
  ].join('\n');
}

shopCards.forEach((card) => {
  const productName = card.dataset.productName || 'Salamanca SBK Shop Item';
  const sizeSelect = card.querySelector('.shop-size');
  const minusBtn = card.querySelector('.qty-minus');
  const plusBtn = card.querySelector('.qty-plus');
  const nameField = card.querySelector('.shop-name-field');
  const nameInput = card.querySelector('.shop-name-input');
  const orderButton = card.querySelector('.shop-order-btn');

  card.querySelectorAll('.swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => setSelectedColour(card, swatch));
  });

  minusBtn?.addEventListener('click', () => {
    setQuantity(card, getQuantity(card) - 1);
  });

  plusBtn?.addEventListener('click', () => {
    setQuantity(card, getQuantity(card) + 1);
  });

  orderButton?.addEventListener('click', async () => {
    const profile = await getShopCustomerProfile();
    let customerName = profile?.name || '';

    if (!customerName) {
      if (nameField) {
        nameField.hidden = false;
      }
      customerName = nameInput?.value.trim() || '';
      if (!customerName) {
        nameInput?.focus();
        return;
      }
    } else if (nameField) {
      nameField.hidden = true;
      if (nameInput) {
        nameInput.value = customerName;
      }
    }

    const message = buildShopMessage({
      productName,
      size: sizeSelect?.value || 'M',
      colour: getSelectedColour(card),
      quantity: getQuantity(card),
      customerName,
    });

    const url = `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  });
});
