#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u

# Function to log messages
log() {
  echo "----------------------------------------"
  echo "$1"
  echo "----------------------------------------"
}

# Define branch names
DEV_BRANCH="dev"
MAIN_BRANCH="main"
BACKUP_BRANCH="backup"

log "Starting branch synchronization from '$MAIN_BRANCH'..."

# --- Pre-flight Checks ---
# Check if the working directory is clean before proceeding
if ! git diff-index --quiet HEAD --; then
  log "Error: Working directory is not clean. Please commit or stash your changes before syncing."
  exit 1
fi

# --- Synchronization Steps ---
# 1. Switch to main branch and pull latest changes
log "Switching to '$MAIN_BRANCH' branch and pulling latest changes..."
git checkout "$MAIN_BRANCH"
git pull origin "$MAIN_BRANCH"

# 2. Merge main into dev branch
log "Switching to '$DEV_BRANCH' branch and merging '$MAIN_BRANCH' into it..."
git checkout "$DEV_BRANCH"
git merge "$MAIN_BRANCH" --no-edit # --no-edit to use default merge message
git push origin "$DEV_BRANCH"

# 3. Merge main into backup branch
log "Switching to '$BACKUP_BRANCH' branch and merging '$MAIN_BRANCH' into it..."
git checkout "$BACKUP_BRANCH"
git merge "$MAIN_BRANCH" --no-edit # --no-edit to use default merge message
git push origin "$BACKUP_BRANCH"

# 4. Return to dev branch
log "Synchronization complete. Switching back to '$DEV_BRANCH' branch."
git checkout "$DEV_BRANCH"

log "Branch synchronization successful!"
