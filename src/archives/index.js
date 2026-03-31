import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentFolder = path.dirname(fileURLToPath(import.meta.url));

export const archives = {};

for (const folder of fs.readdirSync(currentFolder)) {
  const filePath = path.join(currentFolder, folder, `${folder}.js`);
  if (!fs.existsSync(filePath)) continue;

  const module = await import(filePath);
  const [archive] = Object.values(module);

  if (archive?.id) archives[archive.id] = archive;
}