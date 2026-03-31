export const untwa = {
  // Archive metadata
  id: "untwa",
  archive: "University of North Texas Web Archives",
  archiveOrg: "University of North Texas University Libraries",
  archiveCountry: "United States of America",
  archiveContinent: "North America",
  archiveUrl: "https://digital.library.unt.edu/explore/collections/untweb",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://webarchive.library.unt.edu/allcollections/cdx?url=${url}",
  timemap: "https://webarchive.library.unt.edu/allcollections/timemap/json/${url}",
  timegate: "https://webarchive.library.unt.edu/allcollections/",

  // Replay API endpoints
  endpointID: "https://webarchive.library.unt.edu/allcollections/${datetime}id_/${url}", // Raw content
  endpointIF: "https://webarchive.library.unt.edu/allcollections/${datetime}x_/${url}", // Navigational toolbars supressed

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: []
};