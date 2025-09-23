/**
 * Wasteback Machine v1.0.10
 * Measure the environmental impact of the past web
 *
 * Author: Overbrowsing Research Group
 * Website: https://overbrowsing.com
 * License: Apache 2.0
 */

import { JSDOM } from "jsdom";

// Fetch with retry logic to handle flaky requests
async function fetchWithRetry(url, options = {}, retries = 3) {
  let error;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      error = new Error(`Non-OK response: ${res.status}`);
    } catch (err) {
      error = err;
    }
    await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
  }
  throw error;
}

// Asset categories
const CATEGORIES = [
  "html", "css", "js", "image", "video", "audio", "font", "flash", "plugin", "data", "other"
];

// Define asset categories by extension
const EXT_GROUPS = {
  css: ["css"],
  js: ["js","mjs","ts","jsx","tsx"],
  image: ["png","jpg","jpeg","gif","webp","avif","bmp","ico","tiff","tif","svg","apng","heic","heif","jp2","j2k","dds"],
  video: ["mp4","webm","ogv","m4v","mkv","mov","avi","flv","m2v","ts","rmvb","rm","f4v","f4p","f4a","f4b"],
  audio: ["mp3","wav","ogg","oga","aac","m4a","flac","opus","mid","midi","ra","ram","aif","aiff","au"],
  font: ["woff","woff2","ttf","otf","eot","pfa","pfb"],
  flash: ["swf"],
  plugin: ["jar","class","xap","unity3d","dcr","dir","cab","ocx"],
  data: ["json","xml","pdf","zip","tar","7z","wasm","map"]
};

const TYPE_REGISTRY_EXT = Object.fromEntries(
  Object.entries(EXT_GROUPS)
        .flatMap(([cat, exts]) => exts.map(ext => [ext, cat]))
);

