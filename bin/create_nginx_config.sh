#!/bin/bash
# Debug, echo every command
#set -x

# Use the BUILD_DIR environment variable.
cd "$BUILD_DIR"

# Sanity checks.
if [ ! -f "static.json" ]; then
  echo "Error: static.json not found in ${BUILD_DIR}. Please include static.json and try again."
  exit 1
fi

if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in ${BUILD_DIR}. Cannot install dependencies."
  exit 1
fi

set -e

echo "Installing EJS dependency..."
npm install ejs

echo "Running generate-config.js to generate nginx-static.conf.erb..."
/app/.heroku/node/bin/node generate_config.js "$BUILD_DIR/static.json"

echo "nginx-static.conf.erb generated successfully."