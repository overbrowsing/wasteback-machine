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
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }
  return url;
}

// Convert snapshot timestamp into a readable YYYY-MM-DD format
function formatSnapshot(ts) {
  const year = ts.slice(0, 4);
  const month = ts.slice(4, 6);
  const day = ts.slice(6, 8);
  return `${year}-${month}-${day}`;
}

// Main execution block
(async () => {
  try {
    // Prompt for URL and validate input
    let url = await question("Enter the target URL: ");
    if (!url) throw new Error("No URL provided.");
    url = normalizeUrl(url);

    // Prompt for year, ensuring it's valid and not before Wayback’s start year
    const yearInput = await question("Enter year (YYYY): ");
    const year = parseInt(yearInput);
    if (isNaN(year) || year < 1996) throw new Error("Invalid year."); // 1996 is when the Wayback Machine started archiving

    // Prompt for optional month, defaulting to "01"
    const monthInput = await question("Enter month (MM, optional): ");
    let targetTimestamp = `${year}`;
    if (monthInput) {
      const month = monthInput.padStart(2, "0");
      targetTimestamp += month;
    } else {
      targetTimestamp += "01";
    }

    // Prompt for optional day, defaulting to "01"
    const dayInput = await question("Enter day (DD, optional): ");
    if (dayInput) {
      const day = dayInput.padStart(2, "0");
      targetTimestamp += day;
    } else {
      targetTimestamp += "01";
    }

    // Pad timestamp to match Wayback’s full format (YYYYMMDDhhmmss)
    targetTimestamp = targetTimestamp.padEnd(14, "0");

    console.log(`Fetching snapshots for ${url} in ${year}${monthInput ? "-" + monthInput : ""}${dayInput ? "-" + dayInput : ""}...`);

    // Fetch snapshots from the Wayback Machine
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
    console.log(`Closest snapshot: ${formatSnapshot(closest)}\n`);

    // Fetch page composition and size breakdown for that snapshot
    const result = await getSnapshotSizes(url, closest, { startYear: year, endYear: year });

    // Calculate total page weight and estimated CO₂e emissions
    const totalBytes = result.sizes.total.bytes;
    const totalKB = (totalBytes / 1024).toFixed(2);
    const oneByte = new co2({ model: "1byte" });
    const gramsCO2 = oneByte.perByte(totalBytes);

    // Display summary results
    console.log("\nPage Size Results:\n");
    console.log(`📊 Data Transfer:   ${totalKB} KB`);
    console.log(`🌍 Page CO₂e:       ${gramsCO2.toFixed(3)} g`);
    console.log(`✅ Completeness:    ${result.completeness}\n`);

    // Display composition breakdown by resource type (JS, CSS, images, etc.)
    console.log("Page Composition Results:\n");

    const total = result.sizes.total.bytes;

    for (const [type, data] of Object.entries(result.sizes)) {
      if (type === "total") continue;

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