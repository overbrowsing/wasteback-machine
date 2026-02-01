export const ia = {
  // Archive metadata
  id: "ia",
  archive: "Wayback Machine",
  archiveOrg: "Internet Archive",
  archiveUrl: "https://web.archive.org",
  
  // Timegate and endpoints
  timegate: "https://webarchive.loc.gov/",
  endpointID: "https://webarchive.loc.gov/all/${datetime}id_/${url}",
  endpointIF: "https://webarchive.loc.gov/all/${datetime}if_/${url}",

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
    "/_static/",
    "https://web-static.archive.org"
  ]
};