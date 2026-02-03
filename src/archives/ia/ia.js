export const ia = {
  // Archive metadata
  id: "ia",
  archive: "Wayback Machine",
  archiveOrg: "Internet Archive",
  archiveUrl: "https://web.archive.org",
  
  // Timegate and endpoints
  timegate: "https://web.archive.org/web/",
  endpointID: "https://web.archive.org/web/${datetime}id_/${url}",
  endpointIF: "https://web.archive.org/web/${datetime}if_/${url}",

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