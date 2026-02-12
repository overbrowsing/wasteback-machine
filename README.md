# Wasteback Machine

[![NPM version](https://img.shields.io/npm/v/@overbrowsing/wasteback-machine.svg)](https://www.npmjs.com/package/@overbrowsing/wasteback-machine)
[![npm](https://img.shields.io/npm/dt/@overbrowsing/wasteback-machine.svg)](https://www.npmtrends.com/@overbrowsing/wasteback-machine)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

## What is Wasteback Machine?

Wasteback Machine is a JavaScript library for analysing archived web pages, measuring their size and composition to support retrospective, quantitative web research.

## Features

- **Archive-agnostic access:** Works with web archives that use the [Memento Protocol](https://datatracker.ietf.org/doc/html/rfc7089) and expose the unmodified archived page via the [id_ endpoint](https://web.archive.org/web/20130806040521/http://faq.web.archive.org/page-without-wayback-code/).
- **Page composition analysis:** Analyses the full structure of an archived page, including HTML, stylesheets, scripts, images, fonts, and more.
- **Resource inventory:** Produces an optional structured list of all discovered resources with their URLs, types, and byte sizes.
- **Byte-accurate measurement:** Precisely measures the size of each resource, cleans stylesheets and scripts to remove archive-injected content, and excludes any resources that are not part of the original page.
- **Completeness scoring:** Calculates how completely an archived page and its resources were retrieved.

## Supported Web Archives

| Web Archive                                                                                       | Organisation                                   | Web Archive ID ⭐️                      |
|---------------------------------------------------------------------------------------------------|------------------------------------------------|---------------------------------------|
| [Arquivo.pt](https://arquivo.pt)                                                                  | 🇵🇹 FCCN/FCT                                     | [arq](/src/archives/arq/arq.js)       |
| [Australia Web Archive (Trove)](https://webarchive.nla.gov.au)                                    | 🇦🇺 National Library of Australia                | [awa](/src/archives/awa/awa.js)       |
| [Webarchiv](https://webarchiv.cz)                                                                 | 🇨🇿 National Library of the Czech Republic       | [cz](/src/archives/cz/cz.js)          |
| [Government of Canada Web Archive](https://webarchiveweb.bac-lac.canada.ca)                       | 🇨🇦 Library and Archives Canada                  | [gcwa](/src/gcwa/gcwa.js)             |
| [Wayback Machine](https://web.archive.org)                                                        | 🇺🇸 Internet Archive                             | [ia](/src/archives/ia/ia.js)          |
| [Icelandic Web Archive (Vefsafn.is)](https://vefsafn.is)                                          | 🇮🇸 National and University Library of Iceland   | [iwa](/src/archives/iwa/iwa.js)       |
| [Library of Congress Web Archive](https://loc.gov/web-archives)                                   | 🇺🇸 Library of Congress                          | [loc](/src/archives/loc/loc.js)       |
| [National Library of Ireland Web Archive](https://nli.ie/collections/our-collections/web-archive) | 🇮🇪 National Library of Ireland                  | [nliwa](/src/archives/nliwa/nliwa.js) |
| [New Zealand Web Archive](https://webarchive.natlib.govt.nz)                                      | 🇳🇿 National Library of New Zealand              | [nzwa](/src/archives/nzwa/nzwa.js)    |
| [PRONI Web Archive](https://webarchive.proni.gov.uk)                                              | 🇬🇧 The Public Record Office of Northern Ireland | [pwa](/src/archives/pwa/pwa.js)       |
| [Spletni Arhiv](https://arhiv.nuk.uni-lj.si)                                                      | 🇸🇮 National and University Library of Slovenia  | [slo](/src/archives/slo/slo.js)       |
| [UK Government Web Archive (UKGWA)](https://nationalarchives.gov.uk/webarchive)                   | 🇬🇧 The National Archives                        | [ukgwa](/src/archives/ukgwa/ukgwa.js) |
| [~~UK Web Archive~~](https://www.webarchive.org.uk) (Offline)                                     | 🇬🇧 UK Legal Deposit Libraries                   | [ukwa](/src/archives/ukwa/ukwa.js)    |

⭐️ This ID is used to select the web archive you want to query.

### Adding a New Web Archive

If you maintain a web archive not currently supported, please contact us at overbrowsing@ed.ac.uk.

## Installation

To install Wasteback Machine as a dependency for your projects using NPM:

```sh
npm i @overbrowsing/wasteback-machine
```

## Usage

Wasteback Machine provides two primary functions:

1. Fetch available memento-datetimes within a specific web archive for a given URL and time range.
2. Analyse a specific memento from a specific web archive to measure its page size and composition.

### 1. Fetch Available Memento-datetimes

Get all mementos for https://nytimes.com between 1996 and 2025 from the Wayback Machine [(ia)](#supported-web-archives)

```javascript
import { getMementos } from "@overbrowsing/wasteback-machine";

const mementos = await getMementos(
  "ia", // Web archive ID (ia = Wayback Machine)
  "https://nytimes.uk", // Target URL
  1996, // Start year
  2025 // End year
);

console.log(mementos);
```

#### Example Output

```javascript
[
  '19961112181513',
  '19961112181513',
  '19961112181513',
  '19961219002950'...
]
```

### 2. Analyse a Specific Memento

Analyse https://nytimes.com from November 12, 1996 from the Wayback Machine [(ia)](#supported-web-archives)

```javascript
import { getMementoSizes } from "@overbrowsing/wasteback-machine";

const mementoData = await getMementoSizes(
  "ia", // Web Archive ID (ia = Wayback Machine)
  "https://nytimes.com", // Target URL
  "19961112181513", // Memento datetime
  { includeResources: true } // Resource list (true/false)
);

console.log(mementoData);
```

#### Example Output

```js
{
  url: 'https://nytimes.com',
  requestedMemento: '19961112181513',
  memento: '19961112181513',
  mementoUrl: 'https://web.archive.org/web/19961112181513if_/https://nytimes.com',
  archive: 'Wayback Machine',
  archiveOrg: 'Internet Archive',
  archiveUrl: 'https://web.archive.org',
  sizes: {
    html: { bytes: 1653, count: 1 },
    stylesheet: { bytes: 0, count: 0 },
    script: { bytes: 0, count: 0 },
    image: { bytes: 46226, count: 2 },
    video: { bytes: 0, count: 0 },
    audio: { bytes: 0, count: 0 },
    font: { bytes: 0, count: 0 },
    flash: { bytes: 0, count: 0 },
    plugin: { bytes: 0, count: 0 },
    data: { bytes: 0, count: 0 },
    document: { bytes: 0, count: 0 },
    other: { bytes: 0, count: 0 },
    total: { bytes: 47879, count: 3 }
  },
  completeness: '100%',
  resources: [
    {
      url: 'https://web.archive.org/web/19961112181513im_/http://www.nytimes.com/index.gif',
      type: 'image',
      size: 45259
    },
    {
      url: 'https://web.archive.org/web/19961112181513im_/http://www.nytimes.com/free-images/marker.gif',
      type: 'image',
      size: 967
    }
  ]
}
```

## Wasteback Machine CLI

The [Wasteback Machine CLI](/bin/cli.js) lets you easily query web archives, fetch mementos for a given URL and date, and see page size, composition, and estimated emissions using [CO2.js](https://developers.thegreenwebfoundation.org/co2js/overview/).

### Quick Start

To initiate Wasteback Machine CLI using NPM:

```sh
npm run cli
```

### CLI Prompts

```sh
1. Enter web archive ID ('help' to list archives or [Enter ↵] = Wayback Machine):
2. Enter URL to analyse:
3. Enter target year (YYYY):
4. Enter target month (MM or [Enter ↵] = 01):
5. Enter target day (DD or [Enter ↵] = 01):
```

#### Example Output

```sh
________________________________________________________

MEMENTO INFO

  Memento URL:    https://web.archive.org/web/19961112181513if_/https://nytimes.com
  Web Archive:    Wayback Machine
  Organisation:   Internet Archive
  Website:        https://web.archive.org

________________________________________________________

PAGE SIZE

  Data:           46.76 KB
  Emissions:      0.014 g CO₂e
  Completeness:   100%

________________________________________________________

PAGE COMPOSITION

  HTML
      Count:      1
      Data:       1653 bytes (3.5%)
      Emissions:  0.000 g CO₂e

  IMAGE
      Count:      2
      Data:       46226 bytes (96.5%)
      Emissions:  0.013 g CO₂e

________________________________________________________
```

## Methodology and Development

Wasteback Machine was developed as part of doctoral research at [The University of Edinburgh’s Institute for Design Informatics](https://designinformatics.org/portfolio-item/wasteback-machine/) and was supported in part by the [EADH (European Association for Digital Humanities)](https://eadh.org/).

For details of the underlying methodology, assumptions, and limitations, please refer to our paper [DOI 10.1371/journal.pclm.0000767](https://journals.plos.org/climate/article?id=10.1371/journal.pclm.0000767#sec009).

> [!IMPORTANT]
> Wasteback Machine is provided for informational and research purposes only. The authors make no guarantees about the accuracy of the results and disclaim any liability for their use. Use of Wasteback Machine is subject to the terms of service of each respective web archive.

## Contributing

Contributions are welcome! Please [submit an issue](https://github.com/overbrowsing/wasteback-machine/issues) or a [pull request](https://github.com/overbrowsing/wasteback-machine/pulls).

## Licenses

Wasteback Machine is licensed under [Apache 2.0](https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)). For full licensing details, see the [LICENSE](/LICENSE) file.