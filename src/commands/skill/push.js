import ora from "ora";
import logger from "../../utils/logger.js";
import { getCacheDir, readConfig } from "../../utils/config.js";
import { gitAddAndCommitAndPush } from "../../utils/git.js";

export async function runPush(nameOrOptions, options = {}) {
  const config = await readConfig();
  if (!config) {
    logger.error("spm has not been initialized. Please run 'spm skill init' first.");
    process.exit(1);
  }

  let name = null;
  let opt = options;
  if (nameOrOptions && typeof nameOrOptions === "object") {
    opt = nameOrOptions;
  } else if (typeof nameOrOptions === "string") {
    name = nameOrOptions;
  }

  const cacheDir = await getCacheDir();
  const commitMessage = opt.message || (name ? `update skill ${name}` : "update skills");
  const targetPath = name || "-A";

  const spinner = ora(name ? `Pushing skill '${name}' to GitHub...` : "Pushing skills to GitHub...").start();

  try {
    const result = await gitAddAndCommitAndPush(cacheDir, commitMessage, targetPath);
    spinner.succeed(result);
  } catch (error) {
    spinner.fail(`Push failed: ${error.message}`);
    logger.tip("Please check your SSH key / credentials and permissions for the remote repository.");
    process.exit(1);
  }
}
export default runPush;
