#!/bin/bash

# Dev with Ngrok Script
# Usage: ./dev-with-ngrok.sh <ngrok-url>

if [ -z "$1" ]; then
    echo "Usage: ./dev-with-ngrok.sh <ngrok-url>"
    echo "Example: ./dev-with-ngrok.sh https://abc1-23-45-67-89.ngrok-free.app"
    exit 1
fi

NGROK_URL=$1

echo "Starting dev server with NEXTAUTH_URL=$NGROK_URL"
NEXTAUTH_URL=$NGROK_URL npm run dev
