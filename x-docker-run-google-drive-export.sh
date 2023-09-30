#!/bin/bash

# Exit immediately if any command returns a non-zero status
set -e

# Get the directory of the currently running script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Ensure the container has been built, especially if there were updates.
"${SCRIPT_DIR}/x-docker-build.sh"

# check to ensure that the first argument is a directory and was passed
if [ -z "$1" ] || [ ! -d "$1" ]; then
  echo "Please provide a directory to mount as a volume for the backup!"
  exit 1
fi

# check to ensure that the second argument was passed
if [ -z "$2" ]; then
  echo "Please provide a Google Drive Directory Id to start from!"
  exit 1
fi

# check that a file exists
if [ ! -f "./secrets/$3" ]; then
  echo "Please provide the path to an Account Service Key JSON file!"
  exit 1
fi

# A function to set the silent and team-drive flags (to be processed next)
set_flag() {
  if [ "$1" == "silent" ]; then
    SILENT_FLAG="--silent"
  fi
  if [ "$1" == "team-drive" ]; then
    TEAMDRIVE_FLAG="--team-drive"
  fi
}

# If we were passed a 4th argument with the string "silent", then we'll set the silent flag to true.
if [ -n "$4" ]; then
  set_flag "$4"
fi

# If we were passed a 5th argument with the string "silent", then we'll set the silent flag to true.
if [ -n "$5" ]; then
  set_flag "$5"
fi

EXPORT_DIR_PATH="$1"
SOURCE_GOOGLE_DRIVE_DIR_ID="$2"
ACCOUNT_SERVICE_KEY_JSON_PATH="$3"

echo "'/export-out' -> '$EXPORT_DIR_PATH'"

# Start a bash shell via docker run, passing in the repos directory as a volume, and the organization
# and team names as arguments.
docker run -i \
  --rm \
  -e SOURCE_GOOGLE_DRIVE_DIR_ID="$SOURCE_GOOGLE_DRIVE_DIR_ID" \
  -v "$EXPORT_DIR_PATH":/export-out/ \
  -w /app \
  google-drive-export node app.mjs --output "/export-out" --folder "$SOURCE_GOOGLE_DRIVE_DIR_ID" --keyfile "$ACCOUNT_SERVICE_KEY_JSON_PATH" $SILENT_FLAG $TEAMDRIVE_FLAG