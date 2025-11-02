# Manual Deployment Guide for DTF-HAT

This guide covers how to MANUALLY build, push, and deploy the DTF-HAT application to Azure Kubernetes Service (AKS).

## Prerequisites

1. **Azure CLI** installed and configured
2. **Docker** installed and running
3. **kubectl** configured with access to your AKS cluster
4. **Azure Container Registry (ACR)** access
   - ACR name: `monsterdigital`
   - ACR URL: `monsterdigital.azurecr.io`

## Step 1: Login to Azure Container Registry

```bash
# Login to Azure (if not already logged in)
az login

# Login to Azure Container Registry
az acr login --name monsterdigital
```

## Step 2: Inject Build ID (Optional but Recommended)

Before building, replace `BUILD_ID` placeholder in `index.html` with an actual build ID:

```bash
# From project root
cd apps/dtf-hat

# Replace BUILD_ID with a unique identifier (e.g., build number, timestamp, or commit hash)
# PowerShell (Windows)
(Get-Content src/index.html) -replace 'BUILD_ID', '20240101-12345' | Set-Content src/index.html

## Step 3: Build Docker Image

Build the Docker image using the appropriate Dockerfile:

### For Development:
```bash
docker build -f Dockerfile.dev -t monsterdigital.azurecr.io/mdp-webapp-dtf-hat:dev .
```

### For Production:
```bash
docker build -f Dockerfile.prod -t monsterdigital.azurecr.io/mdp-webapp-dtf-hat:prod .
```

### For Test:
```bash
docker build -f Dockerfile.test -t monsterdigital.azurecr.io/mdp-webapp-dtf-hat:test .
```

**Note:** Make sure you're in the `apps/dtf-hat` directory or adjust the build context accordingly.

## Step 4: Push Image to Azure Container Registry

Push the built image to ACR:

```bash
# Replace with your tag
docker push monsterdigital.azurecr.io/mdp-webapp-dtf-hat:dev

## Step 5: Update Kubernetes Deployment

Update the deployment YAML file with your new image tag:

### Option 1: Edit deployment.yaml directly

Edit `devops/dev/dtf-hat/k8s/deployment.yaml`:
```yaml
containers:
  - name: webapp-dtf-hat-container
    image: monsterdigital.azurecr.io/mdp-webapp-dtf-hat:YOUR_TAG_HERE
    imagePullPolicy: Always
```

### Option 2: Use sed/Replace command

**PowerShell (Windows):**
```powershell
# From project root
$deploymentFile = "devops/dev/dtf-hat/k8s/deployment.yaml"
$oldTag = "dev"
$newTag = "v1.0.0-20240101-12345"
(Get-Content $deploymentFile) -replace "mdp-webapp-dtf-hat:$oldTag", "mdp-webapp-dtf-hat:$newTag" | Set-Content $deploymentFile
```

### Option 3: Use kubectl set image

```bash
kubectl set image deployment/webapp-dtf-hat webapp-dtf-hat-container=monsterdigital.azurecr.io/mdp-webapp-dtf-hat:YOUR_TAG -n mdp
```

## Step 6: Apply Kubernetes Configuration

Apply the Kubernetes configuration to deploy/update the application:

```bash
# Apply all Kubernetes resources (deployment, service, ingress)
kubectl apply -f devops/dev/dtf-hat/k8s/ -n mdp

# Or apply individually
kubectl apply -f devops/dev/dtf-hat/k8s/deployment.yaml -n mdp
kubectl apply -f devops/dev/dtf-hat/k8s/service.yaml -n mdp
kubectl apply -f devops/dev/dtf-hat/k8s/ingress.yaml -n mdp
```

## Step 7: Verify Deployment

Check the deployment status:

```bash
# Check deployment status
kubectl get deployment webapp-dtf-hat -n mdp

# Check pods
kubectl get pods -l mSvc=webapp-dtf-hat -n mdp

# Check pod logs
kubectl logs -l mSvc=webapp-dtf-hat -n mdp --tail=50

# Describe deployment
kubectl describe deployment webapp-dtf-hat -n mdp
```

## Complete Example Workflow

Here's a complete example for a production deployment:

```bash
# 1. Login to ACR
az acr login --name monsterdigital

# 2. Navigate to app directory
cd apps/dtf-hat

# 3. Inject build ID (optional)
sed -i 's/BUILD_ID/20240101-12345/g' src/index.html

# 4. Build image
docker build -f Dockerfile.prod -t monsterdigital.azurecr.io/mdp-webapp-dtf-hat:v1.0.0-20240101-12345 .

# 5. Push image
docker push monsterdigital.azurecr.io/mdp-webapp-dtf-hat:v1.0.0-20240101-12345

# 6. Go back to project root
cd ../../

# 7. Update deployment with new tag
sed -i 's|mdp-webapp-dtf-hat:.*|mdp-webapp-dtf-hat:v1.0.0-20240101-12345|g' devops/dev/dtf-hat/k8s/deployment.yaml

# 8. Apply Kubernetes configuration
kubectl apply -f devops/dev/dtf-hat/k8s/ -n mdp

# 9. Verify deployment
kubectl get pods -l mSvc=webapp-dtf-hat -n mdp -w
```

## Troubleshooting

### Image Pull Errors

If you see `ImagePullBackOff` errors:
1. Verify ACR credentials are configured in Kubernetes:
   ```bash
   kubectl create secret docker-registry acr-secret \
     --docker-server=monsterdigital.azurecr.io \
     --docker-username=monsterdigital \
     --docker-password=$(az acr credential show --name monsterdigital --query "passwords[0].value" --output tsv) \
     --namespace=mdp
   ```

### Deployment Not Updating

If the deployment doesn't update:
1. Force a rollout restart:
   ```bash
   kubectl rollout restart deployment/webapp-dtf-hat -n mdp
   ```

### Check Pod Status

```bash
# Describe pod for detailed info
kubectl describe pod <pod-name> -n mdp

# View pod events
kubectl get events -n mdp --sort-by='.lastTimestamp'
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `az acr login --name monsterdigital` | Login to ACR |
| `docker build -f Dockerfile.prod -t monsterdigital.azurecr.io/mdp-webapp-dtf-hat:TAG .` | Build image |
| `docker push monsterdigital.azurecr.io/mdp-webapp-dtf-hat:TAG` | Push image |
| `kubectl apply -f devops/dev/dtf-hat/k8s/ -n mdp` | Apply Kubernetes config |
| `kubectl get pods -l mSvc=webapp-dtf-hat -n mdp` | Check pods |
| `kubectl logs -l mSvc=webapp-dtf-hat -n mdp` | View logs |

## Environment Details

- **Namespace:** `mdp`
- **Deployment Name:** `webapp-dtf-hat`
- **Container Port:** `8080`
- **ACR Registry:** `monsterdigital.azurecr.io`
- **Image Repository:** `mdp-webapp-dtf-hat`

