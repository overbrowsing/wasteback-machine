/**
 * Wasteback Machine v1.0.13
 * JavaScript library for measuring the size and composition of archived web pages
 *
 * Author: Overbrowsing Research Group
 * Website: https://overbrowsing.com
 * License: Apache 2.0
 */

import { JSDOM } from "jsdom";

// Constants and Type Registries
const CATEGORIES = [
  "html", "stylesheet", "script", "image", "video", "audio", "font", "flash", "plugin", "data", "other"
];

const EXT_GROUPS = {
  stylesheet: ["css","scss","sass","less"],
  script: ["js","mjs","cjs","ts","jsx","tsx","coffee","vue"],
  image: ["png","jpg","jpeg","gif","webp","avif","bmp","ico","cur","tiff","tif","svg","apng","heic","heif","jp2","j2k","dds","ppm","pgm","pbm","hdr"],
  video: ["mp4","webm","ogv","m4v","mkv","mov","avi","flv","m2v","ts","rmvb","rm","f4v","f4p","f4a","f4b","3gp","3g2"],
  audio: ["mp3","wav","ogg","oga","aac","m4a","flac","opus","mid","midi","ra","ram","aif","aiff","au","m4b"],
  font: ["woff","woff2","ttf","otf","eot","pfa","pfb"],
  flash: ["swf"],
  plugin: ["jar","class","xap","unity3d","dcr","dir","cab","ocx"],
  data: ["json","xml","zip","tar","7z","wasm","map","csv","tsv","yaml","yml","sqlite","db","db3"],
  document: ["txt","pdf","rtf","log","ini","conf"]
};

const TYPE_REGISTRY_EXT = Object.fromEntries(
  Object.entries(EXT_GROUPS).flatMap(([cat, exts]) => exts.map(ext => [ext, cat]))
);

