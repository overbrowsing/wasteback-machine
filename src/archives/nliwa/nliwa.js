export const nliwa = {
  // Archive metadata
  id: "nliwa",
  archive: "National Library of Ireland Web Archive",
  archiveOrg: "National Library of Ireland",
  archiveUrl: "https://nli.ie/collections/our-collections/web-archive",
  
  // Timegate and endpoints
  timegate: "https://wayback.archive-it.org/org-1444/",
  endpointID: "https://wayback.archive-it.org/org-1444/${datetime}id_/${url}",
  endpointIF: "https://wayback.archive-it.org/org-1444/${datetime}if_/${url}",

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