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

## Usage

Wasteback Machine provides two main functions:

1. Discover available snapshots for a URL in a given time range.
2. Analyse a specific snapshot for page size and composition.

### 1. Fetch Available Snapshots

```javascript
import { getSnapshots } from "@overbrowsing/wasteback-machine";

// Get all snapshots for a URL between 2012 and 2025
const snapshots = await getSnapshots('https://example.com', 2012, 2025);
console.log(snapshots);
```

### Example Output

```javascript
["20120101123456", "20120615120000", "20121231180000"]
```

### 2. Analyse a Specific Snapshot

```javascript
import { getSnapshotSizes } from "@overbrowsing/wasteback-machine";

// Analyse a specific snapshot
const snapshotData = await getSnapshotSizes('https://example.com', '20120101123456', { includeAssets: true });
```

### Example Output:

```js
{
  "url": "https://example.com",
  "requestedSnapshot": "20120101123456",
  "snapshot": "20120101123456",
  "archiveUrl": "https://web.archive.org/web/20120101123456/https://example.com",
  "sizes": {
    "html": { "bytes": 12345, "count": 1 },
    "css": { "bytes": 54321, "count": 2 },
    "js": { "bytes": 1024, "count": 1 },
    "image": { "bytes": 500000, "count": 5 },
    "video": { "bytes": 0, "count": 0 },
    "audio": { "bytes": 0, "count": 0 },
    "font": { "bytes": 0, "count": 0 },
    "flash": { "bytes": 0, "count": 0 },
    "plugin": { "bytes": 0, "count": 0 },
    "other": { "bytes": 0, "count": 0 },
    "total": { "bytes": 563690, "count": 9 }
  },
  "completeness": "89%",
  "assets": [
    { "url": "https://web.archive.org/web/20120101123456js_/script.js", "type": "js", "size": 1024 },
    { "url": "https://web.archive.org/web/20120101123456im_/image.png", "type": "image", "size": 250000 }
  ]
}
```

## Demo

A full interactive demo is available in [`examples/demo.js`](examples/demo.js), which integrates [CO2.js](https://developers.thegreenwebfoundation.org/co2js/overview) with the 1Byte model to estimate the environmental impact of page data transfer.

The demo allows you to:
- Enter a URL and a target date (year, optional month and day).
- See page size results:
  - Total data transfer (KB)
  - Estimated emissions (grams CO₂e)
  - Completeness of retrieval
- View a breakdown of all assets including:
  - Number of files
  - Size in KB and percentage of total page size
  - Estimated CO₂e per type

### Run the Demo

Run the demo with Node.js:

```bash
node examples/demo.js
```

## Method

A technical paper on the Wasteback Machine methodology is currently being prepared. Until it is published, please contact overbrowsing@ed.ac.uk for more information.

## Disclaimer

Because web archives are inherently ephemeral, Wasteback Machine outputs should be treated as indicative, highlighting relative growth trends in page size and composition over time rather than providing exact measurements. Estimates of environmental impact are likewise approximate. Users should base any claims only on evidence that can be supported and ensure that any formal reporting or use of results is reviewed by a qualified professional. Misleading sustainability claims (greenwashing) can cause harm and may carry legal or reputational risks. The authors and contributors accept no responsibility for how this software, its outputs, or any findings derived from it are used.

## Contributing

Contributions are welcome! Please [submit an issue](https://github.com/overbrowsing/wasteback-machine/issues) or a [pull request](https://github.com/overbrowsing/wasteback-machine/pulls).

## Licenses

This project is licensed under [Apache 2.0](https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)).

The Wayback Machine API is provided by the Internet Archive and is subject to their [Terms of Use](https://archive.org/about/terms).

See the [LICENSE](/LICENSE) file for details.