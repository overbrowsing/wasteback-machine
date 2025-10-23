import { getMementos, getMementoSizes } from "../src/wasteback-machine.js";
import { co2 } from "@tgwf/co2"; // For calculating CO₂e emissions from data transfer

// Ensure the URL has a valid scheme (if https:// is missing)
function normaliseUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

// Convert memento timestamp into a readable YYYY-MM-DD format
function formatMemento(ts) {
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
}

// Build a memento timestamp (YYYYMMDDhhmmss) from year, month, day
function buildTimestamp(year, month = "01", day = "01") {
  return `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`.padEnd(14, "0");
}

// Main execution block
(async () => {
  try {
    // Accept CLI: node demo.js <URL> <Year YYYY> [Month MM] [Day DD]
    const [, , rawUrl, yearInput, monthInput = "01", dayInput = "01"] = process.argv;

    if (!rawUrl || !yearInput) {
      throw new Error("Usage: node demo.js <URL> <Year YYYY> [Month MM] [Day DD]");
    }

    // Validate and normalise input URL
    const url = normaliseUrl(rawUrl);

    // Ensure year is valid and not before the Internet Archive started archiving websites (1995)
    const year = parseInt(yearInput);
    if (isNaN(year) || year < 1996) throw new Error("Invalid year.");

    const targetTimestamp = buildTimestamp(year, monthInput, dayInput);

    console.log(`Fetching mementos for ${url} in ${year}-${monthInput}-${dayInput}...`);

    // Fetch mementos from the Wayback Machine
    const mementos = await getMementos(url, year, year);
    if (!mementos.length) {
      console.log("No mementos found.");
      return;
    }

    // Find the closest available memento to the requested date
    const closest = mementos.reduce((prev, curr) =>
      Math.abs(parseInt(curr) - parseInt(targetTimestamp)) < Math.abs(parseInt(prev) - parseInt(targetTimestamp))
        ? curr
        : prev
    );

    // Fetch page composition and size breakdown for that memento
    const result = await getMementoSizes(url, closest, { startYear: year, endYear: year });

    // Calculate total page size and estimated CO₂e emissions
    const totalBytes = result.sizes.total.bytes;
    const totalKB = (totalBytes / 1024).toFixed(2);
    const oneByte = new co2({ model: "1byte" });
    const gramsCO2 = oneByte.perByte(totalBytes);

    // Display summary results
    console.log("\nPage Size Results:\n");
    console.log(`🔗 Memento URL:     ${result.mementoURL}`);
    console.log(`📊 Data Transfer:   ${totalKB} KB`);
    console.log(`🌍 Page CO₂e:       ${gramsCO2.toFixed(3)} g`);
    console.log(`✅ Completeness:    ${result.completeness}`);

    // Display composition breakdown by resource (URI-M) type (style sheet, script, image, etc.)
    console.log("\nPage Composition Results:\n");

    const total = result.sizes.total.bytes;
    for (const [type, data] of Object.entries(result.sizes)) {
      if (type === "total") continue;
      if (!data.count || data.bytes === 0) continue;

      const sizeKB = (data.bytes / 1024).toFixed(2);
      const percent = ((data.bytes / total) * 100).toFixed(1);
      const co2e = oneByte.perByte(data.bytes).toFixed(3);

      console.log(`📁 ${type.toUpperCase()}`);
      console.log(`   Count:   ${data.count}`);
      console.log(`   Size:    ${sizeKB} KB (${percent}%)`);
      console.log(`   CO₂e:    ${co2e} g\n`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
})();