import { JSDOM } from "jsdom";
import { archives } from "../archives/index.js";

/* ------------------- Utilities ------------------- */

// Spoof user-agent
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
  "Accept": "text/plain,application/json,*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "Connection": "keep-alive"
};

// Fetch with retries
async function fetchWithRetry(url, options = {}, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options, headers: { ...HEADERS, ...(options.headers || {}) } });
      if (res.ok) return res;
    } catch { }
    await new Promise(r => setTimeout(r, 500 * (i + 1)));
  }
  throw new Error(`Failed to fetch: ${url}`);
}

// Normalise URLs by removing tracking parameters and fragments
function normaliseUrl(u) {
  try {
    const url = new URL(u);
    url.hash = "";
    ["v", "ver", "cb"].forEach(p => url.searchParams.delete(p));
    return url.href;
  } catch {
    return u;
  }
}

// Resolve archive by web archive ID
function resolveArchives(archive) {
  if (!archive) throw new Error("Web archive ID is required");
  const p = typeof archive === "string" ? archives[archive.toLowerCase()] : archive;
  if (!p || !p.id) throw new Error(`Invalid or unsupported web archive id: ${archive}`);
  return [p];
}

/* ------------------- Memento Aggregator (getMementos) ------------------- */

// Query CDX to get all available memento-datetimes for the target URL
export async function getMementos(archiveId, url) {
  if (!archiveId || !url) throw new Error("Web archive ID and URL are required");

  const archive = resolveArchives(archiveId)[0];
  if (!archive.cdx?.trim()) return `No CDX available for ${archive.archive}`;

  try {
    const text = await (await fetchWithRetry(archive.cdx.replace("${url}", encodeURIComponent(url)))).text();
    const timestamps = [...new Set(text.match(/\b\d{14}\b/g) || [])].sort();
    return timestamps.length ? timestamps : `No memento-datetimes found for ${url}`;
  } catch (err) {
    console.warn("Failed to fetch CDX:", err);
    return [];
  }
}

/* ------------------- Analyse Composite Memento (analyseMemento) ------------------- */

// Resource categories
export const CATEGORIES = [
  "html", "stylesheet", "script", "image", "video", "audio", "font", "flash", "plugin", "document", "data", "other"
];

// File extensions grouped by resource category
const EXT_GROUPS = {
  stylesheet: ["css", "scss", "sass", "less"],
  script: ["js", "mjs", "cjs", "ts", "jsx", "tsx", "coffee", "vue"],
  image: ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "ico", "cur", "tiff", "tif", "svg", "apng", "heic", "heif", "jp2", "j2k", "dds", "ppm", "pgm", "pbm", "hdr"],
  video: ["mp4", "webm", "ogv", "m4v", "mkv", "mov", "avi", "flv", "m2v", "ts", "rmvb", "rm", "f4v", "f4p", "f4a", "f4b", "3gp", "3g2"],
  audio: ["mp3", "wav", "ogg", "oga", "aac", "m4a", "flac", "opus", "mid", "midi", "ra", "ram", "aif", "aiff", "au", "m4b"],
  font: ["woff", "woff2", "ttf", "otf", "eot", "pfa", "pfb"],
  flash: ["swf"],
  plugin: ["jar", "class", "xap", "unity3d", "dcr", "dir", "cab", "ocx"],
  data: ["json", "wasm", "xml", "x-yaml", "x-sh", "x-wais-source", "x-netcdf", "x-hdf", "x-sqlite3", "octet-stream", "x-mif", "rdf", "sparql", "atom", "rss", "soap", "mathml", "xslt", "xenc", "xop", "csv", "tsv", "sqlite", "db", "db3", "zip", "tar", "7z", "map", "yml", "yaml"],
  document: ["txt", "pdf", "rtf", "log", "ini", "conf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "wpd", "gnumeric", "kspread", "kword", "impress", "lotus"]
};

