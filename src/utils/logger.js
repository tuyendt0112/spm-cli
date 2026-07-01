import chalk from "chalk";

export const logger = {
  success: (msg) => console.log(chalk.green("✔ ") + msg),
  error: (msg) => console.error(chalk.red("✘ ") + msg),
  warn: (msg) => console.warn(chalk.yellow("⚠ ") + msg),
  info: (msg) => console.log(chalk.cyan("ℹ ") + msg),
  tip: (msg) => console.log(chalk.magenta("💡 ") + msg),
  bold: (msg) => console.log(chalk.bold(msg)),
  dim: (msg) => console.log(chalk.dim(msg)),
};

export default logger;
