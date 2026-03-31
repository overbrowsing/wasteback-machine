export const iwa = {
  // Archive metadata
  id: "iwa",
  archive: "Icelandic Web Archive (Vefsafn.is)",
  archiveOrg: "National and University Library of Iceland",
  archiveCountry: "Iceland ",
  archiveContinent: "Europe",
  archiveUrl: "https://vefsafn.is",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://vefsafn.is/cdx?url=${url}",
  timemap: "https://vefsafn.is/is/timemap/json/${url}",
  timegate: "https://vefsafn.is/",

  // Replay API endpoints
  endpointID: "https://vefsafn.is/${datetime}id_/${url}", // Raw content
  endpointIF: "https://vefsafn.is/${datetime}if_/${url}", // Navigational toolbars supressed

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: [
    "/static/",
    "https://t.landsbokasafn.is"
  ]
};