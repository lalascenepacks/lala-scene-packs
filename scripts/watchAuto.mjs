import fs from "fs";
import { execSync } from "child_process";

const WATCH_FOLDER = process.env.DOWNLOADS_ROOT || "X:\\meus-downloads-site\\downloads";

let running = false;
let timer = null;

function run(command) {
  console.log(`\n> ${command}\n`);
  execSync(command, {
    stdio: "inherit",
    env: process.env,
  });
}

function runFullAuto() {
  if (running) return;

  running = true;

  try {
    console.log("\n🚀 Mudança detectada. Rodando full auto...\n");

    run("node --env-file=.env.local scripts/fullAuto.mjs");

    console.log("\n✅ Full auto terminou. Aguardando novos arquivos...\n");
  } catch (error) {
    console.error("\n❌ Erro no automático:");
    console.error(error.message || error);
  } finally {
    running = false;
  }
}

console.log(`👀 Monitorando pasta: ${WATCH_FOLDER}`);
console.log("Pode jogar vídeos novos aí. Ctrl + C para parar.\n");

fs.watch(WATCH_FOLDER, { recursive: true }, () => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    runFullAuto();
  }, 10000);
});