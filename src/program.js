import { Command } from "commander";
import runInit from "./commands/skill/init.js";
import runSync from "./commands/skill/sync.js";
import runList from "./commands/skill/list.js";
import runSearch from "./commands/skill/search.js";
import runAdd from "./commands/skill/add.js";
import runCreate from "./commands/skill/create.js";
import runPush from "./commands/skill/push.js";
import runRemove from "./commands/skill/remove.js";

const program = new Command();

program
  .name("spm")
  .description("Skill Package Manager — Manage AI agent skills")
  .version("0.1.0");

const skill = program
  .command("skill")
  .description("Manage agent skills");

skill
  .command("init")
  .description("Initialize spm with a GitHub repository")
  .action(runInit);

skill
  .command("sync")
  .description("Sync local skills cache with remote repository")
  .action(runSync);

skill
  .command("list")
  .description("List all available skills in cache")
  .option("-t, --tag <tag>", "filter skills by tag")
  .action(runList);

skill
  .command("search <keyword>")
  .description("Search skills by keyword in name, description or tags")
  .action(runSearch);

skill
  .command("add <name>")
  .description("Add a skill from cache into current project")
  .option("-f, --force", "overwrite without prompting")
  .action(runAdd);

skill
  .command("create <name>")
  .description("Create a new skill in local cache from template")
  .action(runCreate);

skill
  .command("push [name]")
  .description("Push local cache changes to GitHub repository")
  .option("-m, --message <msg>", "commit message")
  .action((name, options) => runPush(name, options));

skill
  .command("remove <name>")
  .description("Remove a skill from current project")
  .option("-f, --force", "remove without prompting")
  .action(runRemove);

program.parse(process.argv);
