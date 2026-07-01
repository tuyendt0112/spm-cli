import fs from "fs/promises";
import path from "path";
import prompts from "prompts";
import logger from "../../utils/logger.js";
import { getCwdAgentSkillsDir } from "../../utils/paths.js";

export async function runRemove(name, options) {
  const destSkillsDir = getCwdAgentSkillsDir();
  const destSkillDir = path.join(destSkillsDir, name);

  // Check if skill exists in cwd
  try {
    await fs.access(destSkillDir);
  } catch (error) {
    logger.error(`Skill '${name}' is not installed in this project.`);
    process.exit(1);
  }

  if (!options.force) {
    const confirm = await prompts({
      type: "confirm",
      name: "remove",
      message: `Are you sure you want to remove skill '${name}' from this project?`,
      initial: false
    });

    if (!confirm.remove) {
      logger.info("Remove operation aborted.");
      return;
    }
  }

  try {
    await fs.rm(destSkillDir, { recursive: true, force: true });
    logger.success(`Successfully removed skill '${name}' from .agent/skills/${name}`);
  } catch (error) {
    logger.error(`Failed to remove skill: ${error.message}`);
    process.exit(1);
  }
}
export default runRemove;
