import path from "path";
import os from "os";

export const getHomeDir = () => {
  return os.homedir();
};

export const getSpmDir = () => {
  return path.join(getHomeDir(), ".spm");
};

export const getConfigPath = () => {
  return path.join(getSpmDir(), "config.json");
};

export const resolvePath = (p) => {
  if (p.startsWith("~")) {
    return path.join(getHomeDir(), p.slice(1));
  }
  return path.resolve(p);
};

export const getCwdAgentSkillsDir = () => {
  return path.join(process.cwd(), ".agent", "skills");
};
