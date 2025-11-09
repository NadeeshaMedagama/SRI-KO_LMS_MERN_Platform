#!/bin/bash

# Script to push changes to GitHub with organized commits
# Repository: https://github.com/NadeeshaMedagama/SRI-KO_LMS_MERN_Platform.git

set -e  # Exit on error

echo "================================================"
echo "  SRI-KO LMS - Git Push Script"
echo "================================================"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"
PROJECT_DIR=$(pwd)
echo "📁 Project Directory: $PROJECT_DIR"
echo ""

# Configure git user (update with your actual email)
echo "⚙️  Configuring Git..."
git config user.name "Nadeesha Medagama"
git config user.email "nadeeshame@gmail.com"  # Update this with your actual email
echo "✅ Git configured"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
    echo "✅ Git initialized"
else
    echo "✅ Git repository already initialized"
fi
echo ""

# Add remote if not exists
if ! git remote get-url origin &> /dev/null; then
    echo "🔗 Adding remote repository..."
    git remote add origin https://github.com/NadeeshaMedagama/SRI-KO_LMS_MERN_Platform.git
    echo "✅ Remote added"
else
    echo "✅ Remote already configured"
    git remote -v
fi
echo ""

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
Backend/node_modules/
Frontend/node_modules/
package-lock.json

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
Backend/config.env
Backend/config.production.env
Backend/config.test.env
Backend/.env

# Build files
Frontend/dist/
Frontend/build/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/

# OS files
.DS_Store
Thumbs.db
.directory

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.project
.classpath
.settings/

# Uploads (keep the directory structure)
Backend/uploads/*
!Backend/uploads/.gitkeep

# Choreo
.choreo/

# Test files in backend root (optional)
Backend/test-*.js
EOF
    echo "✅ .gitignore created"
else
    echo "✅ .gitignore already exists"
fi
echo ""

# Check status
echo "📊 Git Status:"
git status --short
echo ""

# Ask user to continue
read -p "Do you want to proceed with commits? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted by user"
    exit 1
fi
echo ""

# Commit 1: Announcement Management
echo "📝 Commit 1: Announcement Management Icons..."
if git diff --quiet Frontend/src/pages/AdminAnnouncementManagementPage.jsx; then
    echo "⏭️  No changes in AdminAnnouncementManagementPage.jsx, skipping..."
else
    git add Frontend/src/pages/AdminAnnouncementManagementPage.jsx
    git commit -m "feat(admin): Replace text buttons with icons in Announcement Management

- Add Heroicons imports (PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, BookmarkIcon, BookmarkSlashIcon)
- Replace text-based action buttons with icon buttons in Actions column
- Add hover states and tooltips for better UX
- Maintain consistent styling with Notification Management
- Icons: Edit (blue), Pin/Unpin (yellow/gray), Activate/Deactivate (green/gray), Delete (red)
- Improve visual consistency across admin panel"
    echo "✅ Committed: Announcement Management"
fi
echo ""

# Commit 2: Discussion Forum Management
echo "📝 Commit 2: Discussion Forum Management Icons..."
if git diff --quiet Frontend/src/pages/AdminDiscussionForumManagementPage.jsx; then
    echo "⏭️  No changes in AdminDiscussionForumManagementPage.jsx, skipping..."
else
    git add Frontend/src/pages/AdminDiscussionForumManagementPage.jsx
    git commit -m "feat(admin): Replace text buttons with icons in Discussion Forum Management

- Add Heroicons imports for action buttons
- Replace text-based action buttons with icon buttons in Actions column
- Implement consistent UI/UX with other admin pages
- Add tooltips for accessibility
- Icons match Notification and Announcement Management style
- Enhance user experience with visual indicators"
    echo "✅ Committed: Discussion Forum Management"
fi
echo ""

# Commit 3: Documentation files
echo "📝 Commit 3: Documentation..."
if ls *.md 1> /dev/null 2>&1; then
    git add *.md
    git commit -m "docs: Update project documentation

- Add certificate delivery tracking documentation
- Add dashboard statistics fix documentation
- Add test certificate feature documentation
- Add git push guide for contributors" || echo "⏭️  No documentation changes to commit"
    echo "✅ Committed: Documentation"
else
    echo "⏭️  No markdown files found, skipping..."
fi
echo ""

# Commit 4: .gitignore
echo "📝 Commit 4: .gitignore..."
if git diff --quiet .gitignore; then
    echo "⏭️  No changes in .gitignore, skipping..."
else
    git add .gitignore
    git commit -m "chore: Add comprehensive .gitignore file

- Exclude node_modules and dependencies
- Exclude environment configuration files
- Exclude build artifacts and logs
- Exclude IDE-specific files
- Protect sensitive data" || echo "⏭️  .gitignore already committed"
    echo "✅ Committed: .gitignore"
fi
echo ""

# Show commit log
echo "📜 Recent Commits:"
git log --oneline -5
echo ""

# Push to GitHub
echo "🚀 Pushing to GitHub..."
read -p "Push to which branch? (main/master/feature-branch): " BRANCH
BRANCH=${BRANCH:-main}

echo "Pushing to branch: $BRANCH"

# Try to pull first (if branch exists on remote)
echo "Attempting to pull latest changes..."
git pull origin $BRANCH --rebase || echo "⚠️  No remote branch found or conflicts, continuing..."

# Push
echo "Pushing commits..."
git push -u origin $BRANCH

if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo "  ✅ SUCCESS! All changes pushed to GitHub"
    echo "================================================"
    echo ""
    echo "🔗 Repository: https://github.com/NadeeshaMedagama/SRI-KO_LMS_MERN_Platform"
    echo "🌿 Branch: $BRANCH"
    echo ""
else
    echo ""
    echo "================================================"
    echo "  ❌ ERROR: Push failed"
    echo "================================================"
    echo ""
    echo "Possible reasons:"
    echo "  1. Authentication failed - use GitHub Personal Access Token"
    echo "  2. Remote branch conflicts - try: git pull origin $BRANCH --rebase"
    echo "  3. No push permissions - check repository access"
    echo ""
    echo "Manual push command:"
    echo "  git push -u origin $BRANCH"
    echo ""
    exit 1
fi

