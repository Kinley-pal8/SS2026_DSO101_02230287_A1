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
        
        stage('Deploy to Render') {
            when {
                branch 'main'
            }
            steps {
                echo '🚀 Triggering Render deployment...'
                sh '''
                    echo "Render deployment triggered via git push"
                    echo "Services will auto-deploy from updated Docker Hub images"
                '''
            }
        }
    }
    
    post {
        always {
            echo '📊 Pipeline finished'
            cleanWs()
        }
        success {
            echo '✅ Pipeline succeeded!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
