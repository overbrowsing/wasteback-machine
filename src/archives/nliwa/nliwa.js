export const nliwa = {
  // Archive metadata
  id: "nliwa",
  archive: "National Library of Ireland Web Archive",
  archiveOrg: "National Library of Ireland",
  archiveCountry: "Ireland",
  archiveContinent: "Europe",
  archiveUrl: "https://nli.ie/collections/our-collections/web-archive",
  
  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://wayback.archive-it.org/org-1444/timemap/cdx?url=${url}",
  timemap: "https://wayback.archive-it.org/org-1444/timemap/json/${url}",
  timegate: "https://wayback.archive-it.org/org-1444/",

  // Replay API endpoints
  endpointID: "https://wayback.archive-it.org/org-1444/${datetime}id_/${url}", // Raw content
  endpointIF: "https://wayback.archive-it.org/org-1444/${datetime}if_/${url}", // Navigational toolbars supressed

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