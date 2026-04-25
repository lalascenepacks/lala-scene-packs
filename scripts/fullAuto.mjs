import { execSync } from "child_process";

function run(command) {
  console.log(`\n🔥 ${command}\n`);
  execSync(command, {
    stdio: "inherit",
    env: process.env,
  });
}

try {
  // 1. Upload para R2
  run("node --env-file=.env.local scripts/uploadR2.mjs");

  // 2. Gerar catalog
  run("node --env-file=.env.local scripts/generatePacksCatalog.js");

  // 3. Criar loot links
  run("node --env-file=.env.local scripts/generateLootLinks.mjs");

  // 4. Atualizar catalog com monetização
  run("node --env-file=.env.local scripts/generatePacksCatalog.js");

  // 5. Deploy automático
  run("git add .");
  run('git commit -m "auto update packs"');
  run("git push");

  console.log("\n🚀 FULL AUTO COMPLETO 🚀");
} catch (err) {
  console.error("ERRO NO FULL AUTO:", err);
}