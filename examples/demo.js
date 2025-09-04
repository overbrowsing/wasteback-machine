import { getSnapshots, getSnapshotSizes } from "../src/wasteback-machine.js";
import readline from "readline";
import { co2 } from "@tgwf/co2"; // For calculating CO₂e emissions from data transfer

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Wrapper around readline.question to use async/await instead of callbacks
function question(prompt) {
  return new Promise(resolve => rl.question(prompt, answer => resolve(answer.trim())));
}

// Ensure the URL has a valid scheme (if https:// is missing)
function normalizeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

// Convert snapshot timestamp into a readable YYYY-MM-DD format
function formatSnapshot(ts) {
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
}

// Build a Internet Archive's Wayback Machine timestamp (YYYYMMDDhhmmss) from year, month, day
function buildTimestamp(year, month = "01", day = "01") {
  return `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`.padEnd(14, "0");
}

// Main execution block
(async () => {
  try {
    // Prompt for URL and validate input
    let url = await question("Enter the target URL: ");
    if (!url) throw new Error("No URL provided.");
    url = normalizeUrl(url);

    // Prompt for year, ensuring it's valid and not before the Internet Archive started archiving websites (1996)
    const yearInput = await question("Enter year (YYYY): ");
    const year = parseInt(yearInput);
    if (isNaN(year) || year < 1996) throw new Error("Invalid year.");

    // Prompt for optional month and day, defaulting to "01"
    const month = (await question("Enter month (MM, optional): ")) || "01";
    const day = (await question("Enter day (DD, optional): ")) || "01";
    const targetTimestamp = buildTimestamp(year, month, day);

    console.log(`Fetching snapshots for ${url} in ${year}-${month}-${day}...`);

    // Fetch snapshots from the Internet Archive's Wayback Machine
    const snapshots = await getSnapshots(url, year, year);
    if (!snapshots.length) {
      console.log("No snapshots found.");
      rl.close();
      return;
    }

    // Find the closest available snapshot to the requested date
    const closest = snapshots.reduce((prev, curr) =>
      Math.abs(parseInt(curr) - parseInt(targetTimestamp)) < Math.abs(parseInt(prev) - parseInt(targetTimestamp))
        ? curr
        : prev
    );

    // Build Internet Archive's Wayback Machine snapshot URL
    const snapshotUrl = `https://web.archive.org/web/${closest}/${url}`;

    console.log(`Closest snapshot: ${formatSnapshot(closest)}`);
    console.log(`Snapshot URL: ${snapshotUrl}\n`);

    // Fetch page composition and size breakdown for that snapshot
    const result = await getSnapshotSizes(url, closest, { startYear: year, endYear: year });

    // Calculate total page size and estimated CO₂e emissions
    const totalBytes = result.sizes.total.bytes;
    const totalKB = (totalBytes / 1024).toFixed(2);
    const oneByte = new co2({ model: "1byte" });
    const gramsCO2 = oneByte.perByte(totalBytes);

    // Display summary results
    console.log("\nPage Size Results:\n");
    console.log(`🔗 Snapshot URL:    ${snapshotUrl}`);
    console.log(`📊 Data Transfer:   ${totalKB} KB`);
    console.log(`🌍 Page CO₂e:       ${gramsCO2.toFixed(3)} g`);
    console.log(`✅ Completeness:    ${result.completeness}`);

    // Display composition breakdown by resource type (JS, CSS, images, etc.)
    console.log("\nPage Composition Results:\n");

    const total = result.sizes.total.bytes;

    for (const [type, data] of Object.entries(result.sizes)) {
      if (type === "total") continue;
      if (!data.count || data.bytes === 0) continue;

      const sizeKB = (data.bytes / 1024).toFixed(2);
      const percent = ((data.bytes / total) * 100).toFixed(1);
      const co2e = oneByte.perByte(data.bytes).toFixed(3);

      // Display breakdown for this resource type
      console.log(`📁 ${type.toUpperCase()}`);
      console.log(`   Count:   ${data.count}`);
      console.log(`   Size:    ${sizeKB} KB (${percent}%)`);
      console.log(`   CO₂e:    ${co2e} g\n`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    rl.close();
  }
})();