#!/bin/bash

# This script runs before the build process
# It copies the google-services.json from the environment variable to the correct location

if [ -n "$GOOGLE_SERVICES_JSON" ]; then
  echo "Setting up google-services.json for Android build..."
  echo "$GOOGLE_SERVICES_JSON" > android/app/google-services.json
  echo "google-services.json has been created"
fi