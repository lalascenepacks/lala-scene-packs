import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

const ROOT = "X:\\meus-downloads-site\\downloads\\animes\\jujutsu-kaisen\\Hiromi-Higuruma";

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function toBlobPath(filePath) {
  const relative = path.relative(ROOT, filePath);
  return relative.replaceAll("\\", "/");
}

const files = walk(ROOT).filter((file) => {
  const lower = file.toLowerCase();
  return lower.endsWith(".mp4") || lower.endsWith(".zip");
});

console.log(`Found ${files.length} files to upload...`);

for (const filePath of files) {
  const blobPath = toBlobPath(filePath);

  console.log(`STARTING: ${blobPath}`);

  try {
    const stats = await fs.promises.stat(filePath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`SIZE: ${sizeMb} MB`);

    const fileBuffer = await fs.promises.readFile(filePath);

    const blob = await put(blobPath, fileBuffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
      addRandomSuffix: false,
    });

    console.log(`${blobPath} -> ${blob.url}`);

    await new Promise((r) => setTimeout(r, 200));
  } catch (error) {
    console.error(`FAILED: ${blobPath}`);
    console.error(error);
  }
}

console.log("Upload finished.");