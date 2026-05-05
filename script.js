const menuToggle = document.getElementById('menu-toggle');
const siteNav = document.getElementById('site-nav');

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

const dayTabsEl = document.getElementById('schedule-day-tabs');
const dayPanelEl = document.getElementById('schedule-day-panel');

const scheduleData = [
  {
    day: 'Monday',
    focus: 'Salsa Core',
    classes: [
      { title: 'Salsa Beginner', time: '18:00' },
      { title: 'Salsa Intermediate', time: '19:30' },
    ],
  },
  {
    day: 'Tuesday',
    focus: 'Bachata Core',
    classes: [
      { title: 'Bachata Beginner', time: '18:00' },
      { title: 'Bachata Intermediate', time: '19:30' },
    ],
  },
  {
    day: 'Wednesday',
    focus: 'Kizomba + Zouk',
    classes: [
      { title: 'Kizomba Beginner', time: '18:00' },
      { title: 'Kizomba Intermediate', time: '19:30' },
      { title: 'Zouk Dedicated Session', time: '21:00' },
    ],
  },
  {
    day: 'Thursday',
    focus: 'Salsa + Tango',
    classes: [
      { title: 'Salsa Partnerwork', time: '18:30' },
      { title: 'Tango Dedicated Session', time: '20:00' },
    ],
  },
  {
    day: 'Friday',
    focus: 'Social + Forro',
    classes: [
      { title: 'Forro Dedicated Session', time: '19:30' },
      { title: 'SBK Social Practice', time: '21:00' },
    ],
  },
];

function renderScheduleCards(dayData) {
  if (!dayPanelEl) return;
  dayPanelEl.innerHTML = '';

  dayData.classes.forEach((entry, index) => {
    const card = document.createElement('details');
    card.className = 'schedule-card';
    if (index === 0) {
      card.open = true;
    }

    const isFirstOpen = index === 0;
    card.innerHTML = `
      <summary>
        <div>
          <span class="schedule-time">${entry.time}</span>
          <p class="schedule-name">${entry.title}</p>
          <small class="schedule-focus">${dayData.focus}</small>
        </div>
        <span class="schedule-expand">${isFirstOpen ? '−' : '+'}</span>
      </summary>
      <div class="schedule-card-body">
        <p>This week's focus: coming soon</p>
        <p>Full video curriculum available in the Members Area</p>
        <a class="button schedule-member-button" href="https://salamancasbk.es/members/" target="_blank" rel="noopener noreferrer">Reserve Your Spot →</a>
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
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
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
