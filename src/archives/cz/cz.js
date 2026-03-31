export const cz = {
  // Archive metadata
  id: "cz",
  archive: "Webarchiv",
  archiveOrg: "National Library of the Czech Republic",
  archiveCountry: "Czech Republic",
  archiveContinent: "Europe",
  archiveUrl: "https://webarchiv.cz/",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://wayback.webarchiv.cz/wayback/cdx?url=${url}",
  timemap: "https://wayback.webarchiv.cz/wayback/timemap/json/${url}",
  timegate: "https://wayback.webarchiv.cz/wayback/",

  // Replay API endpoints
  endpointID: "https://wayback.webarchiv.cz/wayback/${datetime}id_/${url}", // Raw content
  endpointIF: "https://wayback.webarchiv.cz/wayback/${datetime}if_/${url}", // Navigational toolbars supressed
  
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