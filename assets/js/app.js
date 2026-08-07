const state = {
  site: null,
  categories: [],
  categoryMap: new Map(),
  affiliate: null,
  channel: null,
  allVideos: [],
  videos: [],
  demoMode: false,
  activeCategory: 'all',
  query: '',
  view: 'grid',
  activeVideo: null
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

async function loadJSON(path, fallback) {
  try {
    const response = await fetch(`${path}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn(`Không thể tải ${path}:`, error);
    return fallback;
  }
}

function normalizeText(value = '') {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function formatViews(value) {
  if (value == null || Number.isNaN(Number(value))) return '';
  const n = Number(value);
  return new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(n) + ' lượt xem';
}

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function safeAffiliateUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

function safeImageUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^(?:\.\.?\/|\/)?[a-zA-Z0-9][a-zA-Z0-9_./-]*$/.test(raw)) return raw;
  return '';
}

function getCategory(slug) {
  return state.categoryMap.get(slug) || { slug: slug || 'khac', title: 'Khám phá', emoji: '✨' };
}

function getThumbnail(video) {
  if (video.thumbnail) return `<img src="${escapeHTML(video.thumbnail)}" alt="" loading="lazy" decoding="async">`;
  const category = getCategory(video.primaryCategory);
  return `<div class="demo-thumb" aria-hidden="true"><span>${category.emoji || '✨'}</span></div>`;
}

function videoCard(video, featured = false) {
  const category = getCategory(video.primaryCategory);
  const viewText = formatViews(video.viewCount);
  const dateText = formatDate(video.publishedAt);
  const meta = [dateText, viewText].filter(Boolean).join(' · ');
  const demoBadge = video.demo ? '<span class="demo-badge">MẪU GIAO DIỆN</span>' : '';
  const duration = video.duration ? `<span class="duration">${escapeHTML(video.duration)}</span>` : '';
  const copyClass = featured ? 'video-copy' : 'video-copy';
  const thumb = `<div class="video-thumb">${getThumbnail(video)}${demoBadge}<span class="play-button">▶</span>${duration}</div>`;
  const copy = `<div class="${copyClass}"><span class="video-category">${escapeHTML(category.emoji || '')} ${escapeHTML(category.title)}</span><h3>${escapeHTML(video.title || 'Video 30s Khám Phá')}</h3>${meta ? `<div class="meta-row"><span>${escapeHTML(meta)}</span></div>` : ''}</div>`;
  if (featured) return `${thumb}${copy}`;
  return `<article class="video-card" data-video-id="${escapeHTML(video.id)}" tabindex="0" role="button" aria-label="Xem: ${escapeHTML(video.title || '')}">${thumb}${copy}</article>`;
}

function applySiteConfig() {
  const site = state.site;
  document.title = site.siteName || '30s Khám Phá';
  $('#siteVersion').textContent = site.version || '0.7.0';
  const youtube = site.youtubeUrl || '#';
  ['#headerYoutube','#mobileYoutube','#youtubeChannelLink','#emptyYoutube','#subscribeYoutube','#footerYoutube'].forEach(selector => {
    const el = $(selector); if (el) el.href = youtube;
  });
  if (site.social?.facebook) { $('#footerFacebook').href = site.social.facebook; $('#footerFacebook').hidden = false; }
  if (site.social?.tiktok) { $('#footerTiktok').href = site.social.tiktok; $('#footerTiktok').hidden = false; }
}

function renderMode() {
  const pill = $('#modePill');
  if (state.demoMode) {
    pill.textContent = 'Chờ video đầu tiên · Đang xem bản mẫu';
    pill.classList.remove('live');
  } else {
    pill.textContent = 'Đồng bộ trực tiếp từ YouTube';
    pill.classList.add('live');
  }
  $('#videoCount').textContent = state.demoMode ? '0' : String(state.allVideos.length);
}

function renderChips() {
  const used = new Set(state.allVideos.flatMap(v => v.categories || [v.primaryCategory]).filter(Boolean));
  const source = state.demoMode ? state.categories : state.categories.filter(c => used.has(c.slug));
  const html = [
    `<button class="chip ${state.activeCategory === 'all' ? 'active' : ''}" data-category="all">✨ Tất cả</button>`,
    ...source.map(c => `<button class="chip ${state.activeCategory === c.slug ? 'active' : ''}" data-category="${c.slug}">${escapeHTML(c.emoji || '•')} ${escapeHTML(c.title)}</button>`)
  ].join('');
  $('#categoryChips').innerHTML = html;
  $$('.chip').forEach(button => button.addEventListener('click', () => setCategory(button.dataset.category)));
}

function filterVideos() {
  const query = normalizeText(state.query.trim());
  state.videos = state.allVideos.filter(video => {
    const categoryMatch = state.activeCategory === 'all' || (video.categories || [video.primaryCategory]).includes(state.activeCategory);
    const queryMatch = !query || normalizeText(`${video.title || ''} ${video.description || ''}`).includes(query);
    return categoryMatch && queryMatch;
  });
}

function renderFeatured() {
  const target = $('#featuredVideo');
  const video = state.videos[0] || state.allVideos[0];
  if (!video) {
    target.innerHTML = `<div class="demo-thumb"><span>▶</span></div><div class="video-copy"><span class="video-category">30s Khám Phá</span><h3>Video đầu tiên sẽ xuất hiện tại đây.</h3></div>`;
    return;
  }
  target.dataset.videoId = video.id;
  target.setAttribute('tabindex','0');
  target.setAttribute('role','button');
  target.innerHTML = videoCard(video, true);
}

function renderLatest() {
  const grid = $('#latestGrid');
  grid.classList.toggle('list-view', state.view === 'list');
  const count = state.site.latestCount || 8;
  const items = state.videos.slice(0, count);
  grid.innerHTML = items.map(video => videoCard(video)).join('');
  $('#emptyState').hidden = state.demoMode || items.length > 0;
  grid.hidden = !state.demoMode && items.length === 0;
  bindVideoCards(grid);
}

function renderCategorySections() {
  const root = $('#categorySections');
  if (state.query || state.activeCategory !== 'all') {
    root.innerHTML = '';
    return;
  }
  const source = state.demoMode ? state.categories : state.categories;
  const min = state.site.minVideosPerCategory ?? 1;
  const max = state.site.maxVideosPerSection || 6;
  const sections = [];
  for (const category of source) {
    const videos = state.allVideos.filter(v => (v.categories || [v.primaryCategory]).includes(category.slug));
    if (videos.length < min) continue;
    sections.push(`<section class="category-section" id="cat-${category.slug}"><div class="container"><div class="section-head"><div><p class="eyebrow">${escapeHTML(category.emoji || '')} DANH MỤC</p><h2>${escapeHTML(category.title)}</h2></div><button class="section-link" data-filter-category="${category.slug}">Xem tất cả →</button></div><div class="video-grid">${videos.slice(0,max).map(v => videoCard(v)).join('')}</div></div></section>`);
  }
  root.innerHTML = sections.join('');
  bindVideoCards(root);
  $$('[data-filter-category]', root).forEach(button => button.addEventListener('click', () => {
    setCategory(button.dataset.filterCategory);
    $('#latest').scrollIntoView({ behavior: 'smooth' });
  }));
}

function renderFilterStatus() {
  const active = $('#activeFilter');
  const bits = [];
  if (state.activeCategory !== 'all') bits.push(getCategory(state.activeCategory).title);
  if (state.query) bits.push(`“${state.query}”`);
  if (bits.length) {
    active.hidden = false;
    $('#activeFilterText').textContent = `${state.videos.length} kết quả · ${bits.join(' · ')}`;
  } else {
    active.hidden = true;
  }
}

function affiliateMatchesCategory(item = {}) {
  const categories = Array.isArray(item.categories) ? item.categories.filter(Boolean) : [];
  return state.activeCategory === 'all' || categories.length === 0 || categories.includes(state.activeCategory);
}

function bindAffiliateTracking(root = document) {
  $$('[data-affiliate-id]', root).forEach(link => {
    if (link.dataset.affiliateBound === 'true') return;
    link.dataset.affiliateBound = 'true';
    link.addEventListener('click', () => {
      const detail = {
        affiliateId: link.dataset.affiliateId || '',
        placement: link.dataset.affiliatePlacement || '',
        provider: link.dataset.affiliateProvider || 'Shopee'
      };
      window.dispatchEvent(new CustomEvent('affiliateclick', { detail }));
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: 'affiliate_click', ...detail });
      }
    });
  });
}

function renderAffiliate() {
  const affiliate = state.affiliate || {};
  const provider = affiliate.provider || 'Shopee';
  const globallyEnabled = affiliate.enabled === true;
  const banner = affiliate.banner || {};
  const bannerUrl = globallyEnabled && banner.enabled === true && affiliateMatchesCategory(banner) ? safeAffiliateUrl(banner.url) : '';
  const slot = $('#affiliateA');

  if (bannerUrl) {
    const bannerImage = safeImageUrl(banner.image);
    const bannerId = banner.id || banner.campaignId || 'banner-main';
    const cta = banner.cta || `Xem trên ${provider}`;
    slot.hidden = false;
    slot.innerHTML = `<a class="affiliate-banner${bannerImage ? ' has-image' : ''}" href="${escapeHTML(bannerUrl)}" target="_blank" rel="sponsored nofollow noopener" data-affiliate-id="${escapeHTML(bannerId)}" data-affiliate-placement="banner-after-latest" data-affiliate-provider="${escapeHTML(provider)}"><div class="affiliate-banner-copy"><span class="ad-label">${escapeHTML(banner.label || 'Tiếp thị liên kết')}</span><h3>${escapeHTML(banner.title || '')}</h3><p>${escapeHTML(banner.description || '')}</p></div>${bannerImage ? `<img class="affiliate-banner-image" src="${escapeHTML(bannerImage)}" alt="" loading="lazy" decoding="async">` : ''}<span class="btn btn-primary">${escapeHTML(cta)} ↗</span></a>`;
  } else {
    slot.hidden = true;
    slot.innerHTML = '';
  }

  const maxProducts = Math.max(1, Number(affiliate.settings?.maxProducts || 8));
  const products = globallyEnabled ? (affiliate.products || [])
    .filter(product => product.enabled !== false && affiliateMatchesCategory(product) && safeAffiliateUrl(product.url))
    .slice(0, maxProducts) : [];

  const productSection = $('#affiliateProducts');
  if (products.length) {
    productSection.hidden = false;
    $('#affiliateProductGrid').innerHTML = products.map((product, index) => {
      const url = safeAffiliateUrl(product.url);
      const image = safeImageUrl(product.image);
      const id = product.id || `product-${index + 1}`;
      const price = product.priceLabel || product.price || '';
      const badge = product.badge || '';
      const cta = product.cta || 'Xem sản phẩm';
      return `<a class="product-card" href="${escapeHTML(url)}" target="_blank" rel="sponsored nofollow noopener" data-affiliate-id="${escapeHTML(id)}" data-affiliate-placement="product-grid" data-affiliate-provider="${escapeHTML(provider)}">${image ? `<img src="${escapeHTML(image)}" alt="${escapeHTML(product.title || '')}" loading="lazy" decoding="async">` : '<div class="product-placeholder" aria-hidden="true">🛍️</div>'}<div class="product-card-copy">${badge ? `<span class="product-badge">${escapeHTML(badge)}</span>` : ''}<h3>${escapeHTML(product.title || '')}</h3><div class="product-card-footer">${price ? `<strong>${escapeHTML(price)}</strong>` : '<span></span>'}<span>${escapeHTML(cta)} ↗</span></div></div></a>`;
    }).join('');
  } else {
    productSection.hidden = true;
    $('#affiliateProductGrid').innerHTML = '';
  }

  const disclosure = $('#affiliateDisclosure');
  const hasActiveAffiliate = Boolean(bannerUrl || products.length);
  disclosure.textContent = hasActiveAffiliate ? (affiliate.disclosure || '') : '';
  disclosure.hidden = !hasActiveAffiliate || !affiliate.disclosure;
  bindAffiliateTracking(slot);
  bindAffiliateTracking(productSection);
}

function renderSyncStatus() {
  if (state.demoMode) {
    $('#syncStatus').textContent = 'Kênh chưa có video · giao diện đang dùng dữ liệu mẫu';
    return;
  }
  const syncedAt = state.channel?.syncedAt || null;
  $('#syncStatus').textContent = syncedAt ? `Đồng bộ ${formatDate(syncedAt)}` : 'Dữ liệu YouTube';
}

function renderAll() {
  filterVideos();
  renderMode();
  renderChips();
  renderFeatured();
  renderLatest();
  renderCategorySections();
  renderFilterStatus();
  renderAffiliate();
  renderSyncStatus();
}

function setCategory(slug) {
  state.activeCategory = slug || 'all';
  renderAll();
}

function setQuery(value) {
  state.query = value;
  renderAll();
}

function bindVideoCards(root = document) {
  $$('.video-card', root).forEach(card => {
    const open = () => openVideo(card.dataset.videoId);
    card.addEventListener('click', open);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
    });
  });
}

function openVideo(id) {
  const video = state.allVideos.find(item => item.id === id);
  if (!video) return;
  if (video.demo) {
    showToast('Đây là video mẫu để xem trước giao diện. Video thật sẽ tự xuất hiện sau khi đồng bộ YouTube.');
    return;
  }
  state.activeVideo = video;
  const category = getCategory(video.primaryCategory);
  $('#modalTitle').textContent = video.title || '';
  $('#modalCategory').textContent = `${category.emoji || ''} ${category.title}`;
  $('#modalYoutubeLink').href = video.url || `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;
  $('#playerWrap').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&rel=0" title="${escapeHTML(video.title || 'YouTube video')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  const modal = $('#videoModal');
  modal.showModal();
  document.body.classList.add('modal-open');
}

function closeVideo() {
  const modal = $('#videoModal');
  if (modal.open) modal.close();
  $('#playerWrap').innerHTML = '';
  state.activeVideo = null;
  document.body.classList.remove('modal-open');
}

async function shareActiveVideo() {
  const video = state.activeVideo;
  if (!video) return;
  const url = video.url || `https://www.youtube.com/watch?v=${video.id}`;
  try {
    if (navigator.share) await navigator.share({ title: video.title, url });
    else { await navigator.clipboard.writeText(url); showToast('Đã sao chép liên kết video.'); }
  } catch (error) {
    if (error.name !== 'AbortError') showToast('Không thể chia sẻ liên kết.');
  }
}

let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function bindUI() {
  $('#searchToggle').addEventListener('click', () => {
    const panel = $('#searchPanel');
    panel.hidden = !panel.hidden;
    $('#searchToggle').setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) $('#searchInput').focus();
  });
  $('#searchInput').addEventListener('input', event => setQuery(event.target.value));
  $('#searchClear').addEventListener('click', () => { $('#searchInput').value = ''; setQuery(''); $('#searchInput').focus(); });
  $('#clearFilter').addEventListener('click', () => { state.activeCategory = 'all'; state.query = ''; $('#searchInput').value = ''; renderAll(); });

  $('#menuToggle').addEventListener('click', () => {
    const nav = $('#mobileNav');
    nav.hidden = !nav.hidden;
    $('#menuToggle').setAttribute('aria-expanded', String(!nav.hidden));
  });
  $$('#mobileNav a').forEach(link => link.addEventListener('click', () => { $('#mobileNav').hidden = true; $('#menuToggle').setAttribute('aria-expanded','false'); }));

  $('#gridView').addEventListener('click', () => { state.view = 'grid'; $('#gridView').classList.add('active'); $('#listView').classList.remove('active'); renderLatest(); });
  $('#listView').addEventListener('click', () => { state.view = 'list'; $('#listView').classList.add('active'); $('#gridView').classList.remove('active'); renderLatest(); });

  $('#featuredVideo').addEventListener('click', () => openVideo($('#featuredVideo').dataset.videoId));
  $('#featuredVideo').addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && $('#featuredVideo').dataset.videoId) { event.preventDefault(); openVideo($('#featuredVideo').dataset.videoId); }
  });
  $('#modalClose').addEventListener('click', closeVideo);
  $('#videoModal').addEventListener('click', event => { if (event.target === $('#videoModal')) closeVideo(); });
  $('#videoModal').addEventListener('close', () => { $('#playerWrap').innerHTML = ''; document.body.classList.remove('modal-open'); });
  $('#shareVideo').addEventListener('click', shareActiveVideo);

  $('#backTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => $('#backTop').classList.toggle('show', window.scrollY > 650), { passive: true });
  $('#year').textContent = new Date().getFullYear();
}

async function init() {
  bindUI();
  const [site, categories, videoData, demoVideos, affiliate, channel] = await Promise.all([
    loadJSON('config/site.json', {}),
    loadJSON('data/categories.json', []),
    loadJSON('data/videos.json', { videos: [] }),
    loadJSON('data/demo-videos.json', []),
    loadJSON('data/affiliate.json', {}),
    loadJSON('data/channel.json', {})
  ]);

  state.site = site;
  state.categories = categories;
  state.categoryMap = new Map(categories.map(category => [category.slug, category]));
  state.affiliate = affiliate;
  state.channel = { ...channel, syncedAt: videoData.syncedAt || channel.syncedAt };
  state.demoMode = (!videoData.videos || videoData.videos.length === 0) && site.demoWhenEmpty !== false;
  state.allVideos = state.demoMode ? demoVideos : (videoData.videos || []);

  applySiteConfig();
  renderAll();
}

init();
