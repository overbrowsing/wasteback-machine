export const awa = {
  // Archive metadata
  id: "awa",
  archive: "Australia Web Archive (Trove)",
  archiveOrg: "National Library of Australia",
  archiveUrl: "https://webarchive.nla.gov.au",

  // Timegate and endpoints
  timegate: "https://webarchive.org.au/wayback/",
  endpointID: "https://webarchive.nla.gov.au/awa/${datetime}id_/${url}",
  endpointIF: "https://webarchive.nla.gov.au/awa/${datetime}if_/${url}",
  
  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: [
    "/bamboo-service/",
    "/calendar/",
    "/cdx/",
    "/css/",
    "/images/",
    "/js/",
    "/webjars/",
    "https://web.archive.org.au/static/",
    "https://assets.nla.gov.au",
    "https://login.nla.gov.au",
    "https://region1.google-analytics.com",
    "https://www.googletagmanager.com"
  ]
};