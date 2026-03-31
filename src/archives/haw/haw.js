export const haw = {
  // Archive metadata
  id: "haw",
  archive: "Croatian Web Archives (HAW)",
  archiveOrg: "National and University Library in Zagreb",
  archiveCountry: "Croatia",
  archiveContinent: "Europe",
  archiveUrl: "https://haw.nsk.hr",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://haw.nsk.hr/wayback/cdx?url=${url}",
  timemap: "https://haw.nsk.hr/wayback/timemap/json/${url}",
  timegate: "https://haw.nsk.hr/wayback/",

  // Replay API endpoints
  endpointID: "https://haw.nsk.hr/wayback/${datetime}id_/${url}", // Raw content
  endpointIF: "https://haw.nsk.hr/wayback/${datetime}x_/${url}", // Navigational toolbars supressed

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: []
};