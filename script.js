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

    card.innerHTML = `
      <summary>
        <div>
          <span class="schedule-time">${entry.time}</span>
          <p class="schedule-name">${entry.title}</p>
          <small class="schedule-focus">${dayData.focus}</small>
        </div>
        <span class="schedule-expand">+</span>
      </summary>
      <div class="schedule-card-body">
        <p>This week's focus: coming soon</p>
        <p>Full video curriculum available in the Members Area</p>
        <a class="button secondary schedule-member-button" href="https://salamancasbk.es/members/" target="_blank" rel="noopener noreferrer">Open Members Area →</a>
      </div>
    `;

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
  const initialDay = scheduleData[0];
  renderScheduleTabs(initialDay.day);
  renderScheduleCards(initialDay);
}
