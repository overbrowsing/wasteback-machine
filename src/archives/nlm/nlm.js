export const nlm = {
  // Archive metadata
  id: "nlm",
  archive: "National Library of Medicine",
  archiveOrg: "National Library of Medicine",
  archiveCountry: "United States of America",
  archiveContinent: "North America",
  archiveUrl: "https://archive-it.org/organizations/350/",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://wayback.archive-it.org/org-350/timemap/cdx?url=${url}",
  timemap: "https://wayback.archive-it.org/org-350/timemap/json/${url}",
  timegate: "https://wayback.archive-it.org/org-350/",

  // Replay API endpoints
  endpointID: "https://wayback.archive-it.org/org-350/${datetime}id_/${url}", // Raw content
  endpointIF: "https://wayback.archive-it.org/org-350/${datetime}if_/${url}", // Navigational toolbars supressed

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