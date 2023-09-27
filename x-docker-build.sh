#!/bin/bash

IMAGE_NAME="google-drive-export"
BUILD_VERSION="1.0.0"

docker build -t ${IMAGE_NAME}:${BUILD_VERSION} .
docker tag ${IMAGE_NAME}:${BUILD_VERSION} ${IMAGE_NAME}:latest
