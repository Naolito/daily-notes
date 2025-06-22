#!/bin/bash

# Create the android/app directory if it doesn't exist
mkdir -p android/app

# Write the google-services.json file from the environment variable
if [ -n "$GOOGLE_SERVICES_JSON" ]; then
  echo "Creating google-services.json from EAS secret..."
  echo "$GOOGLE_SERVICES_JSON" > android/app/google-services.json
  echo "google-services.json created successfully"
else
  echo "Warning: GOOGLE_SERVICES_JSON environment variable not found"
fi