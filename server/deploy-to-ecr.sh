#!/bin/bash

# --- CONFIG ---
AWS_REGION="us-east-1"                # Update if needed
REPOSITORY_NAME="nodejs-app"         # ECR repo name (will be created if doesn't exist)
IMAGE_TAG="latest"                   # You can use git commit SHA or version here

# --- INIT ---
echo "🔑 Getting AWS account ID..."
if ! ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>&1); then
    echo "❌ Failed to get AWS account ID. Error: $ACCOUNT_ID"
    echo "Please check your AWS credentials and try again."
    exit 1
fi
ECR_URI="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPOSITORY_NAME}"

# --- LOGIN ---
echo "🔍 Checking ECR repository..."
if ! aws ecr describe-repositories --repository-names "${REPOSITORY_NAME}" > /dev/null 2>&1; then
    echo "📦 Creating ECR repository..."
    # Create repository and capture output
    REPO_CREATE_OUTPUT=$(aws ecr create-repository --repository-name "${REPOSITORY_NAME}" --region "${AWS_REGION}" 2>&1)
    # Check if the error is because repository already exists
    if [[ $? -ne 0 ]] && [[ ! $REPO_CREATE_OUTPUT =~ "RepositoryAlreadyExistsException" ]]; then
        echo "❌ Failed to create ECR repository: $REPO_CREATE_OUTPUT"
        exit 1
    fi
    echo "📦 Repository exists or was created successfully"
else
    echo "📦 Repository already exists"
fi

echo "🔑 Logging into ECR..."
if ! aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com" > /dev/null 2>&1; then
    echo "❌ Failed to login to ECR. Please check your AWS credentials and permissions."
    exit 1
fi

# --- BUILD & PUSH ---
echo "🏗️  Building Docker image..."
if ! docker build --platform linux/amd64 -t "${REPOSITORY_NAME}:${IMAGE_TAG}" .; then
    echo "❌ Failed to build Docker image"
    exit 1
fi

echo "🏷️  Tagging Docker image..."
if ! docker tag "${REPOSITORY_NAME}:${IMAGE_TAG}" "${ECR_URI}:${IMAGE_TAG}"; then
    echo "❌ Failed to tag Docker image"
    exit 1
fi

echo "⬆️  Pushing Docker image to ECR..."
if ! docker push "${ECR_URI}:${IMAGE_TAG}"; then
    echo "❌ Failed to push Docker image to ECR"
    exit 1
fi

echo "✅ Image pushed to: ${ECR_URI}:${IMAGE_TAG}"
