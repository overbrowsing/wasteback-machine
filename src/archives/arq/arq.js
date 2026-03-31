export const arq = {
  // Archive metadata
  id: "arq",
  archive: "Arquivo.pt",
  archiveOrg: "FCCN/FCT",
  archiveCountry: "Portugal",
  archiveContinent: "Europe",
  archiveUrl: "https://arquivo.pt",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://arquivo.pt/wayback/cdx?url=${url}",
  timemap: "https://arquivo.pt/wayback/timemap/json/${url}",
  timegate: "https://arquivo.pt/wayback/",

  // Replay API endpoints
  endpointID: "https://arquivo.pt/noFrame/replay/${datetime}id_/${url}", // Raw content
  endpointIF: "https://arquivo.pt/noFrame/replay/${datetime}if_/${url}", // Navigational toolbars supressed

  // Cleaning and filtering rules
  cleaningRules: [],
  excludedPaths: [
    "/static/"
  ]
};