import prompts from "prompts";
import fs from "fs/promises";
import logger from "../../utils/logger.js";
import { isGitInstalled } from "../../utils/git.js";
import { readConfig, writeConfig, getCacheDir } from "../../utils/config.js";
import { runSync } from "./sync.js";

export async function runInit() {
  // Check if Git is installed
  const gitInstalled = await isGitInstalled();
  if (!gitInstalled) {
    logger.error("Git is not installed on this system. Please install Git first.");
    process.exit(1);
  }

  // Check if config already exists
  const existingConfig = await readConfig();
  if (existingConfig) {
    logger.warn(`spm has already been initialized!`);
    logger.info(`Current Repo URL: ${existingConfig.repoUrl}`);
    logger.info(`Current Auth Method: ${existingConfig.authMethod}`);
    
    const confirm = await prompts({
      type: "confirm",
      name: "overwrite",
      message: "Do you want to overwrite the existing configuration?",
      initial: false
    });

    if (!confirm.overwrite) {
      logger.info("Initialization aborted.");
      return;
    }
  }

  // Ask user for configuration details
  const questions = [
    {
      type: "text",
      name: "repoUrl",
      message: "Enter the GitHub repository URL (e.g. git@github.com:user/my-skills.git):",
      validate: value => value ? true : "Repository URL cannot be empty."
    },
    {
      type: "select",
      name: "authMethod",
      message: "Choose authentication method:",
      choices: [
        { title: "SSH", value: "ssh" },
        { title: "HTTPS", value: "https" }
      ],
      initial: 0
    }
  ];

  const answers = await prompts(questions);
  
  if (!answers.repoUrl || !answers.authMethod) {
    logger.error("Initialization cancelled.");
    return;
  }

  const config = {
    repoUrl: answers.repoUrl.trim(),
    cacheDir: "~/.spm/skills",
    authMethod: answers.authMethod
  };

  await writeConfig(config);
  logger.success("Configuration saved to ~/.spm/config.json");

  // Run sync automatically if cache directory doesn't exist
  const cacheDir = await getCacheDir();
  let cacheExists = false;
  try {
    await fs.access(cacheDir);
    cacheExists = true;
  } catch (e) {
    cacheExists = false;
  }

  if (!cacheExists) {
    logger.info("Local cache not found. Starting automatic sync...");
    await runSync();
  } else {
    logger.info("Local cache directory already exists. You can run 'spm skill sync' to pull the latest changes.");
  }
}
export default runInit;
