#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Function to log messages
log() {
  echo "----------------------------------------"
  echo ""
  echo "----------------------------------------"
}

# --- Deployment Steps ---

log "Step 1: Pulling latest changes from GitHub..."
sudo git pull origin main

log "Step 2: Cleaning up and rebuilding the project..."
sudo rm -rf .astro
sudo pnpm build

log "Step 3: Restarting the application with pm2..."
sudo pm2 restart budgetbee

log "Step 4: Waiting for the application to restart..."
sleep 3

log "Step 5: Saving the pm2 process list..."
sudo pm2 save

log "Deployment successful!"
