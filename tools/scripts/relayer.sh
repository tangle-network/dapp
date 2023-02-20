#!/usr/bin/env bash

set -euo pipefail

# Set variables
REPO_URL="https://github.com/webb-tools/relayer.git"
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

if [ -d "$PROJECT_DIR/relayer" ]; then
  echo "relayer directory already exists. Skipping clone."
else
  cd "$PROJECT_DIR"
  echo "Cloning repository from $REPO_URL..."
  git clone "$REPO_URL"
  cd relayer
fi

echo "Fetching webb-relayer binary v0.5.0-rc8/webb-relayer-aarch64-apple-darwin.tar.gz from GitHub...\n"

# Download the relayer binary
RELAYER_VERSION="v0.5.0-rc8"
RELAYER_FILENAME="webb-relayer-aarch64-apple-darwin.tar.gz"
RELAYER_URL="https://github.com/webb-tools/relayer/releases/download/${RELAYER_VERSION}/${RELAYER_FILENAME}"
if ! curl -f -C - -L -o "$RELAYER_FILENAME" "$RELAYER_URL"; then
    echo "Failed to download $RELAYER_FILENAME from $RELAYER_URL"
    exit 1
fi
tar -xvf "$RELAYER_FILENAME"

# Create or update the .env file
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Creating $ENV_FILE file..."
  touch "$ENV_FILE"
else
  echo "$ENV_FILE file already exists."
fi
echo "Adding environment variables to $ENV_FILE file..."
cat << EOF >> "$ENV_FILE"
# EVM LOCAL NET
GOVERNOR_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001

WEBB_EVM_ATHENA_ENABLED=true
WEBB_EVM_DEMETER_ENABLED=true
WEBB_EVM_HERMES_ENABLED=true

ATHENA_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001
HERMES_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001
DEMETER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000001

ATHENA_HTTP_URL=http://127.0.0.1:5002
DEMETER_HTTP_URL=http://127.0.0.1:5003
HERMES_HTTP_URL=http://127.0.0.1:5001
ATHENA_WS_URL=wss://127.0.0.1:5002
DEMETER_WS_URL=wss://127.0.0.1:5003
HERMES_WS_URL=wss://127.0.0.1:5001
EOF

# Run the relayer
echo "Running the relayer..."
./webb-relayer -c config/development/evm-localnet/ -vv
