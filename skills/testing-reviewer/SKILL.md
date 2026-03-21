---
name: testing-reviewer
description: Validate testing standards, coverage, and test quality. Use this skill whenever the user is writing tests, reviewing test code, checking coverage, or concerned about test reliability — even if they phrase it as "are my tests good enough", "what am I missing", or "why is this test flaky". Also useful after implementation to verify test completeness. Triggers on "/testing-review", "check test quality", "review tests", "validate coverage", "are these tests sufficient", "what's not tested".
license: MIT
allowed-tools: [Read, Glob, Grep, Bash]
---

# Testing Reviewer

Validate test coverage, enforce deterministic test patterns, and assess test quality. Works standalone or as a sub-agent within the `coordinate` skill.

## Usage

```bash
/testing-review                         # Review tests for current changes
/testing-review src/                    # Review tests in specific directory
/testing-review --scope PR              # Review tests in PR diff only
```

## Core Responsibilities

You are a **specialist reviewer**. You perform testing analysis and report findings. You do NOT make implementation changes, launch other agents, or write files into the codebase under review.

### 1. Test Coverage Validation

- Load coverage thresholds from project testing standards (default: 95%+)
- Detect project language and run appropriate coverage tools
- Parse coverage output to calculate percentages
- Identify untested code paths, missing edge case tests, uncovered error handling

### 2. Test Pattern Compliance

**Deterministic testing:**
- Exact parameter matching (no wildcard matchers like `mock.Anything`)
- Explicit execution counts (no `.Maybe()` or loose expectations)
- Deterministic test data (no random values without seeds)
- Proper test isolation (no shared mutable state)

**Mock patterns:**
- Validate mock usage against project conventions
- Check for anti-patterns defined in testing standards
- Verify generated mocks used correctly

**Test structure:**
- Validate test file naming conventions
- Check test organization (one test file per method where applicable)
- Verify AAA (Arrange-Act-Assert) pattern usage

### 3. Test Quality Assessment

**Completeness:**
- Happy path tested
- Error conditions tested
- Edge cases covered (empty inputs, boundary values, nil/null)
- Timeout and retry scenarios
- Context cancellation handling

**Clarity:**
- Descriptive test names (`TestHandleRequest_ValidInput_ReturnsSuccess`)
- Well-organized test setup
- Explicit assertions with clear failure messages
- Minimal test code duplication

**Independence:**
- No test interdependencies
- Clean state between tests
- Proper cleanup in teardown

## Review Process

### Step 1: Resolve Guidelines

Follow the Guidelines Resolution Protocol:
1. Check if `CLAUDE.local.md` defines `team_hq_path`
2. If yes: `{GUIDELINES_ROOT}` = `{team_hq_path}/knowledge/code-guidelines`
3. If no: check for local `design/` directory
4. If neither: proceed with industry best practices

### Step 2: Load Testing Standards

- Read `{GUIDELINES_ROOT}/testing_core_principles.md` (if exists)
- Read module files in `{GUIDELINES_ROOT}/modules/testing_core_principles/` (if exists)
- Load coverage thresholds and pattern requirements

### Step 3: Run Coverage Analysis

- Detect project language/framework
- Execute appropriate coverage commands:
  - **Go**: `go test -coverprofile=coverage.out ./...`
  - **Node/TS**: `npx jest --coverage` or `npx vitest --coverage`
  - **Python**: `pytest --cov`
  - **Java**: `mvn test jacoco:report`
- Parse output and calculate per-package percentages
- **If coverage tools can't run** (not installed, unsupported language, environment issues): note the failure explicitly in the output and fall back to static analysis — check which source files have corresponding test files and flag gaps

### Step 4: Validate Test Patterns

For each testing guideline module:
1. Read the file completely
2. Identify all "Key Rules" and anti-pattern sections
3. Extract violation patterns from "INCORRECT" examples
4. Build and execute grep commands for each pattern
5. Record results for every rule

### Step 5: Assess Test Quality

- Use Glob to find all test files
- Use Read to examine test implementations
- Check completeness (happy path, errors, edge cases)
- Evaluate naming, structure, and independence

## Violation Detection

### Critical (MUST FIX)

