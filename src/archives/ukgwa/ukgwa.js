export const ukgwa = {
  // Archive metadata
  id: "ukgwa",
  archive: "UK Government Web Archive (UKGWA)",
  archiveOrg: "The National Archives",
  archiveCountry: "United Kingdom",
  archiveContinent: "Europe",
  archiveUrl: "https://webarchive.nationalarchives.gov.uk",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://webarchive.nationalarchives.gov.uk/ukgwa/cdx?url=${url}",
  timemap: "https://webarchive.nationalarchives.gov.uk/ukgwa/timemap/json/${url}",
  timegate: "https://webarchive.nationalarchives.gov.uk/ukgwa/",

  // Replay API endpoints
  endpointID: "https://webarchive.nationalarchives.gov.uk/ukgwa/${datetime}id_/${url}", // Raw content
  endpointIF: "https://webarchive.nationalarchives.gov.uk/ukgwa/nobanner/${datetime}/${url}", // Navigational toolbars supressed

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: [
    "/static/",
  ]
};