import fs from "fs/promises";
import path from "path";
import logger from "../../utils/logger.js";
import { getCacheDir, readConfig } from "../../utils/config.js";
import { parseSkillContent } from "../../utils/frontmatter.js";
import chalk from "chalk";

export async function runList(options) {
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

  const skills = [];

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      const skillMdPath = path.join(cacheDir, entry.name, "SKILL.md");
      try {
        await fs.access(skillMdPath);
        const fileContent = await fs.readFile(skillMdPath, "utf-8");
        const parsed = parseSkillContent(fileContent);
        
        if (parsed.isValid) {
          skills.push({
            dirName: entry.name,
            name: parsed.data.name,
            description: parsed.data.description,
            tags: parsed.data.tags || [],
            version: parsed.data.version || "1.0.0"
          });
        } else {
          logger.warn(`Skipping invalid skill directory '${entry.name}':`);
          parsed.errors.forEach(err => logger.dim(`  - ${err}`));
        }
      } catch (e) {
        // Missing SKILL.md is silently ignored unless it's expected
      }
    }
  }

  if (skills.length === 0) {
    logger.info("No skills found in cache. Run 'spm skill sync' or create one with 'spm skill create <name>'.");
    return;
  }

  // Filter by tag if requested
  let filteredSkills = skills;
  if (options.tag) {
    const filterTag = options.tag.toLowerCase();
    filteredSkills = skills.filter(s => 
      s.tags.some(t => t.toLowerCase() === filterTag)
    );
  }

  if (filteredSkills.length === 0) {
    logger.info(`No skills found matching tag '${options.tag}'.`);
    return;
  }

  // Render list or table
  logger.bold(`\nAvailable Skills (${filteredSkills.length}):`);
  logger.dim("--------------------------------------------------------------------------------");
  
  for (const skill of filteredSkills) {
    const tagsStr = skill.tags.length > 0 ? `[${skill.tags.join(", ")}]` : "";
    console.log(
      `${chalk.green.bold(skill.name)} ${chalk.dim(`(v${skill.version})`)}`
    );
    console.log(`  ${chalk.white(skill.description)}`);
    if (tagsStr) {
      console.log(`  ${chalk.cyan(tagsStr)}`);
    }
    console.log("");
  }
  logger.dim("--------------------------------------------------------------------------------");
}
export default runList;
