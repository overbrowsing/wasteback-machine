export const yudl = {
  // Archive metadata
  id: "yudl",
  archive: "York University Digital Library",
  archiveOrg: "York University Libraries",
  archiveCountry: "Canada",
  archiveContinent: "North America",
  archiveUrl: "https://digital.library.yorku.ca",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://wayback.library.yorku.ca/all/cdx?url=${url}",
  timemap: "https://wayback.library.yorku.ca/all/timemap/json/${url}",
  timegate: "https://digital.library.yorku.ca/wayback/",

  // Replay API endpoints
  endpointID: "https://wayback.library.yorku.ca/all/${datetime}id_/${url}", // raw content
  endpointIF: "https://wayback.library.yorku.ca/all/${datetime}x_/${url}", // Navigational toolbars supressed

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: []
};