import test from "node:test";
import assert from "node:assert";
import { parseSkillContent } from "../src/utils/frontmatter.js";

test("parseSkillContent - valid content", () => {
  const content = `---
name: code-reviewer
description: Review code according to standards
tags: [code-review, qa]
version: 1.0.0
---

# Code Reviewer
`;

  const parsed = parseSkillContent(content);
  assert.strictEqual(parsed.isValid, true);
  assert.strictEqual(parsed.data.name, "code-reviewer");
  assert.strictEqual(parsed.data.description, "Review code according to standards");
  assert.deepStrictEqual(parsed.data.tags, ["code-review", "qa"]);
  assert.strictEqual(parsed.data.version, "1.0.0");
  assert.strictEqual(parsed.errors.length, 0);
});

test("parseSkillContent - invalid name", () => {
  const content = `---
name: Code Reviewer
description: Review code according to standards
---
`;

  const parsed = parseSkillContent(content);
  assert.strictEqual(parsed.isValid, false);
  assert.strictEqual(parsed.errors.length, 1);
  assert.match(parsed.errors[0], /Invalid 'name' in frontmatter/);
});

test("parseSkillContent - missing description", () => {
  const content = `---
name: code-reviewer
---
`;

  const parsed = parseSkillContent(content);
  assert.strictEqual(parsed.isValid, false);
  assert.strictEqual(parsed.errors.length, 1);
  assert.match(parsed.errors[0], /Missing 'description'/);
});
