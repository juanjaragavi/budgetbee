#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u

# Define branch names
DEV_BRANCH="dev"
MAIN_BRANCH="main"
BACKUP_BRANCH="backup"

# Generic Git workflow script for TopFinanzas Pages MX
# This script automates common Git operations for deployment

# --- Pre-flight Checks ---

# 1. Check if we are on the dev branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$DEV_BRANCH" ]; then
  echo "Error: You must be on the '$DEV_BRANCH' branch to run this script."
  exit 1
fi

echo "Starting Git workflow on '$DEV_BRANCH' branch..."

# --- Git Workflow (Commit & Push) ---

# Step 1: Check repository status
echo "Checking repository status..."
git status

# Step 2: Add all changes to staging
echo "Adding changes to staging..."
git add --all

# Step 3: Check for merge conflicts
echo "Checking for merge conflicts..."
if git diff --name-only --diff-filter=U | grep -q .; then
  echo "Merge conflicts detected. Resolving by keeping current branch changes..."
  git checkout --ours .
  git add --all
  echo "Merge conflicts resolved."
else
  echo "No merge conflicts detected."
fi

# Step 4: Check if commit message file exists
if [ -f "./lib/documents/commit-message.txt" ]; then
  echo "Committing with message from commit-message.txt..."
  git commit -F ./lib/documents/commit-message.txt
else
  echo "No commit message file found. Please enter commit message:"
  read -p "> " commit_message
  git commit -m "$commit_message"
fi

# Step 5: Push to current branch
echo "Pushing to branch: $DEV_BRANCH"
git push -u origin $DEV_BRANCH

echo "Git workflow (commit & push) completed successfully!"

# --- Merge Process (Separate Functionality) ---

# Ask whether to proceed with merges to main and backup branches
read -p "Do you want to merge changes into main and backup branches? (y/n): " MERGE_CONFIRM
if [ "$MERGE_CONFIRM" != "y" ] && [ "$MERGE_CONFIRM" != "Y" ]; then
  echo "Merge process skipped. Exiting script."
  exit 0
fi

# Check if the working directory is clean before proceeding with merges
if ! git diff-index --quiet HEAD --; then
  echo "Error: Working directory is not clean. Please commit or stash your changes before merging."
  exit 1
fi

echo "Starting merge process..."

# 1. Update and merge into main branch
echo "Switching to '$MAIN_BRANCH' branch..."
git checkout "$MAIN_BRANCH"

echo "Pulling latest changes for '$MAIN_BRANCH'..."
git pull origin "$MAIN_BRANCH"

echo "Merging '$DEV_BRANCH' into '$MAIN_BRANCH'..."
git merge "$DEV_BRANCH"

echo "Pushing '$MAIN_BRANCH' to origin..."
git push origin "$MAIN_BRANCH"

# 2. Update and merge into backup branch
echo "Switching to '$BACKUP_BRANCH' branch..."
git checkout "$BACKUP_BRANCH"

echo "Pulling latest changes for '$BACKUP_BRANCH'..."
git pull origin "$BACKUP_BRANCH"

echo "Merging '$DEV_BRANCH' into '$BACKUP_BRANCH'..."
git merge "$DEV_BRANCH"

echo "Pushing '$BACKUP_BRANCH' to origin..."
git push origin "$BACKUP_BRANCH"

# 3. Return to dev branch
echo "Switching back to '$DEV_BRANCH' branch..."
git checkout "$DEV_BRANCH"

echo "Successfully merged '$DEV_BRANCH' into '$MAIN_BRANCH' and '$BACKUP_BRANCH', and pushed updates."
echo "You are now back on the '$DEV_BRANCH' branch."

exit 0
