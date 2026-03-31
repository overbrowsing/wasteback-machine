export const cul = {
  // Archive metadata
  id: "cul",
  archive: "Columbia University Libraries Web Archives",
  archiveOrg: "Columbia University Libraries",
  archiveCountry: "United States of America",
  archiveContinent: "North America",
  archiveUrl: "https://wayback.archive-it.org/org-304/",
  
  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://wayback.archive-it.org/org-304/timemap/cdx?url=${url}",
  timemap: "https://wayback.archive-it.org/org-304/timemap/json/${url}",
  timegate: "https://wayback.archive-it.org/org-304/",

  // Replay API endpoints
  endpointID: "https://wayback.archive-it.org/org-304/${datetime}id_/${url}", // Raw content
  endpointIF: "https://wayback.archive-it.org/org-304/${datetime}if_/${url}", // Navigational toolbars supressed

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