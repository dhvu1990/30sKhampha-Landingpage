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
    let detail = null;
    try { detail = JSON.parse(body); } catch {}
    const error = new Error(`YouTube API ${response.status}: ${body}`);
    error.status = response.status;
    error.reason = detail?.error?.errors?.[0]?.reason || null;
    error.apiMessage = detail?.error?.message || null;
    throw error;
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

function isPlaylistNotFound(error) {
  return error?.status === 404 && error?.reason === 'playlistNotFound';
}

async function paginatePlaylistItems(params, maxItems = Infinity, label = 'playlist') {
  try {
    return await paginate('playlistItems', params, maxItems);
  } catch (error) {
    if (isPlaylistNotFound(error)) {
      console.warn(`Bỏ qua ${label}: playlist chưa tồn tại hoặc chưa khả dụng (${params.playlistId}).`);
      return [];
    }
    throw error;
  }
}

function slugify(value = '') {
  return value.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalized(value = '') {
  return slugify(value).replace(/-/g, ' ').trim();
}

const categoryNameMap = new Map();
for (const category of categoryConfig) {
  for (const candidate of [category.title, ...(category.aliases || [])]) {
    const key = normalized(candidate);
    if (key) categoryNameMap.set(key, category.slug);
  }
}

function resolveCategory(playlistTitle) {
  return categoryNameMap.get(normalized(playlistTitle)) || null;
}

function parseDuration(iso = '') {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = Number(match[1] || 0);
  const m = Number(match[2] || 0);
  const s = Number(match[3] || 0);
  return `${h * 60 + m}:${String(s).padStart(2, '0')}`;
}

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}

function sameData(a, b) {
  return JSON.stringify(stable(a)) === JSON.stringify(stable(b));
}

async function readJSON(filePath, fallback) {
  try { return JSON.parse(await fs.readFile(filePath, 'utf8')); } catch { return fallback; }
}

const channelData = await youtube('channels', { part: 'id,snippet,contentDetails,statistics', forHandle: handle });
const channel = channelData.items?.[0];
if (!channel) throw new Error(`Không tìm thấy channel theo handle ${handle}.`);

const channelId = channel.id;
const uploadsPlaylist = channel.contentDetails?.relatedPlaylists?.uploads || '';
let uploadItems = [];
if (uploadsPlaylist) {
  uploadItems = await paginatePlaylistItems({ part: 'snippet,contentDetails,status', playlistId: uploadsPlaylist }, 250, `uploads playlist của ${handle}`);
} else {
  console.warn(`Channel ${handle} chưa có uploads playlist khả dụng. Tiếp tục với 0 video.`);
}

const playlistResources = await paginate('playlists', { part: 'id,snippet,contentDetails,status', channelId }, 250);
const categoryMembership = new Map();
const recognizedPlaylists = [];
const ignoredPlaylists = [];

for (const playlist of playlistResources) {
  const playlistTitle = playlist.snippet?.title || '';
  const slug = resolveCategory(playlistTitle);
  if (!slug) {
    ignoredPlaylists.push(playlistTitle || playlist.id);
    console.warn(`Playlist ngoài taxonomy, bỏ qua: "${playlistTitle || playlist.id}".`);
    continue;
  }

  recognizedPlaylists.push({ id: playlist.id, title: playlistTitle, slug });
  const items = await paginatePlaylistItems({ part: 'contentDetails,status', playlistId: playlist.id }, 250, `playlist "${playlistTitle}"`);
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
  const data = await youtube('videos', { part: 'id,snippet,contentDetails,statistics,status', id: ids.join(',') });
  for (const video of data.items || []) detailMap.set(video.id, video);
}

const videos = uploadIds
  .map(id => detailMap.get(id))
  .filter(Boolean)
  .filter(video => video.status?.privacyStatus === 'public')
  .map(video => {
    const categories = [...(categoryMembership.get(video.id) || [])];
    if (!categories.length) {
      console.warn(`Video public chưa thuộc 1 trong 8 playlist chuẩn, bỏ qua website: ${video.id} — ${video.snippet?.title || ''}`);
      return null;
    }
    const primaryCategory = categories[0];
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
      categories,
      primaryCategory,
      url: `https://www.youtube.com/watch?v=${video.id}`
    };
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

const videosPath = path.join(root, 'data/videos.json');
const channelPath = path.join(root, 'data/channel.json');
const previousVideos = await readJSON(videosPath, { syncedAt: null, channelId: null, videos: [] });
const previousChannel = await readJSON(channelPath, {});

const nextVideosCore = { channelId, videos };
const nextChannelCore = {
  id: channelId,
  title: channel.snippet?.title || site.siteName,
  handle,
  thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || '',
  subscriberCount: channel.statistics?.hiddenSubscriberCount ? null : Number(channel.statistics?.subscriberCount || 0),
  videoCount: Number(channel.statistics?.videoCount || 0),
  viewCount: Number(channel.statistics?.viewCount || 0)
};

const previousVideosCore = { channelId: previousVideos.channelId ?? null, videos: previousVideos.videos || [] };
const { syncedAt: _previousChannelSyncedAt, ...previousChannelCore } = previousChannel;
const videosChanged = !sameData(previousVideosCore, nextVideosCore);
const channelChanged = !sameData(previousChannelCore, nextChannelCore);

console.log(`Taxonomy: ${recognizedPlaylists.length}/8 playlist chuẩn được nhận diện.`);
if (ignoredPlaylists.length) console.warn(`Playlist ngoài taxonomy: ${ignoredPlaylists.join(' | ')}`);

if (!videosChanged && !channelChanged) {
  console.log(`Không có thay đổi YouTube cho ${channel.snippet?.title || handle}. Không ghi lại JSON.`);
  process.exit(0);
}

const syncedAt = new Date().toISOString();
if (videosChanged) await fs.writeFile(videosPath, JSON.stringify({ syncedAt, ...nextVideosCore }, null, 2) + '\n');
if (channelChanged || videosChanged) await fs.writeFile(channelPath, JSON.stringify({ syncedAt, ...nextChannelCore }, null, 2) + '\n');

console.log(`Đồng bộ xong ${videos.length} video hợp lệ từ ${channel.snippet?.title || handle}. Dữ liệu đã thay đổi.`);
