import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const apiKey = process.env.YOUTUBE_API_KEY;
if (!apiKey) throw new Error('Thiếu biến môi trường YOUTUBE_API_KEY.');

const site = JSON.parse(await fs.readFile(path.join(root, 'config/site.json'), 'utf8'));
const categoryConfig = JSON.parse(await fs.readFile(path.join(root, 'data/categories.json'), 'utf8'));
const handle = site.youtubeHandle;
if (!handle) throw new Error('Thiếu youtubeHandle trong config/site.json.');

const API = 'https://www.googleapis.com/youtube/v3';

async function youtube(endpoint, params) {
  const url = new URL(`${API}/${endpoint}`);
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YouTube API ${response.status}: ${body}`);
  }
  return response.json();
}

async function paginate(endpoint, params, maxItems = Infinity) {
  const items = [];
  let pageToken = '';
  do {
    const data = await youtube(endpoint, { ...params, maxResults: 50, pageToken: pageToken || undefined });
    items.push(...(data.items || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken && items.length < maxItems);
  return items.slice(0, maxItems);
}

function slugify(value = '') {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalized(value = '') {
  return slugify(value).replace(/-/g, ' ');
}

function resolveCategory(playlistTitle) {
  const name = normalized(playlistTitle);
  for (const category of categoryConfig) {
    const candidates = [category.title, ...(category.aliases || [])].map(normalized);
    if (candidates.some(alias => alias && (name.includes(alias) || alias.includes(name)))) return category.slug;
  }
  return slugify(playlistTitle) || 'khac';
}

function parseDuration(iso = '') {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = Number(match[1] || 0);
  const m = Number(match[2] || 0);
  const s = Number(match[3] || 0);
  const totalMinutes = h * 60 + m;
  return `${totalMinutes}:${String(s).padStart(2, '0')}`;
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

const channelData = await youtube('channels', {
  part: 'id,snippet,contentDetails,statistics',
  forHandle: handle
});
const channel = channelData.items?.[0];
if (!channel) throw new Error(`Không tìm thấy channel theo handle ${handle}.`);

const channelId = channel.id;
const uploadsPlaylist = channel.contentDetails?.relatedPlaylists?.uploads;
if (!uploadsPlaylist) throw new Error('Không tìm thấy uploads playlist của channel.');

const uploadItems = await paginate('playlistItems', {
  part: 'snippet,contentDetails,status',
  playlistId: uploadsPlaylist
}, 250);

const playlistResources = await paginate('playlists', {
  part: 'id,snippet,contentDetails,status',
  channelId
}, 250);

const categoryMembership = new Map();
const generatedCategories = [];
for (const playlist of playlistResources) {
  const playlistTitle = playlist.snippet?.title || 'Khám phá';
  const slug = resolveCategory(playlistTitle);
  if (!categoryConfig.some(c => c.slug === slug) && !generatedCategories.some(c => c.slug === slug)) {
    generatedCategories.push({ slug, title: playlistTitle, emoji: '✨', aliases: [] });
  }
  const items = await paginate('playlistItems', {
    part: 'contentDetails,status',
    playlistId: playlist.id
  }, 250);
  for (const item of items) {
    const videoId = item.contentDetails?.videoId;
    if (!videoId) continue;
    const current = categoryMembership.get(videoId) || new Set();
    current.add(slug);
    categoryMembership.set(videoId, current);
  }
}

const uploadIds = uploadItems.map(item => item.contentDetails?.videoId).filter(Boolean);
const detailMap = new Map();
for (const ids of chunk(uploadIds, 50)) {
  const data = await youtube('videos', {
    part: 'id,snippet,contentDetails,statistics,status',
    id: ids.join(',')
  });
  for (const video of data.items || []) detailMap.set(video.id, video);
}

const fallbackCategory = 'top-su-that-nhanh';
const videos = uploadIds.map(id => detailMap.get(id)).filter(Boolean).filter(video => video.status?.privacyStatus === 'public').map(video => {
  const categories = [...(categoryMembership.get(video.id) || [])];
  const primaryCategory = categories[0] || fallbackCategory;
  const thumbs = video.snippet?.thumbnails || {};
  const thumbnail = thumbs.maxres?.url || thumbs.standard?.url || thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || '';
  return {
    id: video.id,
    title: video.snippet?.title || '',
    description: video.snippet?.description || '',
    publishedAt: video.snippet?.publishedAt || null,
    thumbnail,
    duration: parseDuration(video.contentDetails?.duration || ''),
    viewCount: Number(video.statistics?.viewCount || 0),
    likeCount: video.statistics?.likeCount != null ? Number(video.statistics.likeCount) : null,
    categories: categories.length ? categories : [primaryCategory],
    primaryCategory,
    url: `https://www.youtube.com/watch?v=${video.id}`
  };
}).sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));

const syncedAt = new Date().toISOString();
await fs.writeFile(path.join(root, 'data/videos.json'), JSON.stringify({ syncedAt, channelId, videos }, null, 2) + '\n');
await fs.writeFile(path.join(root, 'data/channel.json'), JSON.stringify({
  syncedAt,
  id: channelId,
  title: channel.snippet?.title || site.siteName,
  handle,
  thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || '',
  subscriberCount: channel.statistics?.hiddenSubscriberCount ? null : Number(channel.statistics?.subscriberCount || 0),
  videoCount: Number(channel.statistics?.videoCount || videos.length),
  viewCount: Number(channel.statistics?.viewCount || 0)
}, null, 2) + '\n');

if (generatedCategories.length) {
  const merged = [...categoryConfig, ...generatedCategories];
  await fs.writeFile(path.join(root, 'data/categories.json'), JSON.stringify(merged, null, 2) + '\n');
}

console.log(`Đồng bộ xong ${videos.length} video từ ${channel.snippet?.title || handle}.`);
