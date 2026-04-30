// ===== THEME MANAGEMENT =====
function getResolvedTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-resolved-theme', theme);
}

function initTheme() {
  const theme = getResolvedTheme();
  applyTheme(theme);
}

function toggleTheme() {
  const current = getResolvedTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

// ===== RENDER FUNCTIONS =====
function renderLinkCard(link) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = link.id;

  card.innerHTML = `
    <div class="card-header">
      <div class="card-image-wrap">
        <img class="card-image" src="${link.image}" alt="${link.title}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%222%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22/><path d=%22M9 9h6M9 12h6M9 15h4%22/></svg>'" />
        <span class="card-order">${link.order}</span>
      </div>
      <button class="card-favorite ${link.favorite ? 'active' : ''}" data-id="${link.id}" aria-label="Toggle favorite">
        ${link.favorite ? '★' : '☆'}
      </button>
    </div>
    <div class="card-title">${link.title}</div>
    <div class="card-description">${link.description}</div>
    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="card-cta">Open →</a>
  `;

  card.querySelector('.card-favorite').addEventListener('click', (e) => {
    e.preventDefault();
    const btn = e.currentTarget;
    const isActive = btn.classList.toggle('active');
    btn.textContent = isActive ? '★' : '☆';
  });

  return card;
}

function renderStockWidget(widget) {
  const el = document.createElement('div');
  el.className = `widget widget-${widget.size}`;

  const rows = widget.data.map(item => {
    const isPositive = item.change.startsWith('+');
    return `
      <div class="stock-item">
        <span class="stock-ticker">${item.ticker}</span>
        <span class="stock-price">$${Number(item.price).toFixed(2)}</span>
        <span class="stock-change ${isPositive ? 'positive' : 'negative'}">${item.change}</span>
      </div>
    `;
  }).join('');

  el.innerHTML = `
    <div class="widget-title">${widget.title}</div>
    <div class="stock-list">${rows}</div>
  `;

  return el;
}

function renderNewsWidget(widget) {
  const el = document.createElement('div');
  el.className = `widget widget-${widget.size}`;

  const items = widget.data.map(item => `
    <div class="news-item">
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="news-headline">${item.headline}</a>
      <span class="news-source">${item.source}</span>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="widget-title">${widget.title}</div>
    <div class="news-list">${items}</div>
  `;

  return el;
}

function renderWidget(widget) {
  if (widget.type === 'stock') return renderStockWidget(widget);
  if (widget.type === 'news') return renderNewsWidget(widget);
  return null;
}

// ===== DATA FETCHING & RENDERING =====
async function fetchAndRender() {
  try {
    const [linksRes, widgetsRes] = await Promise.all([
      fetch('/api/links'),
      fetch('/api/widgets')
    ]);

    if (linksRes.status === 401 || widgetsRes.status === 401) {
      window.location.href = '/login';
      return;
    }

    const links = await linksRes.json();
    const widgets = await widgetsRes.json();

    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    // Render link cards
    links.forEach(link => grid.appendChild(renderLinkCard(link)));

    // Render widgets
    widgets.forEach(widget => {
      const el = renderWidget(widget);
      if (el) grid.appendChild(el);
    });
  } catch (err) {
    console.error('Failed to fetch data:', err);
  }
}

// ===== AUTO-REFRESH =====
let refreshInterval = 5000;
let countdown = 5;
let countdownTimer = null;
let refreshTimer = null;

function updateRefreshLabel() {
  const label = document.getElementById('refreshLabel');
  const dot = document.querySelector('.refresh-dot');
  if (label) label.textContent = `Refreshing in ${countdown}s`;
  if (countdown <= 0) {
    if (dot) dot.classList.add('refreshing');
  } else {
    if (dot) dot.classList.remove('refreshing');
  }
}

function startRefreshLoop(interval) {
  refreshInterval = interval;
  countdown = Math.round(interval / 1000);

  clearInterval(countdownTimer);
  clearTimeout(refreshTimer);

  countdownTimer = setInterval(() => {
    countdown--;
    if (countdown < 0) countdown = 0;
    updateRefreshLabel();
  }, 1000);

  function scheduleRefresh() {
    refreshTimer = setTimeout(async () => {
      countdown = 0;
      updateRefreshLabel();
      await fetchAndRender();
      countdown = Math.round(refreshInterval / 1000);
      updateRefreshLabel();
      scheduleRefresh();
    }, interval);
  }

  scheduleRefresh();
}

// ===== USER INFO =====
async function loadUserInfo() {
  try {
    const res = await fetch('/api/user');
    if (!res.ok) return;
    const user = await res.json();

    const avatar = document.getElementById('userAvatar');
    const name = document.getElementById('userName');

    if (avatar && user.avatar) {
      avatar.src = user.avatar;
      avatar.alt = user.name;
    } else if (avatar) {
      avatar.style.display = 'none';
    }

    if (name) name.textContent = user.name;
  } catch (err) {
    console.error('Failed to load user info:', err);
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();

  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  await loadUserInfo();
  await fetchAndRender();

  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const cfg = await res.json();
      startRefreshLoop(cfg.refreshInterval || 5000);
    } else {
      startRefreshLoop(5000);
    }
  } catch {
    startRefreshLoop(5000);
  }
});
