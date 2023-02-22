#!/bin/bash

set -e

# Set variables
REPO_URL="https://github.com/webb-tools/webb-dapp.git"
CURRENT_DIR=$(pwd)
defaultPath="$CURRENT_DIR/local-webb-dapp"

if [ $# -eq 0 ]
then
    PROJECT_DIR="$defaultPath"
else
    PROJECT_DIR="$1"
fi

# Check to see if the directory exists else create it
echo "Check to see if the directory exists else create it...\n"
[ -d $PROJECT_DIR ] || mkdir $PROJECT_DIR

# Clone the repository
cd "$PROJECT_DIR"

if [ -d "$PROJECT_DIR/webb-dapp" ]; then
  echo "webb-dapp directory already exists. Skipping clone."
  cd webb-dapp
else
  cd "$PROJECT_DIR"
  echo "Cloning repository from $REPO_URL..."
  git clone "$REPO_URL"
  cd webb-dapp
fi

# Install the dependencies
if ! yarn install; then
  echo "Failed to install dependencies. Exiting..."
  exit 1
fi

# Start the bridge
if ! yarn start:bridge; then
  echo "Failed to start the bridge. Exiting..."
  exit 1
fi
