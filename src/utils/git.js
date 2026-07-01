import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function isGitInstalled() {
  try {
    await execAsync("git --version");
    return true;
  } catch (error) {
    return false;
  }
}

export async function gitClone(repoUrl, destDir) {
  try {
    await execAsync(`git clone "${repoUrl}" "${destDir}"`);
    return true;
  } catch (error) {
    throw new Error(`Failed to clone repository: ${error.message}`);
  }
}

export async function gitPull(cwd) {
  try {
    await execAsync("git pull", { cwd });
    return true;
  } catch (error) {
    throw new Error(`Failed to pull updates: ${error.message}`);
  }
}

export async function gitAddAndCommitAndPush(cwd, message, targetPath = "-A") {
  try {
    // Add files
    await execAsync(`git add "${targetPath}"`, { cwd });
    
    // Check if there are changes to commit
    try {
      const { stdout } = await execAsync("git status --porcelain", { cwd });
      if (!stdout.trim()) {
        return "No changes to push.";
      }
    } catch (e) {
      // ignore
    }

    await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd });
    await execAsync("git push", { cwd });
    return "Successfully pushed changes.";
  } catch (error) {
    throw new Error(`Failed to push changes: ${error.message}`);
  }
}
