---
description: Update AGENTS.md based on codebase changes since a specific commit
argument-hint: [base-commit]
---

# Update AGENTS.md Command

This command intelligently updates the AGENTS.md file based on detected changes in the codebase since a specified commit.

**Note:** CLAUDE.md is a symlink to AGENTS.md in this project, so updates to AGENTS.md are automatically reflected in CLAUDE.md.

## Purpose

AGENTS.md provides guidance to Claude Code when working with this codebase. It contains:
- Project overview and structure
- Tech stack and dependencies
- Setup instructions
- Code patterns and conventions
- Development workflows

**IMPORTANT**: AGENTS.md is NOT for tracking progress or tasks (that belongs in .beads/issues.jsonl or similar). It's for onboarding and guiding AI assistants working with the code.

## Command Workflow

### Step 1: Determine Base Commit

If the user provided a base commit argument:
- Use that commit as the base
- Validate it exists: `git rev-parse --verify <commit> 2>/dev/null`

Otherwise, default to HEAD~10 (last 10 commits):
- Use `HEAD~10` as the base commit
- If fewer than 10 commits exist, fall back to the initial commit

Report to the user which commit range will be analyzed.

### Step 2: Analyze Codebase Changes

Run git diff to detect what changed between the base commit and HEAD:

```bash
git diff --name-status <base-commit>..HEAD
```

Categorize the changes:

**A. New Files/Directories Added (A status)**
- New source files → May indicate new modules or features
- New config files → May indicate new tools or dependencies
- New directories → May indicate new project structure

**B. Modified Files (M status)**
- package.json / requirements.txt / pyproject.toml / Cargo.toml / go.mod → Dependency changes
- README.md → May contain new setup instructions
- Config files (.eslintrc, tsconfig.json, etc.) → Pattern changes
- Source files → May reveal new conventions

**C. Deleted Files (D status)**
- Removed dependencies or deprecated patterns
- Structural changes

**D. Renamed Files (R status)**
- Project reorganization

For each category, examine the actual diff content for significant changes:

```bash
git diff <base-commit>..HEAD -- <specific-file>
```

### Step 3: Read Current AGENTS.md

Read the existing AGENTS.md file to understand:
- Current structure and sections
- Existing content that should be preserved
- Custom instructions or context
- What's missing or outdated

### Step 4: Identify Sections Needing Updates

Based on detected changes, determine which AGENTS.md sections need updates:

**Common sections to check:**

- **Project Structure** - If files/directories were added/removed/renamed
- **Tech Stack** - If package.json, requirements.txt, pyproject.toml, or similar changed
- **Dependencies** - If new libraries were added
- **Setup Instructions** - If build scripts, configs, or environment changed
- **Code Patterns** - If linting rules, formatting configs, or architectural patterns changed
- **Development Workflows** - If scripts, CI configs, or developer tools changed
- **Architecture** - If major structural changes occurred

### Step 5: Generate Updates Using claude-md-enhancer Patterns

Use the **claude-md-enhancer** skill as a reference for:
- Proper AGENTS.md structure and formatting
- Best practices for documenting projects
- Tech stack-specific templates
- Comprehensive guideline generation

Review the detected changes and draft updates for each affected section.

**Key principles:**
- Preserve user-written custom content
- Update only sections affected by the changes
- Maintain consistent formatting and style
- Be specific and actionable
- Include code examples where relevant

### Step 6: Present Changes to User

Before making any modifications, present a summary:

1. **Changes Detected:**
   - List significant file changes
   - Categorize by type (new features, dependencies, configs, etc.)

2. **Proposed AGENTS.md Updates:**
   - Show which sections will be updated
   - Provide a brief preview of changes
   - Explain the reasoning

3. **Ask for Confirmation:**
   - "Should I proceed with these updates to AGENTS.md?"
   - Offer to adjust based on feedback

### Step 7: Apply Updates

Once approved:

1. Read the current AGENTS.md in full
2. Apply the updates to the relevant sections
3. Preserve all custom content and formatting
4. Write the updated AGENTS.md back to disk

### Step 8: Verify and Report

After updating:

1. Show a diff of what changed in AGENTS.md
2. Summarize the updates made
3. Suggest next steps (e.g., review, commit, further refinements)
4. Remind user that CLAUDE.md (symlink) will automatically reflect these changes

## Error Handling

**If base commit doesn't exist:**
- Report error to user
- Suggest valid commit range or default to HEAD~10

**If git diff fails:**
- Check if we're in a git repository
- Verify git is installed
- Report error with diagnostic info

**If AGENTS.md doesn't exist:**
- Inform user that AGENTS.md doesn't exist yet
- Offer to create one from scratch using claude-md-enhancer skill
- Suggest: "Would you like me to create an AGENTS.md file for this project?"

**If no significant changes detected:**
- Report: "No changes detected that would affect AGENTS.md"
- Offer to review AGENTS.md for completeness anyway
- Suggest manual review if needed

## Success Criteria

The command succeeds when:
- All relevant sections of AGENTS.md are updated based on detected changes
- Custom content is preserved
- Formatting is consistent with claude-md-enhancer patterns
- User confirms the updates are accurate
- AGENTS.md file is written successfully
- CLAUDE.md symlink automatically reflects the changes

## Examples

**Example 1: Default usage (last 10 commits)**
```
/update-agents-md
```

**Example 2: Since specific commit**
```
/update-agents-md abc123f
```

**Example 3: Since a tag**
```
/update-agents-md v1.0.0
```

## Notes

- This command does NOT update progress tracking or task lists (use .beads/issues.jsonl for that)
- Always preserve user-written custom instructions and context
- Use the claude-md-enhancer skill patterns for comprehensive formatting
- When in doubt, ask the user before making significant structural changes
- CLAUDE.md is automatically updated via symlink, so only edit AGENTS.md
