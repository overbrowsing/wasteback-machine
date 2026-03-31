export const banq = {
  // Archive metadata
  id: "banq",
  archive: "National Library and Archives of Quebec (BAnQ) Web Archiving",
  archiveOrg: "National Library and Archives of Quebec (BAnQ)",
  archiveCountry: "Canada",
  archiveContinent: "North America",
  archiveUrl: "https://www2.banq.qc.ca/collections/collections_patrimoniales/archives_web",
 
  // CDX, TimeMap and TimeGate endpoints
  cdx: "",
  timemap: "https://waext.banq.qc.ca/wayback/timemap/json/${url}",
  timegate: "https://waext.banq.qc.ca/wayback/",

  // Replay API endpoints
  endpointID: "https://waext.banq.qc.ca/wayback/${datetime}id_/${url}", // Raw content
  endpointIF: "https://waext.banq.qc.ca/wayback/${datetime}x_/${url}", // Navigational toolbars supressed

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
  excludedPaths: []
};