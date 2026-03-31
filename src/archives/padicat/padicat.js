export const padicat = {
  // Archive metadata
  id: "padicat",
  archive: "The Web Archive of Catalonia (Padicat)",
  archiveOrg: "Library of Catalonia",
  archiveCountry: "Catalonia (Spain)",
  archiveContinent: "Europe",
  archiveUrl: "https://padicat.cat",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://wayback.padicat.cat/cdx?url=${url}",
  timemap: "https://wayback.padicat.cat/timemap/json/${url}",
  timegate: "https://wayback.padicat.cat/",

  // Replay API endpoints
  endpointID: "https://wayback.padicat.cat/${datetime}id_/${url}", // Raw content
  endpointIF: "https://wayback.padicat.cat/${datetime}np_/${url}", // Navigational toolbars supressed

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: []
};