import { JSDOM } from "jsdom";
import { archives } from "../archives/index.js";

/* ------------------- Constants ------------------- */

// Resource types
const CATEGORIES = [
  "html", "stylesheet", "script", "image", "video", "audio", "font", "flash", "plugin", "data", "document", "other"
];

// Resource type by file extension
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

// Resource type registry
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
    { test: /^application\/pdf\b/i, cat: "document" },
    { test: /^application\/(zip|x-7z-compressed|x-tar|gzip)\b/i, cat: "data" },
    { test: /^application\/xml\b/i, cat: "data" },
    { test: /^text\/xml\b/i, cat: "data" },
    { test: /^text\/map\b/i, cat: "data" }
  ],
  ext: TYPE_REGISTRY_EXT
};

/* ------------------- Utilities ------------------- */

// Fetch with retries
async function fetchWithRetry(url, options = {}, retries = 3) {
  let error;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      error = new Error(`Non-OK response: ${res.status}`);
    } catch (err) { error = err; }
    await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
  }
  throw error;
}

// Normalize URLs
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

// Classify resource type by MIME or file extension
function classifyResource(url = "", mime = "") {
  if (mime) {
    const rule = TYPE_REGISTRY.mime.find(r => r.test.test(mime));
    if (rule) return rule.cat;
  }
  const ext = url.split("?")[0].split("#")[0].toLowerCase().split(".").pop();
  return TYPE_REGISTRY.ext[ext] || "other";
}

// Archive resolver
function resolveArchives(provider) {
  if (!provider) throw new Error("Archive provider is required");
  const p = typeof provider === "string" ? archives[provider.toLowerCase()] : provider;
  if (!p || !p.id) throw new Error(`Invalid or unsupported archive: ${provider}`);
  return [p];
}

/* ------------------- Memento timegate ------------------- */

export async function getMementos(providerId, url, startYear = 1995, endYear = new Date().getFullYear()) {
  if (!providerId) throw new Error("Archive provider is required");
  if (!url) throw new Error("URL is required");

  const providers = resolveArchives(providerId);
  const provider = providers[0];

  const mementos = [];

  for (let year = startYear; year <= endYear; year++) {
    const datetime = new Date(`${year}-01-01T12:00:00Z`).toUTCString();

    try {
      const res = await fetchWithRetry(provider.timegate + url, {
        method: "GET",
        headers: { "Accept-Datetime": datetime }
      });

      const dt = res.headers.get("Memento-Datetime") || datetime;
      const d = new Date(dt);
      const formatted = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}${String(d.getUTCSeconds()).padStart(2, "0")}`;

      mementos.push(formatted);

    } catch {
      continue;
    }
  }

  return Array.from(new Set(mementos)).sort();
}

/* ------------------- Resource extraction ------------------- */

async function getSize(url, provider) {
  const res = await fetch(url).catch(() => null);
  if (!res || !res.ok) return { size: 0, type: "other" };

  const mime = res.headers.get("content-type") || "";
  const type = classifyResource(url, mime);

  // Clean scripts and stylesheets from archival comments
  if (type === "script" || type === "stylesheet") {
    let text = await res.text();

    if (provider?.cleaningRules) {
      provider.cleaningRules.forEach(rule => {
        if (rule.removeComments) text = text.replace(/\/\*[\s\S]*?\*\//g, "");
        if (rule.removeBetween) {
          rule.removeBetween.forEach(({ start, end }) => {
            text = text.replace(new RegExp(`${start}[\\s\\S]*?${end}`, "gi"), "");
          });
        }
      });
    }

    return { size: new TextEncoder().encode(text).length, type, text };
  }

  const buf = await res.arrayBuffer();
  return { size: buf.byteLength, type };
}

// Fetch sizes for all resources
async function fetchResourceSizes(resources, provider) {
  const results = [];
  const seen = new Set();

  for (const { url } of resources) {
    const n = normaliseUrl(url);
    if (seen.has(n)) continue;
    seen.add(n);

    const { size, type } = await getSize(url, provider);
    results.push({ url, type, size });
  }

  return results;
}

// Extract resource URLs from HTML and srcset attributes
async function getResourceUrls(url, datetime, provider) {
  const htmlUrl = provider.endpointID.replace("${url}", url).replace("${datetime}", datetime);
  const htmlText = await (await fetchWithRetry(htmlUrl)).text();
  const htmlSize = new TextEncoder().encode(htmlText).length;

  const ifUrl = provider.endpointIF.replace("${url}", url).replace("${datetime}", datetime);
  const ifText = await (await fetchWithRetry(ifUrl)).text();
  const doc = new JSDOM(ifText).window.document;

  const resources = [];
  const push = (rawUrl) => {
    if (!rawUrl) return;

    if (rawUrl.startsWith("//")) rawUrl = "https:" + rawUrl;

    // Remove resources from excluded paths
    for (const path of provider.excludedPaths || []) {
      if (rawUrl.includes(path)) return;
    }

    try {
      resources.push({ url: new URL(rawUrl, ifUrl).href });
    } catch {
      resources.push({ url: rawUrl });
    }
  };

  doc.querySelectorAll(`
    link[href], script[src], img[src], img[srcset],
    source[src], source[srcset], video[src], video[poster],
    audio[src], iframe[src], object[data], embed[src]
  `).forEach(el => {
    push(el.getAttribute("src"));
    push(el.getAttribute("href"));
    push(el.getAttribute("data"));
    push(el.getAttribute("poster"));
    if (el.hasAttribute("srcset")) extractUrlsFromSrcset(el.getAttribute("srcset")).forEach(push);
  });

  const seen = new Set();
  const filtered = resources.filter(r => {
    const n = normaliseUrl(r.url);
    if (seen.has(n)) return false;
    seen.add(n);
    r.url = n;
    return true;
  });

  return { htmlSize, resources: filtered };
}

/* ------------------- Main execution block ------------------- */

export async function getMementoSizes(...args) {
  let providerId, url, datetime, options = {};

  if (typeof args[0] === "string" && args[0].startsWith("http")) {
    [url, datetime, options = {}] = args;
    providerId = options.provider;
  } else {
    [providerId, url, datetime, options = {}] = args;
  }

  if (!providerId) throw new Error("Web archive ID is required");
  if (!url) throw new Error("Target URL is required");

  const { includeResources = false, startYear = 1995, endYear = new Date().getFullYear() } = options;
  const providers = resolveArchives(providerId);

  const allResults = [];

  for (const provider of providers) {
    const mementos = await getMementos(provider.id, url, startYear, endYear);
    if (!mementos.length) continue;

    const validDatetime = mementos.includes(datetime)
      ? datetime
      : mementos.reduce((prev, curr) =>
          Math.abs(Number(curr) - Number(datetime)) < Math.abs(Number(prev) - Number(datetime))
            ? curr : prev
        );

    const { htmlSize, resources } = await getResourceUrls(url, validDatetime, provider);
    const resourceResults = await fetchResourceSizes(resources, provider);

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

    const completeness = `${Math.round(resources.length ? (resourceResults.filter(r => r.size > 0).length / resources.length) * 100 : 100)}%`;

    allResults.push({
      url,
      requestedMemento: datetime,
      memento: validDatetime,
      mementoUrl: provider.endpointIF.replace("${url}", url).replace("${datetime}", validDatetime),
      archive: provider.archive,
      archiveOrg: provider.archiveOrg,
      archiveUrl: provider.archiveUrl,
      sizes: sizeData,
      completeness,
      resources: includeResources ? resourceResults : undefined
    });
  }

  return allResults.length === 1 ? allResults[0] : allResults;
}