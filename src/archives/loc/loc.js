export const loc = {
  // Archive metadata
  id: "loc",
  archive: "Library of Congress Web Archive",
  archiveOrg: "Library of Congress",
  archiveUrl: "https://loc.gov/web-archives",
  
  // Timegate and endpoints
  timegate: "https://webarchive.loc.gov/all/*/",
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
    "/static/"
  ]
};