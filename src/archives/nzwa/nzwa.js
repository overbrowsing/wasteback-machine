export const nzwa = {
  // Archive metadata
  id: "nzwa",
  archive: "New Zealand Web Archive",
  archiveOrg: "National Library of New Zealand",
  archiveUrl: "https://webarchive.natlib.govt.nz",

  // Timegate and endpoints
  timegate: "https://ndhadeliver.natlib.govt.nz/webarchive/",
  endpointID: "https://ndhadeliver.natlib.govt.nz/webarchive/${datetime}id_/${url}",
  endpointIF: "https://ndhadeliver.natlib.govt.nz/webarchive/${datetime}if_/${url}",

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: [
    "/static/"
  ]
};