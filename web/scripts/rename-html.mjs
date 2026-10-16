import { existsSync, renameSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve("dist");
const source = resolve(distDir, "index.html");
const target = resolve(distDir, "management.html");

if (!existsSync(source)) {
  process.exit(0);
}

if (existsSync(target)) {
  rmSync(target);
}

renameSync(source, target);
