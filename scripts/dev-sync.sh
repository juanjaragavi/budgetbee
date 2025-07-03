#!/bin/bash

# Function to display messages
function message() {
  echo "-------------------------"
  echo "$1"
  echo "-------------------------"
}

# Navigate to the project directory
cd /Users/macbookpro/GitHub/budgetbee || exit

# Step 1: Stash any local changes
message "Stashing local changes..."
git stash

# Step 2: Switch to the main branch
message "Switching to the main branch..."
git checkout main

# Step 3: Pull the latest changes from the main branch
message "Pulling the latest changes from the main branch..."
git pull origin main

# Step 4: Switch to the dev branch
message "Switching to the dev branch..."
git checkout dev

# Step 5: Merge the changes from the main branch into the dev branch
message "Merging changes from main into dev..."
git merge main

# Step 6: Push the updated dev branch to the remote repository
message "Pushing the updated dev branch to the remote repository..."
git push origin dev

# Step 7: Switch to the backup branch
message "Switching to the backup branch..."
git checkout backup

# Step 8: Merge the changes from the main branch into the backup branch
message "Merging changes from main into backup..."
git merge main

# Step 9: Push the updated backup branch to the remote repository
message "Pushing the updated backup branch to the remote repository..."
git push origin backup

# Step 10: Switch back to the dev branch
message "Switching back to the dev branch for development..."
git checkout dev

# Step 11: Apply the stashed changes
message "Applying stashed changes..."
git stash pop

# Step 12: Inform the user that the process is complete
message "The dev and backup branches have been successfully updated with the latest changes from the main branch. You are now on the dev branch."
