# agent-skills — Contributor Guide

## Project Overview

This repository contains reusable AI agent skills for software development workflows. Each skill is a self-contained directory under `skills/` with a `SKILL.md` entry point. Published to Artifactory as `@sparker2/agent-skills`.

## Structure

```
skills/{skill-name}/
  SKILL.md              # Entry point — frontmatter + full skill documentation
  agents/               # Agent protocol definitions (optional)
  templates/            # Template files (optional)
  references/           # Reference material (optional)
```

## Conventions

### SKILL.md Frontmatter

Every `SKILL.md` must include YAML frontmatter:

```yaml
---
name: skill-name
description: Brief description of the skill
license: MIT
allowed-tools: [Read, Glob, Grep, Bash]
---
```

### Organization Agnostic Skills

All content under `skills/` must be organization-agnostic:
- No company names, internal URLs, or proprietary references
- Use `{GUIDELINES_ROOT}` for team-specific guideline paths
- Use generic examples
- Graceful degradation when team guidelines aren't configured

Files outside `skills/` (package.json, README, design/) may contain org-specific references since this is a private repo.

### Guidelines Resolution Protocol

Skills that need team-specific standards follow this resolution:

1. Check if `CLAUDE.local.md` defines `team_hq_path`
2. If yes: `GUIDELINES_ROOT` = `{team_hq_path}/knowledge/code-guidelines`
3. If no: check for local `design/` directory
4. If neither: use general best practices (graceful degradation)

## Development

### Adding a New Skill

1. Create `skills/{skill-name}/SKILL.md` with required frontmatter
2. Add supporting files in subdirectories as needed
3. Update `README.md` skill catalog
4. Verify: `npm run validate`

### Publishing

```bash
npm run validate && npm publish
```

## License

MIT — see LICENSE file.
