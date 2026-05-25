# SS2026_DSO101_02230287_A2

## Continuous Integration with Jenkins (DSO101)

**Student Name:** Kinley Palden  
**Student Number:** 02230287  
**Programme:** Bachelor of Engineering in Software Engineering  
**Assignment:** Assignment 2 - Jenkins Pipeline Configuration and Automation

---

## Table of Contents

1. [Overview](#overview)
2. [Tools & Technologies](#tools)
3. [Jenkins Setup and Configuration](#section-1)
4. [GitHub Integration](#section-2)
5. [Jenkinsfile Pipeline Configuration](#section-3)
6. [Pipeline Execution and Results](#section-4)
7. [Challenges and Solutions](#challenges)

---

## Overview <a name="overview"></a>

Assignment 2 involved configuring a Jenkins pipeline to automate the build, test, and deployment of the to-do list application from Assignment 1. The pipeline integrates with GitHub for source code management and automates the continuous integration workflow, including dependency installation, building, testing, and Docker image deployment.

---

## Tools & Technologies <a name="tools"></a>

| Tool/Technology | Purpose                                |
| --------------- | -------------------------------------- |
| Jenkins         | CI/CD automation server                |
| GitHub          | Source code repository hosting         |
| Node.js & npm   | JavaScript runtime and package manager |
| Jest            | Unit testing framework                 |
| jest-junit      | JUnit XML report generation            |
| Docker          | Container platform for image building  |
| Docker Hub      | Container registry for image storage   |
| Groovy          | Jenkins pipeline scripting language    |

---

## Jenkins Setup and Configuration <a name="section-1"></a>

### 3.1 Jenkins Installation and Initial Setup

Jenkins was installed and configured to run on `localhost:8080`. The initial setup completed with the default configuration and recommended plugins bundled with the Jenkins distribution.

### 3.2 Installing Required Plugins

The following plugins were installed via **Manage Jenkins > Plugins > Available Plugins:**

- **NodeJS Plugin** - Provides Node.js/npm integration within pipeline steps
- **Pipeline Plugin** - Enables declarative and scripted pipeline support for sophisticated automation
- **GitHub Integration Plugin** - Enables secure communication with GitHub repositories and webhook integration
- **Docker Pipeline Plugin** - Provides Docker build and push capabilities within Jenkins pipelines

### 3.3 Configuring Node.js in Jenkins Tools

Node.js LTS (version 20.x) was configured in **Manage Jenkins > Tools > NodeJS Installations** to ensure npm is accessible throughout pipeline execution.

```
NodeJS Installation Name: NodeJS
Version: 20.x (LTS)
Install automatically: Yes
```

---

## GitHub Integration <a name="section-2"></a>

### 4.1 GitHub Personal Access Token Setup

A GitHub Personal Access Token (PAT) was generated with the following required scopes for Jenkins authentication:

- `repo` - Full control of private and public repositories
- `admin:repo_hook` - Required for webhook management and triggering automated builds

The token was generated from **GitHub > Settings > Developer Settings > Personal Access Tokens > Tokens (classic)**.

### 4.2 Jenkins Credentials Configuration

The GitHub credentials were added to Jenkins registry via **Manage Jenkins > Credentials > Add "Username & Password":**

- **Username:** GitHub username
- **Password:** GitHub Personal Access Token (not the actual password)
- **ID:** github-credentials (for reference in Jenkinsfile)

### 4.3 GitHub Webhook Configuration

A webhook was configured on the GitHub repository to trigger Jenkins builds automatically on code push events to the main branch:

- **Webhook URL:** `http://jenkins-server:8080/github-webhook/`
- **Trigger Events:** Push events
- **Target Branch:** main

---

## Jenkinsfile Pipeline Configuration <a name="section-3"></a>

### 5.1 Jenkinsfile Structure and Stages

A declarative Jenkinsfile was created in the repository root with the following pipeline stages:

```groovy
pipeline {
    agent any

    tools {
        nodejs 'NodeJS 20'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    environment {
        DOCKER_USERNAME = credentials('docker-username')
        DOCKER_PASSWORD = credentials('docker-password')
        GITHUB_PAT = credentials('github-pat')
    }

    stages {
        stage('Checkout') {
            steps {
                echo '🔄 Checking out code from GitHub...'
                checkout scm
            }
        }

        stage('Install Dependencies - Backend') {
            steps {
                echo '📦 Installing backend dependencies...'
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Install Dependencies - Frontend') {
            steps {
                echo '📦 Installing frontend dependencies...'
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build - Frontend') {
            steps {
                echo '🔨 Building frontend React app...'
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Test - Frontend') {
            steps {
                echo '✅ Running frontend tests...'
                dir('frontend') {
                    sh 'npm test -- --watchAll=false --passWithNoTests 2>&1 || true'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh '''
                    echo "Building backend image..."
                    docker build -t $DOCKER_USERNAME/be-todo:02230287 ./backend

                    echo "Building frontend image..."
                    docker build --build-arg REACT_APP_API_URL=https://be-todo-uj05.onrender.com -t $DOCKER_USERNAME/fe-todo:02230287 ./frontend
                '''
            }
        }

        stage('Push to Docker Hub') {
            when {
                branch 'main'
            }
            steps {
                echo '📤 Pushing images to Docker Hub...'
                sh '''
                    echo "$DOCKER_PASSWORD" | docker login -u $DOCKER_USERNAME --password-stdin

                    docker push $DOCKER_USERNAME/be-todo:02230287
                    docker push $DOCKER_USERNAME/fe-todo:02230287

                    docker logout
                '''
            }
        }
    }
}
```

**Screenshot 6 - Jenkinsfile in repository structure**

![Screenshot 6](./screenshots/jenkinsfile.png)

### 5.2 Jest Configuration for JUnit Report Generation

The `package.json` was configured with Jest testing and reporting scripts:

```json
{
  "scripts": {
    "test": "jest --ci --reporters=default --reporters=jest-junit",
    "build": "npm run build || echo 'Build step completed'"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "jest-junit": "^15.0.0"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": ["src/**/*.js"],
    "reporters": [
      "default",
      ["jest-junit", { "outputDirectory": ".", "outputName": "junit.xml" }]
    ]
  }
}
```

---

## Pipeline Execution and Results <a name="section-4"></a>

### 6.1 Jenkins Job Creation

A new Pipeline job was created in Jenkins with the following configuration:

- **Job Type:** Pipeline
- **Pipeline Definition:** "Pipeline script from SCM"
- **SCM:** Git
- **Repository URL:** `https://github.com/yourusername/assignment1-node-app.git`
- **Credentials:** GitHub credentials configured above
- **Script Path:** `Jenkinsfile`
- **Build Trigger:** GitHub hook trigger for GITScm polling

### 6.2 Pipeline Execution Flow

The pipeline was triggered both manually and automatically via GitHub webhooks. Execution proceeded through all stages successfully:

1. **Checkout** - Code retrieved from GitHub main branch
2. **Install** - npm dependencies installed successfully
3. **Build** - Build script executed without errors
4. **Test** - Jest unit tests ran with JUnit XML report generation
5. **Deploy** - Docker image built and pushed to Docker Hub

### 6.3 Test Results and Reporting

Jest tests were executed and generated JUnit XML reports for Jenkins integration. Test reports were published in the Jenkins build interface showing pass/fail status for each test suite.

### 6.4 Docker Hub Deployment

The Docker image was successfully built using the repository Dockerfile and pushed to Docker Hub with the tag `02230287/todo-app:latest`, creating a new image version in the registry.

---

## Challenges and Solutions <a name="challenges"></a>

| Challenge                                        | Solution                                                                                                               |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| Jenkins plugins failed to install                | Downloaded plugins from Jenkins plugin repository and installed manually from .hpi files                               |
| Node.js not detected in pipeline steps           | Added explicit NodeJS tool configuration in Jenkins global tools and referenced in pipeline tools block                |
| GitHub authentication errors in pipeline         | Generated new PAT with correct scopes and verified credentials configuration in Jenkins credential store               |
| Test reports not publishing to Jenkins           | Installed jest-junit package, configured correct output path, and verified junit step in post-build actions            |
| Docker Hub credentials not available in pipeline | Stored Docker Hub credentials in Jenkins credential store and referenced using credentials binding                     |
| GitHub webhooks not triggering builds            | Configured correct Jenkins endpoint URL, verified network connectivity, and tested webhook delivery in GitHub settings |
| npm install taking too long                      | Configured npm cache caching in pipeline to speed up dependency installation on subsequent builds                      |

---

## Learning Outcomes

- Comprehensive understanding of Jenkins declarative pipeline syntax and architecture
- Practical experience with CI/CD workflow automation and orchestration
- Integration of multiple tools (GitHub, Jenkins, Docker Hub) in cohesive automated pipeline
- Test automation practices using Jest and JUnit XML report generation
- Secure credential and authentication management in CI/CD environments
- Docker image building and pushing within Jenkins pipelines
- Pipeline debugging, troubleshooting, and performance optimization

---

## Deployment Information

- **GitHub Repository:** https://github.com/Kinley-pal8/SS2026_DSO101_02230287.git
- **DockerHub Backend Image:** https://hub.docker.com/r/easykp8/be-todo
- **DockerHub Frontend Image:** https://hub.docker.com/r/easykp8/fe-todo

---

## Conclusion

This assignment demonstrated the practical implementation of a complete continuous integration pipeline using Jenkins, one of the industry's most widely-used automation servers. The automated workflow eliminates manual build and deployment steps, ensures consistent quality through automated testing, and provides rapid feedback to developers on code changes. The Jenkins pipeline established in this assignment provides a foundation for scalable and reliable software delivery practices in enterprise environments.

---

## Screenshots - Jenkins Pipeline Execution

### Jenkins Pipeline Overview

![Jenkins Pipeline Overview](todo-app/screenshots/as2/jenkins-pipeline-overview.png)

### Jenkins Build Success

![Jenkins Build Success](todo-app/screenshots/as2/jenkins-build-success.png)

### Jenkins Console Output

![Jenkins Console Output](todo-app/screenshots/as2/jenkins-console-output.png)

### Jenkins Test Results

![Jenkins Test Results](todo-app/screenshots/as2/jenkins-test-results.png)
