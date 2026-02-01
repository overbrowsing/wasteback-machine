export const cz = {
  // Archive metadata
  id: "cz",
  archive: "Webarchiv",
  archiveOrg: "National Library of the Czech Republic",
  archiveUrl: "https://webarchiv.cz/",

  // Timegate and endpoints
  timegate: "https://wayback.webarchiv.cz/wayback/",
  endpointID: "https://wayback.webarchiv.cz/wayback/${datetime}id_/${url}",
  endpointIF: "https://wayback.webarchiv.cz/wayback/${datetime}if_/${url}",

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