import fs from "fs/promises";
import path from "path";
import prompts from "prompts";
import logger from "../../utils/logger.js";
import { getCacheDir, readConfig } from "../../utils/config.js";
import { getCwdAgentSkillsDir } from "../../utils/paths.js";

export async function runAdd(name, options) {
  const config = await readConfig();
  if (!config) {
    logger.error("spm has not been initialized. Please run 'spm skill init' first.");
    process.exit(1);
  }

  const cacheDir = await getCacheDir();
  const sourceSkillDir = path.join(cacheDir, name);
  const sourceSkillMd = path.join(sourceSkillDir, "SKILL.md");

  // Validate skill exists in cache
  try {
    await fs.access(sourceSkillMd);
  } catch (error) {
    logger.error(`Skill '${name}' does not exist in local cache.`);
    logger.info(`Try searching for matching skills: 'spm skill search ${name}'`);
    logger.info(`Or sync the cache: 'spm skill sync'`);
    process.exit(1);
  }

  const destSkillsDir = getCwdAgentSkillsDir();
  const destSkillDir = path.join(destSkillsDir, name);

  // Check if destination already exists
  let destExists = false;
  try {
    await fs.access(destSkillDir);
    destExists = true;
  } catch (e) {
    destExists = false;
  }

  if (destExists && !options.force) {
    logger.warn(`Skill '${name}' already exists in this project at '.agent/skills/${name}'.`);
    const confirm = await prompts({
      type: "confirm",
      name: "overwrite",
      message: "Do you want to overwrite it?",
      initial: false
    });

    if (!confirm.overwrite) {
      logger.info("Add operation cancelled.");
      return;
    }
  }

  try {
    // Ensure .agent/skills/ directory exists
    await fs.mkdir(destSkillsDir, { recursive: true });

    // Clean destination first if it exists to avoid merging files cleanly
    if (destExists) {
      await fs.rm(destSkillDir, { recursive: true, force: true });
    }

    // Copy directory recursively (Node 16.7+ has fs.cp, Node 18 is target)
    await fs.cp(sourceSkillDir, destSkillDir, { recursive: true });

    logger.success(`Successfully added skill '${name}' to .agent/skills/${name}`);
  } catch (error) {
    logger.error(`Failed to add skill: ${error.message}`);
    process.exit(1);
  }
}
export default runAdd;
