export const nzwa = {
  // Archive metadata
  id: "nzwa",
  archive: "New Zealand Web Archive",
  archiveOrg: "National Library of New Zealand",
  archiveCountry: "New Zealand",
  archiveContinent: "Oceania",
  archiveUrl: "https://webarchive.natlib.govt.nz",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://ndhadeliver.natlib.govt.nz/webarchive/cdx?url=${url}",
  timemap: "https://ndhadeliver.natlib.govt.nz/webarchive/timemap/json/${url}",
  timegate: "https://ndhadeliver.natlib.govt.nz/webarchive/",

  // Replay API endpoints
  endpointID: "https://ndhadeliver.natlib.govt.nz/webarchive/${datetime}id_/${url}", // Raw content
  endpointIF: "https://ndhadeliver.natlib.govt.nz/webarchive/${datetime}if_/${url}", // Navigational toolbars supressed

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: [
    "/static/"
  ]
};