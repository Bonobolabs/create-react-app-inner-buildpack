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
npm install ejs

echo "Running generate-config.js to generate nginx-static.conf.erb..."
mkdir -p "$BUILD_DIR/config"
node "$BP_DIR/bin/generate_config.js" "$BUILD_DIR/static.json" >  "$BUILD_DIR/config/nginx.conf.erb"

echo "nginx-static.conf.erb generated successfully."