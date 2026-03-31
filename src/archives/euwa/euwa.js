export const euwa = {
  // Archive metadata
  id: "euwa",
  archive: "European Union Web Archive",
  archiveOrg: "European Union",
  archiveCountry: "European Union",
  archiveContinent: "Europe",
  archiveUrl: "https://op.europa.eu/en/web/euwebarchive",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://wayback.archive-it.org/12090/timemap/cdx?url=${url}",
  timemap: "https://wayback.archive-it.org/12090/timemap/json/${url}",
  timegate: "https://wayback.archive-it.org/12090/",

  // Replay API endpoints
  endpointID: "https://wayback.archive-it.org/12090/${datetime}id_/${url}", // Raw content
  endpointIF: "https://wayback.archive-it.org/12090/${datetime}if_/${url}", // Navigational toolbars supressed

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