import fs from "fs";
import path from "path";

const BASE_URL = "https://pub-5719d1a2ca594294addba288a9734eb8.r2.dev";
const ROOT = "X:\\meus-downloads-site\\downloads\\series\\euphoria";

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of list) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

function toUrl(filePath) {
  const relative = path.relative(ROOT, filePath);
  return `${BASE_URL}/${relative.replaceAll("\\", "/")}`;
}

const files = walk(ROOT).filter(f =>
  f.toLowerCase().endsWith(".mp4") || f.toLowerCase().endsWith(".zip")
);

const output = files.map(file => {
  return {
    file: file,
    url: toUrl(file)
  };
});

fs.writeFileSync("links.json", JSON.stringify(output, null, 2));

console.log("Links gerados em links.json 🚀");