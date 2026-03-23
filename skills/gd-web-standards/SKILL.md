---
name: gd-web-standards
description: >-
  GoDaddy web technology standards enforcement and compliance. Use this skill
  whenever working in a GoDaddy web codebase — it ensures technology choices,
  dependencies, and patterns comply with GoDaddy's TDL Tech Radar and MHSDs.
  This skill does not write code — it validates that coding skills and developer
  choices use GoDaddy-approved tooling, flags deprecated patterns, and routes to
  correct sources of truth. Use when choosing frameworks, adding dependencies,
  setting up new projects, reviewing PRs for compliance, migrating from deprecated
  technologies, onboarding to a GoDaddy codebase, or asking "what should I use
  for X" in a GoDaddy web context.
license: Proprietary
metadata:
  author: godaddy-platform
  version: "1.0"
  category: developer-tools
  platform: web
---

# gd-web-standards

This skill enforces GoDaddy's web technology standards. It does not write code — coding skills handle that. This skill ensures those implementations use GoDaddy-approved tooling and follow MHSDs.

## When to Use

- User is choosing or adding a web dependency to a GoDaddy project
- User is setting up a new web project or feature
- User is reviewing a PR for tech stack compliance
- User is onboarding to a GoDaddy web codebase
- User is migrating from deprecated technologies
- User asks "what should I use for X" in a GoDaddy web context
- Any web development work in a GoDaddy repository

## Prerequisites

- **TDL MCP server** — required for the Verification Protocol's TDL searches. If not configured, the skill still works for MHSD enforcement, onboarding scans, and org adoption checks, but cannot verify Tech Radar statuses. Set up the TDL MCP server or install `tdl-search-docs` for search guidance.
- **GitHub access** — for org-wide adoption searches in Step 3 of the Verification Protocol. Works with GitHub MCP server, `gh` CLI, or GitHub web search.
- Access to GoDaddy GitHub Enterprise Cloud (gdcorp-engineering org)

## Instructions

### The Verification Protocol

This is the core of this skill. Every technology choice — framework, library, test tool, bundler, linter, state manager, deployment target — must pass through this before being used or recommended:

```text
Step 1: Search TDL (requires TDL MCP server)
  → @tdl search "{technology} tech radar"
  → If TDL MCP is not available, skip to Step 3 and note that
    Tech Radar status could not be verified

Step 2: Interpret the result
  → Adopt: approved, proceed
  → Maintain: OK in existing code, don't introduce to new projects
  → Experiment: flag risk, get explicit developer approval before using
  → Eject: do not use — recommend the TDL-listed replacement
  → Not found: go to Step 3

Step 3: Discovery (when TDL has no entry)
  a) Check the official Gasket templates in gdcorp-engineering
     → if the template uses it, it's likely safe
  b) Search across GoDaddy repos for breadth of adoption
     → Search GitHub code for "{package-name}" in package.json files
       across GoDaddy orgs (use GitHub MCP, gh CLI, or GitHub web search)
     → GoDaddy has many GitHub orgs (gdcorp-engineering, gdcorp-im,
       gdcorp-uxp, gdcorp-domains, gdcorp-infosec, gdcorp-cp, etc.)
       — search the orgs relevant to the project's domain
     → fewer than 3-5 actively maintained repos across orgs = flag the risk
  c) Check the tool's official docs
     → is it actively maintained? Compatible with the rest of the stack?
  d) Report findings to the developer with a recommendation
```

**Fast path:** Skip Steps 2-3 for widely-known open-source utilities (lodash, axios, date-fns, etc.) that have no TDL entry and no GoDaddy-specific alternative — just note they're not on Tech Radar and proceed. Reserve the full protocol for frameworks, UI libraries, test tools, and architectural choices where GoDaddy has opinions.

### Onboarding Compliance Scan

When entering a GoDaddy web codebase for the first time, read:

```text
package.json → dependencies for deprecated packages
Gasket config → framework version and plugin list
ESLint config → linting approach
Test config → test runner and libraries
CLAUDE.md → project-specific AI agent instructions
```

Flag these if found — they are deprecated or abandoned per TDL:
- `@ux/uxcore2` as an import source → should be individual `@ux/*` packages
- `enzyme` in devDependencies → should be React Testing Library (TDL: Adopt)
- Angular, AngularJS, Ember, Knockout → should be React (TDL: Adopt)
- `@ux/style-common` → should be UXCore components
- Atlantis Framework (.NET) → should be Gasket (TDL: Adopt)

