export const arq = {
  // Archive metadata
  id: "arq",
  archive: "Arquivo.pt",
  archiveOrg: "FCCN/FCT",
  archiveUrl: "https://arquivo.pt",

  // Timegate and endpoints
  timegate: "https://arquivo.pt/wayback/",
  endpointID: "https://arquivo.pt/noFrame/replay/${datetime}id_/${url}",
  endpointIF: "https://arquivo.pt/noFrame/replay/${datetime}if_/${url}",

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: [
    "/static/"
  ]
};