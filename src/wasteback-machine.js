/**
 * Wasteback Machine v1.0.4
 * Measure the environmental impact of the past web
 *
 * Author: Overbrowsing Research Group
 * Website: https://overbrowsing.com
 * License: Apache 2.0
 */

import { JSDOM } from "jsdom";

// Fetch with retry logic to handle flaky Wayback Machine requests
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

// Asset type registry and MIME/extension classification
const CATEGORIES = [
  "html", "css", "js", "image", "video", "audio", "font", "flash", "plugin", "other"
];

// Define extensions per category
const EXT_GROUPS = {
  css: ["css"],
  js: ["js", "mjs"],
  image: ["png","jpg","jpeg","gif","webp","avif","bmp","ico","tiff","tif","svg","svgz","apng"],
  video: ["mp4","webm","ogv","m4v","mkv","3gp","3g2","mov","qt","avi","wmv","asf","flv","rmvb","rm"],
  audio: ["mp3","wav","ogg","oga","aac","m4a","flac","mid","midi","ra","ram"],
  font: ["woff","woff2","ttf","otf","eot"],
  flash: ["swf"],
  plugin: ["dcr","dir","xap","jar","class","jnlp","unity3d","cab","ocx"]
};

// Build ext lookup dynamically
const TYPE_REGISTRY_EXT = Object.fromEntries(
  Object.entries(EXT_GROUPS)
        .flatMap(([cat, exts]) => exts.map(ext => [ext, cat]))
);

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
    { test: /^application\/vnd\.unity\b/i, cat: "plugin" }
  ],
  ext: TYPE_REGISTRY_EXT
};

function classifyByMime(mime) {
  if (!mime) return null;
  const rule = TYPE_REGISTRY.mime.find(r => r.test.test(mime));
  return rule?.cat || null;
}

function classifyByExtension(url = "") {
  const clean = url.split("#")[0].split("?")[0].toLowerCase();
  const ext = clean.includes(".") ? clean.split(".").pop() : "";
  return TYPE_REGISTRY.ext[ext] || null;
}

function extractSrcsetUrls(srcset = "") {
  return srcset.split(",")
    .map(part => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

async function getSize(url, hintedType = "") {
  try {
    const res = await fetchWithRetry(url);
    const contentType = res.headers.get("content-type") || "";

    const finalType = classifyByMime(contentType) || hintedType;

    if (finalType === "css" || finalType === "js") {
      let text = await res.text();
      text = text
        .replace(/\/\*\s*FILE ARCHIVED ON[\s\S]*?\*\//gi, "")
        .replace(/\/\*\s*playback timings[\s\S]*?\*\//gi, "");
      return { size: new TextEncoder().encode(text).length, contentType, ok: true };
    }

    const buf = await res.arrayBuffer();
    return { size: buf.byteLength, contentType, ok: true };
  } catch (err) {
    console.warn(`Failed to fetch ${url}: ${err.message}`);
    return null;
  }
}

function detectAssetType(tag, url = "", el = null, contentType = "") {
  let cat = classifyByMime(contentType);

  if (!cat && el) {
    if (tag === "link") {
      const asHint = (el.getAttribute("as") || "").toLowerCase();
      if (CATEGORIES.includes(asHint)) cat = asHint;
    }
    if (["source", "embed", "object"].includes(tag)) {
      const t = el.getAttribute("type") || "";
      cat = classifyByMime(t) || cat;
    }
  }

  if (!cat) cat = classifyByExtension(url);

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
  const apiUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(
    url
  )}&from=${startYear}&to=${endYear}&output=json&fl=timestamp&filter=statuscode:200`;

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

// Get asset URLs for a snapshot
async function getAssetUrls(url, datetime) {
  const htmlUrl = `https://web.archive.org/web/${datetime}id_/${url}`;
  const htmlRes = await fetchWithRetry(htmlUrl);
  const html = await htmlRes.text();
  const htmlSize = new TextEncoder().encode(html).length;

  const ifUrl = `https://web.archive.org/web/${datetime}if_/${url}`;
  const ifRes = await fetchWithRetry(ifUrl);
  const dom = new JSDOM(await ifRes.text());
  const doc = dom.window.document;

  const assets = [];
  const pushSafe = (rawUrl, tag, el) => {
    if (!rawUrl) return;
    if (/web-static\.archive\.org/i.test(rawUrl)) return;
    try {
      const resolvedUrl = new URL(rawUrl, ifUrl).href;
      assets.push({ url: resolvedUrl, tag, el });
    } catch (e) {
      console.warn(`Skipping malformed asset URL "${rawUrl}": ${e.message}`);
    }
  };

  doc.querySelectorAll(`
    link[href],
    script[src],
    img[src],
    img[srcset],
    source[src],
    source[srcset],
    video[src],
    video poster,
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
    } else {
      pushSafe(el.getAttribute("src"), tag, el);
    }

    if (el.hasAttribute("srcset")) {
      extractSrcsetUrls(el.getAttribute("srcset")).forEach(u => pushSafe(u, tag, el));
    }
  });

  doc.querySelectorAll('link[rel~="icon"][href], link[rel="apple-touch-icon"][href], link[rel="manifest"][href]')
    .forEach(el => pushSafe(el.getAttribute("href"), "link", el));

  return { htmlSize, assets };
}

// Fetch sizes for all assets in parallel
async function fetchAssetSizes(assets) {
  const results = await Promise.all(
    assets.map(async a => {
      const result = await getSize(a.url);
      if (!result) return { ok: false }; // 🚨 mark failed
      const { size, contentType } = result;
      const type = detectAssetType(a.tag, a.url, a.el, contentType);
      return { url: a.url, type, size, ok: true };
    })
  );
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

  const sizeData = {
    html: { bytes: htmlSize, count: 1 },
    css: { bytes: 0, count: 0 },
    js: { bytes: 0, count: 0 },
    image: { bytes: 0, count: 0 },
    video: { bytes: 0, count: 0 },
    audio: { bytes: 0, count: 0 },
    font: { bytes: 0, count: 0 },
    flash: { bytes: 0, count: 0 },
    plugin: { bytes: 0, count: 0 },
    other: { bytes: 0, count: 0 },
    total: { bytes: htmlSize, count: 1 }
  };

  let retrievedCount = 0;

  assetResults.forEach(result => {
    if (!result.ok) return;
    retrievedCount++;
    let { type, size } = result;
    if (!sizeData[type]) type = "other";
    sizeData[type].bytes += size;
    sizeData[type].count += 1;
    sizeData.total.bytes += size;
    sizeData.total.count += 1;
  });

  const completenessRatio = assets.length > 0 ? retrievedCount / assets.length : 1;
  const completeness = `${Math.round(completenessRatio * 100)}%`;

  return {
    url,
    requestedSnapshot: datetime,
    snapshot: validDatetime,
    archiveUrl: `https://web.archive.org/web/${validDatetime}/${url}`,
    sizes: sizeData,
    completeness,
    ...(includeAssets ? { assets: assetResults } : {})
  };
}