export const trove = {
  // Archive metadata
  id: "trove",
  archive: "Australia Web Archive (Trove)",
  archiveOrg: "National Library of Australia",
  archiveCountry: "Australia",
  archiveContinent: "Oceania",
  archiveUrl: "https://webarchive.nla.gov.au",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "",
  timemap: "",
  timegate: "https://webarchive..nla.org.au/wayback/",

  // Replay API endpoints
  endpointID: "https://webarchive.nla.gov.au/awa/${datetime}id_/${url}", // Raw content
  endpointIF: "https://webarchive.nla.gov.au/awa/${datetime}if_/${url}", // Navigational toolbars supressed

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