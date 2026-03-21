#!/usr/bin/env node

/**
 * Postinstall script for @sparker2/agent-skills
 *
 * Copies skills from node_modules into .claude/skills/ so they're
 * available to Claude Code and other agent platforms.
 *
 * Usage:
 *   npm install @sparker2/agent-skills          # installs all skills
 *   SKILLS=security-reviewer npm install ...     # install specific skill(s)
 *   SKILLS=security-reviewer,testing-reviewer npm install ...
 */

const fs = require("fs");
const path = require("path");

const SOURCE = path.join(__dirname, "..", "skills");
const TARGET = path.join(
  process.env.INIT_CWD || process.cwd(),
  ".claude",
  "skills"
);

// If SKILLS env var is set, only install those skills
const selectedSkills = process.env.SKILLS
  ? process.env.SKILLS.split(",").map((s) => s.trim())
  : null;

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(SOURCE)) {
  console.error("agent-skills: skills/ directory not found, skipping install");
  process.exit(0);
}

const available = fs
  .readdirSync(SOURCE, { withFileTypes: true })
  .filter(
    (d) =>
      d.isDirectory() && fs.existsSync(path.join(SOURCE, d.name, "SKILL.md"))
  )
  .map((d) => d.name);

// Warn about any requested skills that don't exist
if (selectedSkills) {
  const unknown = selectedSkills.filter((s) => !available.includes(s));
  if (unknown.length > 0) {
    console.warn(
      `agent-skills: unknown skill(s): ${unknown.join(", ")}\n` +
        `  available: ${available.join(", ")}`
    );
  }
}

const skills = available.filter(
  (name) => !selectedSkills || selectedSkills.includes(name)
);

if (skills.length === 0) {
  console.log("agent-skills: no matching skills found");
  process.exit(0);
}

fs.mkdirSync(TARGET, { recursive: true });

let installed = 0;
for (const name of skills) {
  const src = path.join(SOURCE, name);
  const dest = path.join(TARGET, name);
  try {
    copyDirSync(src, dest);
    console.log(`  ✓ ${name}`);
    installed++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

console.log(
  `\nagent-skills: ${installed}/${skills.length} skill(s) installed to .claude/skills/`
);
