import fs from "fs/promises";
import path from "path";
import ora from "ora";
import logger from "../../utils/logger.js";
import { readConfig, getCacheDir } from "../../utils/config.js";
import { gitClone, gitPull } from "../../utils/git.js";
import { parseSkillContent } from "../../utils/frontmatter.js";

export async function runSync() {
  const config = await readConfig();
  if (!config) {
    logger.error("spm has not been initialized. Please run 'spm skill init' first.");
    process.exit(1);
  }

  const cacheDir = await getCacheDir();
  const spinner = ora("Syncing skills from GitHub...").start();

  try {
    let exists = false;
    try {
      await fs.access(cacheDir);
      exists = true;
    } catch (e) {
      exists = false;
    }

    if (!exists) {
      // Create parent directory
      await fs.mkdir(path.dirname(cacheDir), { recursive: true });
      spinner.text = "Cloning repository...";
      await gitClone(config.repoUrl, cacheDir);
    } else {
      spinner.text = "Pulling latest changes...";
      await gitPull(cacheDir);
    }

    // Count skills
    let skillCount = 0;
    try {
      const entries = await fs.readdir(cacheDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith(".")) {
          const skillMdPath = path.join(cacheDir, entry.name, "SKILL.md");
          try {
            await fs.access(skillMdPath);
            const content = await fs.readFile(skillMdPath, "utf-8");
            const parsed = parseSkillContent(content);
            if (parsed.isValid) {
              skillCount++;
            }
          } catch (e) {
            // Not a valid skill directory or missing SKILL.md
          }
        }
      }
    } catch (e) {
      // Ignore count errors
    }

    spinner.succeed(`Sync completed! Found ${skillCount} valid skill(s) in cache.`);
  } catch (error) {
    spinner.fail(`Sync failed: ${error.message}`);
    process.exit(1);
  }
}
export default runSync;
