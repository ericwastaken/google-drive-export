#!/bin/bash

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
if [ ! -f "$3" ]; then
  echo "Please provide the path to an Account Service Key JSON file!"
  exit 1
fi

SOURCE_REPOS_DIR_PATH="$1"
SOURCE_GOOGLE_DRIVE_DIR_ID="$2"
ACCOUNT_SERVICE_KEY_JSON_PATH="$3"

# Start a bash shell via docker run, passing in the repos directory as a volume, and the organization
# and team names as arguments.
docker run -it \
  --rm \
  -e SOURCE_GOOGLE_DRIVE_DIR_ID="$SOURCE_GOOGLE_DRIVE_DIR_ID" \
  -e ACCOUNT_SERVICE_KEY_JSON_PATH="$ACCOUNT_SERVICE_KEY_JSON_PATH" \
  -v "$SOURCE_REPOS_DIR_PATH":/export-out/ \
  -w /app \
  google-drive-export /bin/bash