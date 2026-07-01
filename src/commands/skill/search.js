import fs from "fs/promises";
import path from "path";
import logger from "../../utils/logger.js";
import { getCacheDir, readConfig } from "../../utils/config.js";
import { parseSkillContent } from "../../utils/frontmatter.js";
import chalk from "chalk";

export async function runSearch(keyword) {
  const config = await readConfig();
  if (!config) {
    logger.error("spm has not been initialized. Please run 'spm skill init' first.");
    process.exit(1);
  }

  const cacheDir = await getCacheDir();
  let entries = [];
  try {
    entries = await fs.readdir(cacheDir, { withFileTypes: true });
  } catch (error) {
    logger.error(`Could not read cache directory: ${error.message}`);
    logger.info("Try running 'spm skill sync' first.");
    process.exit(1);
  }

  const kw = keyword.toLowerCase();
  const results = [];

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      const skillMdPath = path.join(cacheDir, entry.name, "SKILL.md");
      try {
        await fs.access(skillMdPath);
        const fileContent = await fs.readFile(skillMdPath, "utf-8");
        const parsed = parseSkillContent(fileContent);
        
        if (parsed.isValid) {
          const { name, description, tags = [], version = "1.0.0" } = parsed.data;
          
          let score = 0;
          if (name.toLowerCase().includes(kw)) {
            score += 3;
            if (name.toLowerCase() === kw) {
              score += 2; // Exact match bonus
            }
          }
          
          if (tags.some(t => t.toLowerCase().includes(kw))) {
            score += 2;
          }
          
          if (description.toLowerCase().includes(kw)) {
            score += 1;
          }

          if (score > 0) {
            results.push({
              name,
              description,
              tags,
              version,
              score
            });
          }
        }
      } catch (e) {
        // Skip
      }
    }
  }

  if (results.length === 0) {
    logger.warn(`No skills matched keyword '${keyword}'.`);
    logger.info("Try syncing cache with 'spm skill sync' if the skill is new.");
    return;
  }

  // Sort by score desc
  results.sort((a, b) => b.score - a.score);

  logger.bold(`\nSearch Results for '${keyword}' (${results.length}):`);
  logger.dim("--------------------------------------------------------------------------------");
  
  for (const skill of results) {
    const tagsStr = skill.tags.length > 0 ? `[${skill.tags.join(", ")}]` : "";
    console.log(
      `${chalk.green.bold(skill.name)} ${chalk.dim(`(v${skill.version})`)} (Score: ${skill.score})`
    );
    console.log(`  ${chalk.white(skill.description)}`);
    if (tagsStr) {
      console.log(`  ${chalk.cyan(tagsStr)}`);
    }
    console.log("");
  }
  logger.dim("--------------------------------------------------------------------------------");
}
export default runSearch;
