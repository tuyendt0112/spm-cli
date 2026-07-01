import fs from "fs/promises";
import path from "path";
import { getConfigPath, resolvePath, getSpmDir } from "./paths.js";

export async function readConfig() {
  const configPath = getConfigPath();
  try {
    const data = await fs.readFile(configPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function writeConfig(config) {
  const configPath = getConfigPath();
  const spmDir = getSpmDir();
  await fs.mkdir(spmDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}

export async function getCacheDir() {
  const config = await readConfig();
  if (config && config.cacheDir) {
    return resolvePath(config.cacheDir);
  }
  return path.join(getSpmDir(), "skills");
}
