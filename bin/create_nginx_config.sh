#!/bin/bash
# Debug, echo every command
set -x

# Use the BUILD_DIR environment variable.
cd "$BUILD_DIR"

# Sanity checks.
if [ ! -f "$BUILD_DIR/static.json" ]; then
  echo "Error: static.json not found in ${BUILD_DIR}. Please include static.json and try again."
  exit 1
fi

set -e

cd "$BP_DIR/bin/"

echo "Installing EJS dependency..."
npm install -g ejs

cd "$BUILD_DIR"
echo "Running generate-config.js to generate nginx-static.conf.erb..."
node "$BP_DIR/bin/generate_config.js" "$BUILD_DIR/static.json"

echo "nginx-static.conf.erb generated successfully."