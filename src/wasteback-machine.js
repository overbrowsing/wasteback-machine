/**
 * Wasteback Machine v1.0.2
 * Measure the environmental impact of the past web
 *
 * Author: Overbrowsing Research Group
 * Website: https://overbrowsing.com
 * License: Apache 2.0
 */

import { JSDOM } from "jsdom";

// Fetch with retry logic to handle flaky Wayback Machine requests
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
    } catch {}
    await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
  }
}

// Fetch a URL and return its byte size, trimming extra Wayback Machine metadata comments
async function getSize(url, type = "") {
  try {
    const res = await fetchWithRetry(url);
    let text = await res.text();
    
    if (type === "css" || type === "js") {
      text = text
        .replace(/\/\*![\s\S]*?\*\//g, "")
        .replace(/\/\*[\s\S]*?FILE ARCHIVED[\s\S]*?\*\//gi, "")
        .replace(/\/\*[\s\S]*?playback timings[\s\S]*?\*\//gi, "");
    }

    return new TextEncoder().encode(text).length;
  } catch (err) {
    console.warn(`Failed to fetch ${url}: ${err.message}`);
    return 0;
  }
}

// Get all available snapshots for a URL between startYear and endYear
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

// Determine asset type based on tag or file extension
function detectAssetType(tag, url) {
  if (tag === "link" && url.endsWith(".css")) return "css";
  if (tag === "script") return "js";
  if (tag === "img") return "image";

  const ext = url.split(".").pop().toLowerCase();
  if (["mp4", "webm", "ogg"].includes(ext)) return "video";
  if (["woff", "woff2", "ttf", "otf", "eot"].includes(ext)) return "font";

  return "other";
}

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
  doc.querySelectorAll('link[href], script[src], img[src], video[src], video source[src]').forEach(el => {
    const tag = el.tagName.toLowerCase();
    const attr = tag === "link" ? "href" : "src";
    const assetUrl = el.getAttribute("data-src") || el.getAttribute("data-image") || el.getAttribute(attr);
    if (!assetUrl) return;
    if (/web-static\.archive\.org/i.test(assetUrl)) return; // skip Wayback Machine resources from https://web-static.archive.org

    const resolvedUrl = new URL(assetUrl, ifUrl).href;
    assets.push({ url: resolvedUrl, type: detectAssetType(tag, assetUrl) });
  });

  return { htmlSize, assets };
}

// Fetch sizes for all assets in parallel
async function fetchAssetSizes(assets) {
  return Promise.all(
    assets.map(async asset => {
      const size = await getSize(asset.url, asset.type);
      return { ...asset, size };
    })
  );
}

// Get snapshot sizes and composition breakdown
export async function getSnapshotSizes(
  url,
  datetime,
  { includeAssets = false, startYear = 1996, endYear = new Date().getFullYear() } = {}
) {
  const snapshots = await getSnapshots(url, startYear, endYear);
  if (snapshots.length === 0) throw new Error(`No snapshots for ${url} between ${startYear} and ${endYear}`);

  const validDatetime = snapshots.includes(datetime) ? datetime : closestSnapshot(snapshots, datetime);
  const { htmlSize, assets } = await getAssetUrls(url, validDatetime);
  const assetSizes = await fetchAssetSizes(assets);

  const sizeData = {
    html: { bytes: htmlSize, count: 1 },
    css: { bytes: 0, count: 0 },
    js: { bytes: 0, count: 0 },
    image: { bytes: 0, count: 0 },
    video: { bytes: 0, count: 0 },
    font: { bytes: 0, count: 0 },
    other: { bytes: 0, count: 0 },
    total: { bytes: htmlSize, count: 1 }
  };

  assetSizes.forEach(({ type, size }) => {
    sizeData[type].bytes += size;
    sizeData[type].count += 1;
    sizeData.total.bytes += size;
    sizeData.total.count += 1;
  });

  // Calculate completeness as a percentage
  const completenessRatio = sizeData.total.count > 0
    ? (sizeData.total.count - sizeData.other.count) / sizeData.total.count
    : 0;
  const completeness = `${Math.round(completenessRatio * 100)}%`;

  return {
    url,
    requestedSnapshot: datetime,
    snapshot: validDatetime,
    archiveUrl: `https://web.archive.org/web/${validDatetime}/${url}`,
    sizes: sizeData,
    completeness,
    ...(includeAssets ? { assets: assetSizes } : {})
  };
}