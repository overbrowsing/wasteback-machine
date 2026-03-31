export const ewa = {
  // Archive metadata
  id: "ewa",
  archive: "Estonian Web Archive",
  archiveOrg: "National Library of Estonia",
  archiveCountry: "Estonia",
  archiveContinent: "Europe",
  archiveUrl: "https://veebiarhiiv.digar.ee",

  // CDX, TimeMap and TimeGate endpoints
  cdx: "https://veebiarhiiv.digar.ee/a/cdx?url=${url}",
  timemap: "https://veebiarhiiv.digar.ee/a/timemap/json/${url}",
  timegate: "https://veebiarhiiv.digar.ee/a/",

  // Replay API endpoints
  endpointID: "https://veebiarhiiv.digar.ee/a/{datetime}id_/{url}", // Raw content
  endpointIF: "https://veebiarhiiv.digar.ee/a/{datetime}x_/{url}", // Navigational toolbars supressed
  
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