const TYPE_REGISTRY = {
  mime: [
    { test: /^text\/html\b/i, cat: "html" },
    { test: /^text\/css\b/i, cat: "stylesheet" },
    { test: /^(application|text)\/(javascript|ecmascript)\b/i, cat: "script" },
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

// Utilities
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

function normaliseUrl(u) {
  try {
    const url = new URL(u);
    url.hash = "";
    ["v","ver","cb"].forEach(p => url.searchParams.delete(p));
    return url.href;
  } catch {
    return u;
  }
}

function classifyResource(url = "", mime = "") {
  if (mime) {
    const rule = TYPE_REGISTRY.mime.find(r => r.test.test(mime));
    if (rule) return rule.cat;
  }
  const ext = url.split("?")[0].split("#")[0].toLowerCase().split(".").pop();
  return TYPE_REGISTRY.ext[ext] || "other";
}

function extractUrlsFromSrcset(srcset = "") {
  return srcset.split(",").map(s => s.trim().split(/\s+/)[0]).filter(Boolean);
}

function extractUrlsFromScript(scriptText) {
  const urls = [];
  for (const match of scriptText.matchAll(/['"`](https?:\/\/[^'"`]+?)['"`]/g)) urls.push(match[1]);
  return urls;
}

// Resource Fetching
async function getSize(url) {
  try {
    const res = await fetchWithRetry(url);
    const mime = res.headers.get("content-type") || "";
    const type = classifyResource(url, mime);

    if (type === "script" || type === "stylesheet") {
      let text = await res.text();
      
      text = text
        .replace(/\/\*\s*FILE ARCHIVED ON[\s\S]*?\*\//gi, "")
        .replace(/\/\*\s*playback timings[\s\S]*?\*\//gi, "");

      return { size: new TextEncoder().encode(text).length, type, text };
    }

    const buf = await res.arrayBuffer();
    return { size: buf.byteLength, type };
  } catch {
    return { size: 0, type: "other" };
  }
}

async function fetchResourceSizes(resources) {
  const results = [];
  for (const { url } of resources) {
    const { size, type, text } = await getSize(url);
    results.push({ url, type, size });

    if (text && type === "script") {
      extractUrlsFromScript(text).forEach(u => results.push({ url: normaliseUrl(u), type: "other", size: 0 }));
    }
  }

  const seen = new Set();
  return results.filter(r => {
    const n = normaliseUrl(r.url);
    if (seen.has(n)) return false;
    seen.add(n);
    r.url = n;
    return true;
  });
}

// HTML Parsing and Resource Extraction
async function getResourceUrls(url, datetime) {
  const htmlUrl = `https://web.archive.org/web/${datetime}id_/${url}`;
  const html = await (await fetchWithRetry(htmlUrl)).text();
  const htmlSize = new TextEncoder().encode(html).length;

  const ifUrl = `https://web.archive.org/web/${datetime}if_/${url}`;
  const doc = new JSDOM(await (await fetchWithRetry(ifUrl)).text()).window.document;

  const resources = [];
  const push = (rawUrl) => {
    if (rawUrl && !/^\/_static\/|https?:\/\/web-static\.archive\.org/i.test(rawUrl)) {
      try { resources.push({ url: new URL(rawUrl, ifUrl).href }); } catch {}
    }
  };

  doc.querySelectorAll(`
    link[href], script[src], img[src], img[srcset], source[src], source[srcset],
    video[src], video[poster], audio[src], iframe[src], object[data], embed[src]
  `).forEach(el => {
    const rawUrl = el.getAttribute("src") || el.getAttribute("data") || el.getAttribute("poster") || el.getAttribute("href");
    push(rawUrl);
    if (el.hasAttribute("srcset")) extractUrlsFromSrcset(el.getAttribute("srcset")).forEach(push);
  });

  doc.querySelectorAll('link[rel~="icon"][href], link[rel="apple-touch-icon"][href], link[rel="manifest"][href]')
    .forEach(el => push(el.getAttribute("href")));

  const seen = new Set();
  return { htmlSize, resources: resources.filter(r => {
    const n = normaliseUrl(r.url);
    if (seen.has(n)) return false;
    seen.add(n);
    r.url = n;
    return true;
  })};
}

// Memento Handling CDX
export async function getMementos(url, startYear, endYear) {
  const apiUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&from=${startYear}&to=${endYear}&output=json&fl=timestamp&filter=statuscode:200`;
  const data = await (await fetchWithRetry(apiUrl)).json();
  return data.slice(1).map(r => r[0]).filter(ts => /^\d{14}$/.test(ts));
}

function closestMemento(mementos, target) {
  return mementos.reduce((prev, curr) =>
    Math.abs(Number(curr) - Number(target)) < Math.abs(Number(prev) - Number(target)) ? curr : prev
  );
}

// Main Execution Block
export async function getMementoSizes(url, datetime, { includeResources = false, startYear = 1995, endYear = new Date().getFullYear() } = {}) {
  const mementos = await getMementos(url, startYear, endYear);
  if (!mementos.length) throw new Error(`No mementos for ${url} between ${startYear} and ${endYear}`);

  const validDatetime = mementos.includes(datetime) ? datetime : closestMemento(mementos, datetime);
  const { htmlSize, resources } = await getResourceUrls(url, validDatetime);
  const resourceResults = await fetchResourceSizes(resources);

  const sizeData = CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: { bytes: 0, count: 0 } }), {});
  sizeData.html = { bytes: htmlSize, count: 1 };
  sizeData.total = { bytes: htmlSize, count: 1 };

  for (const { type, size } of resourceResults) {
    const t = sizeData[type] ? type : "other";
    sizeData[t].bytes += size;
    sizeData[t].count += 1;
    sizeData.total.bytes += size;
    sizeData.total.count += 1;
  }

  const completeness = `${Math.round(
    resources.length ? (resourceResults.filter(r => r.size > 0).length / resources.length) * 100 : 100
  )}%`;

  const output = {
    url,
    requestedMemento: datetime,
    memento: validDatetime,
    mementoURL: `https://web.archive.org/web/${validDatetime}/${url}`,
    sizes: sizeData,
    completeness
  };

  if (includeResources) output.resources = resourceResults;
  return output;
}