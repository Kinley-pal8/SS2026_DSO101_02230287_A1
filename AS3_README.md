# Assignment III — Continuous Integration and Continuous Deployment (DSO101)

**Bachelor's of Engineering in Software Engineering (SWE)**

**Student Name:** Kinley Palden  
**Student Number:** 02230287  
**Assignment:** Assignment 3 - GitHub Actions CI/CD Pipeline

---

## Objective

Configure GitHub Actions to automate building, pushing Docker containers to Docker Hub, and deploying to Render.com.

---

## Tools & Technologies Used

| Tool | Purpose | Status |
|------|---------|--------|
| GitHub | Source code hosting | ✅ Public repo |
| GitHub Actions | CI/CD automation | ✅ Configured |
| Docker | Container build & push | ✅ Automated |
| Docker Hub | Container registry | ✅ Images pushed |
| Render.com | Cloud deployment | ✅ Live |
| Node.js & npm | Application runtime | ✅ Working |

---

## Task 1: GitHub Repository Setup ✅

**Verification:**

- ✅ Repository is **public**: `https://github.com/Kinley-pal8/SS2026_DSO101_02230287_A1`
- ✅ Package.json includes build scripts:
  ```json
  {
    "scripts": {
      "start": "npm start",
      "build": "npm run build",
      "test": "npm test"
    }
  }
  ```
- ✅ All code committed and pushed to main branch

---

## Task 2: Dockerfiles Verification ✅

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Frontend Dockerfile (Multi-stage build):**
```dockerfile
FROM node:18-alpine AS build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Testing:**
- ✅ Images built successfully locally
- ✅ Containers tested and verified working
- ✅ Both services communicate correctly

---

## Task 3: GitHub Actions Workflow ✅

**File Location:** `.github/workflows/deploy.yml`

**Workflow Stages:**

1. **Checkout Code** - Pulls latest from GitHub
2. **Setup Docker Buildx** - Enables advanced Docker builds  
3. **Login to Docker Hub** - Using secrets for credentials
4. **Build Backend Image** - Builds and tags backend container
5. **Build Frontend Image** - Builds frontend with REACT_APP_API_URL build arg
6. **Push to Docker Hub** - Both images pushed with tags:
   - `easykp8/be-todo:02230287`
   - `easykp8/fe-todo:02230287`  
   - `easykp8/be-todo:latest`
   - `easykp8/fe-todo:latest`
7. **Trigger Render Deployment** - Notifies deployment system

**GitHub Secrets Configured:**
- ✅ `DOCKER_USERNAME` = `easykp8`
- ✅ `DOCKER_PASSWORD` = Docker Hub Personal Access Token

---

## Task 4: Render.com Deployment ✅

**Service Configuration:**

### Backend Service
- **Service ID:** `srv-d7uek9gsfn5c73b3rm7g`
- **Name:** `be-todo`
- **Runtime:** Docker Image
- **Image:** `easykp8/be-todo:02230287`
- **Port:** 5000
- **Live URL:** `https://be-todo-uj05.onrender.com`
- **Database:** PostgreSQL (Render managed)
- **Status:** ✅ LIVE

### Frontend Service
- **Name:** `fe-todo`
- **Runtime:** Docker Image
- **Image:** `easykp8/fe-todo:02230287`
- **Port:** 80
- **Live URL:** `https://fe-todo-ete4.onrender.com`
- **Environment:** `REACT_APP_API_URL=https://be-todo-uj05.onrender.com`
- **Status:** ✅ LIVE

**Blueprint Configuration:**
- ✅ `render.yaml` configured for multi-service deployment
- ✅ Automatic redeploy on image updates
- ✅ Blueprint Name: `SS2026_DSO101_A1_Blueprint`

---

## CI/CD Pipeline Flow

```
Code Push to GitHub
        ↓
GitHub Actions Triggered
        ↓
Checkout Code
        ↓
Build Backend Docker Image
        ↓
Build Frontend Docker Image
        ↓
Login to Docker Hub
        ↓
Push Images to Docker Hub
        ↓
Pull Images from Docker Hub (Render)
        ↓
Deploy Services on Render.com
        ↓
✅ Live Application Updated
```

---

## How It Works

1. **Developer pushes** code to GitHub `main` branch
2. **GitHub Actions** automatically triggers workflow
3. **Workflow builds** Docker images with latest code
4. **Images pushed** to Docker Hub with version tags
5. **Render detects** new images via Blueprint
6. **Render pulls** latest images from Docker Hub
7. **Services restart** with new code automatically
8. **Application** is live with updates

---

## Challenges & Solutions

| Challenge | Solution | Status |
|-----------|----------|--------|
| Plugin installation in Jenkins | Switched to GitHub Actions (more reliable) | ✅ Resolved |
| Frontend API connectivity | Added build-arg for REACT_APP_API_URL | ✅ Resolved |
| Render auto-deployment | Configured Blueprint with correct runtime:image | ✅ Resolved |
| Docker image caching | Used specific base image versions | ✅ Resolved |

---

## Key Learning Outcomes

✅ GitHub Actions is modern, reliable CI/CD solution  
✅ Docker multi-stage builds reduce image size  
✅ Build arguments enable environment-specific builds  
✅ Infrastructure-as-code (render.yaml) enables reproducibility  
✅ Automated deployment reduces manual errors  
✅ Secrets management prevents credential exposure  

---

## Verification - Live Application

**Test the deployment:**

1. **Frontend:** https://fe-todo-ete4.onrender.com/
   - Add a task
   - Edit a task
   - Complete a task
   - Delete a task
   - All operations should work ✅

2. **Backend API:** https://be-todo-uj05.onrender.com/todos
   - Returns JSON array of todos ✅

3. **Docker Hub Images:**
   - https://hub.docker.com/r/easykp8/be-todo
   - https://hub.docker.com/r/easykp8/fe-todo

---

## Screenshots

See assignment submission folder for:
- GitHub Actions workflow runs
- Docker Hub image tags
- Render deployment status
- Application running live

---

## Files & Deliverables

| File | Purpose | Status |
|------|---------|--------|
| `.github/workflows/deploy.yml` | GitHub Actions workflow | ✅ Created |
| `render.yaml` | Multi-service Render Blueprint | ✅ Configured |
| `backend/Dockerfile` | Backend container definition | ✅ Verified |
| `frontend/Dockerfile` | Frontend container definition | ✅ Verified |
| `package.json` (both) | Build scripts configured | ✅ Verified |
| GitHub Secrets | DOCKER_USERNAME & TOKEN | ✅ Set |

---

## Summary

**Assignment 3 Status: ✅ COMPLETE**

- ✅ GitHub Actions workflow automated
- ✅ Docker images built and pushed  
- ✅ Render deployment configured
- ✅ Application live and tested
- ✅ Infrastructure documented

**CI/CD Pipeline fully operational!**

---

## References

- GitHub Actions Documentation: https://docs.github.com/en/actions
- Docker Build Documentation: https://docs.docker.com/build/
- Render Blueprint Spec: https://render.com/docs/blueprint-spec
- Docker Hub Registry: https://hub.docker.com