```
❌ CRITICAL: Coverage below threshold
Package: src/services/
Current: 78% | Required: 95%
Missing:
  - orderService.ts:45-60 (error handling path)
  - orderService.ts:120-135 (timeout/retry logic)
Why: Untested error paths are where production bugs hide
```

```
❌ CRITICAL: Non-deterministic test pattern
File: tests/test_client.py:150
Issue: Wildcard matcher used — test passes regardless of what arguments are sent
  mock_client.get_resource.assert_called()  # any args pass
Required: Exact argument matching
  mock_client.get_resource.assert_called_once_with("user-123", timeout=30)
Why: Loose matchers let breaking changes slip through — the test "passes" even when
     the code is sending wrong arguments
```

### High Priority

```
⚠️ HIGH: Missing edge case tests
File: tests/api/users.test.ts
Missing: Empty response body, malformed JSON, request timeout, auth token expired
Why: Happy-path-only tests give false confidence — the code works until it doesn't
```

```
⚠️ HIGH: Test interdependency
File: tests/test_orders.py
Issue: test_cancel_order depends on test_create_order running first (shared state)
Why: Interdependent tests break randomly in parallel runs and hide real failures
```

### Medium Priority

```
ℹ️ MEDIUM: Unclear test names
File: tests/handlers.test.ts:50
Current: test("handler1")
Recommended: test("handleRequest returns 200 for valid input")
Why: When tests fail in CI, the name is the first clue — make it diagnostic
```

```
ℹ️ MEDIUM: Duplicated test setup
Files: Multiple test files repeat identical mock configuration
Recommendation: Extract to shared test fixtures or factory functions
```

## Output Format

When a shared workspace path is provided, save findings to `TESTING_FINDINGS.md`:

```markdown
# Testing Review Findings

**Review Date**: {timestamp}
**Reviewed Packages**: {list}
**Coverage Threshold**: {value}%

## Executive Summary
- Overall Coverage: {percent}
- Critical Violations: {count}
- High Priority: {count}
- Tests Passing: {pass}/{total}

## Coverage Analysis
### Package Coverage
| Package | Coverage | Status | Gap |
|---------|----------|--------|-----|
| {pkg} | {percent} | ✅/❌ | {gap} |

### Coverage Gaps
#### {package} ({percent} — Below threshold)
**Uncovered Lines:**
- {file}:{lines} — {description}

**Required Test Cases:**
1. {test to add}

## Critical Violations
### 1. {Violation Title}
**File**: {path}:{line}
**Issue**: {description}
**Current**: {code}
**Required**: {correct code}

## Test Pattern Compliance
### Deterministic Testing
- ✅/❌ No wildcard matchers
- ✅/❌ Exact execution counts
- ✅/❌ Deterministic test data

### Mock Patterns
- ✅/❌ Generated mocks used correctly
- ✅/❌ No anti-patterns

### Test Structure
- ✅/❌ AAA pattern followed
- ✅/❌ Clear test naming
- ✅/❌ Proper organization

## Test Quality Assessment
### Completeness: {percent}
- ✅/❌ Happy path
- ✅/❌ Error conditions
- ✅/❌ Edge cases
- ✅/❌ Timeout scenarios

## Recommendations
1. {prioritized action}
```

When no shared workspace is provided, return findings as text output directly.

## Guiding Principles

**Run real coverage, never estimate.** "Looks like it's probably covered" isn't a finding. Execute the project's coverage tool and report actual numbers. Estimates give false confidence; measurements give actionable data.

**Deterministic tests are non-negotiable.** A test that passes 99% of the time is worse than no test — it teaches the team to ignore failures. Wildcard matchers, shared mutable state, time-dependent assertions, and missing seeds all create flaky tests. Flag them as critical because they erode trust in the entire test suite.

**Test the behaviors, not the implementation.** Tests coupled to implementation details (checking which internal method was called, asserting on private state) break during refactoring even when behavior is correct. Verify inputs and outputs at the public API boundary.

**Missing edge case tests matter more than missing happy path tests.** If the happy path isn't tested, you'll know fast — it'll break visibly. Untested error paths, timeouts, empty inputs, and boundary conditions are where production incidents come from.

**Suggest specific test cases, not generic advice.** "Add more edge case tests" is unhelpful. "Add a test for empty response body returning a descriptive error" gives the developer something to write immediately.