Note but don't necessarily fix (may be intentional or out-of-scope):
- Older Gasket config format (JS vs TS)
- Legacy ESLint config format (`.eslintrc` vs flat config)
- Bun in production — Experiment status, flag the risk

### MHSD Requirements

These are **must-have** requirements. Code that violates them must be flagged regardless of context:

**Security (MHSD: Cryptography and Secrets Management):**
- Never hardcode credentials, tokens, API keys, or secrets in source code
- Store in AWS Secrets Manager (cloud) or HashiCorp Vault (on-prem)
- Rotate cryptographic keys every 90 days
- All transport must use TLS 1.2+
- For current MHSD: `@tdl search "cryptography secrets management MHSD"`

**Authentication (MHSD: Authentication):**
- Customer-facing apps must use the Authentication Platform (SSO)
- Validate JWT signatures; never trust tokens without verification
- Never collect or store customer credentials
- For current MHSD: `@tdl search "authentication MHSD security"`

**Environments:**
- All applications must support: `dev`, `test`, `OTE`, `stage`, `prod`
- OTE is required for reseller/API partner testing — blocking it affects external partners

**UXCore:**
- Import individual `@ux/*` packages, never the bundle
- Never hardcode colors — use intents
- Never target internal `.ux-*` CSS classes
- Use logical properties (`padding-inline-start`, not `padding-left`)

**Accessibility:**
- WCAG 2.1 Level AA compliance required
- Delegate implementation to `accessibility` skill

MHSDs evolve — verify current requirements:
```text
@tdl search "MHSD web application requirements"
```

### Production Readiness

Before any application reaches production, verify:
- Security certification completed
- Privacy Impact Assessment (if PII/SPI)
- PCP project registration
- Deployment platform configured (`@tdl search "deployment standards"`)
- Monitoring and alerting
- Ops playbook

```text
@tdl search "production readiness checklist"
```

### Package Registry

GoDaddy uses Artifactory for private npm packages (`@ux/*`, `@godaddy/*`, `@gasket/*`). If installs fail with 401, credentials have expired:
```text
@tdl search "Artifactory npm 401 fix"
```

## Reference Loading Policy

DO NOT open any `references/*.md` file unless the user request matches a trigger below.
When a trigger matches, open exactly ONE reference file.

| Trigger keywords | Reference to load |
|------------------|-------------------|
| migrate, upgrade, deprecated, eject, Angular, Ember, Enzyme, legacy, UXCore1, unbundling, React upgrade | `references/MIGRATION.md` |
| API, REST, endpoint, GraphQL, authentication, JWT, SSO, environment, OTE, MHSD, security, credentials | `references/COMPLIANCE.md` |

If no trigger matches, answer from this file only.

## Error Handling

| Issue | Severity | Resolution |
|-------|----------|-----------|
| Unknown dependency added | Medium | Run the Verification Protocol before proceeding |
| `@ux/uxcore2` bundle import | High | Switch to individual `@ux/*` imports |
| Enzyme in test config | High | Migrate to React Testing Library |
| Hardcoded credentials in source | Critical | Move to AWS Secrets Manager; rotate the exposed credential |
| Missing OTE environment | High | Add OTE — required for partner testing |
| Hardcoded colors in CSS | Medium | Use intents (delegate to `uxcore` skill) |
| `padding-left` instead of logical | Medium | Use `padding-inline-start` for RTL support |

## When You're Stuck

1. `@tdl search "{your question}"`
2. Slack: `#gasket-users`, `#uxcore2-support`, `#cds-support`, `#typescript-guild`, `#a11y`

## Related Skills

- `uxcore`: UXCore styling implementation (intents, Box, theming)
- `accessibility`: WCAG 2.1 Level AA implementation
- `tdl-search-docs`: Searching the TDL effectively
- `gdsnoop-security-scan`: Security vulnerability scanning
- `brand-guidelines`: GoDaddy brand identity and visual design

## Resources

- [TDL — Tech Radar](https://tdl.gdcorp.tools/docs/tech-radar/)
- [TDL — MHSDs](https://tdl.gdcorp.tools/docs/mhsd/)
- [GoDaddy API Spec](https://github.com/gdcorp-platform/api-spec)
