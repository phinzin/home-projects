# CI/CD Setup Guide for Docker Hub Publishing

## Prerequisites

1. **Docker Hub Account**: Create a free account at https://hub.docker.com
2. **GitHub Secrets**: Add the following secrets to your repository:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password or personal access token (recommended)

### How to Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add:
   - Name: `DOCKER_USERNAME` | Value: Your Docker Hub username
   - Name: `DOCKER_PASSWORD` | Value: Your Docker Hub password or PAT
5. Click **Add secret**

## Pipeline Configuration

The CI/CD pipeline is now configured to:

### Triggers
- **Push to main/master/develop branches**: Automatically builds and publishes
- **Release tags (v*)**: Automatically builds with semantic versioning
- **Pull Requests**: Builds image for validation (doesn't push)

### Jobs

1. **build-and-test**: 
   - Runs linting, tests, and builds the app
   - Required to pass before Docker image is built

2. **docker-build-push** (on push to main/master or version tags):
   - Builds multi-stage Docker image
   - Publishes to Docker Hub with tags:
     - `branch-name` (e.g., `master`, `develop`)
     - `v1.0.0` (semantic versioning)
     - `v1.0`, `v1` (major/minor versions)
     - `latest` (on main/master branch)
     - `{branch}-{sha}` (commit SHA)

3. **pull-request-check**:
   - Validates Docker image builds for PRs
   - Doesn't push to Docker Hub

## Docker Image

- **Registry**: Docker Hub
- **Image Name**: `{DOCKER_USERNAME}/home-health`
- **Port**: 3000 (application runs on this port)
- **Health Check**: Enabled

### Running Locally

```bash
docker run -p 3000:3000 {DOCKER_USERNAME}/home-health:latest
```

## Environment Variables

You can pass environment variables at runtime:

```bash
docker run -p 3000:3000 -e NODE_ENV=production {DOCKER_USERNAME}/home-health:latest
```

## Building Locally

```bash
docker build -f apps/home-health/Dockerfile -t my-home-health:v1 .
docker run -p 3000:3000 my-home-health:v1
```

## Troubleshooting

### Build Fails
- Check that `npm ci --legacy-peer-deps` works locally
- Verify `npx nx build home-health --configuration=production` builds successfully

### Push to Docker Hub Fails
- Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are set correctly
- Check Docker Hub account has push permissions
- Ensure Docker Hub username matches in secret

### Image Size Too Large
- Check `.dockerignore` file to exclude unnecessary files
- Consider using slim/alpine base images
