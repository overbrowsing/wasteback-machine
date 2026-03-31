export const ia = {
  // Archive metadata
  id: "ia",
  archive: "Internet Archive (Wayback Machine)",
  archiveOrg: "Internet Archive",
  archiveCountry: "United States of America",
  archiveContinent: "North America",
  archiveUrl: "https://web.archive.org",
  
  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://web.archive.org/cdx/search/cdx?url=${url}",
  timemap: "https://web.archive.org/web/timemap/link/${url}",
  timegate: "https://web.archive.org/web/",

  // Replay API endpoints
  endpointID: "https://web.archive.org/web/${datetime}id_/${url}", // Raw content
  endpointIF: "https://web.archive.org/web/${datetime}if_/${url}", // Navigational toolbars supressed

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