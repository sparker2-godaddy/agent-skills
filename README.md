# Agent Skills

A collection of reusable AI agent skills for software development workflows. Skills follow the open [Agent Skills](https://agentskills.io/) standard and work with Claude Code, Cursor, Windsurf, Cline, and 30+ other AI agent platforms.

## Available Skills

| Skill | Description |
|-------|-------------|
| **architecture-reviewer** | Validate architectural compliance, pattern consistency, scope boundaries, and design standards |
| **security-reviewer** | Identify vulnerabilities — auth, secrets management, input validation, OWASP Top 10 |
| **code-quality-analyzer** | Assess maintainability, detect code smells, measure complexity, identify technical debt |
| **testing-reviewer** | Validate coverage, enforce deterministic test patterns, assess test completeness |

## Installation

### From Artifactory (recommended)

Install all skills:

```bash
npm install @sparker2/agent-skills
```

Install specific skills only:

```bash
SKILLS=security-reviewer,testing-reviewer npm install @sparker2/agent-skills
```

Skills are automatically copied to `.claude/skills/` on install.

### From source

```bash
git clone https://github.gdcorp.tools/sparker2/agent-skills.git
cp -r agent-skills/skills/security-reviewer .claude/skills/
```

## Usage

Skills are automatically available in Claude Code once installed. Invoke them by name or let the agent use them when relevant tasks are detected.

```
/security-review src/auth/
/architecture-review --scope PR
/code-quality src/services/
/testing-review
```

## Team Guidelines

Skills support team-specific coding standards via the Guidelines Resolution Protocol:

1. Set `team_hq_path` in your `CLAUDE.local.md`
2. Skills resolve `{GUIDELINES_ROOT}` = `{team_hq_path}/knowledge/code-guidelines`
3. If not configured, skills fall back to general best practices

No configuration is required for basic usage.

## Publishing

```bash
# Validate no org-specific content leaked
npm run validate

# Publish to Artifactory
npm publish
```

## Skill Structure

```
skills/{skill-name}/
  SKILL.md              # Entry point — frontmatter + instructions
  agents/               # Agent protocol definitions (optional)
  templates/            # Template files (optional)
  references/           # Reference material (optional)
```

## Contributing

1. Create `skills/{skill-name}/SKILL.md` with required frontmatter (`name`, `description`, `license`)
2. Keep SKILL.md body under 500 lines
3. Verify: `npm run validate`
4. Skills must work without `team_hq_path` configured (graceful degradation)

## License

MIT
