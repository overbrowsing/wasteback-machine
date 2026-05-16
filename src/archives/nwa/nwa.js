export const nwa = {
  // Archive metadata
  id: "nwa",
  archive: "Norwegian Web Archive",
  archiveOrg: "National Library of Norway",
  archiveCountry: "Norway",
  archiveContinent: "Europe",
  archiveUrl: "https://nb.no/en/collection/web-archive",
  
  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://nettarkivet.nb.no/search/cdx?url=${url}",
  timemap: "https://nettarkivet.nb.no/search/timemap/json/${url}",
  timegate: "https://nettarkivet.nb.no/search/",

  // Replay API endpoints
  endpointID: "https://nettarkivet.nb.no/search/{datetime}id_/{url}", // Raw content
  endpointIF: "https://nettarkivet.nb.no/search/{datetime}if_/{url}", // Navigational toolbars supressed

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: []
};