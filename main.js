// 看板配置
const DASHBOARDS = {
  weekly: [
    { id: 'core-weekly',          name: '核心数据', path: '核心数据看板（周度）/index.html' },
    { id: 'user-growth-weekly',   name: '用户增长', path: '用户增长数据看板（周度）/user-growth-dashboard.html' },
    { id: 'search-weekly',        name: '搜索数据', path: '搜索数据看板（周度）/index.html' },
    { id: 'user-behavior-weekly', name: '用户行为', path: 'user-behavior.html' },
  ],
  monthly: [
    { id: 'core-monthly',         name: '核心数据', path: '核心数据看板（月度）/index-static.html' },
    { id: 'penetration-monthly',  name: '各模块渗透率', path: '各模块渗透率看板（月度）/index.html' },
    { id: 'province-monthly',     name: '分省数据', path: '分省数据看板（月度）/index.html' },
  ],
};

let currentPeriod = 'weekly';

// 门户启动时刻；所有子看板 iframe URL 共用同一份 cache-buster，
// 仅在重新打开/刷新门户时变化，避免子看板 HTML 被浏览器长期缓存而看不到样式更新。
const PORTAL_BUILD = Date.now();

// 将相对路径转为可用于 iframe src 的路径
function resolvePath(relativePath) {
  if (relativePath.startsWith('http')) return relativePath;
  const base = window.location.protocol === 'file:'
    ? relativePath
    : '/' + relativePath.replace(/^\.\//, '');
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}v=${PORTAL_BUILD}`;
}

// 渲染加载中
function showLoading(container) {
  container.innerHTML = `
    <div class="portal-loading">
      <span class="portal-spinner" aria-hidden="true"></span>
      <span class="portal-loading-text">正在加载看板…</span>
    </div>`;
}

// 渲染错误
function showError(container, path) {
  container.innerHTML = `
    <div class="portal-error">
      <span class="portal-error-icon">📭</span>
      <p class="portal-error-title">看板加载失败</p>
      <p class="portal-error-desc">文件路径可能不存在，请检查目录结构。</p>
      <a class="portal-error-link" href="${path}" target="_blank" rel="noopener">尝试直接打开 →</a>
    </div>`;
}

// 加载看板（iframe）
function prefetchSearchDashboardAssets() {
  const base = '/搜索数据看板（周度）/data/';
  fetch(base + 'manifest.json')
    .then((r) => (r.ok ? r.json() : null))
    .then((m) => {
      if (!m || !m.latestWeek) return;
      const v = m.dataVersion || '';
      ['dashboard-core.json', `keywords-${m.latestWeek}.json`].forEach((file) => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `${base}${file}?v=${v}`;
        document.head.appendChild(link);
      });
    })
    .catch(() => { /* 忽略预取失败 */ });
}

function loadDashboard(period, id) {
  const config = DASHBOARDS[period].find(d => d.id === id);
  const container = document.getElementById('dashboardContainer');
  if (!config) { showError(container, '#'); return; }

  if (id === 'search-weekly') prefetchSearchDashboardAssets();

  showLoading(container);

  const src = resolvePath(config.path);

  // 短暂延迟避免闪烁
  setTimeout(() => {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.className = 'portal-frame';
    iframe.title = config.name;
    iframe.setAttribute('loading', 'lazy');
    iframe.onerror = () => showError(container, src);
    container.innerHTML = '';
    container.appendChild(iframe);
  }, 200);
}

// 更新下拉选项
function updateSelect(period) {
  const select = document.getElementById('dashboardType');
  select.innerHTML = DASHBOARDS[period]
    .map(d => `<option value="${d.id}">${d.name}</option>`)
    .join('');
}

// 切换周期
function switchPeriod(period) {
  if (period === currentPeriod) return;
  currentPeriod = period;

  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.period === period);
  });

  updateSelect(period);
  loadDashboard(period, DASHBOARDS[period][0].id);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => switchPeriod(btn.dataset.period));
  });

  document.getElementById('dashboardType').addEventListener('change', function () {
    loadDashboard(currentPeriod, this.value);
  });

  loadDashboard(currentPeriod, DASHBOARDS[currentPeriod][0].id);
});
