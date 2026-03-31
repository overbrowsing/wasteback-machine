export const gcwa = {
  // Archive metadata
  id: "gcwa",
  archive: "Government of Canada Web Archive",
  archiveOrg: "Library and Archives Canada",
  archiveCountry: "Canada",
  archiveContinent: "North America",
  archiveUrl: "https://webarchiveweb.bac-lac.canada.ca",
  
  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://webarchiveweb.wayback.bac-lac.canada.ca/web/timemap/cdx?url=${url}",
  timemap: "https://webarchiveweb.wayback.bac-lac.canada.ca/web/timemap/json/${url}",
  timegate: "https://webarchiveweb.wayback.bac-lac.canada.ca/web/",

  // Replay API endpoints
  endpointID: "https://webarchiveweb.wayback.bac-lac.canada.ca/web/${datetime}id_/${url}", // Raw content
  endpointIF: "https://webarchiveweb.wayback.bac-lac.canada.ca/web/${datetime}if_/${url}", // Navigational toolbars supressed
  
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