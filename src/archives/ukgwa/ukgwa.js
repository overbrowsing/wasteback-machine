export const ukgwa = {
  // Archive metadata
  id: "ukgwa",
  archive: "UK Government Web Archive (UKGWA)",
  archiveOrg: "The National Archives",
  archiveUrl: "https://webarchive.nationalarchives.gov.uk/ukgwa",

  // Timegate and endpoints
  timegate: "https://webarchive.nationalarchives.gov.uk/ukgwa/",
  endpointID: "https://webarchive.nationalarchives.gov.uk/ukgwa/${datetime}id_/${url}",
  endpointIF: "https://webarchive.nationalarchives.gov.uk/ukgwa/nobanner/${datetime}/${url}",

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: [
    "/static/",
  ]
};