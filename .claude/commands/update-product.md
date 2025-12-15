---
description: Update PRODUCT.md based on code changes since origin/main
argument-hint: [base-commit]
---

# Update Product Documentation

Automatically analyze code changes and update PRODUCT.md to reflect newly implemented features, roadmap progress, and product evolution.

## What This Command Does

1. **Analyze changes**: Compare current branch against origin/main (or specified base)
2. **Identify new features**: Detect implemented features from code, commits, and beads
3. **Review current PRODUCT.md**: Understand existing documentation structure
4. **Update relevant sections**: Modify features, roadmap, version history as needed
5. **Report changes**: Summarize what was updated

## Usage

```bash
# Compare against origin/main (default)
/update-product

# Compare against specific commit or branch
/update-product abc123
/update-product feature-branch
```

## Implementation Steps

### 1. Determine Base Reference

If `[base-commit]` argument is provided:
- Use the specified commit/branch as base

If no argument:
- Use `origin/main` as the base reference

### 2. Gather Change Information

Run these commands to understand what changed:

```bash
# Get list of changed files
git diff --name-only [base]...HEAD

# Get detailed diff for understanding changes
git diff [base]...HEAD --stat

# Get commit messages since base (for context)
git log [base]...HEAD --oneline

# Check beads for completed work
bd list --status=closed
```

### 3. Analyze Backend Changes

Look for changes in `backend/src/`:
- **New endpoints** in `main.py` → New API capabilities
- **New services** in `services/` → New functionality
- **Modified services** → Enhanced features

Key files to check:
- `backend/src/main.py` - API endpoints
- `backend/src/services/audio.py` - Audio capabilities
- `backend/src/services/transcription.py` - Transcription features

### 4. Analyze Frontend/Desktop Changes

Look for changes in `desktop/src/`:
- **New UI components** → User-facing features
- **Hotkey changes** → Interaction updates
- **Tray updates** → Status/feedback features

Key files to check:
- `desktop/src/main/index.ts` - Main app logic
- `desktop/src/main/hotkey.ts` - Keyboard shortcuts
- `desktop/src/main/tray.ts` - System tray features

### 5. Check Beads for Context

Review completed issues for feature descriptions:

```bash
bd list --status=closed --json
```

Use closed issues to understand:
- What features were intentionally implemented
- How to describe them in user-facing terms
- Priority and categorization

### 6. Read Current PRODUCT.md

Read the existing PRODUCT.md to understand:
- Current feature list (what's documented)
- Roadmap structure (phases and priorities)
- Version history format
- Writing style and tone

### 7. Determine What to Update

Based on analysis, identify sections that need updates:

| Change Type | Section to Update |
|-------------|-------------------|
| New endpoint/service | Current Features |
| Completed roadmap item | Roadmap (move to complete) |
| New capability | Technical Specifications |
| Breaking change | Version History |
| Bug fix | Usually no update needed |

### 8. Apply Updates

Use Edit tool to update PRODUCT.md:

**For new features:**
- Add to "Current Features" table
- Include status marker (Shipped)
- Write user-facing description (not technical)

**For roadmap progress:**
- Move completed items from "Next" to "Complete"
- Update phase status if all items done
- Add checkmarks to completed items

**For version history:**
- Add new version entry if significant changes
- Include date and highlights
- Follow existing format

### 9. Report Changes

After updating, summarize:

```markdown
## PRODUCT.md Updated

**Sections modified:**
- Current Features: Added X new features
- Roadmap Phase 2: Marked Y items complete
- Version History: Added v1.1 entry

**New features documented:**
1. [Feature name] - [brief description]
2. [Feature name] - [brief description]

**Roadmap items completed:**
1. [Item moved from Next to Complete]
```

## Important Guidelines

1. **User-facing language**: Write features as benefits, not technical details
   - BAD: "Added POST /recording/stop endpoint"
   - GOOD: "Stop recording with automatic transcription"

2. **Don't over-document**: Only add significant user-facing changes
   - Skip: Refactoring, internal improvements, bug fixes
   - Include: New features, new options, UX improvements

3. **Preserve structure**: Match existing PRODUCT.md style and format

4. **Be conservative**: When uncertain, don't add - ask user

5. **Check for duplicates**: Don't add features already documented

## Error Handling

If analysis is unclear:
- List potential changes found
- Ask user which ones to document
- Don't auto-update without confidence

If PRODUCT.md doesn't exist:
- Report error
- Suggest running initial documentation setup first

## Example Output

```
Analyzing changes since origin/main...

Found 12 changed files:
- backend/src/services/audio.py (modified)
- backend/src/main.py (modified)
- desktop/src/main/tray.ts (new)

Detected new features:
1. System tray with color-coded status indicators
2. Audio device selection via API

Checking beads...
Found 3 closed issues related to these changes.

Updating PRODUCT.md...
- Added "System Tray States" to Current Features
- Added "Audio Device Selection" to Technical Capabilities
- Marked "System tray with menu" as complete in Roadmap

Done! PRODUCT.md updated with 2 new features.
```