// MIME-based asset classification
const TYPE_REGISTRY = {
  mime: [
    { test: /^text\/html\b/i, cat: "html" },
    { test: /^text\/css\b/i, cat: "css" },
    { test: /^(application|text)\/(javascript|ecmascript)\b/i, cat: "js" },
    { test: /^image\//i, cat: "image" },
    { test: /^video\//i, cat: "video" },
    { test: /^audio\//i, cat: "audio" },
    { test: /^font\//i, cat: "font" },
    { test: /^application\/(font-woff2?|vnd\.ms-fontobject)\b/i, cat: "font" },
    { test: /^application\/x-shockwave-flash\b/i, cat: "flash" },
    { test: /^application\/x-director\b/i, cat: "plugin" },
    { test: /^application\/x-silverlight-app\b/i, cat: "plugin" },
    { test: /^(application\/java-archive|application\/x-java-applet)\b/i, cat: "plugin" },
    { test: /^application\/vnd\.unity\b/i, cat: "plugin" },
    { test: /^application\/json\b/i, cat: "data" },
    { test: /^application\/wasm\b/i, cat: "data" },
    { test: /^application\/pdf\b/i, cat: "data" },
    { test: /^application\/(zip|x-7z-compressed|x-tar|gzip)\b/i, cat: "data" },
    { test: /^application\/xml\b/i, cat: "data" },
    { test: /^text\/xml\b/i, cat: "data" },
    { test: /^text\/map\b/i, cat: "data" }
  ],
  ext: TYPE_REGISTRY_EXT
};

// Classify assets MIME first, then fallback to extension
function classifyAsset(url = "", mime = "") {
  if (mime) {
    const rule = TYPE_REGISTRY.mime.find(r => r.test.test(mime));
    if (rule) return rule.cat;
  }
  const ext = url.split("?")[0].split("#")[0].toLowerCase().split(".").pop();
  return TYPE_REGISTRY.ext[ext] || "other";
}

function extractSrcsetUrls(srcset = "") {
  return srcset.split(",")
    .map(part => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

// Extract resources from JavaScript files to catch dynamically referenced assets
function extractUrlsFromJS(jsText) {
  const urls = [];
  const regex = /['"`](https?:\/\/[^'"`]+?)['"`]/g;
  let match;
  while ((match = regex.exec(jsText)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

async function getSize(url, hintedType = "") {
  try {
    const res = await fetchWithRetry(url);
    const contentType = res.headers.get("content-type") || "";
    const finalType = classifyAsset(url, contentType);

    if (finalType === "css" || finalType === "js") {
      let text = await res.text();
      text = text
        .replace(/\/\*\s*FILE ARCHIVED ON[\s\S]*?\*\//gi, "")
        .replace(/\/\*\s*playback timings[\s\S]*?\*\//gi, "");
      return { size: new TextEncoder().encode(text).length, contentType, text };
    }

    const buf = await res.arrayBuffer();
    return { size: buf.byteLength, contentType };
  } catch (err) {
    console.warn(`Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}

function detectAssetType(tag, url = "", el = null, contentType = "") {
  let cat = classifyAsset(url, contentType);
  if (!cat && el) {
    if (tag === "link") {
      const asHint = (el.getAttribute("as") || "").toLowerCase();
      if (CATEGORIES.includes(asHint)) cat = asHint;
    }
    if (["source","embed","object"].includes(tag)) {
      const t = el.getAttribute("type") || "";
      cat = classifyAsset("", t) || cat;
    }
  }
  if (!cat) {
    if (tag === "script") cat = "js";
    else if (tag === "link") cat = "css";
    else if (tag === "img") cat = "image";
    else if (tag === "audio") cat = "audio";
    else if (tag === "video") cat = "video";
    else cat = "other";
  }
  return cat;
}

// Get all available snapshots for a URL
export async function getSnapshots(url, startYear, endYear) {
  const apiUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&from=${startYear}&to=${endYear}&output=json&fl=timestamp&filter=statuscode:200`;
  const res = await fetchWithRetry(apiUrl);
  const data = await res.json();
  return data.slice(1).map(row => row[0]).filter(ts => /^\d{14}$/.test(ts));
}

// Find the closest snapshot to a given datetime
function closestSnapshot(snapshots, target) {
  return snapshots.reduce((prev, curr) =>
    Math.abs(Number(curr) - Number(target)) < Math.abs(Number(prev) - Number(target))
      ? curr
      : prev
  );
}

// Extract asset URLs
async function getAssetUrls(url, datetime) {
  // HTML fetched using the 'id_' API flag, which replays the unmodified snapshot
  const htmlUrl = `https://web.archive.org/web/${datetime}id_/${url}`;
  const htmlRes = await fetchWithRetry(htmlUrl);
  const html = await htmlRes.text();
  const htmlSize = new TextEncoder().encode(html).length;

  // Assets fetched using the 'if_' API flag, which hides the Wayback Machine toolbar when replaying a snapshot
  const ifUrl = `https://web.archive.org/web/${datetime}if_/${url}`;
  const ifRes = await fetchWithRetry(ifUrl);
  const dom = new JSDOM(await ifRes.text());
  const doc = dom.window.document;

  const assets = [];
  const pushSafe = (rawUrl, tag, el) => {
    if (!rawUrl) return;
    if (/web-static\.archive\.org/i.test(rawUrl)) return;
    try { assets.push({ url: new URL(rawUrl, ifUrl).href, tag, el }); }
    catch (e) { console.warn(`Skipping malformed URL "${rawUrl}": ${e.message}`); }
  };

  // Capture standard assets: scripts, styles, images, media, embeds
  doc.querySelectorAll(`
    link[href],
    script[src],
    img[src],
    img[srcset],
    source[src],
    source[srcset],
    video[src],
    video[poster],
    audio[src],
    iframe[src],
    object[data],
    embed[src]
  `).forEach(el => {
    const tag = el.tagName.toLowerCase();
    if (tag === "link") pushSafe(el.getAttribute("href"), tag, el);
    else if (tag === "object") pushSafe(el.getAttribute("data"), tag, el);
    else if (tag === "video") {
      pushSafe(el.getAttribute("src"), tag, el);
      pushSafe(el.getAttribute("poster"), "img", el);
    } else pushSafe(el.getAttribute("src"), tag, el);

    if (el.hasAttribute("srcset")) extractSrcsetUrls(el.getAttribute("srcset")).forEach(u => pushSafe(u, tag, el));
  });

  doc.querySelectorAll('link[rel~="icon"][href], link[rel="apple-touch-icon"][href], link[rel="manifest"][href]')
    .forEach(el => pushSafe(el.getAttribute("href"), "link", el));

  return { htmlSize, assets };
}

// Fetch asset sizes
async function fetchAssetSizes(assets) {
  const results = [];
  for (const a of assets) {
    const result = await getSize(a.url);
    if (!result) { results.push({ url: a.url, type: "other", size: 0 }); continue; }

    const { size, contentType, text } = result;
    const type = detectAssetType(a.tag, a.url, a.el, contentType);
    results.push({ url: a.url, type, size });

    if (text && type === "js") extractUrlsFromJS(text).forEach(u => results.push({ url: u, type: "other", size: 0 }));
  }
  return results;
}

// Get snapshot sizes and composition breakdown
export async function getSnapshotSizes(
  url,
  datetime,
  { includeAssets = false, startYear = 1996, endYear = new Date().getFullYear() } = {}
) {
  const snapshots = await getSnapshots(url, startYear, endYear);
  if (!snapshots.length) throw new Error(`No snapshots for ${url} between ${startYear} and ${endYear}`);

  const validDatetime = snapshots.includes(datetime) ? datetime : closestSnapshot(snapshots, datetime);
  const { htmlSize, assets } = await getAssetUrls(url, validDatetime);
  const assetResults = await fetchAssetSizes(assets);

  const sizeData = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: { bytes: 0, count: 0 } }), {});
  sizeData.html = { bytes: htmlSize, count: 1 };
  sizeData.total = { bytes: htmlSize, count: 1 };

  assetResults.forEach(({ type, size }) => {
    const t = sizeData[type] ? type : "other";
    sizeData[t].bytes += size;
    sizeData[t].count += 1;
    sizeData.total.bytes += size;
    sizeData.total.count += 1;
  });

  const completeness = `${Math.round(assets.length ? (assetResults.length / assets.length) * 100 : 100)}%`;

  const output = {
    url,
    requestedSnapshot: datetime,
    snapshot: validDatetime,
    archiveUrl: `https://web.archive.org/web/${validDatetime}/${url}`,
    sizes: sizeData,
    completeness
  };

  if (includeAssets) output.assets = assetResults;
  return output;
}