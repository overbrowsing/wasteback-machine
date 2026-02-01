export const ukgwa = {
  // Archive metadata
  id: "ukgwa",
  archive: "UK Government Web Archive (UKGWA)",
  archiveOrg: "The National Archives",
  archiveUrl: "https://webarchive.nationalarchives.gov.uk/ukgwa",

  // Timegate and endpoints
  timegate: "https://webarchive.nationalarchives.gov.uk/ukgwa/",
  endpointID: "https://webarchive.nationalarchives.gov.uk/ukgwa/${datetime}id_/${url}",
  endpointIF: "https://webarchive.nationalarchives.gov.uk/ukgwa/${datetime}if_/${url}",

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: [
    "/static/",
    "https://cdn.jsdelivr.net",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    "https://s3-eu-west-1.amazonaws.com",
    "https://www.googletagmanager.com",
  ]
};