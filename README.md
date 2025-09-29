# Wasteback Machine

[![NPM version](https://img.shields.io/npm/v/@overbrowsing/wasteback-machine.svg)](https://www.npmjs.com/package/@overbrowsing/wasteback-machine)
[![npm](https://img.shields.io/npm/dt/@overbrowsing/wasteback-machine.svg)](https://www.npmtrends.com/@overbrowsing/wasteback-machine)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

## What Is Wasteback Machine?

Wasteback Machine is a JavaScript library for analysing historical website sizes, composition, and environmental impact using snapshots from the [Internet Archive's Wayback Machine](https://web.archive.org).

## Why Use It?

Most page analysis tools are strictly contemporary, ignoring historical context. Wasteback Machine retrieves archived pages from the Internet Archive’s Wayback Machine with high fidelity, removing artifacts, correcting modifications, and preserving temporal coherence. This enables retrospective longitudinal analysis of page size, defined as the amount of data transferred over the internet when a webpage is loaded, along with page composition. It also supports the estimation of environmental impact using libraries that convert page size into equivalent carbon emissions, such as [CO2.js](https://developers.thegreenwebfoundation.org/co2js/overview), and easy integration with research or analytics workflows focused on web growth and sustainability.

## Features

- **Retrieve snapshots by date or timespan:** Selects the nearest snapshot if the exact timestamp is missing.
- **Analyse page composition:** Measure sizes of HTML, CSS, JS, images, videos, fonts, etc.
- **Generate detailed asset lists:** Includes URLs, types, and sizes of all page assets.
- **Retrieval completeness score:** See what percentage of a snapshot was successfully retrieved.

## Installation

### Using NPM

To install Wasteback Machine as a dependency for your projects using NPM:

```sh
npm install @overbrowsing/wasteback-machine
```

### Using Yarn

To install Wasteback Machine as a dependency for your projects using Yarn:

```sh
yarn add @overbrowsing/wasteback-machine
```

## Usage

Wasteback Machine provides two main functions:

1. Discover available snapshots for a URL in a given time range.
2. Analyse a specific snapshot for page size and composition.

### 1. Fetch Available Snapshots

```javascript
import { getSnapshots } from "@overbrowsing/wasteback-machine";

// Get all snapshots for www.nytimes.com between 1996 and 2025
const snapshots = await getSnapshots('https://nytimes.com', 1996, 2025);
console.log(snapshots);
```

Example Output:

```javascript
[
  '19961112181513', '19961112181513', '19961112181513', '19961219002950', ...
]
```

### 2. Analyse a Specific Snapshot

```javascript
import { getSnapshotSizes } from "@overbrowsing/wasteback-machine";

// Analyse www.nytimes.com snapshot from November 12, 1996
const snapshotData = await getSnapshotSizes(
  'https://nytimes.com',
  '19961112181513',
  { includeAssets: true } // optional: set to true to include full asset list
);
console.log(snapshotData);
```

Example Output:

```js
{
  url: 'https://nytimes.com',
  requestedSnapshot: '19961112181513',
  snapshot: '19961112181513',
  archiveUrl: 'https://web.archive.org/web/19961112181513/https://nytimes.com',
  sizes: {
    html: { bytes: 1653, count: 1 },
    css: { bytes: 0, count: 0 },
    js: { bytes: 0, count: 0 },
    image: { bytes: 46226, count: 2 },
    video: { bytes: 0, count: 0 },
    audio: { bytes: 0, count: 0 },
    font: { bytes: 0, count: 0 },
    flash: { bytes: 0, count: 0 },
    plugin: { bytes: 0, count: 0 },
    data: { bytes: 0, count: 0 },
    other: { bytes: 0, count: 0 },
    total: { bytes: 47879, count: 3 }
  },
  completeness: '100%',
  assets: [
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

## Demo

A demo is available in [`examples/demo.js`](examples/demo.js), which integrates [CO2.js](https://developers.thegreenwebfoundation.org/co2js/overview) with the 1Byte model to estimate the environmental impact of page data transfer.

The demo allows you to:
- Enter a URL and a target date (year, optional month and day).
- See page size results:
  - Total data transfer (KB)
  - Estimated emissions (grams CO₂e)
  - Completeness of retrieval
- View a breakdown of all assets including:
  - Number of files
  - Size (KB) and percentage of total page size
  - Estimated CO₂e per type

### Run the Demo

Run the demo with Node.js:

```bash
node examples/demo.js <URL> <Year YYYY> [Month MM] [Day DD]
```

Example:

```bash
# Analyse www.nytimes.com snapshot from November 12, 1996
node examples/demo.js www.nytimes.com 1996 11 12
```

## Method

A paper on the Wasteback Machine method is currently being prepared. Until it is published, please contact overbrowsing@ed.ac.uk for more information.

## Disclaimer

> [!IMPORTANT]
> - The Wasteback Machine is provided on an as-is basis for informational purposes only. Users are expected to exercise professional judgement when interpreting and applying the data and insights generated, and the authors disclaim any liability for consequences arising from its use.
> - The Wasteback Machine is a heuristic tool focusing on bytes transferred and should be interpreted as indicative trends rather than precise measurements. Regular, contemporaneous measurement and reporting remain best practice in evaluating web sustainability.
> - Longitudinal comparability is affected by advances in web technology, network and computational efficiencies [(Koomey's Law)][https://ieeexplore.ieee.org/document/5440129], and changing user expectations, making exact "apples-to-apples" comparisons challenging. When combining results with contemporary data, comparisons should be made under equivalent conditions, and sensitivity analyses are recommended. Results from live websites and historical snapshots should be clearly distinguished in reporting.
> - The Wasteback Machine does not capture system-level energy use or operational context and cannot determine if hosting is on [verified renewable energy](https://www.thegreenwebfoundation.org/green-web-check).
> - Not all bytes have the same environmental impact, as some assets, such as complex JavaScript or CSS, require more client-side resources and energy than others.
> - The Internet Archive’s Wayback Machine snapshots may not be complete. Futhermore, in certain edge cases, such as dynamically loaded resources, single-page applications, or websites using iFrames, may not be measured accurately. The completeness score reflects the proportion of assets retrieved from an archived page, not the completeness of the live page at the time of archiving.

## Contributing

Contributions are welcome! Please [submit an issue](https://github.com/overbrowsing/wasteback-machine/issues) or a [pull request](https://github.com/overbrowsing/wasteback-machine/pulls).

## Licenses

This project is licensed under [Apache 2.0](https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)).

The Wayback Machine API is provided by the Internet Archive and is subject to their [Terms of Use](https://archive.org/about/terms).

See the [LICENSE](/LICENSE) file for details.