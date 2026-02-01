export const ukwa = {
  // Archive metadata
  id: "ukwa",
  archive: "UK Web Archive",
  archiveOrg: "British Library",
  archiveUrl: "https://www.webarchive.org.uk",

  // Timegate and endpoints
  timegate: "https://webarchive.org.uk/wayback/en/archive/",
  endpointID: "https://webarchive.org.uk/wayback/en/archive/${datetime}id_/${url}",
  endpointIF: "https://webarchive.org.uk/wayback/en/archive/${datetime}mp_/${url}",

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: []
};