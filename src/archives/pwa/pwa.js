export const pwa = {
  // Archive metadata
  id: "pwa",
  archive: "PRONI Web Archive",
  archiveOrg: "The Public Record Office of Northern Ireland",
  archiveUrl: "https://webarchive.proni.gov.uk",
  
  // Timegate and endpoints
  timegate: "https://wayback.archive-it.org/11112/",
  endpointID: "https://wayback.archive-it.org/11112/${datetime}id_/${url}",
  endpointIF: "https://wayback.archive-it.org/11112/${datetime}if_/${url}",

  // Cleaning and filtering rules
  cleaningRules: [
    { removeComments: true },
    {
      removeBetween: [
        { start: "/\\* FILE ARCHIVED ON", end: "\\*/" },
        { start: "<!-- FILE ARCHIVED ON", end: "-->" }
      ]
    }
  ],
  excludedPaths: [
    "/static/",
    "https://partner.archive-it.org"
  ]
};