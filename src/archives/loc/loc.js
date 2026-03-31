export const loc = {
  // Archive metadata
  id: "loc",
  archive: "Library of Congress Web Archive",
  archiveOrg: "Library of Congress",
  archiveCountry: "United States of America",
  archiveContinent: "North America",
  archiveUrl: "https://loc.gov/web-archives",
  
  // CDX, TimeMap and TimeGate endpoints
  cdx: "",
  timemap: "",
  timegate: "https://webarchive.loc.gov/all/",

  // Replay API endpoints
  endpointID: "https://webarchive.loc.gov/all/${datetime}id_/${url}", // Raw content
  endpointIF: "https://webarchive.loc.gov/all/${datetime}if_/${url}", // Navigational toolbars supressed

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
    "/static/"
  ]
};