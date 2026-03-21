# AGENTS.md

This file provides guidance to AI coding agents working with code in this repository.

## Repository Overview

A collection of reusable AI agent skills for software development workflows. Skills follow the [Agent Skills](https://agentskills.io/) standard.

## Skill Structure

```
skills/
  {skill-name}/
    SKILL.md              # Required: skill definition with YAML frontmatter
    agents/               # Optional: sub-agent protocol definitions
    templates/            # Optional: template files
    references/           # Optional: reference material
```

### SKILL.md Format

```markdown
---
name: {skill-name}
description: {When to use this skill. Include trigger phrases.}
license: MIT
allowed-tools: [Read, Glob, Grep, Bash]
---

# {Skill Title}

{Instructions for the agent when using this skill.}
```

### Naming Conventions

- **Skill directory**: `kebab-case` (e.g., `security-reviewer`, `code-quality-analyzer`)
- **SKILL.md**: Always uppercase, always this exact filename
- **Supporting files**: `kebab-case.md`

### Key Constraints

- SKILL.md body must be under 500 lines
- All content must be organization-agnostic (no company names, internal URLs)
- Skills must work without `team_hq_path` configured (graceful degradation)
- Use `{GUIDELINES_ROOT}` placeholder for team-specific guideline paths

### Adding a New Skill

1. Create `skills/{skill-name}/SKILL.md` with required YAML frontmatter
2. Add supporting files in subdirectories as needed
3. Update `README.md` with the new skill entry and install command
4. Verify no org-specific content: `grep -ri "company-name" skills/{skill-name}/`
