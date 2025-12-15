---
description: Update README.md based on code changes since a specific commit
argument-hint: [base-commit]
---

# Update README Based on Code Changes

Update the README.md file to reflect changes that occurred in the codebase since a specific commit. This command intelligently detects what changed and updates only the relevant README sections.

## Command Arguments

- `[base-commit]` (optional): The base commit to compare against. Defaults to `HEAD~10` (last 10 commits).

## Workflow

### Step 1: Detect Changes

Run git diff to identify what changed in the codebase:

```bash
git diff [base-commit]..HEAD --stat
git diff [base-commit]..HEAD --name-status
```

If no base commit argument is provided, use `HEAD~10` as the default.

Analyze the diff output to categorize changes:
- **New files**: Indicate new features, components, or modules
- **Modified files**: May signal updated functionality, API changes, or bug fixes
- **Deleted files**: Removal of deprecated features
- **Package files** (`package.json`, `requirements.txt`, `go.mod`, etc.): Dependency or tech stack changes
- **Config files** (`.env.example`, `docker-compose.yml`, etc.): Setup or deployment changes
- **Directory structure changes**: New folders or reorganization

### Step 2: Read Current README

Read the existing README.md file:

```bash
cat README.md
```

Understand the current structure and identify which sections exist:
- Project description / What it does
- Tech stack / Technologies used
- Getting started / Installation
- Environment variables / Configuration
- Project structure
- API endpoints / Usage
- How it works / Architecture
- Development / Contributing
- Roadmap / Future plans

### Step 3: Invoke README Skill for Guidance

Use the `crafting-effective-readmes` skill to ensure updates follow best practices:

```
/invoke-skill crafting-effective-readmes
```

This skill provides:
- Templates for different project types (OSS, personal, internal, config)
- Guidance on README structure and purpose
- Best practices for each section

Ask the skill: "I'm updating a README for a [project-type] project. The changes include [summary of changes]. Which sections should I update and how should I structure them?"

### Step 4: Map Changes to README Sections

Based on the detected changes, determine which README sections need updates:

| Change Type | README Sections to Update |
|-------------|---------------------------|
| New features/components | "What it does", "Features", "How it works" |
| Modified setup/config files | "Getting started", "Installation", "Configuration" |
| New/removed dependencies | "Tech stack", "Prerequisites", "Installation" |
| API changes | "API endpoints", "Usage", "Examples" |
| Project structure changes | "Project structure", "Architecture" |
| New environment variables | "Environment variables", "Configuration" |
| Documentation changes | May not need README update |

Create a summary like:
```
Changes detected:
- Added new authentication module (files: auth.ts, middleware/auth.ts)
- Updated package.json (new dependency: jsonwebtoken)
- Added .env.example variables (JWT_SECRET, JWT_EXPIRES_IN)
- Modified API routes (new /auth endpoints)

Sections to update:
1. Tech stack (add jsonwebtoken)
2. Getting started (mention JWT setup)
3. Environment variables (add JWT_SECRET, JWT_EXPIRES_IN)
4. API endpoints (document /auth routes)
5. How it works (explain authentication flow)
```

### Step 5: Update README Sections

For each identified section:

1. **Preserve existing structure**: Do not rewrite the entire README. Update only the affected sections.

2. **Follow the crafting-effective-readmes patterns**:
   - Keep language clear and action-oriented
   - Use code blocks for setup steps
   - Provide concrete examples
   - Maintain consistent formatting

3. **Update specific sections**:

   **Tech Stack**: Add or remove dependencies
   ```markdown
   - Express.js - Web framework
   - TypeScript - Type safety
   - PostgreSQL - Database
   - jsonwebtoken - JWT authentication [NEW]
   ```

   **Getting Started**: Add new setup steps if config changed
   ```markdown
   3. Copy environment variables:
      ```bash
      cp .env.example .env
      ```
      Configure JWT settings (see Environment Variables section)
   ```

   **Environment Variables**: Document new variables
   ```markdown
   | Variable | Description | Example |
   |----------|-------------|---------|
   | JWT_SECRET | Secret key for JWT signing | `your-secret-key` |
   | JWT_EXPIRES_IN | Token expiration time | `7d` |
   ```

   **API Endpoints**: Add new routes
   ```markdown
   ### Authentication
   - `POST /auth/login` - User login
   - `POST /auth/register` - User registration
   - `GET /auth/me` - Get current user (requires auth)
   ```

   **Project Structure**: Reflect directory changes
   ```markdown
   src/
   ├── auth/              # Authentication module [NEW]
   │   ├── auth.service.ts
   │   └── auth.controller.ts
   ├── middleware/
   │   └── auth.ts        # JWT middleware [NEW]
   ```

4. **Use the Edit tool** to make targeted updates. Do NOT rewrite the entire file.

### Step 6: Verify and Report

1. **Read the updated README** to ensure:
   - Changes are accurate
   - Formatting is consistent
   - No sections were accidentally removed
   - Links still work
   - Code blocks are properly formatted

2. **Report what was updated**:
   ```
   ✓ README.md updated successfully

   Changes made:
   - Updated Tech Stack section (added jsonwebtoken)
   - Added JWT configuration to Getting Started
   - Documented 2 new environment variables
   - Added Authentication API endpoints
   - Updated Project Structure

   Sections preserved:
   - Project description
   - How it works
   - Development
   - Roadmap
   ```

3. **Suggest next steps** if relevant:
   - "Consider updating the Roadmap section to reflect completed features"
   - "The How it works section could be expanded to explain the new authentication flow"
   - "New screenshots or diagrams might help illustrate the changes"

## Important Context

### README Purpose
For this project (personal/OSS hybrid), README.md serves both future-you and potential contributors. It should answer:
- What does this project do?
- What technologies does it use?
- How do I get started?
- How do I configure it?
- What's the project structure?
- What APIs are available?
- How does it work?
- What's planned for the future?

### Key Principles
- **Incremental updates**: Only update sections affected by changes
- **Consistency**: Follow existing README structure and style
- **Clarity**: Use simple language and concrete examples
- **Completeness**: Ensure new features are fully documented
- **Accuracy**: Verify all information matches the actual code

## Error Handling

- If base commit doesn't exist: Report error and suggest using `git log --oneline` to find valid commits
- If README.md doesn't exist: Report this and ask if one should be created
- If git diff returns no changes: Report "No changes detected since [commit]. README is up to date."
- If unsure about a change's impact: Flag it for user review rather than guessing

## Success Criteria

- ✓ All significant code changes are reflected in README
- ✓ New features are documented with examples
- ✓ Changed dependencies are listed in Tech Stack
- ✓ New environment variables are documented
- ✓ API changes are documented with examples
- ✓ README structure and formatting remain consistent
- ✓ No existing content is accidentally removed
