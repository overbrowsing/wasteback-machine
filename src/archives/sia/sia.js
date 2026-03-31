export const sia = {
  // Archive metadata
  id: "sia",
  archive: "Smithsonian Institution Archives",
  archiveOrg: "Smithsonian Libraries and Archives",
  archiveCountry: "United States of America",
  archiveContinent: "North America",
  archiveUrl: "https://siarchives.si.edu",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://wayback.archive-it.org/org-660/timemap/cdx?url=${url}",
  timemap: "https://wayback.archive-it.org/org-660/timemap/json/${url}",
  timegate: "https://wayback.archive-it.org/org-660/",

  // Replay API endpoints
  endpointID: "https://wayback.archive-it.org/org-660/${datetime}id_/${url}", // Raw content
  endpointIF: "https://wayback.archive-it.org/org-660/${datetime}if_/${url}", // Navigational toolbars supressed

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