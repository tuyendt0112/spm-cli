# spm (Skill Package Manager)

`spm` (Skill Package Manager) is a Node.js CLI tool built to manage and distribute **Skills** (formatted as `SKILL.md` files conforming to the Antigravity/Claude AI Agent Skill structure) from a centralized GitHub repository to any local project workspaces.

---

## 💡 How It Works

```
[Remote GitHub Repo] <==== Sync ====> [Local Cache: ~/.spm/skills/]
                                                │
                                                │ (add / copy)
                                                ▼
                                   [Your Project: .agent/skills/]
```

1. **Central Repository (GitHub):** All your skills are hosted on a single remote Git repository (private or public).
2. **Local Cache (`~/.spm/skills/`):** When you run the `sync` command, `spm` clones or pulls the remote repository into a local cache directory.
3. **Project Integration (`.agent/skills/`):** Running `add <name>` inside a project directory copies the specific skill from the local cache to the project's `.agent/skills/` folder, allowing your AI agent to read and use it immediately.

---

## 🛠️ Prerequisites

* **Node.js** >= 18.0.0
* **Git** installed and configured (with SSH keys or HTTPS credentials)

---

## 📦 Installation

### Option 1: Install from Local Source (For Developers)
Navigate to the `spm-cli` project directory and run:
```bash
npm install -g .
# or
npm link
```

### Option 2: Install directly from GitHub (For Team Members)
Once the CLI repository is pushed to GitHub (e.g. `github.com/username/spm-cli`), others can install it globally via:
```bash
npm install -g git+https://github.com/username/spm-cli.git
```

---

## 🚀 Commands & Usage

All commands operate under the `skill` namespace:

### 1. Initialize Configuration (`init`)
Set up the remote Git repository to store your skills. This only needs to be run **once** upon installation.
```bash
spm skill init
```
* **Workflow:**
  1. Prompts for the GitHub repo URL (e.g. `git@github.com:your-user/skills-library.git`).
  2. Choice of authentication protocol (`SSH` or `HTTPS`).
  3. Writes config to `~/.spm/config.json`.
  4. Automatically runs the `sync` workflow if the local cache directory doesn't exist yet.
* *Note:* Re-running `init` on a configured environment warns you and prompts for confirmation before overwriting.

### 2. Synchronize Cache (`sync`)
Synchronize the local cache directory with your remote GitHub repository.
```bash
spm skill sync
```
* **Workflow:** Clones the repository if it's the first run, or pulls the latest updates if the cache directory is already initialized.

### 3. List Available Skills (`list`)
List all valid skills currently cached locally.
```bash
spm skill list
```
* **Filter by Tag:** Use the `-t` or `--tag` flag to show only skills matching a specific tag:
  ```bash
  spm skill list --tag code-review
  ```

### 4. Search Skills (`search`)
Search through cached skills matching a keyword in their `name`, `description`, or `tags`.
```bash
spm skill search <keyword>
```
* **Search Scoring:** Results are sorted in descending order of matching relevance:
  * Name match: +3 points (with +2 bonus points for an exact match).
  * Tag match: +2 points.
  * Description match: +1 point.

### 5. Create a New Skill (`create`)
Bootstrap a new skill inside the local cache directory using the default template.
```bash
spm skill create <name>
```
* **Naming Rules:** Skill names must only contain lower-case letters, numbers, and hyphens (regex: `[a-z0-9-]`).
* **Instant GitHub Push:** Once the template files are initialized, the CLI asks if you'd like to immediately commit and push the new skill to the GitHub repo.

### 6. Push Changes (`push`)
Commit and push changes from your local cache repository up to GitHub.
```bash
spm skill push [name]
```
* **Push Specific Skill:** If you provide the optional `[name]` argument, the CLI will stage, commit, and push only the specified skill directory (e.g. `spm skill push demo-skill`), leaving other local changes untouched.
* **Push All:** Running the command without arguments stages and pushes all local cache changes.
* **Custom Commit Message:** Change the commit message using the `-m` or `--message` flag:
  ```bash
  spm skill push demo-skill -m "Update guidelines for code reviews"
  ```

### 7. Install Skill to Project (`add`)
Copy a skill from the local cache into your current project folder.
```bash
spm skill add <name>
```
* **Destination Path:** The skill folder is copied to `<current_working_directory>/.agent/skills/<name>/`.
* **Overwrite Warning:** If the skill already exists in the project, the CLI prompts for confirmation. Force an overwrite using the `-f` or `--force` flag:
  ```bash
  spm skill add code-reviewer --force
  ```

### 8. Remove Skill from Project (`remove`)
Delete a skill's directory from the current project.
```bash
spm skill remove <name>
```
* Skip confirmation prompts by adding the `-f` or `--force` flag:
  ```bash
  spm skill remove code-reviewer --force
  ```

---

## 📝 Skill Package Directory Format

For a directory to be recognized as a valid skill by the CLI, it must conform to the following layout:

```markdown
code-reviewer/
├── SKILL.md                 # Required (contains frontmatter metadata)
├── scripts/                 # Optional helper scripts
└── references/              # Optional detailed references and documentation
```

The `SKILL.md` file must contain YAML Frontmatter at the beginning of the file:
```markdown
---
name: code-reviewer
description: Review codebase changes against project standards
tags: [code-review, qa, checklist]
version: 1.0.0
---

# Code Reviewer Skill

## When to use
...

## Steps
1. ...
```
