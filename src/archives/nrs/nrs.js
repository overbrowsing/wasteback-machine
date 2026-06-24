export const nrs = {
  // Archive metadata
  id: "nrs",
  archive: "National Records of Scotland Web Archive",
  archiveOrg: "National Records of Scotland",
  archiveCountry: "United Kingdom (Scotland)",
  archiveContinent: "Europe",
  archiveUrl: "https://webarchive.nrscotland.gov.uk",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://webarchive.nrscotland.gov.uk/public/cdx?url=${url}",
  timemap: "https://webarchive.nrscotland.gov.uk/public/timemap/json/${url}",
  timegate: "https://webarchive.nrscotland.gov.uk/public/",

  // Replay API endpoints
  endpointID: "https://webarchive.nrscotland.gov.uk/public/${datetime}id_/${url}", // Raw content
  endpointIF: "https://webarchive.nrscotland.gov.uk/public/${datetime}if_/${url}", // Navigational toolbars supressed
  
  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: []
};