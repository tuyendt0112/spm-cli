import matter from "gray-matter";

/**
 * Parses and validates SKILL.md content.
 * Returns { data, content, isValid, errors }
 */
export function parseSkillContent(fileContent) {
  try {
    const { data, content } = matter(fileContent);
    const errors = [];

    if (!data.name) {
      errors.push("Missing 'name' in frontmatter.");
    } else if (typeof data.name !== "string" || !/^[a-z0-9-]+$/.test(data.name)) {
      errors.push("Invalid 'name' in frontmatter. Only lower-case letters, numbers, and dashes are allowed ([a-z0-9-]).");
    }

    if (!data.description) {
      errors.push("Missing 'description' in frontmatter.");
    }

    return {
      data,
      content,
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      data: {},
      content: "",
      isValid: false,
      errors: [`Failed to parse YAML frontmatter: ${error.message}`]
    };
  }
}
