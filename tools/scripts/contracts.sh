#!/bin/bash

set -e

# Set variables
REPO_URL="https://github.com/webb-tools/protocol-solidity.git"
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

if [ -d "$PROJECT_DIR/protocol-solidity" ]; then
  echo "protocol-solidity directory already exists. Skipping clone."
  cd protocol-solidity
else
  cd "$PROJECT_DIR"
  echo "Cloning repository from $REPO_URL..."
  git clone "$REPO_URL"
  cd protocol-solidity
fi

# Install dependencies
echo "Installing dependencies..."
yarn install

# Fetch submodules
echo "Fetching submodules..."
git submodule update --init --recursive

# Check if dvc is installed
if ! command -v dvc &> /dev/null; then
  echo "dvc is not installed. Installing..."
  pip install dvc
else
  echo "dvc is already installed."
fi

# Populate fixtures
echo "Populating fixtures..."
yarn fetch:fixtures

# Compile contracts and build typescript interfaces
echo "Compiling contracts and building typescript interfaces..."
yarn build

# Start local test network
echo "Starting local test network..."
npx ts-node ./scripts/evm/deployments/LocalEvmVBridge.ts

echo "Done!"
