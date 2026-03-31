export const slo = {
  // Archive metadata
  id: "slo",
  archive: "Spletni Arhiv",
  archiveOrg: "National and University Library of Slovenia",
  archiveCountry: "Slovenia",
  archiveContinent: "Europe",
  archiveUrl: "https://arhiv.nuk.uni-lj.si",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "",
  timemap: "http://arhiv.nuk.uni-lj.si/wayback/timemap/json/${url}",
  timegate: "https://arhiv.nuk.uni-lj.si/wayback/",

  // Replay API endpoints
  endpointID: "https://arhiv.nuk.uni-lj.si/wayback/${datetime}id_/${url}", // Raw content
  endpointIF: "https://arhiv.nuk.uni-lj.si/wayback/${datetime}if_/${url}", // Navigational toolbars supressed

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
    "/extern_js/",
    "/images/",
    "/intl/",
    "/textinputassistant/",
    "https://ssl.gstatic.com/",
  ]
};