export const gcwa = {
  // Archive metadata
  id: "gcwa",
  archive: "Government of Canada Web Archive",
  archiveOrg: "Library and Archives Canada",
  archiveUrl: "https://webarchiveweb.bac-lac.canada.ca",
  
  // Timegate and endpoints
  timegate: "https://webarchiveweb.wayback.bac-lac.canada.ca/web/",
  endpointID: "https://webarchiveweb.wayback.bac-lac.canada.ca/web/${datetime}id_/${url}",
  endpointIF: "https://webarchiveweb.wayback.bac-lac.canada.ca/web/${datetime}if_/${url}",

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
    "https://analytics.archive-it.org"
  ]
};