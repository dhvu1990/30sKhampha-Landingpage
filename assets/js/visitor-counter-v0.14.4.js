const COUNTER_CONFIG_URL = 'config/site.json';
const SESSION_KEY = '30skhampha-visit-counted';

function formatCount(value) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0) return '';
  return new Intl.NumberFormat('vi-VN').format(count);
}

async function initVisitorCounter() {
  const root = document.querySelector('#visitorCounter');
  const valueNode = document.querySelector('#visitorCounterValue');
  if (!root || !valueNode) return;

  try {
    const configResponse = await fetch(`${COUNTER_CONFIG_URL}?v=${Date.now()}`, { cache: 'no-store' });
    if (!configResponse.ok) return;
    const site = await configResponse.json();
    const counter = site.visitorCounter || {};
    const endpoint = String(counter.endpoint || '').trim();
    if (counter.enabled !== true || !/^https:\/\//i.test(endpoint)) return;

    const alreadyCounted = sessionStorage.getItem(SESSION_KEY) === '1';
    const method = alreadyCounted ? 'GET' : 'POST';
    const response = await fetch(endpoint, {
      method,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return;

    const data = await response.json();
    const formatted = formatCount(data.count);
    if (!formatted) return;

    if (!alreadyCounted) sessionStorage.setItem(SESSION_KEY, '1');
    valueNode.textContent = formatted;
    root.hidden = false;
  } catch (error) {
    console.warn('Không thể tải bộ đếm lượt truy cập:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVisitorCounter, { once: true });
} else {
  initVisitorCounter();
}
