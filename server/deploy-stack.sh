#!/bin/bash
set -e

# --- CONFIG ---
STACK_NAME="nodejs-server-stack"
TEMPLATE_FILE="cloudformation.yaml"
AWS_REGION="us-east-1"
IMAGE_URI="$1"  # Pass as argument
ENVIRONMENT_NAME="prod"

if [[ -z "$IMAGE_URI" ]]; then
  echo "❌ You must provide the ECR image URI as the first argument."
  exit 1
fi

# --- DEPLOY ---
aws cloudformation deploy \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE_FILE" \
  --capabilities CAPABILITY_IAM \
  --region "$AWS_REGION" \
  --parameter-overrides \
    EnvironmentName="$ENVIRONMENT_NAME" \
    ImageUrl="$IMAGE_URI"

echo "✅ Stack deployed: $STACK_NAME"
