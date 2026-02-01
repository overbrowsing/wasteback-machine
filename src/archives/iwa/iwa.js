export const iwa = {
  // Archive metadata
  id: "iwa",
  archive: "Icelandic Web Archive (Vefsafn.is)",
  archiveOrg: "National and University Library of Iceland",
  archiveUrl: "https://vefsafn.is",

  // Timegate and endpoints
  timegate: "https://vefsafn.is/",
  endpointID: "https://vefsafn.is/${datetime}id_/${url}",
  endpointIF: "https://vefsafn.is/${datetime}if_/${url}",

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: [
    "/static/",
    "https://t.landsbokasafn.is"
  ]
};