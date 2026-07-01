import fs from "fs/promises";
import path from "path";
import prompts from "prompts";
import { fileURLToPath } from "url";
import logger from "../../utils/logger.js";
import { getCacheDir, readConfig } from "../../utils/config.js";
import { runPush } from "./push.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runCreate(name) {
  const config = await readConfig();
  if (!config) {
    logger.error("spm has not been initialized. Please run 'spm skill init' first.");
    process.exit(1);
  }

  // Validate name
  if (!/^[a-z0-9-]+$/.test(name)) {
    logger.error("Invalid skill name. Only lower-case letters, numbers, and dashes are allowed ([a-z0-9-]).");
    process.exit(1);
  }

  const cacheDir = await getCacheDir();
  const skillDir = path.join(cacheDir, name);
  const skillMdPath = path.join(skillDir, "SKILL.md");

  // Check if skill already exists in cache
  try {
    await fs.access(skillMdPath);
    logger.error(`Skill '${name}' already exists in local cache.`);
    process.exit(1);
  } catch (e) {
    // OK, doesn't exist
  }

  try {
    // Create skill directory
    await fs.mkdir(skillDir, { recursive: true });

    // Read template
    const templatePath = path.resolve(__dirname, "../../templates/SKILL.template.md");
    let templateContent = "";
    try {
      templateContent = await fs.readFile(templatePath, "utf-8");
    } catch (err) {
      logger.error(`Template not found at ${templatePath}. Using fallback template.`);
      templateContent = `---
name: {{name}}
description: Fallback description
tags: []
version: 1.0.0
---

# {{name}} Skill
`;
    }

    // Replace placeholders
    const resolvedContent = templateContent.replace(/\{\{name\}\}/g, name);

    // Write file
    await fs.writeFile(skillMdPath, resolvedContent, "utf-8");
    logger.success(`Created new skill '${name}' at ${skillMdPath}`);

    // Ask to push
    const confirm = await prompts({
      type: "confirm",
      name: "pushNow",
      message: "Do you want to push this update to GitHub repository now?",
      initial: true
    });

    if (confirm.pushNow) {
      await runPush({ message: `Add skill ${name}` });
    }
  } catch (error) {
    logger.error(`Failed to create skill: ${error.message}`);
    process.exit(1);
  }
}
export default runCreate;
