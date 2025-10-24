# Wasteback Machine

[![NPM version](https://img.shields.io/npm/v/@overbrowsing/wasteback-machine.svg)](https://www.npmjs.com/package/@overbrowsing/wasteback-machine)
[![npm](https://img.shields.io/npm/dt/@overbrowsing/wasteback-machine.svg)](https://www.npmtrends.com/@overbrowsing/wasteback-machine)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

## What Is Wasteback Machine?

Wasteback Machine is a JavaScript library for measuring the size and composition of archived web pages (mementos) from the [Internet Archive's Wayback Machine](https://web.archive.org).

## Why Use Wasteback Machine?

Wasteback Machine retrieves mementos with high fidelity, removing archive linkage and replay-preserving modifications, and excluding replay-induced distortions, while preserving temporal coherence. The library extracts and classifies binary resources (URI-Ms) to accurately measure page size and composition.

The method overcomes the limitations of live-measurement approaches by recognising the unique nature of web archives as re-born digital objects and navigating their complexities to make them analytically tractable. This enables retrospective analysis of websites.

Its modular design supports integration into research workflows, analytics pipelines, and sustainability assessment tools, facilitating the study of web evolution and informing interventions to measure the internet’s environmental impact.

## Features

- **Retrieve mementos by date or timespan:** Selects the nearest memento if the exact timestamp is missing.
- **Analyse page composition:** Measure sizes of HTML, style sheets, scripts, images, videos, fonts, etc.
- **Generate detailed resource (URI-M) lists:** Includes URLs, types, and sizes of all URI-Ms.
- **Retrieval completeness score:** See what percentage of a memento was successfully retrieved.

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

Wasteback Machine provides two primary functions:

1. Discover available mementos for a URL in a given time range.
2. Analyse a specific memento for page size and composition.

### 1. Fetch Available Mementos

```javascript
import { getMementos } from "@overbrowsing/wasteback-machine";

// Get all mementos for www.nytimes.com between 1996 and 2025
const mementos = await getMementos('https://nytimes.com', 1996, 2025);
console.log(mementos);
```

Example Output:

```javascript
[
  '19961112181513', '19961112181513', '19961112181513', '19961219002950', ...
]
```

### 2. Analyse a Specific Memento

```javascript
import { getMementoSizes } from "@overbrowsing/wasteback-machine";

// Analyse www.nytimes.com memento from November 12, 1996
const mementoData = await getMementoSizes(
  'https://nytimes.com',
  '19961112181513',
  { includeResources: true } // optional: include full resource list
);
console.log(mementoData);
```

Example Output:

```js
{
  url: 'https://nytimes.com',
  requestedMemento: '19961112181513',
  memento: '19961112181513',
  mementoURL: 'https://web.archive.org/web/19961112181513/https://nytimes.com',
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

## Demo

A demo is available in [`examples/demo.js`](examples/demo.js). It integrates [CO2.js](https://developers.thegreenwebfoundation.org/co2js/overview) with the 1Byte model to estimate the environmental impact of a memento.

### Getting Started

Run the demo with Node.js:

```bash
node examples/demo.js <URL> <Year YYYY> [Month MM] [Day DD]
```

Parameters:
	•	<URL>: Target website to analyse
	•	<Year YYYY>: Year of interest
	•	[Month MM]: Optional month (defaults to January (01) if omitted)
	•	[Day DD]: Optional day (defaults to 1st (01) if omitted)

Example:

```bash
# Analyse www.nytimes.com memento from November 12, 1996
node examples/demo.js www.nytimes.com 1996 11 12
```

### Results

After running the demo, you will receive a structured report for the desired memento:

- Memento information:
  - Retrieved memento URL
  - Completeness of retrieval (%)
- Page size results:
  - Total page size (KB)
  - Estimated equivalent emissions per page visit (g CO₂e)
- Page composition results:
  - Count of URI-Ms by type (images, scripts, stylesheets, etc.)
  - Total size per type (KB) and percentage of total page size (%)
  - Estimated equivalent emissions per type per page visit (g CO₂e)

Example Output:

```bash
# Results for www.nytimes.com memento from November 12, 1996
Retrieved Memento:
🔗 Memento URL:     https://web.archive.org/web/19961112181513/https://www.nytimes.com
✅ Completeness:    100%

Page Size Results:
📊 Data Transfer:   46.76 KB
🌍 Page CO₂e:       0.014 g

Page Composition Results:
📁 HTML
   Count:   1
   Size:    1.61 KB (3.5%)
   CO₂e:    0.000 g

📁 IMAGE
   Count:   2
   Size:    45.14 KB (96.5%)
   CO₂e:    0.013 g
```

## Methodology

For details on Wasteback Machine’s methodology, assumptions, and limitations, please refer to our working paper. It provides guidance on the library’s intended use, interpretive constraints, and best practices for integrating results into research or sustainability assessments.

For questions or access before publication, please contact [overbrowsing@ed.ac.uk](mailto:overbrowsing@ed.ac.uk).

## Disclaimer

> [!IMPORTANT]
> This library is provided for informational and research purposes only. The authors make no guarantees about the accuracy of the results and disclaim any liability for their use.

## Contributing

Contributions are welcome! Please [submit an issue](https://github.com/overbrowsing/wasteback-machine/issues) or a [pull request](https://github.com/overbrowsing/wasteback-machine/pulls).

## Licenses

Wasteback Machine is licensed under [Apache 2.0](https://tldrlegal.com/license/apache-license-2.0-(apache-2.0)). For full licensing details, see the [LICENSE](/LICENSE) file.

The Wayback Machine, Wayback CDX Server API, and Wayback Replay API are provided by the Internet Archive and are governed by their [Terms of Use](https://archive.org/about/terms).