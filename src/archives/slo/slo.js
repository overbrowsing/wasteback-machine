export const slo = {
  // Archive metadata
  id: "slo",
  archive: "Spletni Arhiv",
  archiveOrg: "National and University Library of Slovenia",
  archiveUrl: "https://arhiv.nuk.uni-lj.si",

  // Timegate and endpoints
  timegate: "https://arhiv.nuk.uni-lj.si/wayback/",
  endpointID: "https://arhiv.nuk.uni-lj.si/wayback/${datetime}id_/${url}",
  endpointIF: "https://arhiv.nuk.uni-lj.si/wayback/${datetime}if_/${url}",

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