// MIME types grouped by resource category
const MIME_GROUPS = {
  stylesheet: [/^text\/css\b/i],
  script: [/^(application|text)\/(javascript|ecmascript|x-tcl)/i],
  image: [/^image\//i],
  video: [/^video\//i],
  audio: [/^audio\//i],
  font: [/^font\//i, /^application\/(font-woff|font-woff2?|vnd\.ms-fontobject|x-font-)/i],
  flash: [/^application\/x-shockwave-flash\b/i],
  plugin: [/^application\/(java-archive|x-java|x-director|x-silverlight|vnd\.unity|x-doom|x-futuresplash|x-authorware)/i],
  document: [/^application\/(pdf\b|msword|vnd\.ms-word|vnd\.openxmlformats-officedocument\..*|vnd\.wordperfect|vnd\.lotus-wordpro|vnd\.sun\.xml\.writer|vnd\.oasis\.opendocument\.text|vnd\.kde\.kword|vnd\.stardivision\.writer|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml|vnd\.sun\.xml\.impress|vnd\.oasis\.opendocument\.presentation|vnd\.kde\.kpresenter|vnd\.lotus-freelance|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml|vnd\.lotus-1-2-3|vnd\.sun\.xml\.calc|vnd\.oasis\.opendocument\.spreadsheet|x-gnumeric|vnd\.kde\.kspread)/i],
  data: [/^(application\/(json|wasm|xml|x-yaml|x-sh|x-wais-source|x-netcdf|x-hdf|x-sqlite3|octet-stream|x-mif|rdf\+xml|sparql|xml-dtd|atom\+xml|rss\+xml|soap\+xml|mathml\+xml|xslt\+xml|xenc\+xml|xop\+xml)|text\/(xml|csv|tab-separated-values|x-yaml|uri-list)|model\/|chemical\/|x-conference\/|application\/(vnd\.|x-))/i]
};

// Map file extensions and MIME types to categories
const EXT_TO_CAT = Object.fromEntries(Object.entries(EXT_GROUPS).flatMap(([cat, exts]) => exts.map(ext => [ext, cat])));
const MIME_RULES = Object.entries(MIME_GROUPS).flatMap(([cat, regexes]) => regexes.map(r => [r, cat]));

// Classify resource by MIME type or file extension
export function classifyResource(url = "", mime = "") {
  if (mime) {
    for (const [regex, cat] of MIME_RULES) if (regex.test(mime)) return cat;
  }
  const ext = url.split("?")[0].split("#")[0].toLowerCase().split(".").pop();
  return EXT_TO_CAT[ext] || "other";
}

/* ------------------- Resource Extraction ------------------- */

// Fetch HTML using id_ endpoint and embedded resources using if_ endpoint
async function getResourceUrls(url, datetime, archive) {

  const idUrl = archive.endpointID.replace("${url}", url).replace("${datetime}", datetime);
  const idText = await fetchWithRetry(idUrl, { headers: HEADERS }).then(r => r.text());
  const documents = new TextEncoder().encode(idText).length;

  const ifUrl = archive.endpointIF.replace("${url}", url).replace("${datetime}", datetime);
  const ifText = await fetchWithRetry(ifUrl, { headers: HEADERS }).then(r => r.text());
  const dom = new JSDOM(ifText).window.document;

  const resources = [];
  const push = rawUrl => {
    if (!rawUrl) return;
    if (rawUrl.startsWith("//")) rawUrl = "https:" + rawUrl;
    for (const path of archive.excludedPaths || []) if (rawUrl.includes(path)) return;
    try { resources.push({ url: new URL(rawUrl, ifUrl).href }); } catch { resources.push({ url: rawUrl }); }
  };

  dom.querySelectorAll(`
    link[href], script[src], img[src], img[srcset],
    source[src], source[srcset], video[src], video[poster],
    audio[src], iframe[src], object[data], embed[src]
  `).forEach(el => {
    push(el.getAttribute("src"));
    push(el.getAttribute("href"));
    push(el.getAttribute("data"));
    push(el.getAttribute("poster"));

    if (el.hasAttribute("srcset")) {
      const candidates = el.getAttribute("srcset").split(",").map(e => {
        const [url, descriptor] = e.trim().split(/\s+/);
        const width = descriptor && descriptor.endsWith("w") ? parseInt(descriptor) : 0;
        return { url, width };
      });
      const largest = candidates.reduce((max, cur) => cur.width > max.width ? cur : max, candidates[0]);
      if (largest && largest.url) push(largest.url);
    }
  });

  // Deduplicate and normalise
  const seen = new Set();
  const filtered = resources.filter(r => {
    const n = normaliseUrl(r.url);
    if (seen.has(n)) return false;
    seen.add(n);
    r.url = n;
    return true;
  });

  return { documents, resources: filtered };
}

// Fetch and measure resource size
async function getSize(url, archive) {
  const res = await fetchWithRetry(url, { headers: HEADERS, redirect: "follow" }).catch(() => null);
  if (!res || !res.ok) return { size: 0, type: "other" };

  const mime = res.headers.get("content-type") || "";
  const type = classifyResource(url, mime);

  // Handle stylesheet and script cleaning
  if (type === "stylesheet" || type === "script") {
    let text = await res.text();
    if (archive?.cleaningRules) {
      archive.cleaningRules.forEach(rule => {
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

  // For other resources, measure raw bytes
  const buf = await res.arrayBuffer();
  return { size: buf.byteLength, type };
}

// Fetch sizes for all resources
async function fetchResourceSizes(resources, archive) {
  const results = [];
  const seen = new Set();

  for (const { url } of resources) {
    const n = normaliseUrl(url);
    if (seen.has(n)) continue;
    seen.add(n);

    const { size, type } = await getSize(n, archive);
    results.push({ url: n, type, size });
  }

  return results;
}

/* ------------------- Main Execution Block ------------------- */

export async function analyseMemento(archiveId, url, datetime, options = {}) {
  if (!archiveId) throw new Error("Web archive ID is required");
  if (!url) throw new Error("Target URL is required");

  const { includeResources = false } = options;
  const archive = resolveArchives(archiveId)[0];

  // If not analysing an exact memento-datetime from the CDX, fetch memento using TimeGate (URI-G)
  let actualDatetime = (datetime.replace(/\D/g, "") + "0101000000").slice(0, 14);

  if (datetime.length < 14 && archive.timegate && !archive.skipTimeGate) {
    try {
      const loc = (await fetchWithRetry(
        archive.timegate.replace("${url}", encodeURIComponent(url))
          .replace("${datetime}", actualDatetime),
        { redirect: "manual" }
      )).headers.get("location") || "";
      actualDatetime = loc.match(archive.datetimeRegex || /(\d{14})/)?.[1] || actualDatetime;
    } catch { }
  }

  try {
    const html = await fetchWithRetry(
      archive.endpointIF.replace("${url}", url).replace("${datetime}", actualDatetime)
    ).then(r => r.text());
    actualDatetime = html.match(/\/(\d{14})[a-z]*_?\//i)?.[1] || actualDatetime;
  } catch { }

  // Page composition analysis
  const { documents, resources } = await getResourceUrls(url, actualDatetime, archive);
  const resourceResults = await fetchResourceSizes(resources, archive);

  const sizeData = {};
  CATEGORIES.forEach(cat => sizeData[cat] = { bytes: 0, count: 0 });
  sizeData.html.bytes = documents;
  sizeData.html.count = 1;
  sizeData.total = { bytes: documents, count: 1 };

  const mainidUrl = archive.endpointIF.replace("${url}", url).replace("${datetime}", actualDatetime);
  resourceResults.forEach(({ url, type, size }) => {
    if (url === mainidUrl) return;
    const cat = sizeData[type] ? type : "other";
    sizeData[cat].bytes += size;
    sizeData[cat].count += 1;
    sizeData.total.bytes += size;
    sizeData.total.count += 1;
  });

  // Calculate completeness as percentage of embedded resources successfully retrieved
  const completeness = `${Math.round(resourceResults.filter(r => r.size > 0).length / (resources.length || 1) * 100)}%`;

  // Build result JSON object
  const result = {
    target: {
      url: url,
      datetime: datetime
    },
    memento: {
      url: archive.endpointIF.replace("${url}", url).replace("${datetime}", actualDatetime),
      datetime: actualDatetime
    },
    archive: {
      name: archive.archive,
      organisation: archive.archiveOrg,
      country: archive.archiveCountry,
      continent: archive.archiveContinent,
      url: archive.archiveUrl
    },
    sizes: sizeData,
    completeness
  };

  if (includeResources) result.resources = resourceResults;
  return result;
}