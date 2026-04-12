import fs from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const ROOT = "X:\\meus-downloads-site\\downloads\\series\\euphoria";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://c2714cb378a43097720ae5f4ea40fac9.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "87069a42968e998ac90392a1afbbf784",
    secretAccessKey: "4fcb455eb74f159ec0c120422d1290f4fd2431b30127ee999d5b1de2ea35d6c5",
  },
  maxAttempts: 3,
});

const BUCKET = "lalascenepacks";
const CONCURRENCY = 1;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

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

function toObjectKey(filePath) {
  return path.relative(ROOT, filePath).replaceAll("\\", "/");
}

function sortAlphabetically(files) {
  return [...files].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

async function objectExists(key) {
  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    const statusCode = error?.$metadata?.httpStatusCode;
    if (statusCode === 404) return false;
    if (error?.name === "NotFound") return false;
    return false;
  }
}

async function uploadFile(filePath, workerId) {
  const key = toObjectKey(filePath);

  const alreadyExists = await objectExists(key);
  if (alreadyExists) {
    console.log(`SKIPPED [${workerId}]: ${key}`);
    return;
  }

  const stats = await fs.promises.stat(filePath);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`STARTING [${workerId}]: ${key} (${sizeMb} MB)`);

  const body = await fs.promises.readFile(filePath);

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: key.toLowerCase().endsWith(".mp4")
        ? "video/mp4"
        : "application/zip",
    })
  );

  console.log(`UPLOADED [${workerId}]: ${key}`);
}

const allFiles = walk(ROOT).filter((file) => {
  const lower = file.toLowerCase();
  return lower.endsWith(".mp4") || lower.endsWith(".zip");
});

const files = sortAlphabetically(allFiles);

console.log(`Found ${files.length} files.`);

async function run() {
  let currentIndex = 0;

  async function worker(workerId) {
    while (currentIndex < files.length) {
      const filePath = files[currentIndex++];
      const key = toObjectKey(filePath);

      try {
        await uploadFile(filePath, workerId);
        await new Promise((r) => setTimeout(r, 500));
      } catch (error) {
        console.error(`FAILED [${workerId}]: ${key}`);
        console.error(error);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) =>
    worker(i + 1)
  );

  await Promise.all(workers);
  console.log("Upload finished.");
}

run();