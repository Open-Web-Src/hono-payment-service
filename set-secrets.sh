#!/bin/bash

# Check if filename is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <filename> [environment]"
  echo "Example: $0 .stg.vars staging"
  exit 1
fi

# Read filename and optionally environment from arguments
filename="$1"
environment="$2"  # Optional, can be empty

# Ensure CF_ACCOUNT_ID is available in the environment
if [ -z "$CF_ACCOUNT_ID" ]; then
  echo "Error: CF_ACCOUNT_ID is not set in the environment."
  exit 1
fi

# Ensure the file exists
if [ ! -f "$filename" ]; then
  echo "File not found: $filename"
  exit 1
fi

# Determine if environment flag should be included
ENV_FLAG=""
if [ -n "$environment" ]; then
  ENV_FLAG="--env $environment"
fi

# Set secrets from the provided file for the specified environment
while IFS= read -r line || [ -n "$line" ]; do
  # Ignore lines that are blank or start with "#" or "//"
  if [[ $line != \#* ]] && [[ $line != //* ]] && [[ -n "$line" ]]; then
    key=$(echo "$line" | cut -d'=' -f1)
    value=$(echo "$line" | cut -d'=' -f2-)
    echo "Setting $key for the ${environment:-default} environment..."
    
    # Set the secret using `printf` to handle multi-line values correctly
    printf "%s" "$value" | wrangler secret put "$key" $ENV_FLAG
  fi
done < "$filename"

echo "All secrets set for CF_ACCOUNT_ID: $CF_ACCOUNT_ID ${environment:+in environment: $environment}"
