# Wasteback Machine

[![NPM version](https://img.shields.io/npm/v/@overbrowsing/wasteback-machine.svg)](https://www.npmjs.com/package/@overbrowsing/wasteback-machine)
[![npm](https://img.shields.io/npm/dt/@overbrowsing/wasteback-machine.svg)](https://www.npmtrends.com/@overbrowsing/wasteback-machine)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

## What is Wasteback Machine?

Wasteback Machine is a JavaScript library for analysing archived web pages, measuring their size and composition to enable retrospective, quantitative web research.

## Features

- **Archive-agnostic:** [Supports 20+ web archives](#supported-web-archives) and is [extensible to additional archives](#adding-web-archives).
- **Aggregate mementos:** Retrieve memento-datetimes for a target URL from an archive’s CDX server.
- **Analyse page composition:** Break down archived web pages by resource type, including HTML, stylesheets, scripts, images, etc.
- **Calculate size metrics:** Compute total and per-type sizes, including counts and bytes.
- **Generate resource inventory:** Optionally produce an inventory of all resources with metadata.
- **Completeness scoring:** Assess how fully an archived web page was retrieved.
- **CLI utility:** Analyse archived web pages [directly from the command line](#cli).

## Installation

To install Wasteback Machine as a dependency for your projects using NPM:

```sh
npm i @overbrowsing/wasteback-machine
```

## API

Wasteback Machine provides two functions:

1. **`getMementos`**: Fetch all memento-datetimes from the CDX server of a [supported web archive](#supported-web-archives) for a given URL.
2. **`analyseMemento`**: Analyses the size and composition of an archived web page from a [supported web archive](#supported-web-archives).

### 1. Fetch Available Memento-datetimes (`getMementos`)

Fetch all memento-datetimes for https://nytimes.com, from the Internet Archive [(🆔 = ia)](#supported-web-archives).

```javascript
import { getMementos } from "@overbrowsing/wasteback-machine";

const mementos = await getMementos(
  "ia", // Web archive ID (🆔 = ia, Internet Archive)
  "https://nytimes.com", // Target URL
);

console.log(mementos);
```

#### Example Output

```javascript
[
  '19961112181513', '19961121230155', '19961219002950', '19961220073509',
  '19961226135029', '19961228014508', '19961230230427', '19970209220858',
  '19970303103041', '19970414192930', '19970414210143', '19970415180120',
  ... 688983 more items
]
```

### 2. Analyse An Archived Web Page (`analyseMemento`)

Analyse the archived snapshot of https://nytimes.com, November 12, 1996, from the Internet Archive [(🆔 = ia)](#supported-web-archives).

> [!TIP]
> If you provide a full 14-digit datetime (`YYYYMMDDhhmmss`) using [`getMementos`](#1-fetch-available-memento-datetimes-getmementos), Wasteback Machine skips the TimeGate (URI-G) lookup, improving performance.

```javascript
import { analyseMemento } from "@overbrowsing/wasteback-machine";

const mementoData = await analyseMemento(
  "ia", // Web archive ID (🆔 = ia, Internet Archive)
  "https://nytimes.com", // Target URL
  "19961112", // Target memento-datetime (YYYYMMDDhhmmss); minimum input: YYYY
  { includeResources: true } // Resource list (true/false)
);

console.log(mementoData);
```

#### Example Output

```javascript
{
  target: {
    url: 'https://nytimes.com', 
    datetime: '19961112'
  },
  memento: {
    url: 'https://web.archive.org/web/19961112181513if_/https://nytimes.com',
    datetime: '19961112181513',
  },
  archive: {
    name: 'Internet Archive (Wayback Machine)',
    organisation: 'Internet Archive',
    country: 'United States of America',
    continent: 'North America',
    url: 'https://web.archive.org',
  },
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

## Supported Web Archives

Each supported web archive has a unique web archive ID (🆔) required for API calls. The table also indicates which functions each archive supports.

| Web Archive                                                                                                                                | Organisation                                      | 🆔                                           | [`getMementos`](#1-fetch-available-memento-datetimes-getmementos) | [`analyseMemento`](#2-analyse-an-archived-web-page-analysememento) |
|--------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------|---------------------------------------------|------------------------------------------------------------------ |---------------------------------------------------------------------|
| [Arquivo.pt](https://arquivo.pt)                                                                                                           | 🇵🇹 FCCN/FCT                                        | [arq](/src/archives/arq/arq.js)             | ✅                                                                | ✅                                                                  |
| [National Library and Archives of Quebec (BAnQ) Web Archiving](https://www2.banq.qc.ca/collections/collections_patrimoniales/archives_web) | 🇨🇦 National Library and Archives of Quebec (BAnQ)  | [banq](/src/archives/banq/banq.js)          | ❌                                                                | ✅                                                                  |
| [Columbia University Libraries Web Archives](https://library.columbia.edu/collections/web-archives)                                        | 🇺🇸 Columbia University Libraries                   | [cul](/src/archives/cul/cul.js)             | ✅                                                                | ✅                                                                  |
| [Webarchiv](https://webarchiv.cz)                                                                                                          | 🇨🇿 National Library of the Czech Republic          | [cz](/src/archives/cz/cz.js)                | ✅                                                                | ✅                                                                  |
| [European Union Web Archive](https://op.europa.eu/en/web/euwebarchive)                                                                     | 🇪🇺 European Union                                  | [euwa](/src/archives/euwa/euwa.js)          | ✅                                                                | ✅                                                                  |
| [Estonian Web Archive](https://veebiarhiiv.digar.ee)                                                                                       | 🇪🇪 National Library of Estonia                     | [ewa](/src/archives/ewa/ewa.js)             | ✅                                                                | ✅                                                                  |
| [Government of Canada Web Archive](https://webarchiveweb.bac-lac.canada.ca)                                                                | 🇨🇦 Library and Archives Canada                     | [gcwa](/src/gcwa/gcwa.js)                   | ✅                                                                | ✅                                                                  |
| [Croatian Web Archives (HAW)](https://haw.nsk.hr)                                                                                          | 🇭🇷 National and University Library in Zagreb       | [haw](/src/archives/haw/haw.js)             | ✅                                                                | ✅                                                                  |
| [Internet Archive (Wayback Machine)](https://web.archive.org)                                                                              | 🇺🇸 Internet Archive                                | [ia](/src/archives/ia/ia.js)                | ✅                                                                | ✅                                                                  |
| [Icelandic Web Archive (Vefsafn.is)](https://vefsafn.is)                                                                                   | 🇮🇸 National and University Library of Iceland      | [iwa](/src/archives/iwa/iwa.js)             | ✅                                                                | ✅                                                                  |
| [Library of Congress Web Archive](https://loc.gov/web-archives)                                                                            | 🇺🇸 Library of Congress                             | [loc](/src/archives/loc/loc.js)             | ❌                                                                | ✅                                                                  |
| [National Library of Ireland Web Archive](https://nli.ie/collections/our-collections/web-archive)                                          | 🇮🇪 National Library of Ireland                     | [nliwa](/src/archives/nliwa/nliwa.js)       | ✅                                                                | ✅                                                                  |
| [National Library of Medicine](https://archive-it.org/organizations/350)                                                                   | 🇺🇸 National Library of Medicine                    | [nlm](/src/archives/nlm/nlm.js)             | ✅                                                                | ✅                                                                  |
| [National Records of Scotland Web Archive](https://webarchive.nrscotland.gov.uk)                                                           | 🏴󠁧󠁢󠁳󠁣󠁴󠁿 National Records of Scotland                    | [nrs](/src/archives/nrs/nrs.js)             | ✅                                                                | ✅                                                                  |
| [New Zealand Web Archive](https://webarchive.natlib.govt.nz)                                                                               | 🇳🇿 National Library of New Zealand                 | [nzwa](/src/archives/nzwa/nzwa.js)          | ✅                                                                | ✅                                                                  |
| [The Web Archive of Catalonia (Padicat)](https://padicat.cat)                                                                              | 🇪🇸 Library of Catalonia                            | [padicat](/src/archives/padicat/padicat.js) | ✅                                                                | ✅                                                                  |
| [PRONI Web Archive](https://webarchive.proni.gov.uk)                                                                                       | 🇬🇧 The Public Record Office of Northern Ireland    | [proni](/src/archives/proni/proni.js)       | ✅                                                                | ✅                                                                  |
| [Smithsonian Institution Archives](https://siarchives.si.edu)                                                                              | 🇺🇸 Smithsonian Libraries and Archives              | [sia](/src/archives/sia/sia.js)             | ✅                                                                | ✅                                                                  |
| [Spletni Arhiv](https://arhiv.nuk.uni-lj.si)                                                                                               | 🇸🇮 National and University Library of Slovenia     | [slo](/src/archives/slo/slo.js)             | ❌                                                                | ✅                                                                  |
| [Australia Web Archive (Trove)](https://webarchive.nla.gov.au)                                                                             | 🇦🇺 National Library of Australia                   | [trove](/src/archives/trove/trove.js)       | ❌                                                                | ✅                                                                  |
| [UK Government Web Archive (UKGWA)](https://nationalarchives.gov.uk/webarchive)                                                            | 🇬🇧 The National Archives                           | [ukgwa](/src/archives/ukgwa/ukgwa.js)       | ✅                                                                | ✅                                                                  |
| [University of North Texas Web Archives](https://digital.library.unt.edu/explore/collections/untweb)                                       | 🇺🇸 University of North Texas University Libraries  | [untwa](/src/archives/untwa/untwa.js)       | ✅                                                                | ✅                                                                  |
| [York University Digital Library](https://digital.library.yorku.ca)                                                                        | 🇨🇦 York University Libraries                       | [yudl](/src/archives/yudl/yudl.js)          | ✅                                                                | ✅                                                                  |

### Adding Web Archives

Wasteback Machine can support additional web archives if they meet the following criteria:

1. Provide a CDX server API (required for [`getMementos`](#1-fetch-available-memento-datetimes-getmementos)).
2. Support the [Memento Protocol (RFC 7089)](https://datatracker.ietf.org/doc/html/rfc7089) (required for [`analyseMemento`](#2-analyse-an-archived-web-page-analysememento)).
3. Offer replay API endpoints for both:
    -	Raw content ([see example](https://web.archive.org/web/20131001001332id_/https://www.bbc.co.uk)).
    -	Navigational toolbars suppressed ([see example](https://web.archive.org/web/20131001001332if_/https://www.bbc.co.uk)).

To request support for an archive that meets these criteria, [submit an issue](https://github.com/overbrowsing/wasteback-machine/issues/new?template=add-new-web-archive.md) using the template.

## CLI

Wasteback Machine CLI lets you analyse an archived web page to view its size, composition, and estimated emissions using [CO2.js](https://developers.thegreenwebfoundation.org/co2js/overview) and the [Sustainable Web Design Model](https://sustainablewebdesign.org/estimating-digital-emissions).

### Quick Start

To initiate Wasteback Machine CLI using NPM:

```sh
npm run cli
```

### CLI Prompts

```sh
1. Enter web archive ID ('help' to list archives or [Enter ↵] = Internet Archive (Wayback Machine)):
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
  Web Archive:    Internet Archive (Wayback Machine)
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

## Credits

Developed by the [Overbrowsing](https://overbrowsing.com) at [The University of Edinburgh’s Institute for Design Informatics](https://designinformatics.org/portfolio-item/wasteback-machine), with support in part from the [European Association for Digital Humanities (EADH)](https://eadh.org).

## Citing

Results generated with Wasteback Machine may be freely cited, quoted, analysed, or republished with attribution to 'Wasteback Machine'. No special permission is required for academic, journalistic, or personal use.

A publication related to this project appeared in the Proceedings of iConference 2026 ([view PDF](https://publicera.kb.se/ir/article/view/64185/51902)). Please cite as:

> Mahoney, D. (2026). Wasteback Machine: a method for quantitative measurement of the archived web. Information Research an International Electronic Journal, 31 (iConf), 448–464. https://doi.org/10.47989/ir31iConf64185

```bib
@article{Mahoney_2026,
  author  = {Mahoney, David},
  title   = {Wasteback Machine: a method for quantitative measurement of the archived web},
  journal = {Information Research: An International Electronic Journal},
  volume  = {31},
  number  = {iConf},
  pages   = {448-464},
  year    = {2026},
  month   = {Mar},
  url     = {https://publicera.kb.se/ir/article/view/64185},
  doi     = {10.47989/ir31iConf64185}
}
```

## Licenses

Wasteback Machine is licensed under [Apache 2.0](https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)). For full licensing details, see the [LICENSE](/LICENSE) file.

Use of Wasteback Machine is subject to the terms, policies and licenses of each respective [supported web archive](#supported-web-archives).

## Terms

All results generated by Wasteback Machine are provided "as-is" without warranties of any kind, express or implied, including but not limited to accuracy, completeness, or reliability. The authors and contributors accept no liability for any errors, omissions, or consequences arising from the use of this software or the results it produces.