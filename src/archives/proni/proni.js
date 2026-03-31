export const proni = {
  // Archive metadata
  id: "proni",
  archive: "PRONI Web Archive",
  archiveOrg: "The Public Record Office of Northern Ireland",
  archiveCountry: "United Kingdom (Northern Ireland)",
  archiveContinent: "Europe",
  archiveUrl: "https://webarchive.proni.gov.uk",
  
  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://wayback.archive-it.org/11112/timemap/cdx?url=${url}",
  timemap: "https://wayback.archive-it.org/11112/timemap/json/${url}",
  timegate: "https://wayback.archive-it.org/11112/",
  
  // Replay API endpoints
  endpointID: "https://wayback.archive-it.org/11112/${datetime}id_/${url}", // Raw content
  endpointIF: "https://wayback.archive-it.org/11112/${datetime}if_/${url}", // Navigational toolbars supressed

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
    "https://partner.archive-it.org"
  ]
};