# Quick Git Commands - Copy & Paste

## Setup (One-time)
```bash
cd /home/nadeeshame/Applications/SRI-KO_LMS_MERN
git config user.name "Nadeesha Medagama"
git config user.email "nadeeshame@gmail.com"  # Update with your actual email
git remote add origin https://github.com/NadeeshaMedagama/SRI-KO_LMS_MERN_Platform.git
```

---

## Method 1: Use Automated Script (Recommended)
```bash
cd /home/nadeeshame/Applications/SRI-KO_LMS_MERN
./push-changes.sh
```

---

## Method 2: Manual Commands (Copy each block)

### Step 1: Navigate to project
```bash
cd /home/nadeeshame/Applications/SRI-KO_LMS_MERN
```

### Step 2: Commit Announcement Management
```bash
git add Frontend/src/pages/AdminAnnouncementManagementPage.jsx
git commit -m "feat(admin): Replace text buttons with icons in Announcement Management

- Add Heroicons imports (PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon, BookmarkIcon, BookmarkSlashIcon)
- Replace text-based action buttons with icon buttons in Actions column
- Add hover states and tooltips for better UX
- Maintain consistent styling with Notification Management
- Icons: Edit (blue), Pin/Unpin (yellow/gray), Activate/Deactivate (green/gray), Delete (red)"
```

### Step 3: Commit Discussion Forum Management
```bash
git add Frontend/src/pages/AdminDiscussionForumManagementPage.jsx
git commit -m "feat(admin): Replace text buttons with icons in Discussion Forum Management

- Add Heroicons imports for action buttons
- Replace text-based action buttons with icon buttons in Actions column
- Implement consistent UI/UX with other admin pages
- Add tooltips for accessibility
- Icons match Notification and Announcement Management style"
```

### Step 4: Commit Documentation
```bash
git add *.md
git commit -m "docs: Update project documentation and add git push guide"
```

### Step 5: Push to GitHub
```bash
git push -u origin main
```

---

## Method 3: Single Commit (Quick)
```bash
cd /home/nadeeshame/Applications/SRI-KO_LMS_MERN

git add Frontend/src/pages/AdminAnnouncementManagementPage.jsx Frontend/src/pages/AdminDiscussionForumManagementPage.jsx *.md

git commit -m "feat(admin): Implement icon-based actions in admin management pages

- Update Announcement Management with icon buttons
- Update Discussion Forum Management with icon buttons
- Add Heroicons for consistent UI/UX
- Replace text buttons with intuitive icons
- Add documentation and git guide"

git push -u origin main
```

---

## Troubleshooting

### If push fails with authentication error:
Use GitHub Personal Access Token as password
Generate at: https://github.com/settings/tokens

### If branch doesn't exist:
```bash
git push -u origin main
```

### If you need to pull first:
```bash
git pull origin main --rebase
git push origin main
```

### Check what will be pushed:
```bash
git status
git log origin/main..HEAD
```

---

## GitHub Personal Access Token Setup

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (all)
4. Click "Generate token"
5. Copy the token
6. Use token as password when pushing

---

**Quick Start:** Just run `./push-changes.sh` from project root!

