const VIDEO_DATA_URL = 'data/videos.json';
const MAX_LINKS_PER_VIDEO = 3;

let videoMap = new Map();

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function safeShopeeUrl(value = '') {
  const raw = String(value || '').trim().replace(/[),.;!?]+$/g, '');
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    const host = url.hostname.toLowerCase();
    const allowed = host === 'shopee.vn' || host.endsWith('.shopee.vn') || host === 'shope.ee' || host.endsWith('.shope.ee');
    return allowed ? url.href : '';
  } catch {
    return '';
  }
}

function cleanLabel(value = '') {
  return String(value)
    .trim()
    .replace(/^[🛒🔗👉📦✨⭐️💡•\-–—\s]+/u, '')
    .replace(/[:：]\s*$/u, '')
    .trim()
    .slice(0, 120);
}

function extractShopeeLinks(description = '') {
  const lines = String(description || '').split(/\r?\n/);
  const links = [];
  const seen = new Set();
  const urlPattern = /https?:\/\/[^\s<>"']+/g;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const matches = lines[lineIndex].match(urlPattern) || [];
    for (const match of matches) {
      const url = safeShopeeUrl(match);
      if (!url || seen.has(url)) continue;
      seen.add(url);

      let label = '';
      for (let lookback = lineIndex - 1; lookback >= Math.max(0, lineIndex - 3); lookback -= 1) {
        const candidate = lines[lookback].trim();
        if (!candidate || /^https?:\/\//i.test(candidate) || candidate.startsWith('#')) continue;
        label = cleanLabel(candidate);
        if (label) break;
      }

      links.push({
        provider: 'Shopee',
        url,
        label: label || 'Sản phẩm liên quan trong video'
      });
      if (links.length >= MAX_LINKS_PER_VIDEO) return links;
    }
  }

  return links;
}

function getActiveVideoId() {
  const link = document.querySelector('#modalYoutubeLink');
  if (!link?.href) return '';
  try {
    const url = new URL(link.href, window.location.href);
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v') || '';
    if (url.hostname === 'youtu.be') return url.pathname.replace(/^\//, '');
  } catch {}
  return '';
}

function trackAffiliateClick(videoId, index) {
  const detail = {
    affiliateId: `${videoId}-shopee-${index + 1}`,
    placement: 'video-modal',
    provider: 'Shopee',
    videoId
  };
  window.dispatchEvent(new CustomEvent('affiliateclick', { detail }));
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: 'affiliate_click', ...detail });
  }
}

function renderVideoAffiliate(videoId) {
  const root = document.querySelector('#modalAffiliate');
  if (!root) return;

  const video = videoMap.get(videoId);
  const links = video ? extractShopeeLinks(video.description) : [];
  if (!links.length) {
    root.hidden = true;
    root.innerHTML = '';
    return;
  }

  root.hidden = false;
  root.innerHTML = `
    <div class="video-affiliate-head">
      <div>
        <span class="ad-label">Tiếp thị liên kết</span>
        <strong>🛍️ Sản phẩm liên quan trong video</strong>
      </div>
      <small>Mua qua liên kết có thể giúp 30s Khám Phá nhận hoa hồng, giá của bạn không tăng.</small>
    </div>
    <div class="video-affiliate-links">
      ${links.map((item, index) => `
        <a href="${escapeHTML(item.url)}" target="_blank" rel="sponsored nofollow noopener" data-video-affiliate-index="${index}">
          <span>${escapeHTML(item.label)}</span>
          <b>Xem trên Shopee ↗</b>
        </a>
      `).join('')}
    </div>`;

  root.querySelectorAll('[data-video-affiliate-index]').forEach(link => {
    link.addEventListener('click', () => {
      trackAffiliateClick(videoId, Number(link.dataset.videoAffiliateIndex || 0));
    });
  });
}

async function loadVideoData() {
  try {
    const response = await fetch(`${VIDEO_DATA_URL}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const data = await response.json();
    videoMap = new Map((data.videos || []).map(video => [video.id, video]));

    const dialog = document.querySelector('#videoModal');
    if (dialog?.open) renderVideoAffiliate(getActiveVideoId());
  } catch (error) {
    console.warn('Không thể tải dữ liệu affiliate theo video:', error);
  }
}

function initVideoAffiliate() {
  const dialog = document.querySelector('#videoModal');
  const root = document.querySelector('#modalAffiliate');
  if (!dialog || !root) return;

  const observer = new MutationObserver(() => {
    if (dialog.open) renderVideoAffiliate(getActiveVideoId());
    else {
      root.hidden = true;
      root.innerHTML = '';
    }
  });
  observer.observe(dialog, { attributes: true, attributeFilter: ['open'] });

  loadVideoData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoAffiliate, { once: true });
} else {
  initVideoAffiliate();
}
