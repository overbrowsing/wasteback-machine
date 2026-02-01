import { getMementos, getMementoSizes } from "../src/core/wasteback-machine.js";
import { archives } from "../src/archives/index.js";
import readline from "readline";
import { co2 } from "@tgwf/co2";

/* ------------------- Utilities ------------------- */

// Readline interface
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = question => new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));

// Helpers for URL and timestamp handling
const normaliseUrl = url => /^https?:\/\//i.test(url) ? url : `https://${url}`;
const buildTimestamp = (year, month = "01", day = "01") =>
  `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`.padEnd(14, "0");

// Spinner loading animation
async function spinWhile(promise, message) {
  const frames = ["- ", "\\ ", "| ", "/ "];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`${message} ${frames[i++ % 4]}`);
  }, 100);

  try {
    return await promise;
  } finally {
    clearInterval(interval);
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`${message} ✓\n`);
  }
}

/* ------------------- Main CLI ------------------- */

(async () => {
  try {
    console.log(`
      ▖  ▖         ▗      ▐           ▐       ▗  ▖        ▐    ▝          
      ▌▐ ▌ ▄▖  ▄▖ ▗▟▄  ▄▖ ▐▄▖  ▄▖  ▄▖ ▐ ▗     ▐▌▐▌ ▄▖  ▄▖ ▐▗▖ ▗▄  ▗▗▖  ▄▖ 
      ▘▛▌▌▝ ▐ ▐ ▝  ▐  ▐▘▐ ▐▘▜ ▝ ▐ ▐▘▝ ▐▗▘     ▐▐▌▌▝ ▐ ▐▘▝ ▐▘▐  ▐  ▐▘▐ ▐▘▐ 
      ▐▌█▘▗▀▜  ▀▚  ▐  ▐▀▀ ▐ ▐ ▗▀▜ ▐   ▐▜      ▐▝▘▌▗▀▜ ▐   ▐ ▐  ▐  ▐ ▐ ▐▀▀ 
      ▐ ▐ ▝▄▜ ▝▄▞  ▝▄ ▝▙▞ ▐▙▛ ▝▄▜ ▝▙▞ ▐ ▚     ▐  ▌▝▄▜ ▝▙▞ ▐ ▐ ▗▟▄ ▐ ▐ ▝▙▞ 

                Overbrowsing Research Group | overbrowsing.com            

`);

    // Archive selection helper
    async function askArchive() {
      const archiveIds = Object.keys(archives);
      const maxIdLength = Math.max(...archiveIds.map(id => id.length));

      while (true) {
        const input = (await ask(
          "1. Enter web archive ID ('help' to list archives or [Enter ↵] = Wayback Machine): "
        )).toLowerCase();

        if (!input) return "ia";

        if (input === "help" || input === "?") {
          console.log("\nSUPPORTED WEB ARCHIVES:");
          archiveIds.forEach(id =>
            console.log(`  ${id.padEnd(maxIdLength)} = ${archives[id].archive}`)
          );
          console.log();
          continue;
        }

        if (archiveIds.includes(input)) return input;

        console.log("Invalid archive ID. Type 'help' to see supported archives.\n");
      }
    }

    // User inputs
    const archiveId = await askArchive();
    const rawUrl = await ask("2. Enter URL to analyse: ");
    const yearInput = await ask("3. Enter target year (YYYY): ");
    const monthInput = (await ask("4. Enter target month (MM or [Enter ↵] = 01): ")) || "01";
    const dayInput = (await ask("5. Enter target day (DD or [Enter ↵] = 01)")) || "01";
    console.log();

    if (!rawUrl || !yearInput) throw new Error("URL and year are required.");
    const year = Number(yearInput);
    if (!Number.isInteger(year) || year < 1995) throw new Error("Invalid year.");

    const url = normaliseUrl(rawUrl);
    const targetTimestamp = buildTimestamp(year, monthInput, dayInput);

    // Get mementos
    const mementos = await spinWhile(
      getMementos(archiveId, url, year, year),
      `Fetching available mementos for ${url} on ${year}-${monthInput}-${dayInput}`
    );

    if (!mementos.length) return console.log("No mementos found.");

    const closestMemento = mementos.reduce((prev, curr) =>
      Math.abs(curr - targetTimestamp) < Math.abs(prev - targetTimestamp) ? curr : prev
    );
    console.log(`  Found a memento! Datetime = ${closestMemento}`);

    // Get memento sizes
    const mementoData = await spinWhile(
      getMementoSizes(archiveId, url, closestMemento, { includeResources: true }),
      `Analysing, please wait`
    );

    const totalBytes = mementoData.sizes.total.bytes;
    const co2Model = new co2({ model: "1byte" });

    // Print results
    console.log("\n________________________________________________________\n");
    console.log("MEMENTO INFO\n")
    console.log(`  Memento URL:    ${mementoData.mementoUrl}`);
    console.log(`  Web Archive:    ${mementoData.archive}`);
    console.log(`  Organisation:   ${mementoData.archiveOrg}`);
    console.log(`  Website:        ${mementoData.archiveUrl}`);
    console.log("\n________________________________________________________\n");
    console.log("PAGE SIZE\n");
    console.log(`  Data:           ${(totalBytes / 1024).toFixed(2)} KB`);
    console.log(`  Emissions:      ${co2Model.perByte(totalBytes).toFixed(3)} g CO₂e`);
    console.log(`  Completeness:   ${mementoData.completeness}`);
    console.log("\n________________________________________________________\n");
    console.log("PAGE COMPOSITION");
    for (const [type, data] of Object.entries(mementoData.sizes)) {
      if (type === "total" || !data.count || !data.bytes) continue;
      console.log(`\n  ${type.toUpperCase()}`);
      console.log(`      Count:      ${data.count}`);
      console.log(`      Data:       ${data.bytes} bytes (${((data.bytes / totalBytes) * 100).toFixed(1)}%)`);
      console.log(`      Emissions:  ${co2Model.perByte(data.bytes).toFixed(3)} g CO₂e`);
    }
    console.log("\n________________________________________________________\n");
  } catch (err) {
    console.error("\nError:", err.message);
  } finally {
    rl.close();
  }
})();